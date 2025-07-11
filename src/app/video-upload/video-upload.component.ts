import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video-upload',
  standalone: true,
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss'],
  imports: [FormsModule, CommonModule, HttpClientModule]
})
export class VideoUploadComponent {
  title: string = '';
  description: string = '';
  selectedFile: File | null = null;
  successMessage: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
    }
  }

  onSubmit(): void {
    if (!this.title || !this.description || !this.selectedFile) {
      alert('Vui lòng điền đầy đủ thông tin và chọn video.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.title);
    formData.append('description', this.description);

    this.http.post('http://localhost:8080/api/videos/upload', formData, {
      responseType: 'text' // nếu BE trả về chuỗi thông báo
    }).subscribe({
      next: (res) => {
        console.log('Upload response:', res);
        this.successMessage = true;
        setTimeout(() => {
          this.router.navigate(['/classroom']); // dùng Angular Router
        }, 1500);
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Tải lên thất bại!');
      }
    });
  }
}
