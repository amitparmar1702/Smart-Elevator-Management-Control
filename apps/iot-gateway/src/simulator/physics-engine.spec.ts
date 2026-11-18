import { SimulatedCar } from './physics-engine';

describe('SimulatedCar Physics Engine & Door Interlock', () => {
  let car: SimulatedCar;

  beforeEach(() => {
    car = new SimulatedCar({
      id: 'car-test-1',
      name: 'Car Test 1',
      assetCode: 'ELV-TST-01',
      minFloor: 1,
      maxFloor: 15,
      ratedSpeedMps: 2.0,
      capacityKg: 1000,
      initialFloor: 1,
    });
  });

  it('should initialize with correct default physics state', () => {
    expect(car.currentFloor).toBe(1);
    expect(car.doorState).toBe('CLOSED');
    expect(car.direction).toBe('STATIONARY');
    expect(car.velocityMps).toBe(0);
    expect(car.safetyChainClosed).toBe(true);
    expect(car.isOverloaded).toBe(false);
  });

  it('should reject dispatch to floor outside configured limits', () => {
    expect(car.dispatchTo(0)).toBe(false);
    expect(car.dispatchTo(16)).toBe(false);
    expect(car.targetFloor).toBeNull();
  });

  it('should dispatch towards upper floor and set direction UP', () => {
    const success = car.dispatchTo(5);
    expect(success).toBe(true);
    expect(car.targetFloor).toBe(5);
    expect(car.direction).toBe('UP');
  });

  it('should advance car position during physics simulation step', () => {
    car.dispatchTo(3);
    // Simulate 1000ms (1 second) step
    car.update(1000);

    // Car should have moved upward from floor 1
    expect(car.currentFloor).toBeGreaterThan(1);
    expect(car.velocityMps).toBe(2.0);
    expect(car.motorCurrentAmps).toBeGreaterThan(0);
  });

  it('should strictly prohibit movement when safety chain is open', () => {
    car.triggerFault('SAFETY_CHAIN_OPEN');
    expect(car.safetyChainClosed).toBe(false);

    // Dispatch should be rejected
    const dispatched = car.dispatchTo(4);
    expect(dispatched).toBe(false);

    // Even if target floor was already set, update should freeze car velocity
    car.targetFloor = 4;
    car.update(1000);
    expect(car.velocityMps).toBe(0);
  });

  it('should execute full door cycle (OPENING -> OPEN -> CLOSING -> CLOSED)', () => {
    expect(car.doorState).toBe('CLOSED');
    const initialDoorCycles = car.doorCycles;

    // Trigger door open
    car.openDoors();
    expect(car.doorState).toBe('OPENING');

    // Simulate 2000ms: opening completes
    car.update(2000);
    expect(car.doorState).toBe('OPEN');

    // Simulate 3500ms: hold time finishes and begins closing
    car.update(3500);
    expect(car.doorState).toBe('CLOSING');

    // Simulate 2000ms: closing completes and doorCycle count increments
    car.update(2000);
    expect(car.doorState).toBe('CLOSED');
    expect(car.doorCycles).toBe(initialDoorCycles + 1);
  });

  it('should prevent door closing when car is overloaded', () => {
    car.openDoors();
    car.update(2000);
    expect(car.doorState).toBe('OPEN');

    car.triggerFault('OVERLOAD');
    expect(car.isOverloaded).toBe(true);

    // Even after dwell timer expires, doors remain OPEN
    car.update(5000);
    expect(car.doorState).toBe('OPEN');
  });

  it('should generate valid and bounded telemetry payload', () => {
    const telemetry = car.getTelemetry();

    expect(telemetry.elevatorId).toBe('car-test-1');
    expect(telemetry.floor).toBe(1);
    expect(telemetry.doorState).toBe('CLOSED');
    expect(telemetry.safetyChainClosed).toBe(true);
    expect(telemetry.gatewayConnected).toBe(true);
    expect(typeof telemetry.timestamp).toBe('string');
    expect(telemetry.loadPercent).toBeLessThanOrEqual(100);
  });
});

