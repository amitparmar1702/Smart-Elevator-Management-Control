import { SimulatedCar } from './physics-engine';
import { ElevatorTelemetry } from '@elevateos/types';

export class FleetSimulator {
  private cars: Map<string, SimulatedCar> = new Map();
  private intervalTimer: NodeJS.Timeout | null = null;
  private readonly TICK_MS = 1000;

  constructor() {
    this.initializeDefaultFleet();
  }

  private initializeDefaultFleet() {
    const defaultCars = [
      {
        id: 'elv-a-01',
        name: 'Passenger Car 1 (High-Speed)',
        assetCode: 'ELV-A-01',
        minFloor: -2,
        maxFloor: 20,
        ratedSpeedMps: 2.5,
        capacityKg: 1350,
        initialFloor: 1,
      },
      {
        id: 'elv-a-02',
        name: 'Passenger Car 2 (Standard)',
        assetCode: 'ELV-A-02',
        minFloor: 1,
        maxFloor: 20,
        ratedSpeedMps: 1.75,
        capacityKg: 1000,
        initialFloor: 5,
      },
      {
        id: 'elv-a-03',
        name: 'Service & Freight Car 3',
        assetCode: 'ELV-A-03',
        minFloor: -2,
        maxFloor: 20,
        ratedSpeedMps: 1.6,
        capacityKg: 2000,
        initialFloor: 1,
      },
      {
        id: 'elv-a-04',
        name: 'Firefighters & Emergency Car 4',
        assetCode: 'ELV-A-04',
        minFloor: 1,
        maxFloor: 20,
        ratedSpeedMps: 2.0,
        capacityKg: 1250,
        initialFloor: 12,
      },
    ];

    for (const config of defaultCars) {
      this.cars.set(config.id, new SimulatedCar(config));
    }
  }

  public start(onTick?: (allTelemetry: ElevatorTelemetry[]) => void) {
    if (this.intervalTimer) return;

    this.intervalTimer = setInterval(() => {
      const telemetryBatch: ElevatorTelemetry[] = [];
      for (const car of this.cars.values()) {
        car.update(this.TICK_MS);
        telemetryBatch.push(car.getTelemetry());
      }
      if (onTick) {
        onTick(telemetryBatch);
      }
    }, this.TICK_MS);

    console.log(`[FleetSimulator] Running with ${this.cars.size} simulated elevator cars (tick rate: ${this.TICK_MS}ms)`);
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public getCar(id: string): SimulatedCar | undefined {
    return this.cars.get(id);
  }

  public getAllTelemetry(): ElevatorTelemetry[] {
    return Array.from(this.cars.values()).map((car) => car.getTelemetry());
  }

  public dispatchCall(elevatorId: string, floor: number): boolean {
    const car = this.cars.get(elevatorId);
    if (!car) return false;
    return car.dispatchTo(floor);
  }
}

