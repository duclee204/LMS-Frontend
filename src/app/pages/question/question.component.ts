import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements AfterViewInit {
  @ViewChild('leftMenu') leftMenu!: ElementRef;
  @ViewChild('toggleBtn') toggleBtn!: ElementRef;
  @ViewChild('contentWrapper') contentWrapper!: ElementRef;
  @ViewChild('profile') profile!: ElementRef;
  @ViewChild('profileDropdown') profileDropdown!: ElementRef;

  ngAfterViewInit() {
    // Toggle dropdown
    if (this.profile && this.profileDropdown) {
      this.profile.nativeElement.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        const dropdown = this.profileDropdown.nativeElement;
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
      });

      document.addEventListener('click', () => {
        this.profileDropdown.nativeElement.style.display = 'none';
      });
    }

    // Toggle menu
    if (this.toggleBtn && this.leftMenu && this.contentWrapper) {
      this.toggleBtn.nativeElement.addEventListener('click', () => {
        const menu = this.leftMenu.nativeElement;
        const wrapper = this.contentWrapper.nativeElement;
        menu.classList.toggle('hide');
        menu.classList.toggle('show');

        const isHidden = menu.classList.contains('hide');
        wrapper.classList.toggle('menu-hidden', isHidden);
        wrapper.style.width = isHidden ? '100%' : '';
      });

      // Hide on outside click (mobile)
      document.addEventListener('click', (e: any) => {
        const isMobile = window.innerWidth < 768;
        if (
          isMobile &&
          !this.leftMenu.nativeElement.contains(e.target) &&
          !this.toggleBtn.nativeElement.contains(e.target)
        ) {
          const menu = this.leftMenu.nativeElement;
          const wrapper = this.contentWrapper.nativeElement;
          menu.classList.remove('show');
          menu.classList.add('hide');
          wrapper.classList.add('menu-hidden');
        }
      });
    }
  }

  updateProfile() {
    alert('Chuyển đến trang cập nhật hồ sơ...');
  }

  logout() {
    alert('Đăng xuất...');
  }
}
