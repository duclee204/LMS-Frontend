import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  courses: any[] = [];
  loading = false;
  userRole: string = '';
  userName: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    // Chỉ load courses nếu đang trong browser (có token)
    if (isPlatformBrowser(this.platformId)) {
      this.loadCourses();
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

  // Load thông tin user từ token hoặc API
  loadUserInfo() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Decode JWT token để lấy thông tin user
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.userRole = payload.role || 'student';
          this.userName = payload.sub || 'Unknown';
          console.log('User info loaded:', { role: this.userRole, name: this.userName });
        } catch (error) {
          console.error('Error decoding token:', error);
          this.userRole = 'student';
        }
      } else {
        // Không có token, redirect về login
        this.router.navigate(['/login']);
      }
    }
  }

  // Load danh sách khóa học theo role
  loadCourses() {
    this.loading = true;
    console.log('Loading courses for role:', this.userRole);
    
    if (this.userRole === 'instructor') {
      // Giảng viên: Load khóa học mình tạo/quản lý
      this.loadInstructorCourses();
    } else if (this.userRole === 'student') {
      // Sinh viên: Load khóa học mình đã đăng ký
      this.loadStudentEnrolledCourses();
    } else {
      // Không xác định được role, có thể là admin hoặc chưa đăng nhập
      console.warn('Unknown user role:', this.userRole);
      this.loading = false;
    }
  }

  // Load khóa học của giảng viên
  loadInstructorCourses() {
    this.apiService.getCoursesByUser().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
        console.log('Instructor courses:', courses);
        
        if (courses.length === 0) {
          console.log('Instructor has no courses');
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải khóa học của giảng viên:', err);
        this.courses = []; // Set empty array instead of keeping old data
        this.handleLoadError(err);
      }
    });
  }

  // Load khóa học sinh viên đã đăng ký
  loadStudentEnrolledCourses() {
    this.apiService.get<any[]>('/enrollments/my-courses').subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
        console.log('Student enrolled courses:', courses);
        
        if (courses.length === 0) {
          console.log('Student has no enrolled courses');
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải khóa học đã đăng ký:', err);
        this.courses = []; // Set empty array instead of keeping old data
        this.handleLoadError(err);
      }
    });
  }

  // Xử lý lỗi khi load
  handleLoadError(err: any) {
    this.loading = false;
    if (err.status === 401) {
      this.showAlert('Bạn cần đăng nhập để xem khóa học');
      this.router.navigate(['/login']);
    } else if (err.status === 403) {
      this.showAlert('Bạn không có quyền truy cập');
    } else {
      this.showAlert('Lỗi khi tải danh sách khóa học');
    }
  }

  // Vào trang học/quản lý khóa học
  enterCourse(course: any) {
    if (this.userRole === 'instructor') {
      // Giảng viên: Vào trang quản lý (upload video, etc.)
      this.router.navigate(['/video-upload'], { 
        queryParams: { courseId: course.courseId } 
      });
    } else {
      // Sinh viên: Vào trang học
      this.router.navigate(['/learn-online'], { 
        queryParams: { courseId: course.courseId } 
      });
    }
  }

  // Xem chi tiết khóa học -> chuyển sang trang xem video
  viewCourseDetails(course: any) {
    console.log('View course details:', course);
    
    if (this.userRole === 'instructor') {
      // Giảng viên: Có thể xem video của mình hoặc quản lý
      this.router.navigate(['/learn-online'], { 
        queryParams: { courseId: course.courseId || course.courseId } 
      });
    } else if (this.userRole === 'student') {
      // Sinh viên: Vào trang học
      this.router.navigate(['/learn-online'], { 
        queryParams: { courseId: course.courseId || course.courseId } 
      });
    } else {
      // Admin hoặc role khác
      this.router.navigate(['/learn-online'], { 
        queryParams: { courseId: course.courseId || course.courseId } 
      });
    }
  }

  // Format giá tiền
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // Format ngày
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  // Helper methods để handle khác nhau giữa CourseDTO và EnrollmentsDTO
  getCourseTitle(course: any): string {
    return course.title || course.courseTitle || course.courseName || 'Không có tiêu đề';
  }

  getCourseDescription(course: any): string {
    return course.description || 'Không có mô tả';
  }

  getCoursePrice(course: any): number {
    return course.price || 0;
  }

  getCourseCreatedDate(course: any): string {
    return course.createdAt || course.enrolledAt || new Date().toISOString();
  }
}
