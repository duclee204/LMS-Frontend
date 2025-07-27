import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleService, ModuleItem } from '../../services/module.service'; // 👈 Quan trọng
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
@Component({
  selector: 'app-module',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss']
})
export class ModuleComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public searchTerm = '';
  public modules: ModuleItem[] = [];
  public filteredModules: ModuleItem[] = [];
  public courseId: number = 0;

  public leftMenuHidden = false;
  public showProfileDropdown = false;

  // Video upload properties
  public showVideoUploadModal = false;
  public videoUploading = false;
  public isVideoDragOver = false;
  public videoUploadData = {
    title: '',
    description: '',
    selectedFile: null as File | null,
    selectedModuleId: '' as string | number
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private moduleService: ModuleService, // 👈 Sử dụng service
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    console.log('ModuleComponent initialized');
    
    // Lấy courseId từ route parameters
    this.route.params.subscribe(params => {
      console.log('Route params:', params);
      if (params['courseId']) {
        this.courseId = +params['courseId'];
        console.log('CourseId from params:', this.courseId);
        this.moduleService.setCurrentCourseId(this.courseId);
        this.loadModules();
      }
    });

    // Lấy courseId từ query parameters (fallback)
    this.route.queryParams.subscribe(queryParams => {
      console.log('Query params:', queryParams);
      if (queryParams['courseId'] && !this.courseId) {
        this.courseId = +queryParams['courseId'];
        console.log('CourseId from query params:', this.courseId);
        this.moduleService.setCurrentCourseId(this.courseId);
        this.loadModules();
      }
    });

    // Nếu không có courseId, load modules mặc định (có thể là empty)
    if (!this.courseId) {
      console.log('No courseId found, loading default modules');
      this.loadModules();
    }
  }

  loadModules(): void {
    console.log('Loading modules for courseId:', this.courseId);
    this.moduleService.getModules().subscribe({
      next: (data) => {
        console.log('Modules loaded successfully:', data);
        this.modules = data.map(m => ({
          moduleId: m.moduleId,
          title: m.title,
          orderNumber: m.orderNumber,
          description: m.description,
          status: m.status
        }));
        this.filteredModules = [...this.modules];
      },
      error: err => {
        console.error('Error loading modules:', err);
        alert('Lỗi tải danh sách module: ' + (err.error?.message || err.message));
      }
    });
  }

  onSearch(): void {
    const keyword = this.searchTerm.toLowerCase();
    this.filteredModules = this.modules.filter(item =>
      item.title && item.title.toLowerCase().includes(keyword)
    );
  }

  toggleDropdown(item: ModuleItem): void {
    this.modules.forEach(m => m.showDropdown = m === item ? !item.showDropdown : false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.modules.forEach(m => (m.showDropdown = false));
    }
  }

  changeStatus(item: ModuleItem, status: 'Published' | 'NotPublished'): void {
    if (!item.moduleId) return;

    if (this.modules[0] === item) {
      // Update tất cả
      this.modules.forEach(m => {
        if (!m.moduleId) return;
        const updated = { ...m, status };
        this.moduleService.updateModule(updated).subscribe(() => {
          m.status = status;
          m.showDropdown = false;
        });
      });
    } else {
      if (this.modules[0].status !== 'Published' && status === 'Published') {
        alert('Bạn phải xuất bản module đầu tiên trước!');
        item.showDropdown = false;
        return;
      }
      const updated = { ...item, status };
      this.moduleService.updateModule(updated).subscribe(() => {
        item.status = status;
        item.showDropdown = false;
      });
    }
  }

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name);
    
    if (!this.courseId) {
      alert('Lỗi: Không tìm thấy ID khóa học. Vui lòng thử lại.');
      return;
    }

    const filename = file.name;
    const exists = this.modules.some(m => m.title === filename);
    if (exists) {
      alert('File đã tồn tại trong danh sách.');
      return;
    }

    const nextOrder = this.modules.length > 0 ? Math.max(...this.modules.map(m => m.orderNumber || 0)) + 1 : 1;
    
    console.log('Creating module:', { 
      title: filename, 
      status: 'NotPublished', 
      orderNumber: nextOrder,
      courseId: this.courseId
    });
    
    this.moduleService.createModule({ 
      title: filename, 
      description: `Module được tạo từ file: ${filename}`,
      status: 'NotPublished', 
      orderNumber: nextOrder 
    }).subscribe({
      next: (response) => {
        console.log('Module created successfully:', response);
        alert('Tải lên thành công');
        this.loadModules();
      },
      error: err => {
        console.error('Error creating module:', err);
        let errorMessage = 'Không thể tải lên module mới';
        if (err.error?.message) {
          errorMessage += ': ' + err.error.message;
        } else if (err.message) {
          errorMessage += ': ' + err.message;
        }
        alert(errorMessage);
      }
    });
  }

  toggleLeftMenu(): void {
    this.leftMenuHidden = !this.leftMenuHidden;
  }

  updateProfile(): void {
    alert('Chuyển đến trang cập nhật hồ sơ...');
  }

  logout(): void {
    alert('Đăng xuất...');
  }

  goToAddModule(): void {
    if (this.courseId) {
      this.router.navigate(['/addmodule', this.courseId]);
    } else {
      this.router.navigate(['/addmodule'], { 
        queryParams: { courseId: this.courseId || 0 } 
      });
    }
  }

  toggleProfileDropdown(event: Event): void {
    event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  // Video upload methods
  openVideoUploadDialog(): void {
    this.showVideoUploadModal = true;
    this.resetVideoUploadData();
  }

  closeVideoUploadDialog(): void {
    this.showVideoUploadModal = false;
    this.resetVideoUploadData();
  }

  resetVideoUploadData(): void {
    this.videoUploadData = {
      title: '',
      description: '',
      selectedFile: null,
      selectedModuleId: ''
    };
    this.isVideoDragOver = false;
    this.videoUploading = false;
  }

  onVideoFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files?.length) {
      const file = target.files[0];
      this.handleVideoFileSelection(file);
    }
  }

  onVideoDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isVideoDragOver = true;
  }

  onVideoDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isVideoDragOver = false;
  }

  onVideoDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isVideoDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files?.length) {
      const file = files[0];
      this.handleVideoFileSelection(file);
    }
  }

  handleVideoFileSelection(file: File): void {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Vui lòng chọn file video!');
      return;
    }
    
    // Validate file size (500MB)
    const maxFileSize = 500 * 1024 * 1024;
    if (file.size > maxFileSize) {
      alert(`File quá lớn! Kích thước tối đa cho phép là ${maxFileSize / (1024 * 1024)}MB`);
      return;
    }
    
    this.videoUploadData.selectedFile = file;
    
    // Auto-fill title if empty
    if (!this.videoUploadData.title) {
      this.videoUploadData.title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    }
    
    console.log(`Video file selected: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  submitVideoUpload(): void {
    if (!this.videoUploadData.title || !this.videoUploadData.description || !this.videoUploadData.selectedFile) {
      alert('Vui lòng điền đầy đủ thông tin và chọn video.');
      return;
    }

    if (!this.courseId) {
      alert('Lỗi: Không tìm thấy ID khóa học. Vui lòng thử lại.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.videoUploadData.selectedFile);
    formData.append('title', this.videoUploadData.title);
    formData.append('description', this.videoUploadData.description);
    formData.append('courseId', this.courseId.toString());
    
    // Nếu có chọn module, gắn moduleId vào
    if (this.videoUploadData.selectedModuleId && this.videoUploadData.selectedModuleId !== '') {
      formData.append('moduleId', this.videoUploadData.selectedModuleId.toString());
    }

    this.videoUploading = true;

    // Upload video using ApiService
    this.apiService.uploadVideo(formData).subscribe({
      next: (response: any) => {
        console.log('Video upload response:', response);
        
        if (this.videoUploadData.selectedModuleId && this.videoUploadData.selectedModuleId !== '') {
          // Video đã được gắn vào module có sẵn
          alert('Upload video và gắn vào module thành công!');
          this.videoUploading = false;
          this.closeVideoUploadDialog();
          this.loadModules(); // Refresh module list
        } else {
          // Tạo module mới
          alert('Upload video thành công! Đang tạo module mới...');
          this.createModuleAfterVideoUpload();
        }
      },
      error: (err) => {
        console.error('Video upload failed', err);
        this.videoUploading = false;
        
        let errorMessage = 'Tải video lên thất bại!';
        if (err.status === 401) {
          errorMessage = 'Bạn cần đăng nhập để upload video';
        } else if (err.status === 403) {
          errorMessage = 'Bạn không có quyền upload video cho khóa học này';
        } else if (err.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại file và thông tin.';
        } else if (err.status === 413) {
          errorMessage = 'File quá lớn! Vui lòng chọn file nhỏ hơn.';
        }
        alert(errorMessage);
      }
    });
  }

  createModuleAfterVideoUpload(): void {
    const nextOrder = this.modules.length > 0 ? Math.max(...this.modules.map(m => m.orderNumber || 0)) + 1 : 1;
    
    this.moduleService.createModule({
      title: this.videoUploadData.title,
      description: this.videoUploadData.description,
      status: 'NotPublished',
      orderNumber: nextOrder
    }).subscribe({
      next: (response) => {
        console.log('Module created successfully after video upload:', response);
        this.videoUploading = false;
        this.closeVideoUploadDialog();
        this.loadModules(); // Refresh module list
      },
      error: (err) => {
        console.error('Error creating module after video upload:', err);
        this.videoUploading = false;
        alert('Video đã upload thành công nhưng tạo module thất bại: ' + (err.error?.message || err.message));
        this.closeVideoUploadDialog();
      }
    });
  }

  // Module expand/collapse methods
  toggleModuleExpand(module: ModuleItem): void {
    module.expanded = !module.expanded;
    if (module.expanded && !module.videos) {
      this.loadModuleVideos(module);
    }
  }

  loadModuleVideos(module: ModuleItem): void {
    if (!module.moduleId) {
      console.error('Module ID not found');
      return;
    }

    // Since there's no API endpoint for videos by module yet,
    // we'll get all videos for the course and filter by title/description
    // This is a temporary solution until backend adds module support
    if (!this.courseId) {
      console.error('Course ID not found');
      return;
    }

    module.loadingVideos = true;
    this.apiService.getVideosByCourse(this.courseId).subscribe({
      next: (videos) => {
        // Temporary: Filter videos that might belong to this module
        // You can improve this logic based on your naming convention
        const moduleVideos = videos.filter(video => 
          video.title && (
            video.title.toLowerCase().includes(module.title.toLowerCase()) ||
            video.description && video.description.toLowerCase().includes(module.title.toLowerCase())
          )
        );
        
        module.videos = moduleVideos;
        module.loadingVideos = false;
        console.log(`Found ${moduleVideos.length} videos for module ${module.title}:`, moduleVideos);
        
        if (moduleVideos.length === 0) {
          console.log('No videos found matching module title. Showing all course videos for reference.');
          // Optionally show all videos for debugging
          // module.videos = videos;
        }
      },
      error: (err) => {
        console.error('Error loading videos for course:', err);
        module.videos = [];
        module.loadingVideos = false;
        
        let errorMessage = 'Lỗi khi tải danh sách video: ';
        if (err.status === 403) {
          errorMessage += 'Không có quyền truy cập videos của khóa học này.';
        } else if (err.status === 401) {
          errorMessage += 'Cần đăng nhập để xem videos.';
        } else {
          errorMessage += (err.error?.message || err.message);
        }
        
        alert(errorMessage);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  }

  playVideo(videoId: number): void {
    // Open video player or navigate to video page
    console.log('Playing video:', videoId);
    // You can implement video player logic here
    alert(`Playing video ID: ${videoId}`);
  }

  downloadVideo(videoId: number): void {
    console.log('Downloading video:', videoId);
    this.apiService.streamVideo(videoId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `video_${videoId}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading video:', err);
        alert('Lỗi khi tải video: ' + (err.error?.message || err.message));
      }
    });
  }

  goToAssignmentManagement() {
    if (this.courseId) {
      this.router.navigate(['/assignment-management'], { 
        queryParams: { courseId: this.courseId } 
      });
    } else {
      this.showAlert('Vui lòng chọn khóa học trước');
    }
  }

  private showAlert(message: string): void {
    if (typeof window !== 'undefined') {
      alert(message);
    } else {
      console.log('Alert (SSR):', message);
    }
  }
}