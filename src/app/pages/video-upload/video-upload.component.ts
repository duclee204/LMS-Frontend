import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-video-upload',
  imports: [CommonModule, FormsModule, HttpClientModule],
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
  loading = false;
  uploadProgress = 0; // Progress bar
  maxFileSize = 500 * 1024 * 1024; // 500MB in bytes

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadUserCourses();
  }

  // Helper method để xử lý alert trong SSR
  private showAlert(message: string) {
    if (isPlatformBrowser(this.platformId)) {
      alert(message);
    } else {
      console.log('Alert (SSR):', message);
    }
  }

  // Load courses của user hiện tại (chỉ instructor mới có courses để upload)
  loadUserCourses() {
    this.loading = true;
    this.apiService.getCoursesByUser().subscribe({
      next: (courses) => {
        this.courses = courses;
        // Tự động chọn course đầu tiên nếu có
        if (courses.length > 0) {
          this.courseId = courses[0].courseId;
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

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files?.length) {
      const file = target.files[0];
      
      // Validate file size (500MB = 500 * 1024 * 1024 bytes)
      if (file.size > this.maxFileSize) {
        this.showAlert(`File quá lớn! Kích thước tối đa cho phép là ${this.maxFileSize / (1024 * 1024)}MB`);
        target.value = ''; // Clear input
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        this.showAlert('Vui lòng chọn file video!');
        target.value = ''; // Clear input
        return;
      }
      
      this.selectedFile = file;
      console.log(`Selected file: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
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
        // Giữ nguyên courseId đã chọn
        this.loading = false;
        
        setTimeout(() => {
          this.successMessage = false;
          this.router.navigate(['/learn-online']);
        }, 1500);
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

