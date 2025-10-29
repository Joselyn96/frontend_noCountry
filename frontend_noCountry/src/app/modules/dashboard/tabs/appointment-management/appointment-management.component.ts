import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, of, Subject, Subscription, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment/appointment.service';

// Definimos una interfaz para la cita, basándonos en el HTML y la tabla SQL
export interface AppointmentResponse {
  id: number;
  availability_id: number;
  doctor_id: number;
  patient_id: number;
  day: string; // o Date
  start_time: string;
  end_time: string;
  status: 'confirmado' | 'cancelado' | 'completado';
  consultation_type: 'virtual' | 'presencial';
  // Estos campos vendrían de un JOIN en el backend
  patientName?: string;
  doctorName?: string;
  doctorSpecialty?: string;
}

type RoleKey = 'admin' | 'doctor' | 'patient' | 'appointment';
type StatusKey = 'active' | 'inactive';

@Component({
  selector: 'app-appointment-management',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-management.component.html',
  styleUrl: './appointment-management.component.css'
})
export class AppointmentManagementComponent {
  appointments: AppointmentResponse[] | null = null;
  private search$ = new Subject<string>();
  private searchSub?: Subscription;
  public readonly Array = Array;

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalPages = signal<number>(0);

  paginatedAppointments = computed(() => {
    const list = this.appointments ?? [];
    const page = Math.max(1, this.currentPage());
    const size = Math.max(1, this.pageSize());
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });



