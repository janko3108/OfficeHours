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
  imports: [RouterOutlet, NotificationsComponent, HeaderComponent, FooterComponent]
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCsrfToken().subscribe();
    this.authService.fetchCurrentUser().subscribe();
  }
}
