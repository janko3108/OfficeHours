import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AuthService } from './services/auth.service';
import { NotificationsComponent } from './notification.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <app-notifications></app-notifications>
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, NotificationsComponent , HeaderComponent, FooterComponent] // Add FooterComponent here
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Get the CSRF token to ensure the cookie is set
    this.authService.getCsrfToken().subscribe({
      next: (data) => console.log("CSRF token set:", data),
      error: (err) => console.error("Error fetching CSRF token:", err)
    });
    // Fetch current user data to update auth state
    this.authService.fetchCurrentUser().subscribe({
      next: (user) => console.log("Fetched current user in AppComponent:", user),
      error: (err) => console.error("Error fetching current user:", err)
    });
  }
}
