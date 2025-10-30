
import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorCreateByAdmin, DoctorResponse, DoctorUpdate } from '../../../../core/models/doctor';
import { DoctorService } from '../../../../core/services/doctor/doctor.service';
import { catchError, debounceTime, distinctUntilChanged, filter, of, Subject, Subscription, switchMap } from 'rxjs';
import { SpecialtyService } from '../../../../core/services/specialty/specialty.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthCurrentUser } from '../../../../core/models/auth';
import { CreateAppointmentComponent } from './create-appointment/create-appointment.component';

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
  selector: 'app-doctors-management',
  imports: [ReactiveFormsModule, CommonModule, CreateAppointmentComponent],
  templateUrl: './doctors-management.component.html',
  styleUrl: './doctors-management.component.css'
})
export class DoctorsManagementComponent {
  doctors: DoctorResponse[] | null = null;
  // specialties state (loaded when opening the create doctor dialog)
  specialties = signal<{ id: number; name: string }[]>([]);
  specialtiesLoading = signal<boolean>(false);
  specialtiesError = signal<string>('');
  private search$ = new Subject<string>();
  private searchSub?: Subscription;
  public readonly Array = Array;

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(0);

  paginatedPatients = computed(() => {
    const list = this.doctors ?? [];
    const page = Math.max(1, this.currentPage());
    const size = Math.max(1, this.pageSize());
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  user: AuthCurrentUser | null = null;

  // Estado para edición
  isEditMode = signal<boolean>(false);
  editingDoctorId = signal<number | null>(null);

  constructor(private fb: FormBuilder, private doctorService: DoctorService, private specialtyService: SpecialtyService, private authService: AuthService) {
    this.user = authService.getCurrentUser();

    this.doctorForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      specialtyID: [0, Validators.required],
      licenseNumber: ['', Validators.required],
      bio: ['']
    });

    this.searchSub = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(q => !!q && q.trim().length >= 3),
      switchMap(q =>
        this.doctorService.getDoctorsByName(q).pipe(
          catchError(err => {
            console.error('Error searching patients:', err);
            return of({ body: { doctors: [] } });
          })
        )
      )
    ).subscribe({
      next: (response: any) => {
        this.doctors = (response?.body?.doctors as DoctorResponse[]) ?? [];
        console.log('Search results:', this.doctors);
      },
      error: err => console.error('Search subscription error:', err)
    });
  }

  async ngOnInit() {
    this.loadSpecialties(); 
    await this.getDoctors();
  }

  async getDoctors() {
    this.doctorService.getAllDoctors(this.pageSize(), this.currentPage()).subscribe({
      next: (response: any) => {
        console.log(response);
        this.doctors = response.body.response.data as DoctorResponse[];
        this.totalPages.set(response.body.response.metadata.totalPages);
        console.log(this.doctors);
      },
      error: (error) => {
        console.log(error);
        this.doctors = [];
      },
      complete: () => {
        console.log('Request completed');
      },
    }
    );
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.search$.complete();
  }

  // Forms
  doctorForm!: FormGroup;

  // Estado UI
  searchTerm = signal<string>('');
  roleFilter = signal<'all' | RoleKey>('all');
  showMenu = false;

  isDoctorDialogOpen = signal<boolean>(false);

  isCreating = signal<boolean>(false);
  errorMsg = signal<string>('');
  successMsg = signal<string>('');

  openDoctorDialog() {
    this.showMenu = false;
    this.errorMsg.set('');
    this.successMsg.set('');
    this.isEditMode.set(false);
    this.editingDoctorId.set(null);
    this.doctorForm.reset({ specialtyID: 0 });
    
    // Habilitar todos los campos para crear
    this.doctorForm.get('email')?.enable();
    this.doctorForm.get('licenseNumber')?.enable();
    
    this.loadSpecialties();
    this.isDoctorDialogOpen.set(true);
  }

  openEditDoctorDialog(doctor: DoctorResponse) {
    this.showMenu = false;
    this.errorMsg.set('');
    this.successMsg.set('');
    this.isEditMode.set(true);
    this.editingDoctorId.set(doctor.id);
    
    this.loadSpecialties();
    
    // Rellenar el formulario con los datos del doctor
    this.doctorForm.patchValue({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone || '',
      specialtyID: doctor.specialtyId || 0,
      licenseNumber: doctor.licenseNumber || '',
      bio: doctor.bio || ''
    });
    
    // Deshabilitar campos que no se pueden editar
    this.doctorForm.get('email')?.disable();
    this.doctorForm.get('licenseNumber')?.disable();
    
    this.isDoctorDialogOpen.set(true);
  }

  loadSpecialties() {
    if (this.specialties().length > 0 || this.specialtiesLoading()) return;

    this.specialtiesLoading.set(true);
    this.specialtiesError.set('');

    this.specialtyService.getAllSpecialty().subscribe({
      next: (response: any) => {
        console.log('Specialties loaded:', response);
        const body = response?.body ?? response;
        const data = body?.response?.data ?? body?.data ?? body;
        const list = Array.isArray(data) ? data.map((s: any) => ({ id: s.id ?? s._id ?? s.ID ?? 0, name: s.name ?? s.title ?? '' })) : [];
        this.specialties.set(list);
      },
      error: (err: any) => {
        console.error('Error loading specialties:', err);
        this.specialtiesError.set('Error loading specialties');
        this.specialties.set([]);
      },
      complete: () => {
        this.specialtiesLoading.set(false);
      }
    });
  }

  closeAllDialogs() {
    this.isDoctorDialogOpen.set(false);
    this.isEditMode.set(false);
    this.editingDoctorId.set(null);
    // Rehabilitar campos al cerrar
    this.doctorForm.get('email')?.enable();
    this.doctorForm.get('licenseNumber')?.enable();
  }

  async createDoctor() {
    if (this.doctorForm.invalid) {
      this.errorMsg.set('Por favor completa todos los campos obligatorios');
      this.doctorForm.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);

    const v = this.doctorForm.value;
    console.log(v);
    const payload: DoctorCreateByAdmin = {
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone || null,
      email: v.email,
      specialtyId: Number(v.specialtyID),
      licenseNumber: v.licenseNumber,
      bio: v.bio || ''
    };

    this.doctorService.createDoctorByAdmin(payload).subscribe({
      next: () => {
        this.successMsg.set('Cuenta de médico creada exitosamente.');
        this.doctorForm.reset();
        this.getDoctors();
      },
      error: (err) => {
        console.error('Error creating doctor:', err);
        this.errorMsg.set('Error al crear médico');
      },
      complete: () => {
        setTimeout(() => {
          this.isCreating.set(false);
          this.isDoctorDialogOpen.set(false);
          this.successMsg.set('');
          this.errorMsg.set('');
        }, 900);
      }
    });
  }

  async updateDoctor() {
    // Validar solo los campos editables
    const firstName = this.doctorForm.get('firstName');
    const lastName = this.doctorForm.get('lastName');
    const specialtyID = this.doctorForm.get('specialtyID');

    if (!firstName?.value || !lastName?.value || !specialtyID?.value || specialtyID?.value === 0) {
      this.errorMsg.set('Por favor completa todos los campos obligatorios');
      this.doctorForm.markAllAsTouched();
      return;
    }

    const doctorId = this.editingDoctorId();
    if (!doctorId) {
      this.errorMsg.set('Error: ID de doctor no encontrado');
      return;
    }

    this.isCreating.set(true);

    const v = this.doctorForm.value;
    const payload: DoctorUpdate = {
      id: doctorId,
      firstName: v.firstName,
      lastName: v.lastName,
      specialityId: Number(v.specialtyID),
      phone: v.phone || undefined,
      bio: v.bio || undefined
    };

    this.doctorService.updateDoctor(payload).subscribe({
      next: () => {
        this.successMsg.set('Doctor actualizado exitosamente.');
        this.doctorForm.reset();
        this.getDoctors();
      },
      error: (err) => {
        console.error('Error updating doctor:', err);
        this.errorMsg.set('Error al actualizar médico');
      },
      complete: () => {
        setTimeout(() => {
          this.isCreating.set(false);
          this.isDoctorDialogOpen.set(false);
          this.successMsg.set('');
          this.errorMsg.set('');
          this.isEditMode.set(false);
          this.editingDoctorId.set(null);
          // Rehabilitar campos
          this.doctorForm.get('email')?.enable();
          this.doctorForm.get('licenseNumber')?.enable();
        }, 900);
      }
    });
  }

  async toggleDoctorStatus(doctor: DoctorResponse) {
    const newStatus = !doctor.isActive;
    const action = newStatus ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Está seguro que desea ${action} al Dr. ${doctor.lastName} ${doctor.firstName}?`)) {
      return;
    }

    // this.doctorService.toggleDoctorStatus(doctor.id, newStatus).subscribe({
    //   next: () => {
    //     this.getDoctors();
    //     alert(`Doctor ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
    //   },
    //   error: (err) => {
    //     console.error('Error toggling doctor status:', err);
    //     alert(`Error al ${action} el doctor`);
    //   }
    // });
  }

  setPage(page: number) {
    const p = Math.min(Math.max(1, page), this.totalPages());
    this.currentPage.set(p);
    this.getDoctors();
  }

  prevPage() {
    this.setPage(this.currentPage() - 1);
  }

  nextPage() {
    this.setPage(this.currentPage() + 1);
  }

  showTurnoDialog = false;
  selectedDoctor: any;
  solicitarTurno(doctor: any) {
    this.selectedDoctor = doctor;
    this.showTurnoDialog = true;
  }

  guardarTurno(turno: any) {
    console.log('Turno confirmado:', turno);
    this.showTurnoDialog = false;
  }

  // ============================================
