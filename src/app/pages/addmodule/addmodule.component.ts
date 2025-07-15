import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-addmodule',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [ModuleService],
  templateUrl: './addmodule.component.html',
  styleUrls: ['./addmodule.component.scss'],
})
export class AddmoduleComponent implements OnInit {
  public title: string = '';
  public orderNumber: number | null = null;
  public filteredModules: any[] = [];
  public modules: any[] = [];
  public searchText: string = '';
  public moduleStatus: { [key: string]: string } = {};
  @ViewChild('profileDropdown') profileDropdown!: ElementRef;
  @ViewChild('aside') aside!: ElementRef;
  @ViewChild('leftMenu') leftMenu!: ElementRef;
  @ViewChild('contentWrapper') contentWrapper!: ElementRef;

  public showProfileDropdown = false;
  public isMenuHidden = false;

  constructor(private router: Router, private moduleService: ModuleService) {}

  ngOnInit() {}


  addModule(): void {
    if (!this.title || !this.orderNumber) {
      alert('Vui lòng nhập đầy đủ tên và thứ tự module!');
      return;
    }
    const moduleData = {
      title: this.title,
      orderNumber: this.orderNumber,
      description: '',
      status: 'NotPublished' as 'NotPublished'
    };
    this.moduleService.createModule(moduleData).subscribe({
      next: () => {
        alert('Thêm module thành công');
        this.router.navigate(['/uploadmodule']);
      },
      error: (err) => {
        alert('Lỗi khi thêm module');
        console.error(err);
      }
    });
  }

  confirmAddModule() {
    this.addModule();
  }

  cancelModal() {
    this.router.navigate(['/module']);
  }

  redirectToModulePage() {
    this.router.navigate(['/module']);
  }

  toggleProfileDropdown(event?: Event) {
    if (event) event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
    if (this.profileDropdown) {
      this.profileDropdown.nativeElement.style.display = this.showProfileDropdown
        ? 'block'
        : 'none';
    }
  }

  toggleLeftMenu() {
    const leftMenu = this.leftMenu.nativeElement;
    const wrapper = this.contentWrapper.nativeElement;

    leftMenu.classList.toggle('hide');
    leftMenu.classList.toggle('show');

    const isHidden = leftMenu.classList.contains('hide');
    wrapper.classList.toggle('menu-hidden', isHidden);
    wrapper.style.width = isHidden ? '100%' : '';

    if (window.innerWidth <= 1024 && this.aside) {
      const isAsideHidden = getComputedStyle(this.aside.nativeElement).display === 'none';
      this.aside.nativeElement.style.display = isAsideHidden ? 'flex' : 'none';
    }

    this.isMenuHidden = isHidden;
  }

  filterModules(): void {
    if (!this.searchText) {
      this.filteredModules = [...this.modules];
    } else {
      this.filteredModules = this.modules.filter((m: any) =>
        m.title && m.title.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const file = input.files[0];
      // ...upload logic here...
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    this.showProfileDropdown = false;
    if (this.profileDropdown) {
      this.profileDropdown.nativeElement.style.display = 'none';
    }
    if (
      typeof window !== 'undefined' &&
      window.innerWidth <= 1024 &&
      this.leftMenu &&
      this.aside &&
      this.contentWrapper &&
      !this.leftMenu.nativeElement.contains(event.target as Node) &&
      !this.aside.nativeElement.contains(event.target as Node)
    ) {
      this.leftMenu.nativeElement.classList.remove('show');
      this.leftMenu.nativeElement.classList.add('hide');
      this.contentWrapper.nativeElement.classList.add('menu-hidden');
      this.aside.nativeElement.style.display = 'none';
      this.isMenuHidden = true;
    }
  }

  updateProfile(): void {
    alert('Chuyển đến trang cập nhật hồ sơ...');
  }

  logout(): void {
    alert('Đăng xuất...');
  }
}
