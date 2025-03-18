import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.model';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  standalone: true,
  selector: 'app-notifications',
  template: `
    <div class="notification-container">
      <div *ngFor="let notification of notifications"
           [@slideDownAnimation]="notification.visible ? 'visible' : 'hidden'"
           (@slideDownAnimation.done)="onAnimationDone($event, notification)"
           class="toast"
           [ngClass]="notification.type">
        <strong>{{ notification.title }}</strong>
        <p>{{ notification.message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      pointer-events: none;
      width: auto;
    }
    .toast {
      pointer-events: auto;
      padding: 10px 20px;
      margin-bottom: 10px;
      border-radius: 12px;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 1rem;
      color: #fff;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      width: 280px;
      text-align: center;
      opacity: 0;
    }
    .success { background: linear-gradient(135deg, #4caf50, #66bb6a) !important; }
    .info { background: linear-gradient(135deg, #ffa726, #ffb74d) !important; }
    .error { background: linear-gradient(135deg, #f44336, #e57373) !important; }
  `],
  animations: [
    trigger('slideDownAnimation', [
      state('visible', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      state('hidden', style({ opacity: 0, transform: 'translateY(-50px) scale(0.9)' })),
      transition('void => visible', [
        style({ opacity: 0, transform: 'translateY(-100px) scale(0.9)' }),
        animate('400ms ease-out')
      ]),
      transition('visible => hidden', [
        animate('400ms ease-in')
      ])
    ])
  ],
  imports: [CommonModule]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(n => this.notifications = n);
  }

  onAnimationDone(event: any, notification: Notification): void {
    // If the state transitioned to "hidden", remove the notification from the list.
    if (event.toState === 'hidden') {
      this.notificationService.removeNotification(notification.id);
    }
  }
}
