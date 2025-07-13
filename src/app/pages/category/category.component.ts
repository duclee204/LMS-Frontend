import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SidebarWrapperComponent } from '../../components/sidebar-wrapper/sidebar-wrapper.component';
import { CategoryService } from '../../services/category.service';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  imports: [CommonModule, FormsModule, SidebarWrapperComponent]
})
export class CategoryComponent implements OnInit {
  searchName: string = '';
  searchDescription: string = '';
  categories: any[] = [];

  showCreateForm = false;
  isEditing = false;
  editId: number | null = null;
  
  // Thêm biến để kiểm tra role
  userRole: string = '';
  isAdmin: boolean = false;

  newCategory = {
    name: '',
    description: ''
  };

  constructor(
    private http: HttpClient,
    private categoryService: CategoryService,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUserRole();
    // Chỉ fetch categories khi đang trong browser (có token)
    if (isPlatformBrowser(this.platformId)) {
      this.fetchCategories();
    }
  }

  // Load thông tin role từ JWT token
  loadUserRole(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.userRole = payload.role || '';
          this.isAdmin = this.userRole === 'ROLE_admin' || this.userRole === 'admin';
          console.log('🔍 Category - User role:', this.userRole, 'isAdmin:', this.isAdmin);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }
  }

  // Helper method để hiển thị alert an toàn
  private showAlert(message: string): void {
    if (isPlatformBrowser(this.platformId)) {
      alert(message);
    } else {
      console.log('Alert (SSR):', message);
    }
  }

  fetchCategories(): void {
    // Kiểm tra platform và role trước khi gọi API
    if (!isPlatformBrowser(this.platformId)) {
      console.log('🔍 Frontend - Skipping API call in SSR');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔍 Frontend - No token found, skipping API call');
      this.showAlert('Bạn cần đăng nhập để xem danh mục.');
      return;
    }

    console.log('🔍 Frontend - Making request to categories API...');
    console.log('🔍 Frontend - User role:', this.userRole);
    console.log('🔍 Frontend - Is admin:', this.isAdmin);
    console.log('🔍 Frontend - Token exists:', !!token);
    console.log('🔍 Frontend - Token value:', token?.substring(0, 50) + '...');

    // Tạo query string cho params
    let queryString = '';
    if (this.searchName || this.searchDescription) {
      const params = new URLSearchParams();
      if (this.searchName) params.set('name', this.searchName);
      if (this.searchDescription) params.set('description', this.searchDescription);
      queryString = '?' + params.toString();
    }

    // Sử dụng ApiService với query string
    this.apiService.get<any[]>(`/categories/list${queryString}`).subscribe({
      next: (data) => {
        this.categories = data;
        console.log('✅ Categories loaded successfully:', data);
      },
      error: (err) => {
        console.error('❌ Error fetching categories:', err);
        console.error('❌ Error status:', err.status);
        console.error('❌ Error statusText:', err.statusText);
        console.error('❌ Error headers:', err.headers);
        console.error('❌ Error url:', err.url);
        
        if (err.status === 403) {
          this.showAlert('Bạn không có quyền xem danh sách danh mục. Vui lòng đăng nhập với quyền phù hợp.');
        } else if (err.status === 401) {
          this.showAlert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          this.showAlert('Có lỗi xảy ra khi tải danh sách danh mục.');
        }
      }
    });
  }

  // 👉 Gọi khi ấn nút "Chỉnh sửa"
  editCategory(category: any): void {
    this.newCategory = { name: category.name, description: category.description };
    this.editId = category.categoryId;
    this.isEditing = true;
    this.showCreateForm = true;
  }

  // 👉 Gọi khi ấn "Lưu" hoặc "Cập nhật"
  submitCategory(): void {
    if (this.isEditing && this.editId !== null) {
      // PUT: cập nhật danh mục
      this.http.put(`http://localhost:8080/api/categories/${this.editId}`, this.newCategory, {
        responseType: 'text'
      }).subscribe({
        next: (res) => {
          this.showAlert(res);
          this.resetForm();
          this.fetchCategories();
        },
        error: (err) => {
          this.showAlert('Cập nhật danh mục thất bại');
          console.error(err);
        }
      });
    } else {
      // POST: tạo mới danh mục
      this.http.post('http://localhost:8080/api/categories', this.newCategory, {
        responseType: 'text'
      }).subscribe({
        next: (res) => {
          this.showAlert(res);
          this.resetForm();
          this.fetchCategories();
        },
        error: (err) => {
          this.showAlert('Tạo danh mục thất bại');
          console.error(err);
        }
      });
    }
  }
deleteCategory(): void {
  if (this.editId === null) {
    this.showAlert('Không tìm thấy ID danh mục để xóa.');
    return;
  }

  if (isPlatformBrowser(this.platformId) && confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
    this.http.delete(`http://localhost:8080/api/categories/${this.editId}`, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          this.showAlert(res);
          this.fetchCategories();
          this.cancelCreate();
        },
        error: (err) => {
          console.error('Lỗi khi xóa:', err);
          this.showAlert('Xóa thất bại.');
        }
      });
  }
}
  cancelCreate(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.newCategory = { name: '', description: '' };
    this.isEditing = false;
    this.editId = null;
    this.showCreateForm = false;
  }
}
