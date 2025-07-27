import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SidebarWrapperComponent } from '../../components/sidebar-wrapper/sidebar-wrapper.component';
import { ProfileComponent } from '../../components/profile/profile.component';
import { AssignmentApiService } from '../../services/assignment-api.service';
import { AssignmentSubmissionApiService } from '../../services/assignment-submission-api.service';
import { Assignment, AssignmentSubmission, CreateSubmissionRequest } from '../../models/assignment.model';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-assignment-submission',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarWrapperComponent, ProfileComponent],
  templateUrl: './assignment-submission.component.html',
  styleUrls: ['./assignment-submission.component.scss'],
})
export class AssignmentSubmissionComponent implements OnInit {
  assignments: Assignment[] = [];
  mySubmissions: AssignmentSubmission[] = [];
  selectedAssignment: Assignment | null = null;
  
  // Submission form
  submissionForm: CreateSubmissionRequest = {
    assignmentId: 0,
    submissionText: ''
  };
  selectedFile: File | null = null;

  // UI states
  loading = false;
  showSubmissionForm = false;
  submitting = false;

  // User info
  username: string = '';
  userRole: string = '';
  avatarUrl: string = '';

  // Route params
  contentId: number = 0;
  courseId: number = 0;

  constructor(
    private assignmentApi: AssignmentApiService,
    private submissionApi: AssignmentSubmissionApiService,
    private sessionService: SessionService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.initializeUserProfile();
    this.loadRouteParams();
    this.loadAssignments();
    this.loadMySubmissions();
  }

  initializeUserProfile(): void {
    this.username = this.sessionService.getUsername() || 'Student';
    this.userRole = this.sessionService.getUserRole() || 'student';
    this.avatarUrl = this.getSessionAvatar();
  }

  getSessionAvatar(): string {
    if (isPlatformBrowser(this.platformId)) {
      const savedAvatar = sessionStorage.getItem('userAvatar');
      if (savedAvatar) return savedAvatar;
      
      const avatars = [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
      ];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      sessionStorage.setItem('userAvatar', randomAvatar);
      return randomAvatar;
    }
    return '';
  }

  loadRouteParams() {
    this.route.queryParams.subscribe(params => {
      this.courseId = +params['courseId'] || 0;
      this.contentId = +params['contentId'] || 0;
      
      console.log('🔍 Student - Route params - courseId:', this.courseId, 'contentId:', this.contentId);
      
      // If we have courseId, load assignments for that course
      if (this.courseId) {
        this.loadAssignmentsForCourse();
      } else if (this.contentId) {
        this.loadAssignments();
      } else {
        console.warn('No courseId or contentId provided');
      }
    });
  }

