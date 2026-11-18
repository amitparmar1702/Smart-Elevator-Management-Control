import dotenv from 'dotenv';
import { FleetSimulator } from './simulator/fleet-simulator';

dotenv.config();

console.log('=====================================================');
console.log(' ElevateOS IoT Gateway & Elevator Simulator Service');
console.log('=====================================================');
console.log(`Node Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`MQTT Broker URL:  ${process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'}`);
console.log(`Simulator Mode:   ${process.env.SIMULATOR_ENABLED || 'true'}`);

export const fleet = new FleetSimulator();

if (process.env.SIMULATOR_ENABLED !== 'false') {
  fleet.start((batch) => {
    // Periodically log fleet pulse
    const activeCar = batch.find((c) => c.direction !== 'STATIONARY' || c.doorState !== 'CLOSED');
    if (activeCar) {
      console.log(
        `[Telemetry Pulse] ${activeCar.elevatorId} @ Floor ${activeCar.floor.toFixed(1)} | Dir: ${activeCar.direction} | Door: ${activeCar.doorState} | Load: ${activeCar.loadKg}kg | Temp: ${activeCar.motorTempCelsius}°C`,
      );
    }
  });

  // Dispatch initial car for demo motion
  setTimeout(() => {
    console.log('[Demo Scenario] Simulating landing call: dispatching elv-a-01 to Floor 8...');
    fleet.dispatchCall('elv-a-01', 8);
  }, 2000);
}

console.log('IoT Gateway Service running and actively listening on telemetry pipeline.');
