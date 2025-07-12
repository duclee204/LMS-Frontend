import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../services/course.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.scss']
})
export class CourseManagementComponent implements OnInit {
  courses: Course[] = [];
  isCreating = false;
  isViewing = false;
  searchTerm: string = ''; // Thêm biến lưu giá trị tìm kiếm
  currentPage: number = 1;
  pageSize: number = 6;

  courseForm = {
    title: '',
    description: '',
    categoryId: 0,
    instructorId: 0,
    status: '',
    price: 0
  };
  selectedCourse: Course | null = null;
  selectedCourseId: number | null = null;
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;

  instructors: any[] = [];
  categories: any[] = [];

  constructor(
    private courseService: CourseService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // ✅ Debug: Kiểm tra token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('🔍 Token hiện tại:', token);
      
      if (!token) {
        console.log('❌ Không có token - cần đăng nhập');
      } else {
        console.log('✅ Có token - tiếp tục load data');
      }
    }
    
    this.loadCourses();
    this.loadInstructors();
    this.loadCategories();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
      },
      error: (err) => {
        console.error('❌ Lỗi khi lấy danh sách khóa học:', err);
      }
    });
  }

  loadInstructors(): void {
    // 🔑 Tạm thời: Thêm header manual
    let headers: any = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Manual token:', token.substring(0, 20) + '...');
      }
    }
    
    this.http.get<any[]>('http://localhost:8080/api/users/list?role=instructor', { headers })
      .subscribe({
        next: (data) => {
          this.instructors = data;
          console.log('✅ Instructors loaded:', data.length);
        },
        error: (err) => {
          console.error('❌ Lỗi khi lấy instructor:', err);
        }
      });
  }

  loadCategories(): void {
    // 🔑 Tạm thời: Thêm header manual
    let headers: any = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    this.http.get<any[]>('http://localhost:8080/api/categories/list', { headers })
      .subscribe({
        next: (data) => {
          this.categories = data;
          console.log('✅ Categories loaded:', data.length);
        },
        error: (err) => {
          console.error('❌ Lỗi khi lấy categories:', err);
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];
      this.imagePreviewUrl = URL.createObjectURL(this.selectedImageFile);
    }
  }

  startCreating(): void {
    this.resetForm();
    this.isCreating = true;
    this.isViewing = false;
  }

  cancelCreating(): void {
    this.resetForm();
    this.isCreating = false;
  }

  cancelEditing(): void {
    this.resetForm();
    this.isViewing = false;
    this.selectedCourseId = null;
  }

  submitCourse(): void {
    const { title, description, categoryId, instructorId, status, price } = this.courseForm;

    if (!title || !description || !categoryId || !instructorId || !status || !price) {
      alert('⚠️ Vui lòng nhập đầy đủ tất cả các trường bắt buộc.');
      return;
    }

    if (!this.selectedImageFile) {
      alert('⚠️ Vui lòng chọn ảnh khóa học.');
      return;
    }

    this.courseService.createCourse(this.courseForm, this.selectedImageFile).subscribe({
      next: (res) => {
        alert(typeof res === 'string' ? res : res?.message || '✅ Tạo khóa học thành công!');
        this.resetForm();
        this.isCreating = false;
        this.loadCourses();
      },
      error: (err) => {
        const msg = typeof err.error === 'string' ? err.error : err.error?.message || '❌ Tạo thất bại!';
        alert(msg);
      }
    });
  }
viewCourse(course: Course): void {
  this.selectedCourse = { ...course };
  this.selectedCourseId = (course as any).id ?? (course as any).courseId ?? null;
  if (!this.selectedCourseId) {
    console.warn('Không tìm thấy trường id hoặc courseId trong đối tượng course:', course);
  }
  this.imagePreviewUrl = course.thumbnailUrl
    ? `http://localhost:8080/images/${course.thumbnailUrl}`
    : null;

  // Đồng bộ dữ liệu vào selectedCourse (để binding trực tiếp trong popup)
  // Không cần gán vào courseForm nữa
  this.isViewing = true;
  this.isCreating = false;
}
updateCourse(): void {
  if (!this.selectedCourseId || !this.selectedCourse) {
    alert('Không tìm thấy ID khóa học để cập nhật!');
    return;
  }

  const { title, description, categoryId, instructorId, status, price } = this.selectedCourse;

  if (!title || !description || !categoryId || !instructorId || !status || !price) {
    alert('⚠️ Vui lòng nhập đầy đủ tất cả các trường.');
    return;
  }

  const coursePayload = {
    courseId: this.selectedCourseId,
    title,
    description,
    categoryId,
    instructorId,
    status,
    price,
    thumbnailUrl: this.selectedCourse?.thumbnailUrl || '',
    instructorImage: this.selectedCourse?.instructorImage || ''
  };

  const formData = new FormData();
  formData.append(
    'course',
    new Blob([JSON.stringify(coursePayload)], { type: 'application/json' })
  );
  if (this.selectedImageFile) {
    formData.append('image', this.selectedImageFile);
  }

  this.http.put(`http://localhost:8080/api/courses/${this.selectedCourseId}`, formData, {
    responseType: 'text'
  }).subscribe({
    next: (res) => {
      alert(res || '✅ Cập nhật khóa học thành công!');
      this.resetForm();
      this.isViewing = false;
      this.loadCourses();
    },
    error: (err) => {
      if (err.status === 403) {
        alert(
          'Bạn không có quyền cập nhật khóa học này (403 Forbidden).\n'
          + '- Kiểm tra token có ROLE_ADMIN chưa.\n'
          + '- Kiểm tra phân quyền backend cho PUT.\n'
          + '- Kiểm tra lại dữ liệu gửi lên có đúng không.'
        );
      } else {
        const msg = typeof err.error === 'string'
          ? err.error
          : (err.error as any)?.message || '❌ Cập nhật thất bại!';
        alert(msg);
      }
    }
  });
}



  resetForm(): void {
    this.courseForm = {
      title: '',
      description: '',
      categoryId: 0,
      instructorId: 0,
      status: '',
      price: 0
    };
    this.selectedCourse = null;
    this.selectedCourseId = null;
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
  }
  deleteSelectedCourse(): void {
  if (!this.selectedCourseId) {
    alert('❌ Không tìm thấy ID khóa học để xóa!');
    return;
  }

  if (!confirm('Bạn có chắc chắn muốn xoá khóa học này?')) return;

  this.courseService.deleteCourse(this.selectedCourseId).subscribe({
    next: (res) => {
      alert(res || '✅ Xoá khóa học thành công!');
      this.loadCourses();
      this.resetForm();
    },
    error: (err) => {
      if (err.status === 403) {
        alert('⛔ Bạn không có quyền xoá khóa học này (403 Forbidden)');
      } else {
        const msg = typeof err.error === 'string'
          ? err.error
          : (err.error as any)?.message || '❌ Xoá thất bại!';
        alert(msg);
      }
    }
  });
}

getFilteredCourses(): Course[] {
  if (!this.searchTerm.trim()) return this.courses;
  const term = this.searchTerm.trim().toLowerCase();
  return this.courses.filter(course =>
    course.title?.toLowerCase().includes(term)
  );
}

getPagedCourses(): Course[] {
  const filtered = this.getFilteredCourses();
  const start = (this.currentPage - 1) * this.pageSize;
  return filtered.slice(start, start + this.pageSize);
}

getTotalPages(): number {
  return Math.ceil(this.getFilteredCourses().length / this.pageSize);
}

goToPage(page: number): void {
  if (page < 1 || page > this.getTotalPages()) return;
  this.currentPage = page;
}
}