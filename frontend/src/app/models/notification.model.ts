export interface NotificationRequest {
  messageId: string;
  messageContent: string;
}

export interface NotificationResponse {
  status: string;
  message: string;
  messageId: string;
  timestamp: string;
}

export interface StatusUpdate {
  messageId: string;
  status: string;
  timestamp: string;
}

export interface ConnectionEstablished {
  message: string;
  clientId: string;
}