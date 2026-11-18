import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ElevatorWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const orgId = client.handshake.query.orgId as string;
    const buildingId = client.handshake.query.buildingId as string;

    if (orgId) {
      client.join(`org:${orgId}`);
    }
    if (buildingId) {
      client.join(`building:${buildingId}`);
    }

    console.log(`[WebSocket] Client connected: ${client.id} (Rooms: org:${orgId || 'public'}, bldg:${buildingId || 'all'})`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeElevator')
  handleSubscribeElevator(client: Socket, elevatorId: string) {
    client.join(`elevator:${elevatorId}`);
    return { status: 'subscribed', elevatorId };
  }

  /**
   * Broadcast real-time elevator kinematic & operational state
   */
  broadcastElevatorState(orgId: string, elevatorId: string, state: any) {
    this.server.to(`org:${orgId}`).emit('elevator.state.updated', {
      elevatorId,
      ...state,
      timestamp: new Date().toISOString(),
    });
    this.server.to(`elevator:${elevatorId}`).emit('elevator.position.updated', state);
  }

  /**
   * Broadcast critical alarm / fault
   */
  broadcastFault(orgId: string, elevatorId: string, fault: any) {
    this.server.to(`org:${orgId}`).emit('elevator.fault.detected', {
      elevatorId,
      ...fault,
      timestamp: new Date().toISOString(),
    });
  }
}

