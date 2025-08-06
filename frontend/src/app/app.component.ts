import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { NotificationService, NotificationItem } from './services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Notification Service Frontend';
  messageControl = new FormControl('', [Validators.required]);
  notifications$: Observable<NotificationItem[]>;
  connectionStatus$: Observable<boolean>;
  statusCounts$: Observable<{[key: string]: number}>;
  isSubmitting = false;
  
  constructor(private service: NotificationService) {
    this.notifications$ = this.service.notifications$;
    this.connectionStatus$ = this.service.connectionStatus$;
    this.statusCounts$ = this.service.getStatusCounts();
  }

  ngOnInit(): void {
    this.service.connect();
  }

  ngOnDestroy(): void {
    this.service.disconnect();
  }

  sendNotification(): void {
    if (this.messageControl.invalid || this.isSubmitting) {
      if (this.messageControl.invalid) alert('Mensagem é obrigatória');
      return;
    }

    this.isSubmitting = true;
    this.service.sendNotification(this.messageControl.value || '').subscribe({
      next: () => {
        this.messageControl.reset();
        this.isSubmitting = false;
        alert('Notificação enviada!');
      },
      error: () => {
        this.isSubmitting = false;
        alert('Erro ao enviar');
      }
    });
  }

  clearNotifications(): void {
    this.service.clearNotifications();
    alert('Lista limpa');
  }

  getStatusText(status: string): string {
    const texts: {[key: string]: string} = {
      'RECEBIDO': 'Recebido',
      'PROCESSANDO': 'Processando',
      'PROCESSADO_COM_SUCESSO': 'Sucesso', 
      'FALHA_NO_PROCESSAMENTO': 'Falha'
    };
    return texts[status] || status;
  }

  trackByMessageId(index: number, item: NotificationItem): string {
    return item.messageId;
  }
}