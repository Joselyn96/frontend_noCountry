import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { PatientCreateByAdmin, PatientResponse, PatientUpdate } from '../../../../core/models/patient';
import { catchError, debounceTime, distinctUntilChanged, filter, of, Subject, Subscription, switchMap } from 'rxjs';
import { AuthCurrentUser } from '../../../../core/models/auth';
import { AuthService } from '../../../../core/auth/auth.service';

type RoleKey = 'admin' | 'doctor' | 'patient';
type StatusKey = 'active' | 'inactive';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: RoleKey;
  specialty: string | null;
  status: StatusKey;
  joinDate: string;
}

@Component({
  selector: 'app-patients-management',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './patients-management.component.html',
  styleUrl: './patients-management.component.css',
  standalone: true
})
export class PatientsManagementComponent {
  
  patients: PatientResponse[] | null = null;
  private search$ = new Subject<string>();
  private searchSub?: Subscription;
  public readonly Array = Array;
  
  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(0);
  
  paginatedPatients = computed(() => {
    const list = this.patients ?? [];
    const page = Math.max(1, this.currentPage());
    const size = Math.max(1, this.pageSize());
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });
  
  // Forms
  patientForm!: FormGroup;
  
  // Estado UI
  searchTerm = signal<string>('');
  roleFilter = signal<'all' | RoleKey>('all');
  showMenu = false;

  isPatientDialogOpen = signal<boolean>(false);
  
  isCreating = signal<boolean>(false);
  errorMsg = signal<string>('');
  successMsg = signal<string>('');
  user: AuthCurrentUser | null = null;
  
