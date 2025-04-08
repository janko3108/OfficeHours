import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.css']
})
export class CompleteProfileComponent {
  token: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  complete2FA(): void {
    window.location.href = "http://localhost:8000/account/two_factor/setup/?next=http://localhost:8000/custom-2fa-complete/";
  }
  
}
