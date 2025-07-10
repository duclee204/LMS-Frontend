import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
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
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
        alert(res?.message || 'Đăng nhập thành công!');
        this.router.navigate(['/qlkh']); // ✅ chuyển đến QLKH sau khi login
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Đăng nhập thất bại!';
        alert(this.loginError);
      }
    });
  }
}

}