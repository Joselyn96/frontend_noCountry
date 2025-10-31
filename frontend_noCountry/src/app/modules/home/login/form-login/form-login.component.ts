import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-login.component.html',
  styleUrl: './form-login.component.css'
})
export class FormLoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  showPassword = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }


  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  handleLogin() {
     if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;
    const { email, password } = this.loginForm.value;
    console.log('Email:', email);
    console.log('Password:', password);

    // Simulación de login
    this.authService.auth(email, password)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.success = 'Inicio de sesión exitoso';
          // setTimeout(() => {
          //   this.router.navigate(['/dashboard']);
          // }, 1500); // 1500ms = 1.5 segundos
        },
        error: (err) => {
          this.error = 'Credenciales incorrectas';
        }
      });
  }

    togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
