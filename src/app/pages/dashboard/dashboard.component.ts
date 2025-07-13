import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarWrapperComponent } from '../../components/sidebar-wrapper/sidebar-wrapper.component';
import { ProfileComponent } from '../../components/profile/profile.component';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [SidebarWrapperComponent, ProfileComponent, CommonModule]
})
export class DashboardComponent implements OnInit {
  userRole: string = '';
  userName: string = '';
  roleDisplayName: string = '';
  
  // Profile component properties
  username: string = '';
  avatarUrl: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    this.checkAdminRedirect();
    this.loadUserInfo();
  }

  // Kiểm tra và redirect admin đến admin dashboard
  checkAdminRedirect() {
    if (this.sessionService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }
  }

  // Load thông tin user từ JWT token
  loadUserInfo() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode JWT token để lấy thông tin user
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('JWT payload:', payload);
          
          this.userRole = payload.role || 'student';
          this.userName = payload.sub || 'Unknown';
          
          // Profile component data
          this.username = payload.fullName || payload.sub || 'User';
          // Không set avatarUrl để profile component tự chọn random avatar
          
          // Chuyển đổi role thành tên hiển thị
          this.roleDisplayName = this.getRoleDisplayName(this.userRole);
          
          console.log('User info loaded:', { 
            role: this.userRole, 
            name: this.userName, 
            displayName: this.roleDisplayName 
          });
        } catch (error) {
          console.error('Error decoding token:', error);
          this.userRole = 'student';
          this.roleDisplayName = 'Sinh viên';
        }
      }
    }
  }

  // Chuyển đổi role code thành tên hiển thị
  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ROLE_admin':
      case 'admin':
        return 'Quản trị viên';
      case 'ROLE_instructor':
      case 'instructor':
        return 'Giảng viên';
      case 'ROLE_student':
      case 'student':
        return 'Sinh viên';
      default:
        return 'Người dùng';
    }
  }

  // Profile component event handlers
  onProfileUpdate() {
    console.log('Profile update requested');
  }

  onLogout() {
    this.sessionService.logout();
  }
}