// PARTE 1: TypeScript Component (doctors-management.component.ts)
// ============================================

// Añade estas propiedades a tu clase DoctorsManagementComponent:

selectedSpecialtyFilter = signal<number>(0); // 0 = "Todos"

// Modifica el método onSearchInput para resetear el filtro:
onSearchInput(value: string) {
  const v = (value ?? '').toString();
  this.searchTerm.set(v);
  
  // Si hay búsqueda por texto, resetear filtro de especialidad
  if (v.trim().length > 0) {
    this.selectedSpecialtyFilter.set(0);
  }
  
  this.getDoctorsByName(v);
}

// Añade este nuevo método para filtrar por especialidad:
onSpecialtyFilterChange(specialtyId: number) {
  this.selectedSpecialtyFilter.set(specialtyId);
  
  // Limpiar búsqueda por texto
  this.searchTerm.set('');
  
  if (specialtyId === 0) {
    // Mostrar todos los doctores
    this.getDoctors();
  } else {
    // Filtrar por especialidad
    this.getDoctorsBySpecialty(specialtyId);
  }
}

// Añade este nuevo método para obtener doctores por especialidad:
async getDoctorsBySpecialty(specialtyId: number) {
  this.doctors = null; // Mostrar loading
  
  this.doctorService.getBySpecialty(specialtyId).subscribe({
    next: (response: any) => {
      console.log('Doctors by specialty:', response);
      // Ajusta según la estructura de tu respuesta
      const body = response?.body ?? response;
      const data = body?.response?.data ?? body?.data ?? body;
      this.doctors = Array.isArray(data) ? data as DoctorResponse[] : [];
      
      // Resetear paginación cuando se filtra
      this.currentPage.set(1);
      // Calcular páginas manualmente si no viene en la respuesta
      const totalItems = this.doctors.length;
      const pages = Math.ceil(totalItems / this.pageSize());
      this.totalPages.set(pages);
    },
    error: (error) => {
      console.error('Error fetching doctors by specialty:', error);
      this.doctors = [];
      this.totalPages.set(0);
    }
  });
}

