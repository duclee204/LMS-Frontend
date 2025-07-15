import { Component, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-doexam3',
  templateUrl: './doexam3.component.html',
  styleUrls: ['./doexam3.component.scss']
})
export class Doexam3Component implements AfterViewInit {
  profileDropdownVisible = false;
  isMenuHidden = false;

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

  ngAfterViewInit() {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
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

  updateProfile(): void {
    alert('Chuyển đến trang cập nhật hồ sơ...');
  }

  logout(): void {
    alert('Đăng xuất...');
  }
}
