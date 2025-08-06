import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  HttpStatus,
  HttpCode,
  BadRequestException,
  Inject 
} from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';

import { NotificationStatusService, ProcessingStatus } from './notification-status.service';
import { WebSocketService } from '../websocket/websocket.service';
import { NotifyDto } from './notification.dto';

@Controller('api')
export class NotificationController {
  constructor(
    private readonly statusService: NotificationStatusService,
    private readonly webSocketService: WebSocketService,
    @Inject('RABBIT_SERVICE') private readonly rabbitClient: ClientProxy,
    @Inject('RABBIT_STATUS_SERVICE') private readonly statusClient: ClientProxy,
  ) {}

  @Post('notificar')
  @HttpCode(HttpStatus.ACCEPTED)
  async notify(@Body() dto: NotifyDto): Promise<{
    status: string;
    message: string;
    messageId: string;
    timestamp: string;
  }> {
    try {
      this.statusService.setStatus(dto.messageId, ProcessingStatus.RECEIVED);
      this.webSocketService.emitNotificationReceived(dto.messageId, dto.messageContent);
      this.rabbitClient.emit('notification_received', {
        messageId: dto.messageId,
        messageContent: dto.messageContent,
        timestamp: new Date().toISOString(),
      });

      return {
        status: 'accepted',
        message: 'Request received and will be processed asynchronously',
        messageId: dto.messageId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException({
        status: 'error',
        message: 'Error publishing to queue',
        error: error.message,
      });
    }
  }

  @MessagePattern('notification_received')
  async handleNotificationReceived(@Payload() data: { 
    messageId: string; 
    messageContent: string; 
    timestamp: string; 
  }): Promise<void> {
    const { messageId, messageContent } = data;
    
    try {
      this.statusService.setStatus(messageId, ProcessingStatus.PROCESSING);
      const delay = 1000 + Math.random() * 1000;
      this.webSocketService.emitProcessingStarted(messageId, messageContent, Math.round(delay));
      await new Promise(resolve => setTimeout(resolve, delay));
      const randomNumber = Math.floor(Math.random() * 10) + 1;
      const isFailure = randomNumber <= 2;

      let finalStatus: ProcessingStatus;
      
      if (isFailure) {
        finalStatus = ProcessingStatus.FAILED;
      } else {
        finalStatus = ProcessingStatus.SUCCESS;
      }
      
      this.statusService.setStatus(messageId, finalStatus);
      this.webSocketService.emitProcessingCompleted(
        messageId, 
        messageContent, 
        !isFailure, 
        randomNumber
      );
      
      this.statusClient.emit('notification_status_update', {
        messageId,
        status: finalStatus,
        processedAt: new Date().toISOString(),
        originalContent: messageContent,
        randomNumber,
      });
      
    } catch (error) {
      this.statusService.setStatus(messageId, ProcessingStatus.FAILED);
      this.webSocketService.emitProcessingError(messageId, messageContent, error.message);
      this.statusClient.emit('notification_status_update', {
        messageId,
        status: ProcessingStatus.FAILED,
        processedAt: new Date().toISOString(),
        error: error.message,
      });
    }
  }



  @Get('message/:messageId/status')
  async getMessageStatus(@Param('messageId') messageId: string): Promise<{
    messageId: string;
    status: string | null;
    found: boolean;
  }> {
    const status = this.statusService.getStatus(messageId);
    return {
      messageId,
      status: status || null,
      found: !!status,
    };
  }

  @Get('messages/status')
  async getAllMessageStatuses(): Promise<Array<{ messageId: string; status: string }>> {
    return this.statusService.getStatusesAsArray();
  }
}