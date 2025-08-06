import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationController } from './notification.controller';

import { NotificationStatusService } from './notification-status.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    WebSocketModule,
    ClientsModule.register([
      {
        name: 'RABBIT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'fila.notificacao.entrada.walter',
          queueOptions: { durable: false },
        },
      },
      {
        name: 'RABBIT_STATUS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@localhost:5672'],
          queue: 'fila.notificacao.status.walter',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationStatusService],
  exports: [NotificationStatusService],
})
export class NotificationModule {}