import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  quickFill(role: 'admin' | 'lead'): void {
    if (role === 'admin') {
      this.loginForm.setValue({
        identifier: 'admin@company.com',
        password: 'admin123'
      });
    } else {
      this.loginForm.setValue({
        identifier: 'sarah.j@company.com',
        password: 'user123'
      });
    }
    this.errorMessage = '';
  }

  onInputChange(): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { identifier, password } = this.loginForm.value;

    setTimeout(() => {
      const result = this.authService.login(identifier, password);
      this.isLoading = false;

      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = result.message || 'Invalid credentials provided.';
        this.changeDetectorRef.detectChanges();
      }
    }, 450);
  }
}
