import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
  userData = { username: '', email: '', password: '', confirm_password: '' };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    if (this.userData.password !== this.userData.confirm_password) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    this.authService.register(this.userData).subscribe({
      next: (_user: User) => {
        this.router.navigate(['/login']);
      },
      error: (_err: any) => {
        this.errorMessage = 'Registration failed. Please try again.';
      }
    });
  }
}
