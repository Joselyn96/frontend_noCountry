import { CommonModule } from '@angular/common';
import { Component, computed, HostListener, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorResponse } from '../../../../../core/models/doctor';
import { DoctorService } from '../../../../../core/services/doctor/doctor.service';
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
  selector: 'app-doctors-management',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './doctors-management.component.html',
  styleUrl: './doctors-management.component.css'
})
export class DoctorsManagementComponent {
  doctors: DoctorResponse[] | null = null;
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



  constructor(private fb: FormBuilder, private doctorService: DoctorService) {
    this.doctorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      specialty: ['null', Validators.required],
      licenseNumber: [''],
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
    this.isDoctorDialogOpen.set(true);
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
    await new Promise(res => setTimeout(res, 1500));

    const v = this.doctorForm.value;

    this.successMsg.set('Cuenta de médico creada exitosamente.');
    this.doctorForm.reset();

    setTimeout(() => {
      this.isCreating.set(false);
      this.isDoctorDialogOpen.set(false);
      this.successMsg.set('');
    }, 1200);
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
