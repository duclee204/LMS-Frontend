import { Component, Input, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProfileUpdateComponent } from '../profile-update/profile-update.component';
import { AvatarService } from '../../services/avatar.service';
import { UserService } from '../../services/user.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ProfileUpdateComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @Input() username: string = 'User';
  @Input() role: string = 'Student';
  @Input() avatarUrl: string = '';
  @Input() showNotifications: boolean = true;
  @Input() showMessages: boolean = true;

  @Output() profileUpdate = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  profileDropdownVisible = false;
  showProfileUpdateModal = false;

  // Danh sách 3 ảnh avatar random tạm thời
  private randomAvatars = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=150&h=150&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format'
  ];

  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private avatarService: AvatarService
  ) {}

  ngOnInit() {
    // Load user info from API first to get latest avatar
    this.loadUserFromAPI();
    
    // Fallback: Nếu avatarUrl không được truyền vào hoặc rỗng, lấy từ session hoặc chọn random mới
    if (!this.avatarUrl || this.avatarUrl.trim() === '') {
      this.avatarUrl = this.getSessionAvatar();
    } else {
      // Process avatar URL to add base URL if needed
      const processedUrl = this.avatarService.processAvatarUrl(this.avatarUrl);
      this.avatarUrl = processedUrl || this.getSessionAvatar();
    }
  }

  // Load user data from API to get latest info including avatar
  private loadUserFromAPI() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        this.userService.getCurrentUser().subscribe({
          next: (user) => {
            console.log('🔄 Loaded user from API:', user);
            
            // Update user info
            this.username = user.fullName || user.username || this.username;
            this.role = user.role || this.role;
            
            // Update avatar with processed URL
            if (user.avatarUrl) {
              const processedUrl = this.avatarService.processAvatarUrl(user.avatarUrl);
              this.avatarUrl = processedUrl || this.getSessionAvatar();
              console.log('✅ Updated avatar from API:', this.avatarUrl);
            } else {
              console.log('⚠️ No avatar URL from API, using fallback');
              this.avatarUrl = this.getSessionAvatar();
            }
          },
          error: (error) => {
            console.error('❌ Error loading user from API:', error);
            // Fallback to token or session avatar
            this.loadUserFromToken();
          }
        });
      } else {
        console.log('⚠️ No access token found');
        this.avatarUrl = this.getSessionAvatar();
      }
    }
  }

  // Fallback: Load user from JWT token
  private loadUserFromToken() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔄 Loaded user from token:', payload);
          
          this.username = payload.fullName || payload.sub || this.username;
          this.role = payload.role || this.role;
          
          if (payload.avatarUrl) {
            const processedUrl = this.avatarService.processAvatarUrl(payload.avatarUrl);
            this.avatarUrl = processedUrl || this.getSessionAvatar();
            console.log('✅ Updated avatar from token:', this.avatarUrl);
          } else {
            this.avatarUrl = this.getSessionAvatar();
          }
        } catch (error) {
          console.error('❌ Error decoding token:', error);
          this.avatarUrl = this.getSessionAvatar();
        }
      }
    }
  }

  // Hàm lấy avatar cho session hiện tại
  private getSessionAvatar(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return this.randomAvatars[0]; // Fallback cho SSR
    }

    const sessionAvatarKey = 'session_avatar';
    let savedAvatar = sessionStorage.getItem(sessionAvatarKey);
    
    // Nếu chưa có avatar cho session này, chọn random và lưu lại
    if (!savedAvatar) {
      const randomIndex = Math.floor(Math.random() * this.randomAvatars.length);
      savedAvatar = this.randomAvatars[randomIndex];
      sessionStorage.setItem(sessionAvatarKey, savedAvatar);
      console.log('🎲 New random avatar selected for this session:', savedAvatar);
    } else {
      console.log('♻️ Using existing session avatar:', savedAvatar);
    }
    
    return savedAvatar;
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    this.profileDropdownVisible = !this.profileDropdownVisible;
  }

  updateProfile() {
    this.profileDropdownVisible = false;
    this.showProfileUpdateModal = true;
  }

  closeProfileUpdateModal() {
    this.showProfileUpdateModal = false;
  }

  onProfileUpdateSuccess(updatedUser?: any) {
    this.showProfileUpdateModal = false;
    
    // Update avatar if provided
    if (updatedUser && updatedUser.avatarUrl) {
      const processedUrl = this.avatarService.processAvatarUrl(updatedUser.avatarUrl);
      this.avatarUrl = processedUrl || this.getSessionAvatar();
    }
    
    // Update other user info if provided
    if (updatedUser) {
      this.username = updatedUser.fullName || updatedUser.username || this.username;
      // Note: role shouldn't change in profile update typically
    }
    
    this.profileUpdate.emit();
  }

  onLogout() {
    this.profileDropdownVisible = false;
    this.logout.emit();
  }

  // Đóng dropdown khi click outside
  closeDropdown() {
    this.profileDropdownVisible = false;
  }
  
  getDisplayAvatar(): string {
    if (this.avatarUrl && !this.avatarUrl.includes('default.png')) {
      return this.avatarUrl;
    }
    
    return this.sessionService.getAvatarUrl();
  }

  onAvatarError(event: any) {
    // Fallback to a reliable default avatar
    event.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
  }
}