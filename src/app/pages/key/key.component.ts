import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-key',
  templateUrl: './key.component.html',
  styleUrls: ['./key.component.scss'],
  imports: [CommonModule],
})
export class KeyComponent implements AfterViewInit {
  profileDropdownVisible = false;
  isMenuHidden = false;

  questions: any[] = [
    {
      id: Date.now(),
      type: 'radio',
      options: ['Tùy chọn 1', 'Tùy chọn 2', 'Tùy chọn 3'],
      points: 1,
      correct: [1],
    },
    {
      id: Date.now() + 1,
      type: 'checkbox',
      options: ['Tùy chọn 1', 'Tùy chọn 2', 'Tùy chọn 3'],
      points: 1,
      correct: [0, 1],
    },
  ];

  @ViewChild('leftMenu') leftMenu!: ElementRef;
  @ViewChild('toggleBtn') toggleBtn!: ElementRef;
  @ViewChild('contentWrapper') contentWrapper!: ElementRef;
  @ViewChild('profile') profile!: ElementRef;
  @ViewChild('profileDropdown') profileDropdown!: ElementRef;

  toggleProfileDropdown(event: Event): void {
    event.stopPropagation();
    this.profileDropdownVisible = !this.profileDropdownVisible;
  }

  toggleLeftMenu(): void {
    this.isMenuHidden = !this.isMenuHidden;
    const menu = this.leftMenu?.nativeElement;
    const wrapper = this.contentWrapper?.nativeElement;
    if (menu && wrapper) {
      if (this.isMenuHidden) {
        menu.classList.add('hide');
        menu.classList.remove('show');
        wrapper.classList.add('menu-hidden');
        wrapper.style.width = '100%';
      } else {
        menu.classList.remove('hide');
        menu.classList.add('show');
        wrapper.classList.remove('menu-hidden');
        wrapper.style.width = '';
      }
    }
  }

  ngAfterViewInit() {
    // Xóa event native, chỉ dùng Angular binding
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Nếu click vào chính nút profile thì không đóng dropdown
    const isClickInsideProfile = this.profile?.nativeElement.contains(event.target);
    if (!isClickInsideProfile && this.profileDropdownVisible) {
      this.profileDropdownVisible = false;
    }
    const isMobile = window.innerWidth < 768;
    if (
      isMobile &&
      this.leftMenu && this.toggleBtn &&
      !this.leftMenu.nativeElement.contains(event.target) &&
      !this.toggleBtn.nativeElement.contains(event.target)
    ) {
      this.isMenuHidden = true;
      this.leftMenu.nativeElement.classList.add('hide');
      this.leftMenu.nativeElement.classList.remove('show');
      this.contentWrapper.nativeElement.classList.add('menu-hidden');
    }
  }

  addQuestion(): void {
    const newQuestion = {
      id: Date.now(),
      type: 'radio',
      options: ['Tùy chọn 1', 'Tùy chọn 2', 'Tùy chọn 3'],
      points: 1,
      correct: [],
    };
    this.questions.push(newQuestion);
  }

  updateProfile(): void {
    alert('Chuyển đến trang cập nhật hồ sơ...');
  }

  logout(): void {
    alert('Đăng xuất...');
  }
}
