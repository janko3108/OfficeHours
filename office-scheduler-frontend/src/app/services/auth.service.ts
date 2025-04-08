import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin?: boolean;
  two_factor_completed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

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

  getCsrfToken(): Observable<any> {
    const csrfUrl = this.baseUrl.replace('/api', '') + '/csrf/';
    return this.http.get<any>(csrfUrl, { withCredentials: true });
  }

  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = `username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}`;
    return this.http.post<any>(`${this.baseUrl}/login/`, body, { headers, withCredentials: true }).pipe(
      tap(() => {
        this.fetchCurrentUser().subscribe();
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.getCsrfToken().pipe(
      switchMap(() => {
        const csrfToken = this.getCookie('csrftoken') || '';
        const headers = new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken
        });
        const body = `username=${encodeURIComponent(userData.username)}&email=${encodeURIComponent(userData.email)}&password=${encodeURIComponent(userData.password)}&confirm_password=${encodeURIComponent(userData.confirm_password)}`;
        return this.http.post(`${this.baseUrl}/register/`, body, { headers, withCredentials: true });
      }),
      tap((response: any) => {
        if (response.redirect) {
          window.location.href = response.redirect;
        }
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/current-user/`, { withCredentials: true }).pipe(
      tap(user => {
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
    return this.http.get<any>('http://localhost:8000/logout/', { withCredentials: true }).pipe(
      tap(() => {
        this.clearCurrentUser();
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.getValue();
  }

  completeTwoFactor(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/complete-2fa/`, { token }, { withCredentials: true }).pipe(
      tap(() => {
        this.fetchCurrentUser().subscribe();
      })
    );
  }
}
