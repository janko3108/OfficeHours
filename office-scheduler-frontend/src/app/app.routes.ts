import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'dashboard', component: StudentDashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: 'home' }
];