// Modifica el método getDoctorsByName para resetear el filtro:
async getDoctorsByName(name: string) {
  const q = (name ?? '').toString().trim();

  if (q.length === 0) {
    this.searchTerm.set('');
    // Si hay un filtro de especialidad activo, mantenerlo
    if (this.selectedSpecialtyFilter() > 0) {
      this.getDoctorsBySpecialty(this.selectedSpecialtyFilter());
    } else {
      await this.getDoctors();
    }
    return;
  }

  if (q.length < 3) {
    this.searchTerm.set(q);
    return;
  }

  this.search$.next(q);
}

}

// import { CommonModule } from '@angular/common';
// import { Component, computed, HostListener, signal } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { DoctorCreateByAdmin, DoctorResponse } from '../../../../core/models/doctor';
// import { DoctorService } from '../../../../core/services/doctor/doctor.service';
// import { catchError, debounceTime, distinctUntilChanged, filter, of, Subject, Subscription, switchMap } from 'rxjs';
// import { SpecialtyService } from '../../../../core/services/specialty/specialty.service';
// import { AuthService } from '../../../../core/auth/auth.service';
// import { AuthCurrentUser } from '../../../../core/models/auth';
// import { CreateAppointmentComponent } from './create-appointment/create-appointment.component';

// type RoleKey = 'admin' | 'doctor' | 'patient';
// type StatusKey = 'active' | 'inactive';

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   phone: string;
//   role: RoleKey;
//   specialty: string | null;
//   status: StatusKey;
//   joinDate: string;
// }

