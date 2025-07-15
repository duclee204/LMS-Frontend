import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam',
  standalone: true,
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss'],
  imports: [CommonModule],
})
export class ExamComponent implements AfterViewInit {
  showDropdown = false;
  isMenuHidden = false;
  isMobile = window.innerWidth < 768;

  @ViewChild('leftMenu', { static: false }) leftMenu!: ElementRef;
  @ViewChild('toggleBtn', { static: false }) toggleBtn!: ElementRef;
  @ViewChild('contentWrapper', { static: false }) contentWrapper!: ElementRef;
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef;
  @ViewChild('noResultMessage', { static: false }) noResultMessage?: ElementRef;

  ngAfterViewInit(): void {
    if (this.searchInput && this.noResultMessage) {
      this.searchInput.nativeElement.addEventListener('input', () => {
        const keyword = this.searchInput!.nativeElement.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');
        let found = false;

        rows.forEach((row) => {
          const quizName = row.querySelector('td')?.textContent?.toLowerCase() || '';
          if (quizName.includes(keyword)) {
            (row as HTMLElement).style.display = '';
            found = true;
          } else {
            (row as HTMLElement).style.display = 'none';
          }
        });

        this.noResultMessage!.nativeElement.style.display = found ? 'none' : 'block';
      });
    }
  }

  toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  toggleLeftMenu(): void {
    this.isMenuHidden = !this.isMenuHidden;
  }

  updateProfile(): void {
    alert('Chuyển đến trang cập nhật hồ sơ...');
  }

  logout(): void {
    alert('Đăng xuất...');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.profile')) {
      this.showDropdown = false;
    }

    if (this.isMobile && this.leftMenu && this.toggleBtn) {
      if (
        !this.leftMenu.nativeElement.contains(event.target) &&
        !this.toggleBtn.nativeElement.contains(event.target)
      ) {
        this.isMenuHidden = true;
      }
    }
  }
}
