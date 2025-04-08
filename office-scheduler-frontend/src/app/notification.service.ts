import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from './notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private idCounter = 0;

  showNotification(notification: Omit<Notification, 'id'>, duration: number = 3000): void {
    const newNotification: Notification = { id: ++this.idCounter, visible: true, ...notification };
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next([...currentNotifications, newNotification]);
  
    setTimeout(() => {
      this.hideNotification(newNotification.id);
    }, duration);
  }
  
  hideNotification(id: number): void {
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next(
      currentNotifications.map(n =>
        n.id === id ? { ...n, visible: false } : n
      )
    );
  }
  
  removeNotification(id: number): void {
    const currentNotifications = this.notificationsSubject.getValue();
    this.notificationsSubject.next(currentNotifications.filter(n => n.id !== id));
  }
  
}
