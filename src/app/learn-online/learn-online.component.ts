import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from "../components/sidebar/sidebar.component";

@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [CommonModule, HttpClientModule, SidebarComponent],
  templateUrl: './learn-online.component.html',
  styleUrls: ['./learn-online.component.scss']
})
export class LearnOnlineComponent implements OnInit {
  dropdownOpen = false;
  videos: any[] = [];
  currentVideo: any = null;

  @ViewChild('classroomVideo', { static: true }) videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8080/api/videos').subscribe({
      next: data => {
        this.videos = data;
        if (this.videos.length) {
          this.playVideo(this.videos[this.videos.length - 1]);
        }
      },
      error: err => console.error('Lỗi khi tải danh sách video:', err)
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  playVideo(video: any, event?: Event) {
    if (event) event.preventDefault();
    this.currentVideo = video;
    const src = video.fileUrl?.startsWith('/videos/')
      ? `http://localhost:8080${video.fileUrl}`
      : video.fileUrl;

    if (src) {
      this.videoPlayer.nativeElement.src = src;
      this.videoPlayer.nativeElement.load();
      this.videoPlayer.nativeElement.play();
    }
  }

  clearVideos() {
    if (confirm('Bạn có chắc chắn muốn xoá tất cả video đã tải lên (chỉ ở giao diện)?')) {
      this.videos = [];
      this.videoPlayer.nativeElement.src = '';
    }
  }
}
