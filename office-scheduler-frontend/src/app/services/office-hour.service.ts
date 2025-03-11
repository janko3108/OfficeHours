// src/app/services/office-hour.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OfficeHour {
  id: number;
  student: string;
  booking_time: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfficeHourService {
  private baseUrl = environment.apiUrl; // e.g., 'http://localhost:8000/api'

  constructor(private http: HttpClient) { }

  // Get list of office hour bookings for the logged in user (or all if admin)
  getOfficeHours(): Observable<OfficeHour[]> {
    return this.http.get<OfficeHour[]>(`${this.baseUrl}/officehours/`, { withCredentials: true });
  }

  // Create a new booking
  bookOfficeHour(bookingData: any): Observable<OfficeHour> {
    return this.http.post<OfficeHour>(`${this.baseUrl}/officehours/`, bookingData, { withCredentials: true });
  }
}
