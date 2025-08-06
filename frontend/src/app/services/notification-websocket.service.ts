import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { StatusUpdate, ConnectionEstablished } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationWebSocketService {

  constructor(private socket: Socket) {}

  connect(): void {
    this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  onConnectionEstablished(): Observable<ConnectionEstablished> {
    return this.socket.fromEvent<ConnectionEstablished>('connection_established');
  }

  onStatusUpdate(): Observable<StatusUpdate> {
    return this.socket.fromEvent<StatusUpdate>('status_update');
  }

  onMessageStatusUpdate(): Observable<StatusUpdate> {
    return this.socket.fromEvent<StatusUpdate>('message_status_update');
  }

  subscribeToMessage(messageId: string): void {
    this.socket.emit('subscribe_to_message', { messageId });
  }

  onSubscriptionConfirmed(): Observable<any> {
    return this.socket.fromEvent('subscription_confirmed');
  }

  onDisconnect(): Observable<string> {
    return this.socket.fromEvent<string>('disconnect');
  }

  onConnect(): Observable<void> {
    return this.socket.fromEvent<void>('connect');
  }
}