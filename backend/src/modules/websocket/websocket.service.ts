import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';

export interface StatusUpdateData {
  messageId: string;
  status: string;
  timestamp?: string;
  messageContent?: string;
  randomNumber?: number;
  processedAt?: string;
  error?: string;
}

export interface ProcessingProgressData {
  messageId: string;
  step: string;
  delay?: number;
  randomNumber?: number;
  result?: string;
}

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  private gateway: WebSocketGateway;

  setGateway(gateway: WebSocketGateway) {
    this.gateway = gateway;
  }

  emitStatusUpdate(data: StatusUpdateData) {
    if (!this.gateway) {
      this.logger.warn('WebSocket Gateway not initialized');
      return;
    }

    const updateData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    this.gateway.broadcastStatusUpdate(updateData);
  }

  emitProcessingProgress(data: ProcessingProgressData) {
    if (!this.gateway) {
      this.logger.warn('WebSocket Gateway not initialized');
      return;
    }

    const progressData = {
      ...data,
      type: 'processing_progress',
      timestamp: new Date().toISOString(),
    };

    this.gateway.broadcastProcessingProgress(progressData);
  }

  emitNotificationReceived(messageId: string, messageContent: string) {
    this.emitStatusUpdate({
      messageId,
      status: 'RECEBIDO',
      messageContent,
    });
  }

  emitProcessingStarted(messageId: string, messageContent: string, delay: number) {
    this.emitStatusUpdate({
      messageId,
      status: 'PROCESSANDO',
      messageContent,
    });

    this.emitProcessingProgress({
      messageId,
      step: 'processing_started',
      delay,
    });
  }

  emitProcessingCompleted(
    messageId: string, 
    messageContent: string, 
    success: boolean, 
    randomNumber: number
  ) {
    const status = success ? 'PROCESSADO_COM_SUCESSO' : 'FALHA_NO_PROCESSAMENTO';
    
    this.emitProcessingProgress({
      messageId,
      step: 'random_check_completed',
      randomNumber,
      result: success ? 'success' : 'failure',
    });

    this.emitStatusUpdate({
      messageId,
      status,
      messageContent,
      randomNumber,
      processedAt: new Date().toISOString(),
    });
  }

  emitProcessingError(messageId: string, messageContent: string, error: string) {
    this.emitStatusUpdate({
      messageId,
      status: 'FALHA_NO_PROCESSAMENTO',
      messageContent,
      error,
      processedAt: new Date().toISOString(),
    });
  }
}