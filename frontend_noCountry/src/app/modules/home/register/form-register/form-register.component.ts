import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form-register.component.html',
  styleUrl: './form-register.component.css'
})
export class FormRegisterComponent {
registerForm: FormGroup;
  isLoading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      gender: ['', Validators.required],
      birthDate: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });
  }

  get name() { return this.registerForm.get('name'); }
  get surname() { return this.registerForm.get('surname'); }
  get email() { return this.registerForm.get('email'); }
  get phone() { return this.registerForm.get('phone'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get birthDate() { return this.registerForm.get('birthDate'); }
  get gender() { return this.registerForm.get('gender'); }
  get dni() { return this.registerForm.get('dni'); }

  async onSubmit() {
    this.error = '';
    this.success = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.error = 'Por favor completa los campos';
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;

    await new Promise((resolve) => setTimeout(resolve, 1500));

    this.success = 'Cuenta creada exitosamente. Redirigiendo...';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);

    this.isLoading = false;
  }
}
