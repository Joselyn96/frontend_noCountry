import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormRegisterComponent } from './form-register/form-register.component';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, FormRegisterComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
registerForm: FormGroup;
  isLoading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      birthDate: ['', Validators.required],
      dni: ['', Validators.required],
      gender: ['', Validators.required], // <-- agregado aquí
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get phone() { return this.registerForm.get('phone'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  async onSubmit() {
    this.error = '';
    this.success = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.error = 'Por favor completa todos los campos obligatorios';
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    // Simula un delay de backend
    // await new Promise((resolve) => setTimeout(resolve, 1500));

    this.success = 'Cuenta creada exitosamente. Redirigiendo...';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);

    this.isLoading = false;
  }
}
