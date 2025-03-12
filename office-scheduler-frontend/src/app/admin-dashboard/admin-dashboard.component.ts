import { Component, OnInit } from '@angular/core';
import { OfficeHourService } from '../services/office-hour.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [CommonModule]
})
export class AdminDashboardComponent implements OnInit {
  bookings: any[] = [];
  errorMessage: string = '';
  loading: boolean = true;

  constructor(private officeHourService: OfficeHourService) {}

  ngOnInit(): void {
    this.officeHourService.getAdminDashboard().subscribe({
      next: (data) => {
        this.bookings = data.bookings;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load admin dashboard data';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
