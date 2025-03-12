import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl; // e.g., 'http://localhost:8000/api'
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCsrfToken(): Observable<any> {
    const csrfUrl = this.baseUrl.replace('/api', '') + '/csrf/';
    return this.http.get<any>(csrfUrl, { withCredentials: true });
  }

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
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
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

  // New logout method: calls the logout endpoint and returns JSON.
  logout(): Observable<any> {
    return this.http.get<any>('http://localhost:8000/logout/', { withCredentials: true }).pipe(
      tap(response => {
        console.log('Logout response:', response);
        this.clearCurrentUser();
      })
    );
  }
}