// @Component({
//   selector: 'app-doctors-management',
//   imports: [ReactiveFormsModule, CommonModule, CreateAppointmentComponent],
//   templateUrl: './doctors-management.component.html',
//   styleUrl: './doctors-management.component.css'
// })
// export class DoctorsManagementComponent {
//   doctors: DoctorResponse[] | null = null;
//   // specialties state (loaded when opening the create doctor dialog)
//   specialties = signal<{ id: number; name: string }[]>([]);
//   specialtiesLoading = signal<boolean>(false);
//   specialtiesError = signal<string>('');
//   private search$ = new Subject<string>();
//   private searchSub?: Subscription;
//   public readonly Array = Array;

//   // Pagination
//   currentPage = signal<number>(1);
//   pageSize = signal<number>(10);
//   totalPages = signal<number>(0);

//   paginatedPatients = computed(() => {
//     const list = this.doctors ?? [];
//     const page = Math.max(1, this.currentPage());
//     const size = Math.max(1, this.pageSize());
//     const start = (page - 1) * size;
//     return list.slice(start, start + size);
//   });

//   user: AuthCurrentUser | null = null;

//   // Estado para edición
//   isEditMode = signal<boolean>(false);
//   editingDoctorId = signal<number | null>(null);

//   constructor(private fb: FormBuilder, private doctorService: DoctorService, private specialtyService: SpecialtyService, private authService: AuthService) {
//     this.user = authService.getCurrentUser();

//     this.doctorForm = this.fb.group({
//       firstName: ['', Validators.required],
//       lastName: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       phone: [''],
//       specialtyID: [0, Validators.required],
//       licenseNumber: ['', Validators.required],
//       bio: ['']
//     });

//     this.searchSub = this.search$.pipe(
//       debounceTime(300),
//       distinctUntilChanged(),
//       filter(q => !!q && q.trim().length >= 3),
//       switchMap(q =>
//         this.doctorService.getDoctorsByName(q).pipe(
//           catchError(err => {
//             console.error('Error searching patients:', err);
//             return of({ body: { doctors: [] } });
//           })
//         )
//       )
//     ).subscribe({
//       next: (response: any) => {
//         this.doctors = (response?.body?.doctors as DoctorResponse[]) ?? [];
//         console.log('Search results:', this.doctors);
//       },
//       error: err => console.error('Search subscription error:', err)
//     });
//   }

//   async ngOnInit() {
//     await this.getDoctors();
//   }

