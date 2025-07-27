import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleService } from '../../services/module.service';
import { CreateModuleRequest } from '../../models/module.model';

@Component({
  selector: 'app-add-module',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="add-module-container">
      <div class="header">
        <button class="back-btn" (click)="goBack()">← Quay lại</button>
        <h1>Thêm Module Mới</h1>
      </div>

      <div class="form-container">
        <form (ngSubmit)="onSubmit()" #moduleForm="ngForm">
          <div class="form-group">
            <label for="title">Tiêu đề Module *</label>
            <input 
              type="text" 
              id="title" 
              name="title"
              [(ngModel)]="moduleData.title" 
              required
              placeholder="Nhập tiêu đề module"
              #title="ngModel">
            <div *ngIf="title.invalid && title.touched" class="error">
              Tiêu đề module là bắt buộc
            </div>
          </div>

          <div class="form-group">
            <label for="description">Mô tả</label>
            <textarea 
              id="description" 
              name="description"
              [(ngModel)]="moduleData.description" 
              placeholder="Nhập mô tả module"
              rows="4">
            </textarea>
          </div>

          <div class="form-group">
            <label for="orderNumber">Thứ tự hiển thị *</label>
            <input 
              type="number" 
              id="orderNumber" 
              name="orderNumber"
              [(ngModel)]="moduleData.orderNumber" 
              required
              min="1"
              placeholder="Nhập số thứ tự"
              #orderNumber="ngModel">
            <div *ngIf="orderNumber.invalid && orderNumber.touched" class="error">
              Thứ tự hiển thị là bắt buộc và phải lớn hơn 0
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="goBack()">
              Hủy
            </button>
            <button 
              type="submit" 
              class="btn-submit" 
              [disabled]="moduleForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Đang tạo...' : 'Tạo Module' }}
            </button>
          </div>
        </form>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .add-module-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      gap: 15px;
    }

    .back-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }

    .back-btn:hover {
      background: #5a6268;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    .form-container {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }

    input[type="text"],
    input[type="number"],
    textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }

    .btn-cancel,
    .btn-submit {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    .btn-submit {
      background: #007bff;
      color: white;
    }

    .btn-submit:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-submit:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .error {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #f5c6cb;
    }
  `]
})
export class AddModuleComponent implements OnInit {
  courseId: number = 0;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  moduleData: CreateModuleRequest = {
    title: '',
    description: '',
    orderNumber: 1
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private moduleService: ModuleService
  ) {}

  ngOnInit(): void {
    // Lấy courseId từ route parameters hoặc query params
    this.route.params.subscribe(params => {
      if (params['courseId']) {
        this.courseId = +params['courseId'];
        this.moduleService.setCurrentCourseId(this.courseId);
      }
    });

    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['courseId']) {
        this.courseId = +queryParams['courseId'];
        this.moduleService.setCurrentCourseId(this.courseId);
      }
    });

    // Nếu không có courseId, redirect về danh sách courses
    if (!this.courseId) {
      this.router.navigate(['/courses']);
    }
  }

  onSubmit(): void {
    console.log('🚀 onSubmit called');
    console.log('🚀 courseId:', this.courseId);
    console.log('🚀 moduleData:', this.moduleData);
    
    if (!this.courseId) {
      this.errorMessage = 'Không tìm thấy thông tin khóa học';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.moduleService.createModuleForCourse(this.courseId, this.moduleData)
      .subscribe({
        next: (response) => {
          console.log('Module created successfully:', response);
          console.log('Response message:', response.message);
          
          // Redirect về trang quản lý modules của course
          this.router.navigate(['/modules'], { 
            queryParams: { courseId: this.courseId } 
          });
        },
        error: (error) => {
          console.error('Error creating module:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error body:', error.error);
          console.error('Full error object:', JSON.stringify(error, null, 2));
          
          let errorMessage = 'Có lỗi xảy ra khi tạo module';
          
          if (error.status === 0) {
            errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend có chạy không.';
          } else if (error.status === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          } else if (error.status === 403) {
            errorMessage = error.error?.message || error.error || 'Bạn không có quyền tạo module cho khóa học này';
          } else if (error.status === 500) {
            errorMessage = error.error?.message || error.error || 'Lỗi server khi tạo module';
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.errorMessage = errorMessage;
          this.isSubmitting = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/modules'], { 
      queryParams: { courseId: this.courseId } 
    });
  }
}
