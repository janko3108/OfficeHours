import { Component, OnInit } from '@angular/core';
import { OfficeHourService, DashboardData } from '../services/office-hour.service';
import { CommonModule } from '@angular/common';

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
  currentUser: any = null; // To store logged-in user's details

  constructor(private officeHourService: OfficeHourService) {}

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
    this.officeHourService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.currentUser = user;
      },
      error: (err: any) => {
        console.error('Failed to fetch current user:', err);
      }
    });
  }

  // Navigate to previous week
  previousWeek(): void {
    this.weekOffset--;
    this.fetchDashboardData(this.weekOffset);
  }

  // Navigate to next week
  nextWeek(): void {
    this.weekOffset++;
    this.fetchDashboardData(this.weekOffset);
  }

  // Helper: extract the hour from an ISO date string
  getHour(slot: string): number {
    return new Date(slot).getHours();
  }

  // Helper: compute the end time (start hour + 1) formatted as "HH:00"
  getEndTime(slot: string): string {
    const startHour = new Date(slot).getHours();
    const endHour = startHour + 1;
    return (endHour < 10 ? '0' : '') + endHour + ':00';
  }

  // Return the booking object for a given day and hour, if exists.
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
    // Construct booking time as "YYYY-MM-DDTHH:00"
    const bookingTime = `${dateOnly}T${hour < 10 ? '0' + hour : hour}:00`;
    console.log('Attempting to book:', bookingTime);
    this.officeHourService.bookOfficeHour(bookingTime).subscribe({
      next: (response) => {
        console.log('Booking successful:', response);
        this.fetchDashboardData(this.weekOffset);
      },
      error: (err) => {
        console.error('Booking error:', err);
        this.errorMessage = 'Booking failed. Please try again.';
      }
    });
  }
}
