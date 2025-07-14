import { Component, Input, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
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

  // Danh sách 3 ảnh avatar random tạm thời
  private randomAvatars = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=150&h=150&fit=crop&crop=face&auto=format',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format'
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Nếu avatarUrl không được truyền vào hoặc rỗng, lấy từ session hoặc chọn random mới
    if (!this.avatarUrl || this.avatarUrl.trim() === '') {
      this.avatarUrl = this.getSessionAvatar();
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
}