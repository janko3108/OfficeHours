import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardData {
  week_days: string[];
  time_slots: string[];
  bookings_dict: { [key: string]: any };
  week_offset: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OfficeHourService {
  // Base URL for API endpoints (make sure it includes /api)
  private baseUrl = environment.apiUrl;

  // BehaviorSubject to hold current user info
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // --- CSRF Handling ---
  getCsrfToken(): Observable<any> {
    // CSRF endpoint is assumed outside /api/
    const csrfUrl = this.baseUrl.replace('/api', '') + '/csrf/';
    return this.http.get<any>(csrfUrl, { withCredentials: true });
  }

  // Helper to get cookie value by name
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

  // --- Authentication Methods ---
  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = `username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}`;
    return this.http.post<any>(`${this.baseUrl}/login/`, body, { headers, withCredentials: true }).pipe(
      tap(response => {
        console.log('Login response:', response);
        this.fetchCurrentUser().subscribe({
          next: user => console.log("User after login:", user),
          error: err => console.error("Error fetching user after login:", err)
        });
      })
    );
  }

  register(userData: any): Observable<User> {
    const csrfToken = this.getCookie('csrftoken') || '';
    const headers = new HttpHeaders({ 
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': csrfToken  // include CSRF token here
    });
    const body = `username=${encodeURIComponent(userData.username)}&email=${encodeURIComponent(userData.email)}&password=${encodeURIComponent(userData.password)}&confirm_password=${encodeURIComponent(userData.confirm_password)}`;
    return this.http.post<User>(`${this.baseUrl}/register/`, body, { headers, withCredentials: true }).pipe(
      tap(response => {
        console.log('Registration response:', response);
        this.fetchCurrentUser().subscribe({
          next: user => console.log("User after registration:", user),
          error: err => console.error("Error fetching user after registration:", err)
        });
      })
    );
  }
  

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/current-user/`, { withCredentials: true }).pipe(
      tap(user => {
        console.log('Fetched current user:', user);
        this.currentUserSubject.next(user);
      })
    );
  }

  fetchCurrentUser(): Observable<User> {
    return this.getCurrentUser();
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  logout(): Observable<any> {
    // Logout endpoint is at /logout/ (outside /api/)
    return this.http.get<any>('http://localhost:8000/logout/', { withCredentials: true }).pipe(
      tap(response => {
        console.log('Logout response:', response);
        this.clearCurrentUser();
      })
    );
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
  // Fetch a booking's details (for editing) via GET
  getBooking(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/manage/booking/edit/${bookingId}/`, { withCredentials: true });
  }

  // Update a booking using PUT
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
