import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule]
})
export class HomeComponent {
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
