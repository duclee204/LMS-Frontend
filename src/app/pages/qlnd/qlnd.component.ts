import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qlnd',
  standalone: true,
  templateUrl: './qlnd.component.html',
  styleUrls: ['./qlnd.component.scss'],
  imports: [CommonModule, SidebarComponent, FormsModule]
})
export class QlndComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  pagedUsers: User[] = [];
  searchTerm: string = '';
  editingUser: User | null = null;
  selectedAvatarFile: File | null = null;

  // Phân trang
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Filter properties
  activeFilter: string = 'all'; // 'all', 'student', 'instructor'

  // CV viewer
  viewingCvUrl: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    console.log('🔍 Loading users...');
    this.userService.getUsers().subscribe({
      next: data => {
        console.log('✅ Users loaded:', data);
        // Sort by userId descending (newest registration first)
        this.users = data.sort((a, b) => b.userId - a.userId);
        this.applyFilters();
      },
      error: err => {
        console.error('❌ Error loading users:', err);
        if (err.status === 403) {
          console.error('🔒 Forbidden - check token or permissions');
          alert('Không có quyền truy cập. Vui lòng đăng nhập lại.');
        } else if (err.status === 401) {
          console.error('🔐 Unauthorized - token might be expired');
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else {
          alert('Lỗi khi tải danh sách người dùng: ' + (err.error?.message || err.message));
        }
      }
    });
  }

  applyFilters(): void {
    const keyword = this.searchTerm.trim().toLowerCase();
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !keyword || 
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.fullName.toLowerCase().includes(keyword);
      
      const matchesRole = this.activeFilter === 'all' || user.role === this.activeFilter;
      
      return matchesSearch && matchesRole;
    });
    
    // Sort filtered results by userId descending (newest first)
    this.filteredUsers.sort((a, b) => b.userId - a.userId);
    
    this.currentPage = 1;
    this.updatePagination();
  }

  onSearch(): void {
    this.applyFilters();
  }

  filterByRole(role: string): void {
    this.activeFilter = role;
    this.applyFilters();
  }

  showAllUsers(): void {
    this.activeFilter = 'all';
    this.applyFilters();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  startEdit(user: User): void {
    const { password, ...userWithoutPassword } = user;
    this.editingUser = { ...userWithoutPassword, password: '' };
    this.selectedAvatarFile = null;
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.selectedAvatarFile = null;
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedAvatarFile = input.files[0];
    }
  }

  updateUser(): void {
    if (!this.editingUser) return;

    const formData = new FormData();
    formData.append('username', this.editingUser.username);
    formData.append('email', this.editingUser.email);
    formData.append('fullName', this.editingUser.fullName);
    formData.append('role', this.editingUser.role);
    formData.append('isVerified', String(this.editingUser.verified));

    // Improved password handling
    const password = this.editingUser.password?.trim();
    if (password && password.length > 0) {
      formData.append('password', password);
      console.log('🔒 Password will be updated');
    } else {
      console.log('🔒 Password field empty - no password update');
    }

    if (this.editingUser.cvUrl) {
      formData.append('cvUrl', this.editingUser.cvUrl);
    }

    if (this.selectedAvatarFile) {
      formData.append('avatar', this.selectedAvatarFile);
    }

    // Debug log
    console.log('📤 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    this.userService.updateUserWithForm(this.editingUser.userId, formData).subscribe({
      next: (response) => {
        console.log('✅ Update response:', response);
        alert('Cập nhật thành công');
        this.editingUser = null;
        this.selectedAvatarFile = null;
        this.loadUsers();
      },
      error: err => {
        console.error('❌ Update failed:', err);
        alert('Cập nhật thất bại: ' + (err.error?.message || err.message));
      }
    });
  }
  confirmDelete(user: User): void {
    const confirmed = confirm(`Xác nhận xoá người dùng "${user.username}"?`);
    if (confirmed) {
      this.userService.deleteUserById(user.userId).subscribe({
        next: (res) => {
          alert(res.message);
          this.filteredUsers = this.filteredUsers.filter(u => u.userId !== user.userId);
          this.updatePagination();
          this.editingUser = null;
        },
        error: (err) => {
          alert(err.error?.message || 'Lỗi khi xoá người dùng');
        }
      });
    }
  }

  openCvViewer(cvUrl: string): void {
    this.viewingCvUrl = `http://localhost:8080/${cvUrl}`;
  }

  closeCvViewer(): void {
    this.viewingCvUrl = null;
  }

  // Add getter methods for template binding
  get verifiedUsersCount(): number {
    return this.filteredUsers.filter(u => u.verified).length;
  }

  get unverifiedUsersCount(): number {
    return this.filteredUsers.filter(u => !u.verified).length;
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}

// Add alias export for backward compatibility
export { QlndComponent as UsersComponent };
