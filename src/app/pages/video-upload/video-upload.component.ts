import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';
import { ModuleService } from '../../services/module.service';
import { SidebarWrapperComponent } from '../../components/sidebar-wrapper/sidebar-wrapper.component';
import { ProfileComponent } from '../../components/profile/profile.component';

@Component({
  standalone: true,
  selector: 'app-video-upload',
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarWrapperComponent, ProfileComponent],
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss']
})
export class VideoUploadComponent implements OnInit {
  title = '';
  description = '';
  selectedFile: File | null = null;
  successMessage = false;
  courseId: number | null = null; // Dynamic courseId based on user selection
  courses: any[] = []; // Danh sách courses của user
  availableModules: any[] = []; // Danh sách modules của course được chọn
  selectedModuleId: string | number = ''; // Module được chọn
  
  // New properties for grouped display
  coursesWithModules: any[] = []; // Courses grouped with their modules
  expandedCourses: Set<number> = new Set(); // Track which courses are expanded
  
  loading = false;
  uploadProgress = 0; // Progress bar
  maxFileSize = 500 * 1024 * 1024; // 500MB in bytes
  isDragOver = false; // Drag & drop state

  // Profile component properties
  username: string = '';
  userRole: string = '';
  avatarUrl: string = '';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private apiService: ApiService,
    private sessionService: SessionService,
    private moduleService: ModuleService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.initializeUserProfile();
    this.loadUserCourses();
  }

  // Initialize user profile
  initializeUserProfile(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.username = payload.sub || 'User';
          this.userRole = payload.role || '';
          this.avatarUrl = this.getSessionAvatar();
        } catch (error) {
          console.error('Error decoding token:', error);
          this.username = 'User';
          this.userRole = '';
          this.avatarUrl = '';
        }
      }
    }
  }

  getSessionAvatar(): string {
    if (isPlatformBrowser(this.platformId)) {
      const savedAvatar = sessionStorage.getItem('userAvatar');
      if (savedAvatar) {
        return savedAvatar;
      }
      
      // Generate random avatar if not exists
      const avatars = [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      ];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      sessionStorage.setItem('userAvatar', randomAvatar);
      return randomAvatar;
    }
    return '';
  }

  onProfileUpdate(): void {
    console.log('Profile update requested');
    // Reload user info after profile update
    this.initializeUserProfile();
  }

  onLogout(): void {
    this.sessionService.logout();
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Drag & Drop handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.handleFileSelection(file);
    }
  }

  // Extract file selection logic into separate method
  private handleFileSelection(file: File): void {
    // Validate file size (500MB = 500 * 1024 * 1024 bytes)
    if (file.size > this.maxFileSize) {
      this.showAlert(`File quá lớn! Kích thước tối đa cho phép là ${this.maxFileSize / (1024 * 1024)}MB`);
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      this.showAlert('Vui lòng chọn file video!');
      return;
    }
    
    this.selectedFile = file;
    console.log(`Selected file: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
  }

  // Helper method để xử lý alert trong SSR
  private showAlert(message: string) {
    if (isPlatformBrowser(this.platformId)) {
      alert(message);
    } else {
      console.log('Alert (SSR):', message);
    }
  }

  // Load courses với modules cho grouped display
  loadCoursesWithModules(courses: any[]) {
    this.coursesWithModules = [];
    
    courses.forEach(course => {
      this.moduleService.setCurrentCourseId(course.courseId);
      this.moduleService.getModules().subscribe({
        next: (modules) => {
          const courseWithModules = {
            ...course,
            modules: modules || []
          };
          this.coursesWithModules.push(courseWithModules);
          
          // Auto-select first course and expand it if it's the first one
          if (this.coursesWithModules.length === 1) {
            this.expandedCourses.add(course.courseId);
            this.availableModules = modules || [];
          }
        },
        error: (err) => {
          console.error(`Lỗi khi tải modules cho course ${course.courseId}:`, err);
          const courseWithModules = {
            ...course,
            modules: []
          };
          this.coursesWithModules.push(courseWithModules);
        }
      });
    });
  }

  // Toggle course expansion in the grouped view
  toggleCourseExpansion(courseId: number) {
    if (this.expandedCourses.has(courseId)) {
      this.expandedCourses.delete(courseId);
    } else {
      this.expandedCourses.add(courseId);
    }
  }

  // Check if course is expanded
  isCourseExpanded(courseId: number): boolean {
    return this.expandedCourses.has(courseId);
  }

  // Select module directly from the grouped view
  selectModuleFromGroup(courseId: number, moduleId: string | number) {
    this.courseId = courseId;
    this.selectedModuleId = moduleId;
    
    // Update available modules for the selected course
    const selectedCourse = this.coursesWithModules.find(c => c.courseId === courseId);
    if (selectedCourse) {
      this.availableModules = selectedCourse.modules;
    }
  }

  // Load modules khi thay đổi course
  onCourseChange() {
    if (this.courseId) {
      this.loadModulesForCourse(this.courseId);
      this.selectedModuleId = ''; // Reset module selection
    }
  }

  // Load danh sách modules cho course được chọn
  loadModulesForCourse(courseId: number) {
    this.moduleService.setCurrentCourseId(courseId);
    this.moduleService.getModules().subscribe({
      next: (modules) => {
        this.availableModules = modules;
        console.log('Loaded modules for course:', modules);
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách modules:', err);
        this.availableModules = [];
      }
    });
  }

  // Load courses của user hiện tại (chỉ instructor mới có courses để upload)
  loadUserCourses() {
    this.loading = true;
    this.apiService.getCoursesByUser().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loadCoursesWithModules(courses);
        // Tự động chọn course đầu tiên nếu có và load modules
        if (courses.length > 0) {
          this.courseId = courses[0].courseId;
          if (this.courseId) {
            this.loadModulesForCourse(this.courseId);
          }
        }
        this.loading = false;
        console.log('Loaded courses:', courses);
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách khóa học:', err);
        if (err.status === 401) {
          this.showAlert('Bạn cần đăng nhập để xem khóa học');
        } else if (err.status === 403) {
          this.showAlert('Bạn không có quyền truy cập (chỉ instructor mới được upload video)');
        } else {
          this.showAlert('Lỗi khi tải danh sách khóa học');
        }
        this.loading = false;
      }
    });
  }

  // ...existing code...
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files?.length) {
      const file = target.files[0];
      this.handleFileSelection(file);
    }
  }

  onSubmit(): void {
    if (!this.title || !this.description || !this.selectedFile || !this.courseId) {
      this.showAlert('Vui lòng điền đầy đủ thông tin, chọn khóa học và chọn video.');
      return;
    }

    // Kiểm tra kích thước file
    if (this.selectedFile.size > this.maxFileSize) {
      this.showAlert(`Kích thước file vượt quá giới hạn cho phép (${this.maxFileSize / (1024 * 1024)}MB).`);
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.title);
    formData.append('description', this.description);
    formData.append('courseId', this.courseId.toString());
    
    // Nếu có chọn module, gắn moduleId vào
    if (this.selectedModuleId && this.selectedModuleId !== '') {
      formData.append('moduleId', this.selectedModuleId.toString());
    }

    this.loading = true;

    // Sử dụng ApiService để upload
    this.apiService.uploadVideo(formData).subscribe({
      next: (res: any) => {
        console.log('Upload response:', res);
        this.successMessage = true;
        this.showAlert('Upload video thành công!');
        
        // Reset form
        this.title = '';
        this.description = '';
        this.selectedFile = null;
        // Giữ nguyên courseId đã chọn để tiện upload tiếp
        this.loading = false;
        
        setTimeout(() => {
          this.successMessage = false;
        }, 3000); // Ẩn thông báo thành công sau 3 giây
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.loading = false;
        
        if (err.status === 401) {
          this.showAlert('Bạn cần đăng nhập để upload video');
        } else if (err.status === 403) {
          this.showAlert('Bạn không có quyền upload video cho khóa học này (chỉ instructor mới được upload)');
        } else if (err.status === 400) {
          this.showAlert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại file và thông tin.');
        } else if (err.status === 413) {
          this.showAlert('File quá lớn! Vui lòng chọn file nhỏ hơn.');
        } else {
          this.showAlert('Tải lên thất bại! Vui lòng thử lại.');
        }
      }
    });
  }
}

