import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  cvFile: File | null = null;
  signupError: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      fullname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { mismatch: true };
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.cvFile = file ? file : null;
  }

  onSubmit(): void {
    this.signupError = null;
    if (this.signupForm.valid) {
      const { username, password, email, fullname, role } = this.signupForm.value;
      this.authService.register({ username, password, email, fullName: fullname, role }).subscribe({
        next: (res) => {
          alert(res?.message || 'Đăng ký thành công!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          if (err.status === 409 && err.error?.message) {
            this.signupError = err.error.message;
            alert(this.signupError);
          } else if (err.error?.message) {
            this.signupError = err.error.message;
            alert(this.signupError);
          } else {
            this.signupError = 'Đăng ký thất bại!';
            alert(this.signupError);
          }
        }
      });
    }
  }
}
