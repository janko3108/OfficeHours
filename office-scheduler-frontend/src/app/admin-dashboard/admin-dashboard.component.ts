import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficeHourService } from '../services/office-hour.service';
import { AuthService, User } from '../services/auth.service';
import { NotificationService } from '../notification.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [CommonModule, FormsModule]
})
export class AdminDashboardComponent implements OnInit {
  bookings: any[] = [];
  errorMessage: string = '';
  loading: boolean = true;
  currentUser: User | null = null;  // holds logged-in user's info

  // Properties for modal editing
  editingBooking: any = null;
  editingBookingTime: string = '';

  constructor(
    private officeHourService: OfficeHourService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.fetchBookings();
    this.fetchCurrentUser();
  }

  fetchBookings(): void {
    this.loading = true;
    this.officeHourService.getAdminDashboard().subscribe({
      next: (data: any) => {
        this.bookings = data.bookings;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'Failed to load admin dashboard data';
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

  openEditModal(event: Event, booking: any): void {
    event.preventDefault();
    console.log("openEditModal triggered for booking:", booking);
    this.editingBooking = booking;
    // Ensure booking.booking_time is a valid ISO string
    this.editingBookingTime = booking.booking_time.slice(0, 16);
  }

  closeEditModal(): void {
    this.editingBooking = null;
    this.editingBookingTime = '';
  }

  updateBooking(): void {
    if (!this.editingBooking) { return; }
    this.officeHourService.updateBooking(this.editingBooking.id, this.editingBookingTime).subscribe({
      next: (data: any) => {
        console.log('Booking updated:', data);
        this.notificationService.showNotification({
          type: 'info',
          title: 'Update',
          message: 'Booking updated successfully!'
        });
        this.fetchBookings();
        this.closeEditModal();
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'Failed to update booking.';
        this.notificationService.showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to update booking!'
        });
      }
    });
  }

  deleteBooking(bookingId: number): void {
    if (confirm('Are you sure you want to delete this booking?')) {
      this.officeHourService.deleteBooking(bookingId).subscribe({
        next: (res: any) => {
          console.log('Booking deleted:', res);
          this.notificationService.showNotification({
            type: 'error',
            title: 'Deleted',
            message: 'Booking deleted successfully!'
          });
          this.fetchBookings();
        },
        error: (err: any) => {
          console.error('Error deleting booking:', err);
          this.errorMessage = 'Failed to delete booking.';
          this.notificationService.showNotification({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete booking!'
          });
        }
      });
    }
  }
}
