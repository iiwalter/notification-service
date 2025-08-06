import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { NotificationService, NotificationItem } from '../services/notification.service';

@Component({
  selector: 'app-notificacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './notificacao.component.html',
  styleUrls: ['./notificacao.component.scss']
})
export class NotificacaoComponent implements OnInit, OnDestroy {

  conteudoMensagemControl = new FormControl('');
  
  notifications$: Observable<NotificationItem[]>;
  connectionStatus$: Observable<boolean>;
  statusCounts$: Observable<{[key: string]: number}>;
  
  isLoading = false;

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    this.notifications$ = this.notificationService.notifications$;
    this.connectionStatus$ = this.notificationService.connectionStatus$;
    this.statusCounts$ = this.notificationService.getStatusCounts();
  }

  ngOnInit(): void {
    this.notificationService.connect();
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
  }

  enviarNotificacao(): void {
    const conteudoMensagem = this.conteudoMensagemControl.value?.trim();
    
    if (!conteudoMensagem) {
      this.snackBar.open('Por favor, insira o conteúdo da mensagem', 'Fechar', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.isLoading = true;

    this.notificationService.sendNotification(conteudoMensagem).subscribe({
      next: (response) => {
        console.log('✅ Notificação enviada:', response);
        this.conteudoMensagemControl.reset();
        this.isLoading = false;
        this.snackBar.open('Notificação enviada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('❌ Erro ao enviar notificação:', error);
        this.isLoading = false;
        this.snackBar.open(`Erro ao enviar notificação: ${error.message}`, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  limparNotificacoes(): void {
    this.notificationService.clearNotifications();
    this.snackBar.open('Notificações limapas', 'Fechar', {
      duration: 2000
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'RECEBIDO':
        return 'primary';
      case 'PROCESSANDO':
        return 'accent';
      case 'PROCESSADO_COM_SUCESSO':
        return 'primary';
      case 'FALHA_NO_PROCESSAMENTO':
        return 'warn';
      case 'Enviando...':
        return 'accent';
      default:
        return 'basic';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'RECEBIDO':
        return 'inbox';
      case 'PROCESSANDO':
        return 'autorenew';
      case 'PROCESSADO_COM_SUCESSO':
        return 'check_circle';
      case 'FALHA_NO_PROCESSAMENTO':
        return 'error';
      case 'Enviando...':
        return 'send';
      default:
        return 'info';
    }
  }

  trackByMessageId(index: number, item: NotificationItem): string {
    return item.messageId;
  }

  formatTimestamp(timestamp: string): string {
    try {
      return new Date(timestamp).toLocaleString('pt-BR');
    } catch {
      return timestamp;
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarNotificacao();
    }
  }
}