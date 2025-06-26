import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: LoginComponent, data: { title: 'Trang đăng nhập' } },
  { path: 'login', component: LoginComponent, data: { title: 'Trang đăng nhập' } },
  { path: 'signup', component: SignupComponent, data: { title: 'Đăng ký tài khoản' } },
  { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
];
