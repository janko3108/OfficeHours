import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl; // e.g., 'http://localhost:8000'

  constructor(private http: HttpClient) {}

  // Get CSRF token (as before)
  getCsrfToken(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/csrf/`, { withCredentials: true });
  }

  // API login using the new endpoint
  login(credentials: any): Observable<any> {
    // Use URL-encoded form data, with credentials and CSRF cookie already set
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const body = `username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}`;
    return this.http.post<any>(`${this.baseUrl}/api/login/`, body, { headers, withCredentials: true });
  }

  register(userData: any): Observable<User> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const body = `username=${encodeURIComponent(userData.username)}&email=${encodeURIComponent(userData.email)}&password=${encodeURIComponent(userData.password)}&confirm_password=${encodeURIComponent(userData.confirm_password)}`;
    return this.http.post<User>(`${this.baseUrl}/api/register/`, body, { headers, withCredentials: true });
  }
}
