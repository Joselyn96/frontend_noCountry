import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../../../../core/services/patient/patient.service';
import { PatientCreateByAdmin, PatientResponse } from '../../../../../core/models/patient';
import { catchError, debounceTime, distinctUntilChanged, filter, of, Subject, Subscription, switchMap } from 'rxjs';

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

  constructor(private fb: FormBuilder, private patientService: PatientService) {
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

  openPatientDialog() {
    this.showMenu = false;
    this.errorMsg.set('');
    this.successMsg.set('');
    this.patientForm.reset();
    this.isPatientDialogOpen.set(true);
  }

  closeAllDialogs() {
    this.isPatientDialogOpen.set(false);
  }

  async createPatient() {
    if (this.patientForm.invalid) {
      this.errorMsg.set('Por favor completa todos los campos obligatorios');
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);

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
      },
      error: (err) => {
        console.error('Error creating patient:', err);
        this.errorMsg.set('Error al crear paciente');
      },
      complete: () => {
        // small delay to show success state
        setTimeout(() => {
          this.isCreating.set(false);
          this.isPatientDialogOpen.set(false);
          this.successMsg.set('');
          this.errorMsg.set('');
        }, 900);
      }
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
}
