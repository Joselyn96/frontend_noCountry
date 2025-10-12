import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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

    // Simulación de login
    setTimeout(() => {
      this.isLoading = false;
      const { email, password } = this.loginForm.value;

      if (
        (email === 'paciente@demo.com' ||
          email === 'doctor@demo.com' ||
          email === 'admin@demo.com') &&
        password
      ) {
        this.success = 'Inicio de sesión exitoso';
      } else {
        this.error = 'Credenciales incorrectas';
      }
    }, 1500);
  }
}
