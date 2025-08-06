import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationHttpService } from './notification-http.service';
import { NotificationWebSocketService } from './notification-websocket.service';
import { NotificationRequest, NotificationResponse, StatusUpdate } from '../models/notification.model';

export interface NotificationItem {
  messageId: string;
  messageContent: string;
  status: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications = new BehaviorSubject<NotificationItem[]>([]);
  private connected = new BehaviorSubject<boolean>(false);

  notifications$ = this.notifications.asObservable();
  connectionStatus$ = this.connected.asObservable();

  constructor(private http: NotificationHttpService, private ws: NotificationWebSocketService) {
    this.setupWebSocket();
  }

  connect(): void {
    this.ws.connect();
  }

  disconnect(): void {
    this.ws.disconnect();
  }

  sendNotification(content: string): Observable<NotificationResponse> {
    const request: NotificationRequest = {
      messageId: this.generateId(),
      messageContent: content
    };

    this.addNotification({
      messageId: request.messageId,
      messageContent: content,
      status: 'RECEBIDO',
      timestamp: new Date().toISOString()
    });

    this.ws.subscribeToMessage(request.messageId);
    return this.http.sendNotification(request);
  }

  clearNotifications(): void {
    this.notifications.next([]);
  }

  getStatusCounts(): Observable<{[key: string]: number}> {
    return this.notifications$.pipe(
      map(items => {
        const counts: {[key: string]: number} = {};
        items.forEach(item => {
          counts[item.status] = (counts[item.status] || 0) + 1;
        });
        return counts;
      })
    );
  }

  private setupWebSocket(): void {
    this.ws.onConnect().subscribe(() => this.connected.next(true));
    this.ws.onDisconnect().subscribe(() => this.connected.next(false));
    this.ws.onStatusUpdate().subscribe(update => this.updateStatus(update));
    this.ws.onMessageStatusUpdate().subscribe(update => this.updateStatus(update));
  }

  private updateStatus(update: StatusUpdate): void {
    const items = this.notifications.value;
    const index = items.findIndex(n => n.messageId === update.messageId);
    
    if (index !== -1) {
      items[index] = { ...items[index], status: update.status };
      this.notifications.next([...items]);
    }
  }

  private addNotification(item: NotificationItem): void {
    const items = this.notifications.value;
    this.notifications.next([item, ...items]);
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}