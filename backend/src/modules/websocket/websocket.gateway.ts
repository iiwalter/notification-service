import { Logger } from '@nestjs/common';
import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { WebSocketService } from './websocket.service';

@WSGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebSocketGateway');

  constructor(private readonly webSocketService: WebSocketService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized on namespace /notifications');
    this.webSocketService.setGateway(this);
  }

    handleConnection(client: Socket, ...args: any[]) {

    
    client.emit('connection_established', {
      message: 'Connected to notification updates',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe_to_message')
  handleSubscribeToMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
        const { messageId } = data;
    client.join(`message_${messageId}`);
    
    client.emit('subscription_confirmed', {
      messageId,
      message: `Subscribed to updates for message ${messageId}`,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('unsubscribe_from_message')
  handleUnsubscribeFromMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
        const { messageId } = data;
    client.leave(`message_${messageId}`);
    
    client.emit('unsubscription_confirmed', {
      messageId,
      message: `Unsubscribed from updates for message ${messageId}`,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastStatusUpdate(updateData: any) {
    this.server.emit('status_update', updateData);
    
    this.server.to(`message_${updateData.messageId}`).emit('message_status_update', updateData);
  }

  broadcastProcessingProgress(progressData: any) {
    this.server.emit('processing_progress', progressData);
    
    this.server.to(`message_${progressData.messageId}`).emit('message_progress_update', progressData);
  }
}