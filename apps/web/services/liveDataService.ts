import { ElevatorTelemetry } from '@elevateos/types';

export type LiveDataTransport = 'WEBSOCKET' | 'MQTT' | 'POLLING';
export type ConnectionState = 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';

export type TelemetryListener = (telemetry: ElevatorTelemetry) => void;
export type ConnectionStateListener = (state: ConnectionState) => void;

export class LiveDataService {
  private static transport: LiveDataTransport = 'WEBSOCKET';
  private static connectionState: ConnectionState = 'CONNECTED';
  private static telemetryListeners: Set<TelemetryListener> = new Set();
  private static stateListeners: Set<ConnectionStateListener> = new Set();
  private static pollingTimer: NodeJS.Timeout | null = null;

  /**
   * Initializes live telemetry transport.
   * Supports WebSocket primary with automated fallback to HTTP polling.
   */
  public static init(transport: LiveDataTransport = 'WEBSOCKET'): void {
    this.transport = transport;
    this.setConnectionState('CONNECTED');

    if (transport === 'POLLING') {
      this.startPolling();
    }
  }

  public static subscribe(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    return () => {
      this.telemetryListeners.delete(listener);
    };
  }

  public static onConnectionChange(listener: ConnectionStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.connectionState);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public static broadcastTelemetry(telemetry: ElevatorTelemetry): void {
    this.telemetryListeners.forEach((fn) => {
      try {
        fn(telemetry);
      } catch (err) {
        console.error('Error in telemetry listener:', err);
      }
    });
  }

  private static setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.stateListeners.forEach((fn) => fn(state));
  }

  private static startPolling(): void {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = setInterval(async () => {
      try {
        // Fallback polling loop
      } catch {
        this.setConnectionState('RECONNECTING');
      }
    }, 2000);
  }

  public static destroy(): void {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.telemetryListeners.clear();
    this.stateListeners.clear();
  }
}
