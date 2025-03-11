import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule]  // Import CommonModule for *ngFor, *ngIf, etc.
})
export class DashboardComponent {
  features = [
    { title: 'Seamless Scheduling', description: 'Book and manage your office hours with ease.' },
    { title: 'Real-Time Notifications', description: 'Stay updated on your appointments instantly.' },
    { title: 'Modern Interface', description: 'Enjoy a responsive and interactive user experience.' }
  ];

  explore(): void {
    // For now, just a simple alert. Later, you can navigate or open a modal.
    alert('More features coming soon!');
  }
}
