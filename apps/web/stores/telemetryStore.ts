import { create } from 'zustand';
import { ElevatorTelemetry } from '@elevateos/types';

export interface TelemetryEvent {
  id: string;
  elevatorId: string;
  eventType: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

interface TelemetryStore {
  cars: Record<string, ElevatorTelemetry>;
  activeCarId: string;
  events: TelemetryEvent[];
  isSimulatorActive: boolean;

  setTelemetry: (telemetry: ElevatorTelemetry) => void;
  setTelemetryBatch: (telemetries: ElevatorTelemetry[]) => void;
  setActiveCarId: (id: string) => void;
  addEvent: (event: Omit<TelemetryEvent, 'id' | 'timestamp'>) => void;
  setSimulatorActive: (active: boolean) => void;
}

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  cars: {},
  activeCarId: 'elv-a-01',
  events: [
    {
      id: 'evt-init-1',
      elevatorId: 'elv-a-01',
      eventType: 'SYSTEM_READY',
      description: 'Gateway connected. Telemetry stream verified.',
      severity: 'INFO',
      timestamp: new Date().toISOString(),
    },
  ],
  isSimulatorActive: true,

  setTelemetry: (telemetry) =>
    set((state) => ({
      cars: {
        ...state.cars,
        [telemetry.elevatorId]: telemetry,
      },
    })),

  setTelemetryBatch: (telemetries) =>
    set((state) => {
      const updated = { ...state.cars };
      for (const t of telemetries) {
        updated[t.elevatorId] = t;
      }
      return { cars: updated };
    }),

  setActiveCarId: (id) => set({ activeCarId: id }),

  addEvent: (event) =>
    set((state) => ({
      events: [
        {
          ...event,
          id: 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          timestamp: new Date().toISOString(),
        },
        ...state.events.slice(0, 99), // Keep latest 100 events
      ],
    })),

  setSimulatorActive: (active) => set({ isSimulatorActive: active }),
}));