//   async getDoctors() {
//     this.doctorService.getAllDoctors(this.pageSize(), this.currentPage()).subscribe({
//       next: (response: any) => {
//         console.log(response);
//         this.doctors = response.body.response.data as DoctorResponse[];
//         this.totalPages.set(response.body.response.metadata.totalPages);
//         console.log(this.doctors);
//       },
//       error: (error) => {
//         console.log(error);
//         this.doctors = [];
//       },
//       complete: () => {
//         console.log('Request completed');
//       },
//     }
//     );
//   }

//   onSearchInput(value: string) {
//     const v = (value ?? '').toString();
//     this.searchTerm.set(v);
//     this.getDoctorsByName(v);
//   }

//   async getDoctorsByName(name: string) {
//     const q = (name ?? '').toString().trim();

//     if (q.length === 0) {
//       this.searchTerm.set('');
//       await this.getDoctors();
//       return;
//     }

//     if (q.length < 3) {
//       this.searchTerm.set(q);
//       return;
//     }

//     this.search$.next(q);
//   }

//   ngOnDestroy(): void {
//     this.searchSub?.unsubscribe();
//     this.search$.complete();
//   }

//   // Forms
//   doctorForm!: FormGroup;

//   // Estado UI
//   searchTerm = signal<string>('');
//   roleFilter = signal<'all' | RoleKey>('all');
//   showMenu = false;

//   isDoctorDialogOpen = signal<boolean>(false);

//   isCreating = signal<boolean>(false);
//   errorMsg = signal<string>('');
//   successMsg = signal<string>('');

//   openDoctorDialog() {
//     this.showMenu = false;
//     this.errorMsg.set('');
//     this.successMsg.set('');
//     this.isEditMode.set(false);
//     this.editingDoctorId.set(null);
//     this.doctorForm.reset({ specialtyID: 0 });
//     this.loadSpecialties();
//     this.isDoctorDialogOpen.set(true);
//   }

//   openEditDoctorDialog(doctor: DoctorResponse) {
//     this.showMenu = false;
//     this.errorMsg.set('');
//     this.successMsg.set('');
//     this.isEditMode.set(true);
//     this.editingDoctorId.set(doctor.id);
    
//     this.loadSpecialties();
    
//     // Rellenar el formulario con los datos del doctor
//     this.doctorForm.patchValue({
//       firstName: doctor.firstName,
//       lastName: doctor.lastName,
//       email: doctor.email,
//       phone: doctor.phone || '',
//       specialtyID: doctor.specialtyId || 0,
//       licenseNumber: doctor.licenseNumber || '',
//       bio: doctor.bio || ''
//     });
    
//     this.isDoctorDialogOpen.set(true);
//   }

//   loadSpecialties() {
//     if (this.specialties().length > 0 || this.specialtiesLoading()) return;

//     this.specialtiesLoading.set(true);
//     this.specialtiesError.set('');

//     this.specialtyService.getAllSpecialty().subscribe({
//       next: (response: any) => {
//         console.log('Specialties loaded:', response);
//         const body = response?.body ?? response;
//         const data = body?.response?.data ?? body?.data ?? body;
//         const list = Array.isArray(data) ? data.map((s: any) => ({ id: s.id ?? s._id ?? s.ID ?? 0, name: s.name ?? s.title ?? '' })) : [];
//         this.specialties.set(list);
//       },
//       error: (err: any) => {
//         console.error('Error loading specialties:', err);
//         this.specialtiesError.set('Error loading specialties');
//         this.specialties.set([]);
//       },
//       complete: () => {
//         this.specialtiesLoading.set(false);
//       }
//     });
//   }

//   closeAllDialogs() {
//     this.isDoctorDialogOpen.set(false);
//     this.isEditMode.set(false);
//     this.editingDoctorId.set(null);
//   }

//   async createDoctor() {
//     if (this.doctorForm.invalid) {
//       this.errorMsg.set('Por favor completa todos los campos obligatorios');
//       this.doctorForm.markAllAsTouched();
//       return;
//     }

//     this.isCreating.set(true);

