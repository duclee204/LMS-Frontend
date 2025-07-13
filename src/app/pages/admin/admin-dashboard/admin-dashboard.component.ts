import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { ProfileComponent } from '../../../components/profile/profile.component';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ProfileComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  
  userName: string = '';
  userRole: string = '';
  
  // Profile component properties
  username: string = '';
  avatarUrl: string = '';

  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  loadUserInfo() {
    const user = this.sessionService.getCurrentUser();
    if (user) {
      this.userName = user.sub || 'Admin';
      this.userRole = user.role || 'ADMIN';
      this.username = user.fullName || user.sub || 'Admin';
      // Không set avatarUrl để profile component tự chọn random avatar
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
