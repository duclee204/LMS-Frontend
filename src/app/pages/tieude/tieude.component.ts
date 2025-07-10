import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams, HttpHeaders } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
@Component({
  standalone: true,
  selector: 'app-tieude',
  templateUrl: './tieude.component.html',
  styleUrls: ['./tieude.component.scss'],
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent]
})
export class TieudeComponent implements OnInit {
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
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

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:8080/api/categories/list', {
      headers,
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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    if (this.isEditing && this.editId !== null) {
      // PUT: cập nhật danh mục
      this.http.put(`http://localhost:8080/api/categories/${this.editId}`, this.newCategory, {
        headers,
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
        headers,
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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:8080/api/categories/${this.editId}`, { headers, responseType: 'text' })
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
