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
  passwordStrength: any = {
    hasLength: false,
    hasNumber: false,
    hasLetter: false,
    hasSpecial: false,
    isValid: false
  };

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.strongPasswordValidator]],
      confirmPassword: ['', Validators.required],
      role: ['student', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Listen to password changes for real-time validation
    this.signupForm.get('password')?.valueChanges.subscribe(password => {
      this.checkPasswordStrength(password || '');
    });
  }

  strongPasswordValidator(control: any) {
    const password = control.value;
    if (!password) return null;

    const hasLength = password.length >= 10;
    const hasNumber = /[0-9]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const valid = hasLength && hasNumber && hasLetter && hasSpecial;
    return valid ? null : { weakPassword: true };
  }

  checkPasswordStrength(password: string) {
    this.passwordStrength = {
      hasLength: password.length >= 10,
      hasNumber: /[0-9]/.test(password),
      hasLetter: /[a-zA-Z]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      isValid: false
    };
    
    this.passwordStrength.isValid = 
      this.passwordStrength.hasLength && 
      this.passwordStrength.hasNumber && 
      this.passwordStrength.hasLetter && 
      this.passwordStrength.hasSpecial;
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.cvFile = file ? file : null;
  }

  onSubmit(): void {
    this.signupError = null;
    
    // Kiểm tra manual validation
    if (!this.signupForm.get('username')?.value || 
        !this.signupForm.get('fullname')?.value ||
        !this.signupForm.get('email')?.value ||
        !this.signupForm.get('password')?.value ||
        !this.signupForm.get('confirmPassword')?.value ||
        !this.signupForm.get('role')?.value) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Kiểm tra password strength
    if (!this.passwordStrength.isValid) {
      alert('Mật khẩu phải có ít nhất 10 ký tự, bao gồm chữ, số và ký tự đặc biệt!');
      return;
    }

    // Kiểm tra password match
    const password = this.signupForm.get('password')?.value;
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Kiểm tra email format
    const email = this.signupForm.get('email')?.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Email không hợp lệ!');
      return;
    }

    const { username, password: pwd, email: userEmail, fullname, role } = this.signupForm.value;
    this.authService.register({ username, password: pwd, email: userEmail, fullName: fullname, role }).subscribe({
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