  constructor(private fb: FormBuilder, private appointmentService: AppointmentService) {
    // TODO: Implementar el formulario para crear/editar citas
    this.searchSub = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(q => !!q && q.trim().length >= 3),
      // switchMap(q =>
        // TODO: Reemplazar con el método de búsqueda de citas real
        // this.appointmentService.searchAppointments(q).pipe(
        //   catchError(err => {
        //     console.error('Error searching appointments:', err);
        //     return of({ body: { appointments: [] } });
        //   })
        // )
      // )
    ).subscribe({
      next: (response: any) => {
        this.appointments = (response?.body?.appointments as AppointmentResponse[]) ?? [];
        console.log('Search results:', this.appointments);
      },
      error: err => console.error('Search subscription error:', err)
    });
  }

  async ngOnInit() {
    // await this.getAppointments(); // Comentado para usar datos de ejemplo
    this.loadExampleAppointments();
  }

  async getAppointments() {
    // TODO: Reemplazar con el método real para obtener todas las citas
    // this.appointmentService.getAllAppointments(this.pageSize(), this.currentPage()).subscribe({
    //   next: (response: any) => {
    //     console.log(response);
    //     this.appointments = response.body.response.data as AppointmentResponse[];
    //     this.totalPages.set(response.body.response.metadata.totalPages);
    //     console.log(this.appointments);
    //   },
    //   error: (error) => {
    //     console.log(error);
    //     this.appointments = [];
    //   },
    //   complete: () => {
    //     console.log('Request completed');
    //   },
    // }
    // );
  }

  loadExampleAppointments() {
    this.appointments = [
      {
        id: 1, availability_id: 101, doctor_id: 1, patient_id: 1, day: '2024-07-20', start_time: '10:00', end_time: '10:30', status: 'confirmado', consultation_type: 'virtual', patientName: 'Ana García', doctorName: 'Dr. Juan Pérez', doctorSpecialty: 'Cardiología'
      },
      {
        id: 2, availability_id: 102, doctor_id: 2, patient_id: 2, day: '2024-07-20', start_time: '11:00', end_time: '11:45', status: 'completado', consultation_type: 'presencial', patientName: 'Luis Fernández', doctorName: 'Dra. María López', doctorSpecialty: 'Pediatría'
      },
      {
        id: 3, availability_id: 103, doctor_id: 1, patient_id: 3, day: '2024-07-21', start_time: '09:30', end_time: '10:00', status: 'cancelado', consultation_type: 'virtual', patientName: 'Sofía Martínez', doctorName: 'Dr. Juan Pérez', doctorSpecialty: 'Cardiología'
      },
      {
        id: 4, availability_id: 104, doctor_id: 3, patient_id: 4, day: '2024-07-21', start_time: '14:00', end_time: '14:30', status: 'confirmado', consultation_type: 'presencial', patientName: 'Carlos Ruiz', doctorName: 'Dr. Pedro Gómez', doctorSpecialty: 'Dermatología'
      },
      {
        id: 5, availability_id: 105, doctor_id: 2, patient_id: 5, day: '2024-07-22', start_time: '16:00', end_time: '16:30', status: 'confirmado', consultation_type: 'virtual', patientName: 'Elena Sánchez', doctorName: 'Dra. María López', doctorSpecialty: 'Pediatría'
      },
      {
        id: 6, availability_id: 106, doctor_id: 1, patient_id: 6, day: '2024-07-22', start_time: '10:00', end_time: '10:30', status: 'completado', consultation_type: 'presencial', patientName: 'Miguel Torres', doctorName: 'Dr. Juan Pérez', doctorSpecialty: 'Cardiología'
      },
      {
        id: 7, availability_id: 107, doctor_id: 3, patient_id: 7, day: '2024-07-23', start_time: '11:30', end_time: '12:00', status: 'confirmado', consultation_type: 'virtual', patientName: 'Laura Díaz', doctorName: 'Dr. Pedro Gómez', doctorSpecialty: 'Dermatología'
      },
      {
        id: 8, availability_id: 108, doctor_id: 2, patient_id: 8, day: '2024-07-23', start_time: '15:00', end_time: '15:30', status: 'confirmado', consultation_type: 'presencial', patientName: 'Javier Romero', doctorName: 'Dra. María López', doctorSpecialty: 'Pediatría'
      },
      {
        id: 9, availability_id: 109, doctor_id: 1, patient_id: 9, day: '2024-07-24', start_time: '09:00', end_time: '09:30', status: 'confirmado', consultation_type: 'virtual', patientName: 'Paula Gil', doctorName: 'Dr. Juan Pérez', doctorSpecialty: 'Cardiología'
      },
      {
        id: 10, availability_id: 110, doctor_id: 3, patient_id: 10, day: '2024-07-24', start_time: '13:00', end_time: '13:45', status: 'completado', consultation_type: 'presencial', patientName: 'Diego Vargas', doctorName: 'Dr. Pedro Gómez', doctorSpecialty: 'Dermatología'
      },
      {
        id: 11, availability_id: 111, doctor_id: 2, patient_id: 11, day: '2024-07-25', start_time: '10:00', end_time: '10:30', status: 'confirmado', consultation_type: 'virtual', patientName: 'Andrea Castro', doctorName: 'Dra. María López', doctorSpecialty: 'Pediatría'
      },
      {
        id: 12, availability_id: 112, doctor_id: 1, patient_id: 12, day: '2024-07-25', start_time: '14:00', end_time: '14:30', status: 'cancelado', consultation_type: 'presencial', patientName: 'Sergio Herrera', doctorName: 'Dr. Juan Pérez', doctorSpecialty: 'Cardiología'
      },
      {
        id: 13, availability_id: 113, doctor_id: 3, patient_id: 13, day: '2024-07-26', start_time: '09:00', end_time: '09:30', status: 'confirmado', consultation_type: 'virtual', patientName: 'Marta Navarro', doctorName: 'Dr. Pedro Gómez', doctorSpecialty: 'Dermatología'
      },
      {
        id: 14, availability_id: 114, doctor_id: 2, patient_id: 14, day: '2024-07-26', start_time: '16:00', end_time: '16:30', status: 'completado', consultation_type: 'presencial', patientName: 'Ricardo Morales', doctorName: 'Dra. María López', doctorSpecialty: 'Pediatría'
      },
      {
        id: 15, availability_id: 115, doctor_id: 1, patient_id: 15, day: '2024-07-27', start_time: '11:00', end_time: '11:30', status: 'confirmado', consultation_type: 'virtual', patientName: 'Isabel Rubio', doctorName: 'Dr. Juan Pérez', doctorSpecialty: 'Cardiología'
      }
    ];
    this.totalPages.set(Math.ceil(this.appointments.length / this.pageSize()));
  }

  onSearchInput(value: string) {
    const v = (value ?? '').toString();
    this.searchTerm.set(v);
    this.searchAppointments(v);
  }

  async searchAppointments(query: string) {
    const q = (query ?? '').toString().trim();

    if (q.length === 0) {
      this.searchTerm.set('');
      await this.getAppointments();
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
  // TODO: Definir el FormGroup para el formulario de citas
  appointmentForm!: FormGroup;

  // Estado UI
  searchTerm = signal<string>('');
  roleFilter = signal<'all' | RoleKey>('all');
  showMenu = false;

  isAppointmentDialogOpen = signal<boolean>(false);

  isCreating = signal<boolean>(false);
  errorMsg = signal<string>('');
  successMsg = signal<string>('');


  openAppointmentDialog() {
    this.showMenu = false;
    this.errorMsg.set('');
    this.successMsg.set('');
    // this.appointmentForm.reset(); // Descomentar cuando el formulario esté implementado
    this.isAppointmentDialogOpen.set(true);
  }

  closeAllDialogs() {
    this.isAppointmentDialogOpen.set(false);
  }

  setPage(page: number) {
    const p = Math.min(Math.max(1, page), this.totalPages());
    this.currentPage.set(p);
    this.getAppointments();
  }

  prevPage() {
    this.setPage(this.currentPage() - 1);
  }

  nextPage() {
    this.setPage(this.currentPage() + 1);
  }
}
