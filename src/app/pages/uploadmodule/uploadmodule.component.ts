import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-uploadmodule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './uploadmodule.component.html',
  styleUrls: ['./uploadmodule.component.scss'],
})
export class UploadmoduleComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public uploadedFiles: string[] = [];
  public selectedFile: string | null = null;
  public showProfileDropdown = false;
  public isLeftMenuHidden = false;
  public uploadModalVisible = false;
  public searchTerm = '';
  public filteredModules: string[] = [];
  public moduleStatus: { [key: string]: string } = {};

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadModules();
  }

  chooseFiles(e: Event): void {
    e.stopPropagation();
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      this.selectedFile = fileName;
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Vui lòng chọn một file trước khi upload.');
      return;
    }

    const existing = JSON.parse(localStorage.getItem('uploadedModules') || '[]');
    if (!existing.includes(this.selectedFile)) {
      existing.push(this.selectedFile);
      localStorage.setItem('uploadedModules', JSON.stringify(existing));
    }

    this.router.navigate(['/module']);
  }

  cancelUpload(): void {
    this.router.navigate(['/addmodule']);
  }

  toggleProfileDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  updateProfile(): void {
    alert('Chuyển đến trang cập nhật hồ sơ...');
  }

  logout(): void {
    alert('Đăng xuất...');
  }

  redirectToModulePage(): void {
    this.router.navigate(['/module']);
  }

  loadModules(): void {
    const storedModules = JSON.parse(localStorage.getItem('uploadedModules') || '[]');
    this.uploadedFiles = storedModules;
    this.filteredModules = [...storedModules];

    storedModules.forEach((name: string) => {
      const status = localStorage.getItem(name) || 'NotPublished';
      this.moduleStatus[name] = status;
    });
  }

  searchModules(): void {
    const keyword = this.searchTerm.toLowerCase();
    this.filteredModules = this.uploadedFiles.filter(m => m.toLowerCase().includes(keyword));
  }

  setPublishStatus(moduleName: string, status: 'Published' | 'NotPublished'): void {
    localStorage.setItem(moduleName, status);
    this.moduleStatus[moduleName] = status;
  }

  toggleLeftMenu(): void {
    this.isLeftMenuHidden = !this.isLeftMenuHidden;
  }

  handleModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  redirectToAddModulePage(): void {
    this.router.navigate(['/addmodule']);
  }

  onFileChange(event: Event): void {
    this.onFileSelected(event);
  }

  openUploadModal(): void {
    this.uploadModalVisible = true;
  }
}
