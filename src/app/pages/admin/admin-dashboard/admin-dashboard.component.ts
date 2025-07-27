import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebaradminComponent } from '../../../components/sidebaradmin/sidebaradmin.component';
import { ProfileComponent } from '../../../components/profile/profile.component';
import { SessionService } from '../../../services/session.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebaradminComponent, ProfileComponent],
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
    // Reload user info after profile update
    this.loadUserInfo();
  }

  onLogout() {
    this.sessionService.logout();
  }
}
