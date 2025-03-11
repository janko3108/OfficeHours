import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  constructor(private router: Router) {}

  login(): void {
    // Instead of sending a POST request, redirect to Django's two_factor login page.
    window.location.href = 'http://localhost:8000/login/';
  }
}