  loadAssignmentsForCourse() {
    if (!this.courseId) return;
    
    this.loading = true;
    console.log('🔍 Loading assignments for course:', this.courseId);
    
    // Use the course-based API endpoint
    this.assignmentApi.getAssignmentsByCourse(this.courseId).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.loading = false;
        console.log('✅ Student assignments loaded:', assignments);
        
        // Load student's submissions after assignments are loaded
        if (assignments.length > 0) {
          this.loadMySubmissions();
        }
      },
      error: (error) => {
        console.error('❌ Error loading assignments for student:', error);
        this.loading = false;
        
        let errorMessage = 'Lỗi khi tải danh sách bài tập: ';
        if (error.status === 403) {
          errorMessage += 'Bạn chưa đăng ký khóa học này hoặc không có quyền truy cập';
        } else if (error.status === 401) {
          errorMessage += 'Phiên đăng nhập đã hết hạn';
        } else {
          errorMessage += error.error || error.message || 'Lỗi không xác định';
        }
        
        this.showAlert(errorMessage);
      }
    });
  }

  loadAssignments() {
    if (!this.contentId) return;
    
    this.loading = true;
    this.assignmentApi.getAssignmentsByContent(this.contentId).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
        this.loading = false;
        this.showAlert('Lỗi khi tải danh sách bài tập');
      }
    });
  }

  loadMySubmissions() {
    console.log('🔍 Loading my submissions...');
    this.submissionApi.getMySubmissions().subscribe({
      next: (submissions) => {
        this.mySubmissions = submissions;
        console.log('✅ My submissions loaded:', submissions);
      },
      error: (error) => {
        console.error('❌ Error loading my submissions:', error);
        
        if (error.status === 403) {
          console.warn('Student role might not be properly set. Continuing without submissions...');
          this.mySubmissions = []; // Continue without submissions
        } else {
          console.error('Other error loading submissions:', error);
        }
      }
    });
  }

  hasSubmitted(assignmentId: number): boolean {
    return this.mySubmissions.some(s => s.assignmentId === assignmentId);
  }

  getSubmission(assignmentId: number): AssignmentSubmission | undefined {
    return this.mySubmissions.find(s => s.assignmentId === assignmentId);
  }

  startSubmission(assignment: Assignment) {
    if (this.hasSubmitted(assignment.assignmentId!)) {
      this.showAlert('Bạn đã nộp bài tập này rồi!');
      return;
    }

    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
      this.showAlert('Bài tập này đã hết hạn nộp!');
      return;
    }

    this.selectedAssignment = assignment;
    this.submissionForm.assignmentId = assignment.assignmentId!;
    this.submissionForm.submissionText = '';
    this.selectedFile = null;
    this.showSubmissionForm = true;
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      
      // Validate file size (50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        this.showAlert('File quá lớn! Kích thước tối đa cho phép là 50MB');
        target.value = ''; // Reset input
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        this.showAlert('Loại file không được hỗ trợ! Vui lòng chọn file PDF, DOC, DOCX, TXT, ZIP, RAR, JPG hoặc PNG');
        target.value = ''; // Reset input
        return;
      }
      
      this.selectedFile = file;
      console.log('✅ File selected:', file.name, 'Size:', this.formatFileSize(file.size));
    }
  }

  submitAssignment() {
    // Enhanced validation
    if (!this.submissionForm.submissionText?.trim() && !this.selectedFile) {
      this.showAlert('Vui lòng nhập nội dung hoặc chọn file để nộp bài');
      return;
    }

    // Validate assignmentId
    if (!this.submissionForm.assignmentId || this.submissionForm.assignmentId === 0) {
      this.showAlert('Lỗi: Không xác định được bài tập cần nộp');
      return;
    }

    // Ensure submissionText is not null/undefined
    const validatedForm: CreateSubmissionRequest = {
      assignmentId: this.submissionForm.assignmentId,
      submissionText: this.submissionForm.submissionText?.trim() || ''
    };

    console.log('🔍 Submitting assignment:', validatedForm);
    console.log('🔍 Selected file:', this.selectedFile);

    this.submitting = true;
    this.submissionApi.submitAssignment(validatedForm, this.selectedFile || undefined).subscribe({
      next: (response) => {
        console.log('✅ Assignment submitted successfully:', response);
        this.showAlert('Nộp bài thành công!');
        this.resetSubmissionForm();
        this.loadMySubmissions(); // Reload submissions
      },
      error: (error) => {
        console.error('❌ Error submitting assignment:', error);
        
        let errorMessage = 'Lỗi khi nộp bài: ';
        if (error.status === 403) {
          errorMessage += 'Bạn không có quyền nộp bài tập này hoặc chưa đăng ký khóa học';
        } else if (error.status === 401) {
          errorMessage += 'Phiên đăng nhập đã hết hạn';
        } else if (error.status === 400) {
          errorMessage += error.error || 'Dữ liệu không hợp lệ';
        } else {
          errorMessage += error.error || error.message || 'Lỗi không xác định';
        }
        
        this.showAlert(errorMessage);
        this.submitting = false;
      }
    });
  }

  resetSubmissionForm() {
    this.submissionForm = {
      assignmentId: 0,
      submissionText: ''
    };
    this.selectedFile = null;
    this.selectedAssignment = null;
    this.showSubmissionForm = false;
    this.submitting = false;
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return 'Không có hạn';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isOverdue(dueDate: string | Date | undefined): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private showAlert(message: string) {
    if (isPlatformBrowser(this.platformId)) {
      alert(message);
    } else {
      console.log('Alert (SSR):', message);
    }
  }

  onProfileUpdate() {
    this.initializeUserProfile();
  }

  onLogout() {
    this.sessionService.logout();
  }

  goBack() {
    this.router.navigate(['/learn-online'], { queryParams: { courseId: this.courseId } });
  }
}
