import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { PatientCreate } from '../../../../core/models/patient';


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

    // 🆕 Agregar esta propiedad
  showPassword = false;
  showRepeatPassword = false; 

   // 🆕 Requisitos de contraseña
  passwordRequirements = {
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSymbol: false
  };

  // private authService = inject(AuthService);

  constructor(private fb: FormBuilder, private router: Router, private patientService: PatientService) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],    
      identification: ['', Validators.required],
      typeIdentification: ['dni', Validators.required], 
      nationality: ['', Validators.required],
      gender: ['male', Validators.required],    
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      repeatPassword: ['', Validators.required],
    });

    // 🆕 Escuchar cambios en la contraseña
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.checkPasswordRequirements(password || '');
    });

  }

   // 🆕 Verificar requisitos de contraseña
  checkPasswordRequirements(password: string) {
    this.passwordRequirements.minLength = password.length >= 8;
    this.passwordRequirements.hasUpperCase = /[A-Z]/.test(password);
    this.passwordRequirements.hasNumber = /[0-9]/.test(password);
    this.passwordRequirements.hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-]/.test(password);
  }

  // 🆕 Verificar si la contraseña cumple todos los requisitos
  get isPasswordValid(): boolean {
    return this.passwordRequirements.minLength &&
           this.passwordRequirements.hasUpperCase &&
           this.passwordRequirements.hasNumber &&
           this.passwordRequirements.hasSymbol;
  }


  
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get dateOfBirth() { return this.registerForm.get('dateOfBirth'); }
  get identification() { return this.registerForm.get('identification'); }
  get typeIdentification() { return this.registerForm.get('typeIdentification'); }
  get nationality() { return this.registerForm.get('nationality'); }
  get gender() { return this.registerForm.get('gender'); }
  get phone() { return this.registerForm.get('phone'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get repeatPassword() { return this.registerForm.get('repeatPassword'); }

  async onSubmit() {
    this.error = '';
    this.success = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.error = 'Por favor completa los campos';
      return;
    }

    // 🆕 Validar que la contraseña cumpla con los requisitos
    if (!this.isPasswordValid) {
      this.error = 'La contraseña no cumple con los requisitos de seguridad';
      return;
    }

    const { password, repeatPassword } = this.registerForm.value;
    console.log(password, repeatPassword);
    console.log(this.registerForm.value);
    if (password !== repeatPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }


    this.isLoading = true;
    this.registerForm.disable();
    const raw = this.registerForm.value;
    const payload: PatientCreate = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone || null,
      password: raw.password,
      repeatPassword: raw.repeatPassword,
      dateOfBirth: new Date(raw.dateOfBirth),
      gender: raw.gender,
      identification: raw.identification,
      typeIdentification: raw.typeIdentification,
      nationality: raw.nationality,
    };

    console.log('[REGISTER] Payload a /patient/create:', payload);
    this.patientService.registerPatient(payload)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.registerForm.enable(); // ✅ Rehabilitar formulario
      }))
      .subscribe({
        next: (response: any) => {
          console.log('Registro exitoso:', response);
          this.success = 'Cuenta creada exitosamente. Redirigiendo al login...';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000);
        },
        error: (err: any) => {
          console.error('Error en registro:', err);

          if (err.status === 400) {
            this.error = 'El correo electrónico ya está registrado';
          } else if (err.status === 422) {
            this.error = 'Los datos ingresados son inválidos. Verifica todos los campos';
          } else if (err.error?.message) {
            this.error = err.error.message;
          } else {
            this.error = 'Error al crear la cuenta. Por favor, intenta nuevamente';
          }
        }
      });
  }

  // 🆕 Agregar este método
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  // 👇 Nuevo método
toggleRepeatPasswordVisibility() {
  this.showRepeatPassword = !this.showRepeatPassword;
}
}
