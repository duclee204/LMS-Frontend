import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LearnOnlineComponent } from './pages/learn-online/learn-online.component';
import { VideoUploadComponent } from './pages/video-upload/video-upload.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { CategoryComponent } from './pages/category/category.component';
import { CourseManagementComponent } from './pages/course-management/course-management.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent, data: { title: 'Trang đăng nhập' } },
  { path: 'login', component: LoginComponent, data: { title: 'Trang đăng nhập' } },
  { path: 'signup', component: SignupComponent, data: { title: 'Đăng ký tài khoản' } },
  { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' }, canActivate: [authGuard] },
  { path: 'courses', component: CoursesComponent, data: { title: 'Khóa học của tôi' }, canActivate: [authGuard] },
  { path: 'learn-online', component: LearnOnlineComponent, data: { title: 'Học trực tuyến' }, canActivate: [authGuard] },
  { path: 'classroom', redirectTo: '/learn-online', pathMatch: 'full' }, // Redirect cũ
  { path: 'video-upload', component: VideoUploadComponent, data: { title: 'Tải video lên' }, canActivate: [authGuard] },
  { path: 'category', component: CategoryComponent, data: { title: 'Quản lý danh mục' }, canActivate: [authGuard] },
  { path: 'course-management', component: CourseManagementComponent, data: { title: 'Quản lý khóa học' }, canActivate: [authGuard] },
  // Redirects for old URLs
  { path: 'tieude', redirectTo: '/category', pathMatch: 'full' },
  { path: 'qlkh', redirectTo: '/course-management', pathMatch: 'full' },
];
