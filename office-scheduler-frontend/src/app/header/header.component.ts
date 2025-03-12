import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to current user changes and log the value
    this.authService.currentUser$.subscribe(user => {
      console.log("Current user in header:", user);
      this.currentUser = user;
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  // Trigger logout and redirect (if desired, you can call this method from the template)
  logout(): void {
    this.authService.logout().subscribe(() => {
      // Optionally, you can also reload the page or use router navigation.
      window.location.href = 'http://localhost:4200/home/';
    });
  }
}
