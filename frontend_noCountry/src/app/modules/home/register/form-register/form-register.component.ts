// import { CommonModule } from '@angular/common';
// import { Component, inject } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { finalize } from 'rxjs';
// import { AuthService } from '../../../../core/auth/auth.service';

// // Utilidad para no enviar undefined/null/''
// function cleanPayload<T extends Record<string, any>>(obj: T): Partial<T> {
//   const out: Partial<T> = {};
//   Object.keys(obj).forEach((k) => {
//     const v = (obj as any)[k];
//     const isEmptyString = typeof v === 'string' && v.trim() === '';
//     if (v !== undefined && v !== null && !isEmptyString) {
//       (out as any)[k] = v;
//     }
//   });
//   return out;
// }

// type PatientCreateDto = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   repeatPassword: string;
//   dateOfBirth: string; // YYYY-MM-DD
//   gender: 'MALE' | 'FEMALE' | 'OTHER';
//   dni: string;
//   phone?: string; // opcional
// };

// @Component({
//   selector: 'app-form-register',
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './form-register.component.html',
//   styleUrl: './form-register.component.css'
// })
// export class FormRegisterComponent {
//   registerForm: FormGroup;
//   isLoading = false;
//   error = '';
//   success = '';

//   private authService = inject(AuthService);

//   constructor(private fb: FormBuilder, private router: Router) {
//     this.registerForm = this.fb.group({
//       name: ['', Validators.required],
//       surname: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       phone: [''],
//       dni: ['', Validators.required],
//       gender: ['', Validators.required], // 'masculino' | 'femenino' | 'otro'
//       birthDate: ['', Validators.required], // input type="date"
//       password: ['', [Validators.required, Validators.minLength(8)]],
//       confirmPassword: ['', Validators.required],
//     });
//   }

//   get name() { return this.registerForm.get('name'); }
//   get surname() { return this.registerForm.get('surname'); }
//   get email() { return this.registerForm.get('email'); }
//   get phone() { return this.registerForm.get('phone'); }
//   get password() { return this.registerForm.get('password'); }
//   get confirmPassword() { return this.registerForm.get('confirmPassword'); }
//   get birthDate() { return this.registerForm.get('birthDate'); }
//   get gender() { return this.registerForm.get('gender'); }
//   get dni() { return this.registerForm.get('dni'); }

//   private genderMap: Record<string, 'MALE' | 'FEMALE' | 'OTHER'> = {
//     masculino: 'MALE',
//     femenino: 'FEMALE',
//     otro: 'OTHER',
//   };

//   async onSubmit() {
//     this.error = '';
//     this.success = '';

//     if (this.registerForm.invalid) {
//       this.registerForm.markAllAsTouched();
//       this.error = 'Por favor completa los campos';
//       return;
//     }

//     const { password, confirmPassword } = this.registerForm.value;
//     if (password !== confirmPassword) {
//       this.error = 'Las contraseñas no coinciden';
//       return;
//     }

//     this.isLoading = true;
//     this.registerForm.disable();

//     const form = this.registerForm.value;

//     const apiGender =
//       this.genderMap[String(form.gender || '').toLowerCase()] ?? 'OTHER';

//     // Asegura formato YYYY-MM-DD (primeros 10 chars de un input date o ISO)
//     const dateOfBirth = String(form.birthDate || '').slice(0, 10);

//     // Construye el payload y elimina campos vacíos/opcionales no usados
//     const rawPayload: PatientCreateDto = {
//       firstName: String(form.name || '').trim(),
//       lastName: String(form.surname || '').trim(),
//       email: String(form.email || '').trim(),
//       password: String(form.password || ''),
//       repeatPassword: String(form.confirmPassword || ''),
//       dateOfBirth,
//       gender: apiGender,
//       dni: String(form.dni || '').trim(),
//       phone: form.phone ? String(form.phone).trim() : undefined,
//     };

//     const payload = cleanPayload(rawPayload) as PatientCreateDto;

//     console.log('[REGISTER] Payload a /patient/create:', payload);

//     this.authService.registerPatient(payload)
//       .pipe(finalize(() => {
//         this.isLoading = false;
//         this.registerForm.enable();
//       }))
//       .subscribe({
//         next: () => {
//           this.success = 'Cuenta creada exitosamente. Redirigiendo al dashboard...';
//           setTimeout(() => this.router.navigate(['/dashboard']), 1500);
//         },
//         error: (err) => {
//           // tratar de extraer mensaje útil del backend
//           const parsed = err?.error || {};
//           const msg =
//             parsed?.message ||
//             parsed?.detail ||
//             parsed?.error ||
//             parsed?.errors?.[0]?.message ||
//             'No pudimos crear tu cuenta por un error del servidor. Intenta más tarde.';
//           this.error = msg;
//           console.error('[REGISTER][ERR] status:', err?.status);
//           console.error('[REGISTER][ERR] raw error:', parsed);
//         }
//       });
//   }
// }


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
}
