import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface ExamItem {
  name: string;
  questions: number;
  due: string;
  status: 'Published' | 'NotPublished';
  dropdownOpen?: boolean;
}

@Component({
  selector: 'app-addexam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addexam.component.html',
  styleUrls: ['./addexam.component.scss'],
})
export class AddExamComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public uploadedFiles: ExamItem[] = [];
  public selectedFile: string | null = null;
  public showProfileDropdown = false;
  public isLeftMenuHidden = false;
  public uploadModalVisible = false;
  public searchTerm = '';
  public filteredExams: ExamItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadExams();
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
    const newExam: ExamItem = {
      name: this.selectedFile,
      questions: Math.floor(Math.random() * 20) + 1,
      due: 'N/A',
      status: 'NotPublished',
      dropdownOpen: false,
    };
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing: ExamItem[] = JSON.parse(localStorage.getItem('uploadedExams') || '[]');
      if (!existing.some(e => e.name === newExam.name)) {
        existing.push(newExam);
        localStorage.setItem('uploadedExams', JSON.stringify(existing));
      }
    }
    this.loadExams();
  }

  cancelUpload(): void {
    this.router.navigate(['/addexam']);
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

  redirectToExamPage(): void {
    this.router.navigate(['/addexam']);
  }

  loadExams(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedExams: ExamItem[] = JSON.parse(localStorage.getItem('uploadedExams') || '[]');
      this.uploadedFiles = storedExams.map(e => ({ ...e, dropdownOpen: false }));
      this.filteredExams = [...this.uploadedFiles];
    } else {
      this.uploadedFiles = [];
      this.filteredExams = [];
    }
  }

  searchExams(): void {
    const keyword = this.searchTerm.toLowerCase();
    this.filteredExams = this.uploadedFiles.filter(e => e.name.toLowerCase().includes(keyword));
  }

  setStatus(exam: ExamItem, status: 'Published' | 'NotPublished'): void {
    exam.status = status;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('uploadedExams', JSON.stringify(this.uploadedFiles));
    }
  }

  toggleDropdown(exam: ExamItem): void {
    this.filteredExams.forEach(e => {
      if (e !== exam) e.dropdownOpen = false;
    });
    exam.dropdownOpen = !exam.dropdownOpen;
  }

  handleModalClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: Event): void {
    this.onFileSelected(event);
  }

  openUploadModal(): void {
    this.uploadModalVisible = true;
  }

  toggleLeftMenu(): void {
    this.isLeftMenuHidden = !this.isLeftMenuHidden;
  }
}
