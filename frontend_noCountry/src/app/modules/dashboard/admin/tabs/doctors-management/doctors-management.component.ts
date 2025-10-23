import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorCreateByAdmin, DoctorResponse } from '../../../../../core/models/doctor';
import { DoctorService } from '../../../../../core/services/doctor/doctor.service';
import { catchError, debounceTime, distinctUntilChanged, filter, of, Subject, Subscription, switchMap } from 'rxjs';
import { SpecialtyService } from '../../../../../core/services/specialty/specialty.service';

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
  imports: [ReactiveFormsModule, CommonModule],
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



  constructor(private fb: FormBuilder, private doctorService: DoctorService, private specialtyService: SpecialtyService) {
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

  onSearchInput(value: string) {
    const v = (value ?? '').toString();
    this.searchTerm.set(v);
    this.getDoctorsByName(v);
  }

  async getDoctorsByName(name: string) {
    const q = (name ?? '').toString().trim();

    if (q.length === 0) {
      this.searchTerm.set('');
      await this.getDoctors();
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
    this.doctorForm.reset();
    // load specialties first (if not already loaded) so the select is populated
    this.loadSpecialties();
    this.isDoctorDialogOpen.set(true);
  }

  loadSpecialties() {
    if (this.specialties().length > 0 || this.specialtiesLoading()) return;

    this.specialtiesLoading.set(true);
    this.specialtiesError.set('');

    this.specialtyService.getAllSpecialty().subscribe({
      next: (response: any) => {
        console.log('Specialties loaded:', response);
        // try several common shapes: response.body.response.data || response.body.data || response.body
        const body = response?.body ?? response;
        const data = body?.response?.data ?? body?.data ?? body;
        // map to {id,name} array
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

}
