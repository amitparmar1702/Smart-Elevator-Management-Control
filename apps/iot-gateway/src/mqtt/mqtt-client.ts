import mqtt, { MqttClient } from 'mqtt';
import { OEMAdapterRegistry } from '../adapters';
import { ElevatorTelemetry } from '@elevateos/types';

export interface MQTTClientConfig {
  brokerUrl: string;
  clientId: string;
  username?: string;
  password?: string;
  useTls?: boolean;
}

export class ElevateOSMQTTClient {
  private client: MqttClient | null = null;
  private isConnected = false;
  private readonly config: MQTTClientConfig;
  private readonly topicPrefix = 'elevateos';

  constructor(config: MQTTClientConfig) {
    this.config = config;
  }

  public connect(onTelemetryReceived?: (telemetry: ElevatorTelemetry) => void) {
    console.log(`[MQTT] Connecting to broker at ${this.config.brokerUrl}...`);

    this.client = mqtt.connect(this.config.brokerUrl, {
      clientId: this.config.clientId,
      username: this.config.username,
      password: this.config.password,
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 3000,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log(`[MQTT] Successfully connected to broker (${this.config.brokerUrl})`);

      // Subscribe to all tenant elevator telemetry topics
      // Pattern: elevateos/tenant/+/building/+/elevator/+/telemetry
      const subscriptionTopic = `${this.topicPrefix}/tenant/+/building/+/elevator/+/telemetry`;
      this.client?.subscribe(subscriptionTopic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`[MQTT] Failed to subscribe to ${subscriptionTopic}:`, err);
        } else {
          console.log(`[MQTT] Subscribed to telemetry feed: ${subscriptionTopic}`);
        }
      });
    });

    this.client.on('message', (topic, payload) => {
      try {
        const parts = topic.split('/');
        // elevateos/tenant/{orgId}/building/{bldgId}/elevator/{elevatorId}/telemetry
        if (parts.length >= 7 && parts[6] === 'telemetry') {
          const rawData = JSON.parse(payload.toString());
          const manufacturer = rawData.manufacturer || 'GENERIC';
          const adapter = OEMAdapterRegistry.getAdapter(manufacturer);
          const normalized = adapter.normalizeTelemetry(rawData);

          if (onTelemetryReceived) {
            onTelemetryReceived(normalized);
          }
        }
      } catch (parseErr) {
        console.error('[MQTT] Error processing incoming telemetry packet:', parseErr);
      }
    });

    this.client.on('error', (err) => {
      console.warn(`[MQTT] Connection notice: ${err.message}. Offline buffer will persist telemetry locally.`);
    });

    this.client.on('offline', () => {
      this.isConnected = false;
      console.warn('[MQTT] Broker connection offline. Reconnection scheduler active.');
    });
  }

  public publishTelemetry(orgId: string, bldgId: string, elevatorId: string, telemetry: ElevatorTelemetry) {
    if (!this.client || !this.isConnected) return false;

    const topic = `${this.topicPrefix}/tenant/${orgId}/building/${bldgId}/elevator/${elevatorId}/telemetry`;
    this.client.publish(topic, JSON.stringify(telemetry), { qos: 1 });
    return true;
  }

  public publishCommand(orgId: string, bldgId: string, elevatorId: string, command: any) {
    if (!this.client || !this.isConnected) return false;

    const topic = `${this.topicPrefix}/tenant/${orgId}/building/${bldgId}/elevator/${elevatorId}/commands/downlink`;
    this.client.publish(topic, JSON.stringify(command), { qos: 1 });
    return true;
  }

  public disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.isConnected = false;
    }
  }

  public getConnected(): boolean {
    return this.isConnected;
  }
}

