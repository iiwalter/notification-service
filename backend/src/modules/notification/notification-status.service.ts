import { Injectable } from '@nestjs/common';

export enum ProcessingStatus {
  RECEIVED = 'RECEBIDO',
  PROCESSING = 'PROCESSANDO',
  SUCCESS = 'PROCESSADO_COM_SUCESSO',
  FAILED = 'FALHA_NO_PROCESSAMENTO',
}

@Injectable()
export class NotificationStatusService {
  private readonly statusMap = new Map<string, string>();

  setStatus(messageId: string, status: ProcessingStatus): void {
    this.statusMap.set(messageId, status);
  }

  getStatus(messageId: string): string | undefined {
    return this.statusMap.get(messageId);
  }

  getAllStatuses(): Map<string, string> {
    return new Map(this.statusMap);
  }

  getStatusesAsArray(): Array<{ messageId: string; status: string }> {
    return Array.from(this.statusMap.entries()).map(([messageId, status]) => ({
      messageId,
      status,
    }));
  }
}