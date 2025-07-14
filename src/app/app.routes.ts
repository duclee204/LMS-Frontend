import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LearnOnlineComponent } from './pages/learn-online/learn-online.component';
import { VideoUploadComponent } from './pages/video-upload/video-upload.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { CategoryComponent } from './pages/category/category.component';
import { CourseManagementComponent } from './pages/course-management/course-management.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { AssignmentsComponent } from './pages/assignments/assignments.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { HelpComponent } from './pages/help/help.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { authGuard } from './auth.guard';
import { loginRedirectGuard } from './login-redirect.guard';
import { adminGuard } from './admin.guard';
import { UsersComponent } from './pages/qlnd/qlnd.component';

export const routes: Routes = [
  { path: '', component: LoginComponent, data: { title: 'Trang đăng nhập' }, canActivate: [loginRedirectGuard] },
  { path: 'login', component: LoginComponent, data: { title: 'Trang đăng nhập' }, canActivate: [loginRedirectGuard] },
  { path: 'signup', component: SignupComponent, data: { title: 'Đăng ký tài khoản' }, canActivate: [loginRedirectGuard] },
  { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' }, canActivate: [authGuard] },
  { path: 'courses', component: CoursesComponent, data: { title: 'Khóa học của tôi' }, canActivate: [authGuard] },
  { path: 'calendar', component: CalendarComponent, data: { title: 'Lịch học' }, canActivate: [authGuard] },
  { path: 'assignments', component: AssignmentsComponent, data: { title: 'Bài tập' }, canActivate: [authGuard] },
  { path: 'messages', component: MessagesComponent, data: { title: 'Tin nhắn' }, canActivate: [authGuard] },
  { path: 'help', component: HelpComponent, data: { title: 'Trợ giúp' }, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, data: { title: 'Cài đặt' }, canActivate: [authGuard] },
  { path: 'learn-online', component: LearnOnlineComponent, data: { title: 'Học trực tuyến' }, canActivate: [authGuard] },
  { path: 'classroom', redirectTo: '/learn-online', pathMatch: 'full' }, // Redirect cũ
  { path: 'video-upload', component: VideoUploadComponent, data: { title: 'Tải video lên' }, canActivate: [authGuard] },
  { path: 'category', component: CategoryComponent, data: { title: 'Quản lý danh mục' }, canActivate: [authGuard] },
  { path: 'course-management', component: CourseManagementComponent, data: { title: 'Quản lý khóa học' }, canActivate: [authGuard] },
    
  // Admin routes
  { path: 'admin/dashboard', component: AdminDashboardComponent, data: { title: 'Admin Dashboard' }, canActivate: [authGuard, adminGuard] },
  { path: 'admin/users', component: AdminDashboardComponent, data: { title: 'User Management' }, canActivate: [authGuard, adminGuard] }, // Temporary use AdminDashboard
  { path: 'admin/courses', component: AdminDashboardComponent, data: { title: 'Admin Course Management' }, canActivate: [authGuard, adminGuard] },
  { path: 'admin/exams', component: AdminDashboardComponent, data: { title: 'Exam Management' }, canActivate: [authGuard, adminGuard] },
  { path: 'admin/modules', component: AdminDashboardComponent, data: { title: 'Module Management' }, canActivate: [authGuard, adminGuard] },
  { path: 'admin/reports', component: AdminDashboardComponent, data: { title: 'Reports & Analytics' }, canActivate: [authGuard, adminGuard] },
  { path: 'admin/settings', component: AdminDashboardComponent, data: { title: 'Admin Settings' }, canActivate: [authGuard, adminGuard] },
  { path: 'admin/categories', component: CategoryComponent, data: { title: 'Admin Category Management' }, canActivate: [authGuard, adminGuard] },
  { path: 'admin/enrollments', component: AdminDashboardComponent, data: { title: 'Enrollment Management' }, canActivate: [authGuard, adminGuard] },
  { path: 'admin/system', component: AdminDashboardComponent, data: { title: 'System Settings' }, canActivate: [authGuard, adminGuard] },
  { path: 'admin/logs', component: AdminDashboardComponent, data: { title: 'System Logs' }, canActivate: [authGuard, adminGuard] },
  
  // Routes for admin sidebar (without /admin prefix)
  { path: 'users', component: AdminDashboardComponent, data: { title: 'User Management' }, canActivate: [authGuard, adminGuard] },
  { path: 'exams', component: AdminDashboardComponent, data: { title: 'Exam Management' }, canActivate: [authGuard, adminGuard] },
  { path: 'modules', component: AdminDashboardComponent, data: { title: 'Module Management' }, canActivate: [authGuard, adminGuard] },
  { path: 'reports', component: AdminDashboardComponent, data: { title: 'Reports & Analytics' }, canActivate: [authGuard, adminGuard] },
  
  // Redirects for old URLs
  { path: 'tieude', redirectTo: '/category', pathMatch: 'full' },
  { path: 'qlkh', redirectTo: '/course-management', pathMatch: 'full' },
  { path: 'qlnd', component: UsersComponent, data: { title: 'Quản lý người dùng' }, canActivate: [authGuard] }, // ✅ Thêm dòng này
];
