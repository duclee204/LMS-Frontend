import { Component, OnInit, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { SessionService } from '../../services/session.service';
import { AvatarService } from '../../services/avatar.service';

@Component({
  selector: 'app-profile-update',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.scss']
})
export class ProfileUpdateComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() updateSuccess = new EventEmitter<User>();

  profileForm: FormGroup;
  loading = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  currentUser: User | null = null;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private sessionService: SessionService,
    private avatarService: AvatarService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      password: [''], // Optional field for password update
      confirmPassword: ['']
    });
  }

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.userId = payload.id || payload.userId;
          
          // Load user data from token first (fallback)
          this.profileForm.patchValue({
            username: payload.sub || '',
            email: payload.email || '',
            fullName: payload.fullName || payload.sub || ''
          });
          
          this.currentUser = {
            userId: this.userId || 0,
            username: payload.sub || '',
            email: payload.email || '',
            fullName: payload.fullName || payload.sub || '',
            role: payload.role || 'student',
            verified: payload.verified || false,
            avatarUrl: payload.avatarUrl || null
          };

          // Load fresh user data from API to get updated avatar
          this.loadUserFromAPI();
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }
  }

  loadUserFromAPI() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        // Update form with fresh data
        this.profileForm.patchValue({
          username: user.username || '',
          email: user.email || '',
          fullName: user.fullName || ''
        });
        
        // Update current user with fresh data including avatar
        this.currentUser = {
          userId: user.userId || 0,
          username: user.username || '',
          email: user.email || '',
          fullName: user.fullName || '',
          role: user.role || 'student',
          verified: user.verified || false,
          avatarUrl: user.avatarUrl || null
        };
      },
      error: (error) => {
        console.error('Error loading user from API:', error);
        // Keep token data as fallback
      }
    });
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      this.selectedFile = target.files[0];
      
      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    if (!this.userId) {
      this.showAlert('Không tìm thấy thông tin người dùng');
      return;
    }

    // Check password confirmation
    const password = this.profileForm.get('password')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;
    
    if (password && password !== confirmPassword) {
      this.showAlert('Mật khẩu xác nhận không khớp');
      return;
    }

    this.loading = true;
    const formData = new FormData();
    
    formData.append('username', this.profileForm.get('username')?.value || '');
    formData.append('email', this.profileForm.get('email')?.value || '');
    formData.append('fullName', this.profileForm.get('fullName')?.value || '');
    
    // ✅ Xử lý role: loại bỏ prefix "ROLE_" nếu có
    let role = this.currentUser?.role || 'student';
    if (role.startsWith('ROLE_')) {
      role = role.substring(5); // Loại bỏ "ROLE_"
    }
    formData.append('role', role);
    
    // Only add password if it's provided
    if (password && password.trim()) {
      formData.append('password', password);
    }

    // Add avatar file if selected
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.userService.updateUserWithForm(this.userId, formData).subscribe({
      next: (response) => {
        this.showAlert('Cập nhật hồ sơ thành công!');
        
        // Reload user data to get updated info including avatar
        this.userService.getCurrentUser().subscribe({
          next: (updatedUser) => {
            this.updateSuccess.emit(updatedUser);
            this.closeModal.emit();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading updated user:', error);
            // Still emit success even if reload fails
            this.updateSuccess.emit();
            this.closeModal.emit();
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Update error:', error);
        this.showAlert('Cập nhật hồ sơ thất bại: ' + (error.error?.message || 'Lỗi không xác định'));
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showAlert(message: string) {
    if (isPlatformBrowser(this.platformId)) {
      alert(message);
    } else {
      console.log('Alert (SSR):', message);
    }
  }

  cancel() {
    this.closeModal.emit();
  }

  onAvatarError(event: any) {
    // Fallback to a reliable default avatar
    event.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
  }

  getAvatarUrl(): string {
    // Use current user data from component state
    if (this.currentUser?.avatarUrl) {
      return this.currentUser.avatarUrl;
    }
    
    // Check if we have an image preview (newly selected file)
    if (this.imagePreview) {
      return this.imagePreview;
    }
    
    // Return a reliable default avatar URL
    return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
  }
}
