import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { QlkhComponent } from './pages/qlkh/qlkh.component';
import { TieudeComponent } from './pages/tieude/tieude.component'; // 👈 Thêm dòng này

import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent, data: { title: 'Trang đăng nhập' } },
  { path: 'login', component: LoginComponent, data: { title: 'Trang đăng nhập' } },
  { path: 'signup', component: SignupComponent, data: { title: 'Đăng ký tài khoản' } },
  { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' }, canActivate: [authGuard] },
  { path: 'qlkh', component: QlkhComponent, data: { title: 'Quản lý khóa học' }, canActivate: [authGuard] },
  { path: 'report', component: TieudeComponent, data: { title: 'Báo cáo' }, canActivate: [authGuard] }, // ✅ Thêm dòng này
 
];
