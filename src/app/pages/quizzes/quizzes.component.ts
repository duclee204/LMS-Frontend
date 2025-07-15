import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.scss'],
})
export class QuizzesComponent implements AfterViewInit {
   @ViewChild('leftMenu') leftMenu!: ElementRef;
  @ViewChild('toggleBtn') toggleBtn!: ElementRef;
  @ViewChild('contentWrapper') contentWrapper!: ElementRef;
  @ViewChild('profileDropdown') profileDropdown!: ElementRef;

  quizzes = [
    { title: 'Điểm danh buổi học 1', dueDate: 'Mar 8, 2023 at 4:35pm', points: 1, questions: 1 },
    { title: 'Điểm danh buổi học 2', dueDate: 'Mar 22, 2023 at 4:35pm', points: 1, questions: 1 },
    { title: 'Điểm danh buổi học 4', dueDate: 'Apr 5, 2023 at 4:30pm', points: 1, questions: 1 },
    { title: 'Điểm danh buổi học 5', dueDate: 'Apr 12, 2023 at 4:30pm', points: 1, questions: 1 },
    { title: 'Điểm danh buổi học 6', dueDate: 'Apr 14, 2023 at 11:35am', points: 1, questions: 1 },
    { title: 'Điểm danh buổi học 7', dueDate: 'Apr 19, 2023 at 4:35pm', points: 1, questions: 1 },
    { title: 'Điểm danh buổi học 8', dueDate: 'Apr 27, 2023 at 4:30pm', points: 1, questions: 1 },
    { title: 'Điểm danh buổi học 9', dueDate: 'May 10, 2023 at 4:30pm', points: 1, questions: 1 },
    { title: 'Điểm danh buổi học 10', dueDate: 'May 15, 2023 at 4:30pm', points: 1, questions: 1 },
    { title: 'Điểm danh buổi học 11', dueDate: 'May 17, 2023 at 4:25pm', points: 1, questions: 1 },
    { title: 'Điểm danh buổi học 12', dueDate: 'May 24, 2023 at 4:35pm', points: 1, questions: 1 },
  ];

  ngAfterViewInit() {
    const toggleBtn = this.toggleBtn.nativeElement;
    const leftMenu = this.leftMenu.nativeElement;
    const contentWrapper = this.contentWrapper.nativeElement;

    toggleBtn.addEventListener('click', () => {
      leftMenu.classList.toggle('hide');
      leftMenu.classList.toggle('show');

      const isHidden = leftMenu.classList.contains('hide');
      contentWrapper.classList.toggle('menu-hidden', isHidden);
      contentWrapper.style.width = isHidden ? '100%' : '';
    });

    document.addEventListener('click', (e: Event) => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && !leftMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        leftMenu.classList.remove('show');
        leftMenu.classList.add('hide');
        contentWrapper.classList.add('menu-hidden');
      }
    });
  }

  updateProfile() {
    alert('Chuyển đến trang cập nhật hồ sơ...');
    // window.location.href = '/update-profile';
  }

  logout() {
    alert('Đăng xuất...');
    // window.location.href = '/logout';
  }
}