//     const v = this.doctorForm.value;
//     console.log(v);
//     const payload: DoctorCreateByAdmin = {
//       firstName: v.firstName,
//       lastName: v.lastName,
//       phone: v.phone || null,
//       email: v.email,
//       specialtyId: Number(v.specialtyID),
//       licenseNumber: v.licenseNumber,
//       bio: v.bio || ''
//     };

//     this.doctorService.createDoctorByAdmin(payload).subscribe({
//       next: () => {
//         this.successMsg.set('Cuenta de médico creada exitosamente.');
//         this.doctorForm.reset();
//         this.getDoctors();
//       },
//       error: (err) => {
//         console.error('Error creating doctor:', err);
//         this.errorMsg.set('Error al crear médico');
//       },
//       complete: () => {
//         setTimeout(() => {
//           this.isCreating.set(false);
//           this.isDoctorDialogOpen.set(false);
//           this.successMsg.set('');
//           this.errorMsg.set('');
//         }, 900);
//       }
//     });
//   }

//   async updateDoctor() {
//     if (this.doctorForm.invalid) {
//       this.errorMsg.set('Por favor completa todos los campos obligatorios');
//       this.doctorForm.markAllAsTouched();
//       return;
//     }

//     const doctorId = this.editingDoctorId();
//     if (!doctorId) {
//       this.errorMsg.set('Error: ID de doctor no encontrado');
//       return;
//     }

//     this.isCreating.set(true);

//     const v = this.doctorForm.value;
//     const payload: DoctorCreateByAdmin = {
//       firstName: v.firstName,
//       lastName: v.lastName,
//       phone: v.phone || null,
//       email: v.email,
//       specialtyId: Number(v.specialtyID),
//       licenseNumber: v.licenseNumber,
//       bio: v.bio || ''
//     };

//     // Asumiendo que tienes un método updateDoctor en tu servicio
//     this.doctorService.updateDoctor(payload).subscribe({
//       next: () => {
//         this.successMsg.set('Doctor actualizado exitosamente.');
//         this.doctorForm.reset();
//         this.getDoctors();
//       },
//       error: (err) => {
//         console.error('Error updating doctor:', err);
//         this.errorMsg.set('Error al actualizar médico');
//       },
//       complete: () => {
//         setTimeout(() => {
//           this.isCreating.set(false);
//           this.isDoctorDialogOpen.set(false);
//           this.successMsg.set('');
//           this.errorMsg.set('');
//           this.isEditMode.set(false);
//           this.editingDoctorId.set(null);
//         }, 900);
//       }
//     });
//   }

//   async toggleDoctorStatus(doctor: DoctorResponse) {
//     const newStatus = !doctor.isActive;
//     const action = newStatus ? 'activar' : 'desactivar';
    
//     if (!confirm(`¿Está seguro que desea ${action} al Dr. ${doctor.lastName} ${doctor.firstName}?`)) {
//       return;
//     }

//     // Asumiendo que tienes un método para cambiar el estado
//     // this.doctorService.toggleDoctorStatus(doctor.id, newStatus).subscribe({
//     //   next: () => {
//     //     this.getDoctors();
//     //     // Mostrar mensaje de éxito
//     //     alert(`Doctor ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
//     //   },
//     //   error: (err) => {
//     //     console.error('Error toggling doctor status:', err);
//     //     alert(`Error al ${action} el doctor`);
//     //   }
//     // });
//   }

//   setPage(page: number) {
//     const p = Math.min(Math.max(1, page), this.totalPages());
//     this.currentPage.set(p);
//     this.getDoctors();
//   }

//   prevPage() {
//     this.setPage(this.currentPage() - 1);
//   }

//   nextPage() {
//     this.setPage(this.currentPage() + 1);
//   }

//   showTurnoDialog = false;
//   selectedDoctor: any;
//   solicitarTurno(doctor: any) {
//     this.selectedDoctor = doctor;
//     this.showTurnoDialog = true;
//   }

//   guardarTurno(turno: any) {
//     console.log('Turno confirmado:', turno);
//     this.showTurnoDialog = false;
//   }
// }


