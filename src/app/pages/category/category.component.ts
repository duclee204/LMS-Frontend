import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CategoryService } from '../../services/category.service';

@Component({
  standalone: true,
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  imports: [CommonModule, FormsModule, SidebarComponent]
})
export class CategoryComponent implements OnInit {
  searchName: string = '';
  searchDescription: string = '';
  categories: any[] = [];

  showCreateForm = false;
  isEditing = false;
  editId: number | null = null;

  newCategory = {
    name: '',
    description: ''
  };

  constructor(
    private http: HttpClient,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // ✅ Debug: Kiểm tra token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('🔍 Category - Token hiện tại:', token);
      
      if (!token) {
        console.log('❌ Category - Không có token - cần đăng nhập');
      } else {
        console.log('✅ Category - Có token - tiếp tục load data');
      }
    }
    
    this.fetchCategories();
  }

  fetchCategories(): void {
    let params = new HttpParams();
    if (this.searchName) {
      params = params.set('name', this.searchName);
    }
    if (this.searchDescription) {
      params = params.set('description', this.searchDescription);
    }

    this.http.get<any[]>('http://localhost:8080/api/categories/list', {
      params
    }).subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error fetching categories', err)
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
          alert(res);
          this.resetForm();
          this.fetchCategories();
        },
        error: (err) => {
          alert('Cập nhật danh mục thất bại');
          console.error(err);
        }
      });
    } else {
      // POST: tạo mới danh mục
      this.http.post('http://localhost:8080/api/categories', this.newCategory, {
        responseType: 'text'
      }).subscribe({
        next: (res) => {
          alert(res);
          this.resetForm();
          this.fetchCategories();
        },
        error: (err) => {
          alert('Tạo danh mục thất bại');
          console.error(err);
        }
      });
    }
  }
deleteCategory(): void {
  if (this.editId === null) {
    alert('Không tìm thấy ID danh mục để xóa.');
    return;
  }

  if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
    this.http.delete(`http://localhost:8080/api/categories/${this.editId}`, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          alert(res);
          this.fetchCategories();
          this.cancelCreate();
        },
        error: (err) => {
          console.error('Lỗi khi xóa:', err);
          alert('Xóa thất bại.');
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
