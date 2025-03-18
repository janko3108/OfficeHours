import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardData {
  week_days: string[];
  time_slots: string[];
  bookings_dict: { [key: string]: any };
  week_offset: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfficeHourService {
  // Base URL for API endpoints (e.g., 'http://localhost:8000/api')
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- CSRF Handling ---
  getCsrfToken(): Observable<any> {
    // CSRF endpoint is assumed to be outside the /api/ prefix.
    const csrfUrl = this.baseUrl.replace('/api', '') + '/csrf/';
    return this.http.get<any>(csrfUrl, { withCredentials: true });
  }

  // Helper to get cookie value by name.
  private getCookie(name: string): string | null {
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return null;
  }

  // --- Dashboard Endpoints ---
  getStudentDashboard(weekOffset: number = 0): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.baseUrl}/dashboard/?week=${weekOffset}`, { withCredentials: true });
  }

  getAdminDashboard(): Observable<{ bookings: any[] }> {
    return this.http.get<{ bookings: any[] }>(`${this.baseUrl}/admin-dashboard/`, { withCredentials: true });
  }

  // --- Booking Endpoints ---
  bookOfficeHour(bookingTime: string): Observable<any> {
    const csrfToken = this.getCookie('csrftoken') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': csrfToken
    });
    const body = `booking_time=${encodeURIComponent(bookingTime)}`;
    return this.http.post<any>(`${this.baseUrl}/book/`, body, { headers, withCredentials: true });
  }

  deleteBooking(bookingId: number): Observable<any> {
    const csrfToken = this.getCookie('csrftoken') || '';
    const headers = new HttpHeaders({ 'X-CSRFToken': csrfToken });
    return this.http.delete<any>(`${this.baseUrl}/manage/booking/delete/${bookingId}/`, { headers, withCredentials: true });
  }

  // --- Edit Booking Endpoints ---
  getBooking(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/manage/booking/edit/${bookingId}/`, { withCredentials: true });
  }

  updateBooking(bookingId: number, bookingTime: string): Observable<any> {
    const csrfToken = this.getCookie('csrftoken') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken
    });
    const body = { booking_time: bookingTime };
    return this.http.put<any>(`${this.baseUrl}/manage/booking/edit/${bookingId}/`, body, { headers, withCredentials: true });
  }
}
