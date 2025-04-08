import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterModule]
})
export class HomeComponent {
  features = [
    { iconClass: 'fas fa-calendar-check', title: 'Easy Scheduling', description: 'Book and manage your office hours with ease.' },
    { iconClass: 'fas fa-lock', title: 'Secure Login with 2FA', description: 'Your data is protected with two-factor authentication.' },
    { iconClass: 'fas fa-clock', title: 'Track Your Bookings', description: 'Stay updated on your past and upcoming meetings.' }
  ];

  testimonials = [
    {
      name: 'Alex T.',
      message: 'This platform made scheduling so easy. No more emailing professors back and forth!',
      avatar: 'https://i.pravatar.cc/100?img=12'
    },
    {
      name: 'Maria S.',
      message: 'Secure login, clean UI, and quick booking — love it!',
      avatar: 'https://i.pravatar.cc/100?img=32'
    },
    {
      name: 'Jordan K.',
      message: 'I finally showed up to every office hour this semester — 10/10.',
      avatar: 'https://i.pravatar.cc/100?img=47'
    }
  ];


  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
