import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login(this.credentials).subscribe({
      next: () => {
        // After successful login, fetch current user data
        this.authService.fetchCurrentUser().subscribe({
          next: (user) => {
            console.log("Logged in user:", user);
            if (user && user.isAdmin) {
              this.router.navigate(['/admin-dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          error: (err) => {
            console.error("Error fetching user:", err);
            this.errorMessage = 'Could not retrieve user information after login.';
          }
        });
      },
      error: (err) => {
        console.error("Login failed:", err);
        this.errorMessage = 'Login failed. Please check your credentials.';
      }
    });
  }
}
