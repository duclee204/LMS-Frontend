import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-video-upload',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.scss']
})
export class VideoUploadComponent {
  title = '';
  description = '';
  selectedFile: File | null = null;
  successMessage = false;

  constructor(private http: HttpClient, private router: Router) {}

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files?.length) {
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

    this.http.post('http://localhost:8080/api/videos/upload', formData, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          console.log('Upload response:', res);
          this.successMessage = true;
          setTimeout(() => this.router.navigate(['/classroom']), 1500);
        },
        error: (err) => {
          console.error('Upload failed', err);
          alert('Tải lên thất bại!');
        }
      });
  }
}

