import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleService, ModuleItem } from '../../services/module.service'; // 👈 Quan trọng
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-module',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss']
})
export class ModuleComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public searchTerm = '';
  public modules: ModuleItem[] = [];
  public filteredModules: ModuleItem[] = [];

  public leftMenuHidden = false;
  public showProfileDropdown = false;

  constructor(
    private router: Router,
    private moduleService: ModuleService // 👈 Sử dụng service
  ) { }

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    this.moduleService.getModules().subscribe({
      next: (data) => {
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
        alert('Lỗi tải danh sách module');
        console.error(err);
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

    const filename = file.name;
    const exists = this.modules.some(m => m.title === filename);
    if (exists) {
      alert('File đã tồn tại trong danh sách.');
      return;
    }

    const nextOrder = this.modules.length > 0 ? Math.max(...this.modules.map(m => m.orderNumber || 0)) + 1 : 1;
    this.moduleService.createModule({ title: filename, status: 'NotPublished', orderNumber: nextOrder }).subscribe({
      next: () => {
        alert('Tải lên thành công');
        this.loadModules();
      },
      error: err => {
        alert('Không thể tải lên module mới');
        console.error(err);
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
    this.router.navigate(['/addmodule']);
  }

  toggleProfileDropdown(event: Event): void {
    event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
  }
}
