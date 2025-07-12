import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.loginError = null;
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login({ username, password }).subscribe({
        next: (res) => {
          if (res?.token && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', res.token);
          }
          if (isPlatformBrowser(this.platformId)) {
            alert(res?.message || 'Đăng nhập thành công!');
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loginError = err.error?.message || 'Đăng nhập thất bại!';
          if (isPlatformBrowser(this.platformId)) {
            alert(this.loginError);
          }
        }
      });
    }
  }
}
