import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { filter, map, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      // 🛑 Skip null values — wait until user is loaded
      filter((user: User | null): user is User => user !== null),
      // ✅ Check if 2FA is complete
      map(user => !!user.two_factor_completed),
      // 🚨 If not allowed, redirect
      tap(allowed => {
        if (!allowed) {
          this.router.navigate(['/complete-profile']);
        }
      }),
      // 🔁 Handle edge cases
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
