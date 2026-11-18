import { Module, Global } from '@nestjs/common';
import { ElevatorWebSocketGateway } from './websocket.gateway';

@Global()
@Module({
  providers: [ElevatorWebSocketGateway],
  exports: [ElevatorWebSocketGateway],
})
export class ElevatorWebSocketModule {}

