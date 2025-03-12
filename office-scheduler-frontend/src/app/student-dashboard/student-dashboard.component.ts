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

  constructor(private officeHourService: OfficeHourService) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(weekOffset: number = 0): void {
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

  // Check if a time slot on a given day is booked
  isBooked(day: string, hour: number): boolean {
    // Assume dashboardData.bookings_dict keys are in the form "YYYY-MM-DD|H"
    if (!this.dashboardData) return false;
    const dateOnly = day.split('T')[0];
    const key = `${dateOnly}|${hour}`;
    return !!this.dashboardData.bookings_dict[key];
  }
}
