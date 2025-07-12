import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './learn-online.component.html',
  styleUrls: ['./learn-online.component.scss']
})
export class LearnOnlineComponent implements OnInit, OnDestroy {
  dropdownOpen = false;
  videos: any[] = [];
  currentVideo: any = null;
  courseId: number | null = null; // Dynamic courseId
  courses: any[] = []; // Available courses for user
  loading = false;
  private currentBlobUrl: string | null = null; // Lưu blob URL hiện tại
  private totalSeekTime = 0; // Tổng thời gian đã tua (giây)
  private maxTotalSeekTime = 120; // Tối đa 2 phút (120 giây) cho toàn bộ video

  @ViewChild('classroomVideo', { static: true }) videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(
    private http: HttpClient, 
    private apiService: ApiService, 
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Chỉ load data khi đang chạy ở browser (có localStorage)
    if (!isPlatformBrowser(this.platformId)) {
      console.log('SSR mode - skipping data loading');
      return;
    }

    // Check for courseId from query params first
    this.route.queryParams.subscribe(params => {
      if (params['courseId']) {
        this.courseId = parseInt(params['courseId']);
        console.log('CourseId from URL params:', this.courseId);
        this.loadUserCourses();
      } else {
        this.loadUserCourses();
      }
    });
  }

  ngOnDestroy() {
    // Cleanup blob URL khi component bị destroy
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  // Helper method để xử lý alert trong SSR
  private showAlert(message: string) {
    if (isPlatformBrowser(this.platformId)) {
      alert(message);
    } else {
      console.log('Alert (SSR):', message);
    }
  }

  // Load course content directly without fetching course list first
  loadUserCourses() {
    this.loading = true;
    
    // For student, directly load course content if courseId is available
    if (this.courseId) {
      console.log('Loading course content directly for courseId:', this.courseId);
      this.loadVideos(); // Auto load videos
      this.loading = false;
    } else {
      console.warn('No courseId provided');
      this.loading = false;
    }
  }

  // Load videos when course is selected
  onCourseChange() {
    if (this.courseId) {
      this.loadVideos();
    }
  }

  // Load videos theo courseId với authentication
  loadVideos() {
    if (!this.courseId) return;
    
    this.loading = true;
    this.apiService.getVideosByCourse(this.courseId).subscribe({
      next: data => {
        this.videos = data;
        if (this.videos.length) {
          this.playVideo(this.videos[this.videos.length - 1]);
        }
        this.loading = false;
      },
      error: err => {
        console.error('Lỗi khi tải danh sách video:', err);
        if (err.status === 401) {
          this.showAlert('Bạn cần đăng nhập để xem video');
        } else if (err.status === 403) {
          this.showAlert('Bạn không có quyền truy cập khóa học này');
        }
        this.loading = false;
      }
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  playVideo(video: any, event?: Event) {
    if (event) event.preventDefault();
    this.currentVideo = video;
    
    // Debug log để kiểm tra video object
    console.log('Video object:', video);
    console.log('Video ID:', video.videoId);
    
    // Kiểm tra videoId hợp lệ
    if (!video.videoId) {
      console.error('Video ID is null or undefined:', video);
      this.showAlert('Không thể phát video: ID video không hợp lệ');
      return;
    }
    
    // Sử dụng API stream với authentication
    this.apiService.streamVideo(video.videoId).subscribe({
      next: (blob) => {
        // Cleanup blob URL cũ trước khi tạo mới
        if (this.currentBlobUrl) {
          URL.revokeObjectURL(this.currentBlobUrl);
        }
        
        const url = URL.createObjectURL(blob);
        this.currentBlobUrl = url; // Lưu blob URL để cleanup sau
        
        this.videoPlayer.nativeElement.src = url;
        this.videoPlayer.nativeElement.load();
        this.videoPlayer.nativeElement.play();
        
        // Thêm giới hạn tua video không quá 2 phút
        this.addVideoSeekLimitation();
        
        // Reset tổng thời gian tua cho video mới
        this.totalSeekTime = 0;
      },
      error: (err) => {
        console.error('Lỗi khi tải video:', err);
        if (err.status === 401) {
          this.showAlert('Bạn cần đăng nhập để xem video');
        } else if (err.status === 403) {
          this.showAlert('Bạn không có quyền xem video này');
        }
      }
    });
  }

  private addVideoSeekLimitation() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const video = this.videoPlayer.nativeElement;
    let lastTime = 0;
    let isUserSeeking = false;
    
    // Theo dõi thời gian phát để phát hiện tua
    video.addEventListener('timeupdate', () => {
      if (!isUserSeeking) {
        lastTime = video.currentTime;
      }
    });
    
    // Bắt đầu tua
    video.addEventListener('seeking', () => {
      isUserSeeking = true;
      const currentTime = video.currentTime;
      const timeDifference = Math.abs(currentTime - lastTime);
      
      // Nếu nhảy quá 1 giây thì coi là tua (không phải pause/play bình thường)
      if (timeDifference > 1) {
        this.totalSeekTime += timeDifference;
        console.log(`� Đã tua ${timeDifference.toFixed(1)}s. Tổng đã tua: ${this.totalSeekTime.toFixed(1)}s/${this.maxTotalSeekTime}s`);
        
        // Kiểm tra vượt giới hạn
        if (this.totalSeekTime > this.maxTotalSeekTime) {
          console.warn('🚫 Đã vượt quá giới hạn tua 2 phút!');
          video.currentTime = lastTime; // Quay về vị trí trước đó
          this.totalSeekTime -= timeDifference; // Trừ lại thời gian vừa tua
          this.showAlert(`Bạn đã sử dụng hết ${this.maxTotalSeekTime/60} phút tua video. Không thể tua thêm!`);
        } else {
          lastTime = currentTime;
          // Hiển thị cảnh báo khi còn 30s
          const remainingSeekTime = this.maxTotalSeekTime - this.totalSeekTime;
          if (remainingSeekTime <= 30 && remainingSeekTime > 0) {
            this.showAlert(`Cảnh báo: Chỉ còn ${remainingSeekTime.toFixed(0)} giây tua video!`);
          }
        }
      }
    });
    
    // Kết thúc tua
    video.addEventListener('seeked', () => {
      isUserSeeking = false;
    });
  }

  clearVideos() {
    const shouldClear = isPlatformBrowser(this.platformId) 
      ? confirm('Bạn có chắc chắn muốn xoá tất cả video đã tải lên (chỉ ở giao diện)?')
      : true; // Default to true in SSR
    
    if (shouldClear) {
      // Cleanup blob URL trước khi clear
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
        this.currentBlobUrl = null;
      }
      
      this.videos = [];
      this.currentVideo = null;
      this.videoPlayer.nativeElement.src = '';
    }
  }
}