  constructor(private fb: FormBuilder, private patientService: PatientService, private authService: AuthService) {
    this.user = authService.getCurrentUser();
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required], 
      nationality: ['', Validators.required],
      typeIdentification: ['', Validators.required],
      identification: ['', Validators.required],
    });

    this.searchSub = this.search$.pipe(
      debounceTime(300),             
      distinctUntilChanged(),      
      filter(q => !!q && q.trim().length >= 3), 
      switchMap(q =>
        this.patientService.getPatientsByName(q).pipe(
          catchError(err => {
            console.error('Error searching patients:', err);
            return of({ body: { patients: [] } });
          })
        )
      )
    ).subscribe({
      next: (response: any) => {
        this.patients = (response?.body?.patients as PatientResponse[]) ?? [];
        console.log('Search results:', this.patients);
      },
      error: err => console.error('Search subscription error:', err)
    });
  }

  async ngOnInit()  {
    await this.getPatients();
  }
  
  async getPatients() {
    this.patientService.getAllPatients(this.currentPage(), this.pageSize()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.patients = response.body.data as PatientResponse[];

        this.totalPages.set(response.body.metadata.totalPages);
        console.log(this.patients);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Request completed');
      },
    }
    );
  }

  onSearchInput(value: string) {
    const v = (value ?? '').toString();
    this.searchTerm.set(v);
    this.getPatientsByName(v); 
  }

  async getPatientsByName(name: string) {
    const q = (name ?? '').toString().trim();

    if (q.length === 0) {
      this.searchTerm.set('');
      await this.getPatients();
      return;
    }

    if (q.length < 3) {
      this.searchTerm.set(q);
      return;
    }

    this.search$.next(q);
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.search$.complete();
  }

  roleConfig: Record<RoleKey, { label: string; color: string }> = {
    admin: { label: 'Administrador', color: 'bg-[#f44336]' },
    doctor: { label: 'Médico', color: 'bg-[#1877f2]' },
    patient: { label: 'Paciente', color: 'bg-[#2ead4e]' },
  };

  // openPatientDialog() {
  //   this.showMenu = false;
  //   this.errorMsg.set('');
  //   this.successMsg.set('');
  //   this.patientForm.reset();
  //   this.isPatientDialogOpen.set(true);
  // }

  // closeAllDialogs() {
  //   this.isPatientDialogOpen.set(false);
  // }

  async createPatient() {
    if (this.patientForm.invalid) {
      this.errorMsg.set('Por favor completa todos los campos obligatorios');
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    // build payload according to PatientCreateByAdmin
    const v = this.patientForm.value;
    const payload: PatientCreateByAdmin = {
      firstName: v.name,
      lastName: v.surname,
      email: v.email,
      phone: v.phone || undefined,
      dateOfBirth: new Date(v.birthDate),
      gender: v.gender,
      identification: v.identification,
      typeIdentification: v.typeIdentification,
      nationality: v.nationality,
    };

    // call service to create patient as admin and refresh list on success
    this.patientService.patientCreateByAdmin(payload).subscribe({
      next: (res: any) => {
        this.successMsg.set('Cuenta de paciente creada exitosamente.');
        // refresh patients from server (resets pagination)
        this.getPatients();
        this.patientForm.reset();
         setTimeout(() => {
          this.isCreating.set(false);
          this.isPatientDialogOpen.set(false);
          this.successMsg.set('');
        }, 900);
      },
      error: (err) => {
        console.error('Error creating patient:', err);
        this.errorMsg.set('Error al crear paciente');
        this.isCreating.set(false);
      },
    });
  }

  setPage(page: number) {
    const p = Math.min(Math.max(1, page), this.totalPages());
    this.currentPage.set(p);
    this.getPatients();
  }

  prevPage() {
    this.setPage(this.currentPage() - 1);
  }

  nextPage() {
    this.setPage(this.currentPage() + 1);
  }

  isEditMode = signal<boolean>(false);
editingPatientId = signal<number | null>(null);

// Modifica el método openPatientDialog existente:
openPatientDialog() {
  this.showMenu = false;
  this.errorMsg.set('');
  this.successMsg.set('');
  this.isEditMode.set(false);
  this.editingPatientId.set(null);
  this.patientForm.reset();
  
  // Habilitar todos los campos para crear
  this.patientForm.get('email')?.enable();
  this.patientForm.get('typeIdentification')?.enable();
  this.patientForm.get('identification')?.enable();
  
  this.isPatientDialogOpen.set(true);
}

// Añade este nuevo método para abrir el diálogo de edición:
openEditPatientDialog(patient: PatientResponse) {
  this.showMenu = false;
  this.errorMsg.set('');
  this.successMsg.set('');
  this.isEditMode.set(true);
  this.editingPatientId.set(patient.id);
  
  // Rellenar el formulario con los datos del paciente
  this.patientForm.patchValue({
    name: patient.firstName,
    surname: patient.lastName,
    phone: patient.phone || '',
    email: patient.email,
    birthDate: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
    gender: patient.gender || '',
    nationality: patient.nationality || '',
    typeIdentification: patient.typeIdentification || '',
    identification: patient.identification || '',
  });
  
  // Deshabilitar campos que no se pueden editar
  this.patientForm.get('email')?.disable();
  this.patientForm.get('typeIdentification')?.disable();
  this.patientForm.get('identification')?.disable();
  
  this.isPatientDialogOpen.set(true);
}

// Modifica el método closeAllDialogs:
closeAllDialogs() {
  this.isPatientDialogOpen.set(false);
  this.isEditMode.set(false);
  this.editingPatientId.set(null);
  // Rehabilitar campos al cerrar
  this.patientForm.get('email')?.enable();
  this.patientForm.get('typeIdentification')?.enable();
  this.patientForm.get('identification')?.enable();
}

// Añade este nuevo método para actualizar paciente:
async updatePatient() {
  // Validar solo los campos editables
  const name = this.patientForm.get('name');
  const surname = this.patientForm.get('surname');
  const birthDate = this.patientForm.get('birthDate');
  const gender = this.patientForm.get('gender');
  const nationality = this.patientForm.get('nationality');

  if (!name?.value || !surname?.value || !birthDate?.value || !gender?.value || !nationality?.value) {
    this.errorMsg.set('Por favor completa todos los campos obligatorios');
    this.patientForm.markAllAsTouched();
    return;
  }

  const patientId = this.editingPatientId();
  if (!patientId) {
    this.errorMsg.set('Error: ID de paciente no encontrado');
    return;
  }

  this.isCreating.set(true);

  // Construir payload con solo los campos editables
  const v = this.patientForm.value;
  const payload: PatientUpdate = {
    firstName: v.name as string,
    lastName: v.surname as string,
    phone: v.phone as string || undefined,
    dateOfBirth: new Date(v.birthDate),
    gender: v.gender,
    nationality: v.nationality as string,
    // Nota: No incluimos email, typeIdentification, ni identification
  };

  this.patientService.updatePatient(patientId, payload).subscribe({
    next: () => {
      this.successMsg.set('Paciente actualizado exitosamente.');
      this.patientForm.reset();
      this.getPatients();
    },
    error: (err) => {
      console.error('Error updating patient:', err);
      this.errorMsg.set('Error al actualizar paciente');
    },
    complete: () => {
      setTimeout(() => {
        this.isCreating.set(false);
        this.isPatientDialogOpen.set(false);
        this.successMsg.set('');
        this.errorMsg.set('');
        this.isEditMode.set(false);
        this.editingPatientId.set(null);
        // Rehabilitar campos
        this.patientForm.get('email')?.enable();
        this.patientForm.get('typeIdentification')?.enable();
        this.patientForm.get('identification')?.enable();
      }, 900);
    }
  });
}

// Añade método para alternar estado del paciente (opcional):
async togglePatientStatus(patient: PatientResponse) {
  const newStatus = !patient.isActive;
  const action = newStatus ? 'activar' : 'desactivar';
  
  if (!confirm(`¿Está seguro que desea ${action} a ${patient.lastName} ${patient.firstName}?`)) {
    return;
  }

  // Implementa el método togglePatientStatus en tu servicio
  // this.patientService.togglePatientStatus(patient.id, newStatus).subscribe({
  //   next: () => {
  //     this.getPatients();
  //     alert(`Paciente ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
  //   },
  //   error: (err) => {
  //     console.error('Error toggling patient status:', err);
  //     alert(`Error al ${action} el paciente`);
  //   }
  // });
}
}
