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
  currentUser: User | null = null;

  constructor(
    private officeHourService: OfficeHourService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

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
      error: () => {
        this.errorMessage = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  fetchCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.currentUser = user;
      },
      error: () => {
      }
    });
  }

  previousWeek(): void {
    if (this.weekOffset > 0) {
      this.weekOffset--;
      this.fetchDashboardData(this.weekOffset);
    }
  }

  nextWeek(): void {
    this.weekOffset++;
    this.fetchDashboardData(this.weekOffset);
  }

  getHour(slot: string): number {
    return new Date(slot).getHours();
  }

  getEndTime(slot: string): string {
    const startHour = new Date(slot).getHours();
    const endHour = startHour + 1;
    return (endHour < 10 ? '0' : '') + endHour + ':00';
  }

  getBooking(day: string, hour: number): any {
    if (!this.dashboardData) return null;
    const dateOnly = day.split('T')[0];
    const key = `${dateOnly}|${hour}`;
    return this.dashboardData.bookings_dict[key];
  }

  bookSlot(day: string, slot: string): void {
    const dateOnly = day.split('T')[0];
    const hour = this.getHour(slot);
    const bookingTime = `${dateOnly}T${hour < 10 ? '0' + hour : hour}:00`;
    this.officeHourService.bookOfficeHour(bookingTime).subscribe({
      next: () => {
        this.notificationService.showNotification({
          type: 'success',
          title: 'Success',
          message: 'Booking successfully made!'
        });
        this.fetchDashboardData(this.weekOffset);
      },
      error: () => {
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
