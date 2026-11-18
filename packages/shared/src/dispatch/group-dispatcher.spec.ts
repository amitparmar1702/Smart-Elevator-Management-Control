import { GroupDispatcher, LandingCallRequest } from './group-dispatcher';
import { ElevatorTelemetry } from '@elevateos/types';

describe('GroupDispatcher (Intelligent Destination Dispatch & Hall Call Allocation)', () => {
  let dispatcher: GroupDispatcher;

  beforeEach(() => {
    dispatcher = new GroupDispatcher();
  });

  const baseCar = (id: string, floor: number, direction: 'UP' | 'DOWN' | 'STATIONARY' = 'STATIONARY'): ElevatorTelemetry => ({
    elevatorId: id,
    timestamp: new Date().toISOString(),
    floor,
    targetFloor: null,
    direction,
    velocityMps: 2.0,
    doorState: 'CLOSED',
    doorCycles: 5000,
    loadKg: 200,
    loadPercent: 20,
    isOverloaded: false,
    motorTempCelsius: 40,
    motorCurrentAmps: 0,
    vibrationRms: 0.03,
    controllerTempCelsius: 30,
    batteryVoltage: 27,
    safetyChainClosed: true,
    emergencyStopActive: false,
    gatewayConnected: true,
    lastUpdated: new Date().toISOString(),
  });

  it('should allocate call to the closest stationary car', () => {
    const cars = [
      baseCar('elv-1', 1),   // 4 floors away
      baseCar('elv-2', 4),   // 1 floor away -> OPTIMAL
      baseCar('elv-3', 12),  // 7 floors away
    ];

    const call: LandingCallRequest = {
      pickupFloor: 5,
      direction: 'UP',
      timestamp: new Date().toISOString(),
    };

    const result = dispatcher.allocateCall(call, cars);
    expect(result).not.toBeNull();
    expect(result?.assignedElevatorId).toBe('elv-2');
    expect(result?.assignedCarEtaSeconds).toBeLessThan(10);
  });

  it('should disqualify car with open safety chain circuit', () => {
    const brokenCar = { ...baseCar('elv-1', 5), safetyChainClosed: false }; // Right at floor 5 but broken
    const safeCar = baseCar('elv-2', 3);                                     // 2 floors away but safe

    const call: LandingCallRequest = {
      pickupFloor: 5,
      direction: 'UP',
      timestamp: new Date().toISOString(),
    };

    const result = dispatcher.allocateCall(call, [brokenCar, safeCar]);
    expect(result?.assignedElevatorId).toBe('elv-2');
    const evalBroken = result?.allEvaluations.find((e) => e.elevatorId === 'elv-1');
    expect(evalBroken?.isEligible).toBe(false);
    expect(evalBroken?.disqualificationReason).toContain('Safety chain is open');
  });

  it('should bypass overloaded car (>90% capacity)', () => {
    const crowdedCar = { ...baseCar('elv-1', 5), loadPercent: 95, isOverloaded: true }; // At floor 5 but full
    const freeCar = baseCar('elv-2', 2);                                                 // At floor 2

    const call: LandingCallRequest = {
      pickupFloor: 5,
      direction: 'UP',
      timestamp: new Date().toISOString(),
    };

    const result = dispatcher.allocateCall(call, [crowdedCar, freeCar]);
    expect(result?.assignedElevatorId).toBe('elv-2');
    const evalCrowded = result?.allEvaluations.find((e) => e.elevatorId === 'elv-1');
    expect(evalCrowded?.isEligible).toBe(false);
  });

  it('should prefer a car already traveling in the call direction over a car traveling in opposite direction', () => {
    // Car 1 is at Floor 3 moving UP toward Floor 5
    const carSameDir = baseCar('elv-1', 3, 'UP');
    // Car 2 is at Floor 4 moving DOWN away from Floor 5
    const carOppositeDir = baseCar('elv-2', 4, 'DOWN');

    const call: LandingCallRequest = {
      pickupFloor: 5,
      direction: 'UP',
      timestamp: new Date().toISOString(),
    };

    const result = dispatcher.allocateCall(call, [carSameDir, carOppositeDir]);
    expect(result?.assignedElevatorId).toBe('elv-1');
  });
});

