// src/app/services/office-hour.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private baseUrl = environment.apiUrl; // e.g., "http://localhost:8000"

  constructor(private http: HttpClient) {}

  getStudentDashboard(weekOffset: number = 0): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.baseUrl}/dashboard/?week=${weekOffset}`, { withCredentials: true });
  }

  getAdminDashboard(): Observable<{ bookings: any[] }> {
    return this.http.get<{ bookings: any[] }>(`${this.baseUrl}/admin-dashboard/`, { withCredentials: true });
  }
}
