import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationRequest, NotificationResponse } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationHttpService {
  private api = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  sendNotification(request: NotificationRequest): Observable<NotificationResponse> {
    return this.http.post<NotificationResponse>(`${this.api}/notificar`, request);
  }

}