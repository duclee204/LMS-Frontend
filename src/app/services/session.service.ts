import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  public authStatus$ = this.isLoggedIn$; // Alias cho tương thích

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    // Khởi tạo trạng thái đăng nhập
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const isValid = this.isTokenValid(token);
      this.isLoggedInSubject.next(isValid);
      
      if (!isValid && token) {
        // Token không hợp lệ, xóa nó
        localStorage.removeItem('token');
      }
    }
  }

  public isTokenValid(token: string | null): boolean {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  public login(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      // Clear any existing session
      this.logout(false);
      
      // Set new session
      localStorage.setItem('token', token);
      this.isLoggedInSubject.next(true);
      console.log('✅ Session established');
    }
  }

  public logout(showAlert: boolean = true): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      // Xóa avatar session để lần đăng nhập tiếp theo chọn avatar mới
      sessionStorage.removeItem('session_avatar');
      this.isLoggedInSubject.next(false);
      console.log('👋 Session cleared');
      
      if (showAlert) {
        alert('Đăng xuất thành công!');
      }
      
      // Redirect to login page after logout
      this.router.navigate(['/login']);
    }
  }

  public getCurrentUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token && this.isTokenValid(token)) {
        try {
          return JSON.parse(atob(token.split('.')[1]));
        } catch (error) {
          return null;
        }
      }
    }
    return null;
  }

  public getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  public getUsername(): string | null {
    const user = this.getCurrentUser();
    return user ? user.sub : null;
  }

  public getFullName(): string | null {
    const user = this.getCurrentUser();
    return user ? user.fullName : null;
  }

  public getUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.userId : null;
  }

  public isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'ROLE_admin' || role === 'ADMIN' || role === 'admin';
  }

  public isInstructor(): boolean {
    return this.getUserRole() === 'INSTRUCTOR';
  }

  public isStudent(): boolean {
    return this.getUserRole() === 'STUDENT';
  }

  public forceLogout(message: string = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'): void {
    this.logout(false);
    if (isPlatformBrowser(this.platformId)) {
      alert(message);
    }
    this.router.navigate(['/login']);
  }
}
