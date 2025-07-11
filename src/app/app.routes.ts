import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './auth.guard';
import { VideoUploadComponent } from './video-upload/video-upload.component';
import { LearnOnlineComponent } from './learn-online/learn-online.component';


export const routes: Routes = [
  { path: '', component: LoginComponent, data: { title: 'Trang đăng nhập' } },
  { path: 'login', component: LoginComponent, data: { title: 'Trang đăng nhập' } },
  { path: 'signup', component: SignupComponent, data: { title: 'Đăng ký tài khoản' } },
  { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' }, canActivate: [authGuard] },
  { path: 'video', redirectTo: 'upload', pathMatch: 'full' }, // mặc định chuyển hướng
  { path: 'upload', component: VideoUploadComponent, data: { title: 'Tải video lên' } },
  { path: 'classroom', component: LearnOnlineComponent, data: { title: 'Phòng học' } }
];
