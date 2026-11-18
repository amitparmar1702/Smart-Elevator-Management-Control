import { ElevatorDirection, ElevatorTelemetry } from '@elevateos/types';

export interface LandingCallRequest {
  pickupFloor: number;
  destinationFloor?: number;
  direction: 'UP' | 'DOWN';
  passengerCount?: number;
  timestamp: string;
}

export interface DispatchEvaluation {
  elevatorId: string;
  estimatedTimeToArrivalSeconds: number;
  totalCostScore: number;
  distanceFloors: number;
  currentLoadPercent: number;
  isEligible: boolean;
  disqualificationReason?: string;
}

export interface GroupDispatchResult {
  assignedElevatorId: string;
  assignedCarEtaSeconds: number;
  allEvaluations: DispatchEvaluation[];
  recommendedLandingIndicator: 'UP' | 'DOWN';
}

export class GroupDispatcher {
  private readonly FLOOR_HEIGHT_METERS = 3.5;
  private readonly DOOR_CYCLE_DWELL_SECONDS = 5.5;

  public static dispatchLandingCall(
    call: LandingCallRequest,
    cars: ElevatorTelemetry[]
  ): GroupDispatchResult | null {
    return new GroupDispatcher().allocateCall(call, cars);
  }

  /**
   * Evaluates all elevators in a group bank and selects the optimal car
   * based on minimum Passenger Wait Time (PWT) and energy expenditure score.
   */
  public allocateCall(
    call: LandingCallRequest,
    cars: ElevatorTelemetry[]
  ): GroupDispatchResult | null {
    if (!cars || cars.length === 0) {
      return null;
    }

    const evaluations: DispatchEvaluation[] = cars.map((car) =>
      this.evaluateCarForCall(call, car)
    );

    const eligibleCars = evaluations.filter((e) => e.isEligible);
    if (eligibleCars.length === 0) {
      // If all cars are overloaded or in emergency, fallback to closest car with penalty
      const fallback = evaluations.sort((a, b) => a.totalCostScore - b.totalCostScore)[0];
      return {
        assignedElevatorId: fallback.elevatorId,
        assignedCarEtaSeconds: fallback.estimatedTimeToArrivalSeconds,
        allEvaluations: evaluations,
        recommendedLandingIndicator: call.direction,
      };
    }

    // Sort by lowest cost score (Fastest ETA + least detour)
    eligibleCars.sort((a, b) => a.totalCostScore - b.totalCostScore);
    const optimal = eligibleCars[0];

    return {
      assignedElevatorId: optimal.elevatorId,
      assignedCarEtaSeconds: optimal.estimatedTimeToArrivalSeconds,
      allEvaluations: evaluations,
      recommendedLandingIndicator: call.direction,
    };
  }

  private evaluateCarForCall(call: LandingCallRequest, car: ElevatorTelemetry): DispatchEvaluation {
    // 1. Safety & Eligibility Gates
    if (!car.safetyChainClosed) {
      return {
        elevatorId: car.elevatorId,
        estimatedTimeToArrivalSeconds: 999,
        totalCostScore: 9999,
        distanceFloors: 99,
        currentLoadPercent: car.loadPercent,
        isEligible: false,
        disqualificationReason: 'Safety chain is open / controller locked',
      };
    }

    if (car.emergencyStopActive) {
      return {
        elevatorId: car.elevatorId,
        estimatedTimeToArrivalSeconds: 999,
        totalCostScore: 9999,
        distanceFloors: 99,
        currentLoadPercent: car.loadPercent,
        isEligible: false,
        disqualificationReason: 'Emergency stop circuit is active',
      };
    }

    if (car.isOverloaded || car.loadPercent >= 90) {
      return {
        elevatorId: car.elevatorId,
        estimatedTimeToArrivalSeconds: 999,
        totalCostScore: 8000,
        distanceFloors: Math.abs(car.floor - call.pickupFloor),
        currentLoadPercent: car.loadPercent,
        isEligible: false,
        disqualificationReason: 'Car is near or above 90% rated weight capacity',
      };
    }

    // 2. Kinematics & Directional Detour Calculation
    const currentFloor = Math.round(car.floor);
    const distanceFloors = Math.abs(currentFloor - call.pickupFloor);
    const ratedSpeed = car.velocityMps > 0 ? car.velocityMps : 2.0;

    let travelTimeSeconds = (distanceFloors * this.FLOOR_HEIGHT_METERS) / ratedSpeed;
    let penaltyScore = 0;

    // Direction alignment check
    const isStationary = car.direction === 'STATIONARY';
    const isSameDirection =
      (car.direction === 'UP' && call.pickupFloor >= currentFloor) ||
      (car.direction === 'DOWN' && call.pickupFloor <= currentFloor);

    if (isStationary) {
      // Stationary car: optimal candidate, ready to dispatch immediately
      travelTimeSeconds += 1.5; // motor start delay
      penaltyScore += 0;
    } else if (isSameDirection) {
      // Car already heading toward call floor: minimal penalty
      penaltyScore += 5;
    } else {
      // Car heading in opposite direction: requires completing current trip and turnaround
      travelTimeSeconds += 18.0;
      penaltyScore += 45;
    }

    // Door dwell penalty if doors are currently open
    if (car.doorState !== 'CLOSED') {
      travelTimeSeconds += this.DOOR_CYCLE_DWELL_SECONDS;
    }

    // Load penalty (prefer cars with lower passenger crowding)
    const loadPenalty = (car.loadPercent / 100) * 15;
    const totalCostScore = travelTimeSeconds + penaltyScore + loadPenalty;

    return {
      elevatorId: car.elevatorId,
      estimatedTimeToArrivalSeconds: Math.max(2, Math.round(travelTimeSeconds)),
      totalCostScore: Math.round(totalCostScore * 10) / 10,
      distanceFloors,
      currentLoadPercent: car.loadPercent,
      isEligible: true,
    };
  }
}

