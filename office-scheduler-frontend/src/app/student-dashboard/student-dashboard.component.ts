import { Component, OnInit } from '@angular/core';
import { OfficeHourService, DashboardData } from '../services/office-hour.service';
import { AuthService, User } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../notification.service';

@Component({
  standalone: true,
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
  imports: [CommonModule]
})
export class StudentDashboardComponent implements OnInit {
  dashboardData?: DashboardData;
  errorMessage: string = '';
  loading: boolean = true;
  weekOffset: number = 0;
  currentUser: User | null = null; // Logged-in user's details

  constructor(
    private officeHourService: OfficeHourService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.fetchDashboardData(this.weekOffset);
    this.fetchCurrentUser();
  }

  fetchDashboardData(weekOffset: number): void {
    this.loading = true;
    this.officeHourService.getStudentDashboard(weekOffset).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load dashboard data';
        console.error(err);
        this.loading = false;
      }
    });
  }

  fetchCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.currentUser = user;
      },
      error: (err: any) => {
        console.error('Failed to fetch current user:', err);
      }
    });
  }

  // Navigate to previous week
  previousWeek(): void {
    if (this.weekOffset > 0) {
      this.weekOffset--;
      this.fetchDashboardData(this.weekOffset);
    }
  }

  // Navigate to next week
  nextWeek(): void {
    this.weekOffset++;
    this.fetchDashboardData(this.weekOffset);
  }

  // Extract hour from ISO date string
  getHour(slot: string): number {
    return new Date(slot).getHours();
  }

  // Compute end time (start hour + 1) formatted as "HH:00"
  getEndTime(slot: string): string {
    const startHour = new Date(slot).getHours();
    const endHour = startHour + 1;
    return (endHour < 10 ? '0' : '') + endHour + ':00';
  }

  // Return booking object for a given day and hour (if exists)
  getBooking(day: string, hour: number): any {
    if (!this.dashboardData) return null;
    const dateOnly = day.split('T')[0];
    const key = `${dateOnly}|${hour}`;
    return this.dashboardData.bookings_dict[key];
  }

  // Book a slot given the day and slot (start time)
  bookSlot(day: string, slot: string): void {
    const dateOnly = day.split('T')[0];
    const hour = this.getHour(slot);
    const bookingTime = `${dateOnly}T${hour < 10 ? '0' + hour : hour}:00`;
    console.log('Attempting to book:', bookingTime);
    this.officeHourService.bookOfficeHour(bookingTime).subscribe({
      next: (response) => {
        console.log('Booking successful:', response);
        this.notificationService.showNotification({
          type: 'success',
          title: 'Success',
          message: 'Booking successfully made!'
        });
        this.fetchDashboardData(this.weekOffset);
      },
      error: (err) => {
        console.error('Booking error:', err);
        this.errorMessage = 'Booking failed. Please try again.';
        this.notificationService.showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to make booking!'
        });
      }
    });
  }
}
