// ============================================
// SOLUCIÓN: create-appointment.component.ts
// ============================================

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Building2, Calendar1, Clock, LucideAngularModule, LucideIconData, Video } from 'lucide-angular';
import { DoctorService } from '../../../../../core/services/doctor/doctor.service';
import { AvailabilityService } from '../../../../../core/services/availability/availability.service';
import { AppointmentService } from '../../../../../core/services/appointment/appointment.service';
import { AppointmentCreate } from '../../../../../core/models/appointment';
import { AuthCurrentUser } from '../../../../../core/models/auth';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-create-appointment',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.css'
})
export class CreateAppointmentComponent {
  @Input() doctor: any;
  @Output() closeDialog = new EventEmitter<void>();
  @Output() turnoConfirmed = new EventEmitter<any>();

  step = 1;

  selectedType: "presencial" | "virtual" |null = null;
  selectedDay: string | null = null;
  selectedHour: string | null = null;

  today = new Date().toISOString().split('T')[0];

  availableHours: string[] = [];
  availability: any[] = [];
  enabledDays: number[] = []; // Se llenará después de obtener availability

  errorMessage: string | null = null;

  constructor(
    private availabilityService: AvailabilityService,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.availabilityService.getAllAvailabilitiesByDoctor(this.doctor.id).subscribe({
      next: (data) => {
        console.log('Availability data:', data);
        this.availability = data;

        // ✅ IMPORTANTE: Procesar los días habilitados
        this.enabledDays = this.availability.map(av =>
          this.dayToNumber(av.day_of_week)
        );

        console.log('Enabled days (0-6):', this.enabledDays);
      },
      error: (err) => {
        console.error('Error loading availability:', err);
      }
    });
  }

  selectType(type: "presencial" | "virtual" ) {
    this.selectedType = type;
    this.errorMessage = null;
  }

  selectHour(hour: string) {
    this.selectedHour = hour;
    this.errorMessage = null;
  }

  nextStep() {
    if (!this.canNext()) {
      this.errorMessage = this.getErrorMessage();
      return;
    }
    this.errorMessage = null;
    if (this.step < 3) this.step++;
  }

  prevStep() {
    this.errorMessage = null;
    if (this.step > 1) this.step--;
  }

  goStep(s: number) {
    if (s === 1 || (s === 2 && this.selectedType) || (s === 3 && this.selectedDay)) {
      this.step = s;
      this.errorMessage = null;
    }
  }

  canNext(): boolean {
    if (this.step === 1) return !!this.selectedType;
    if (this.step === 2) return !!this.selectedDay;
    if (this.step === 3) return !!this.selectedHour;
    return false;
  }

  getErrorMessage(): string {
    if (this.step === 1) return 'Debes seleccionar Presencial o Virtual antes de continuar.';
    if (this.step === 2) return 'Debes seleccionar un día antes de continuar.';
    if (this.step === 3) return 'Debes seleccionar una hora antes de continuar.';
    return '';
  }

  close() {
    this.closeDialog.emit();
  }

  cancelTurno() {
    this.resetForm();
    this.close();
    console.log('Operación cancelada.');
  }

  private resetForm() {
    this.step = 1;
    this.selectedType = null;
    this.selectedDay = null;
    this.selectedHour = null;
    this.errorMessage = null;
  }

  private iconMap: { [key: string]: LucideIconData } = {
    'building-2': Building2,
    'calendar-1': Calendar1,
    'clock': Clock,
    'video': Video,
  };

  getIcon(iconName: string): LucideIconData {
    return this.iconMap[iconName] || Building2;
  }

  // ✅ Generar horarios disponibles basado en availability
  private generateHours(av: any): string[] {
    const times: string[] = [];
    const start = this.toMinutes(av.start_time);
    const end = this.toMinutes(av.end_time);
    const restStart = this.toMinutes(av.rest_start_time);
    const restEnd = this.toMinutes(av.rest_end_time);
    const step = av.period_time;

    for (let t = start; t < end; t += step) {
      // Excluir horario de descanso
      if (t >= restStart && t < restEnd) continue;
      times.push(this.toTimeString(t));
    }

    return times;
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  private toTimeString(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  }

  // ✅ Seleccionar día y cargar horarios
  selectDay(event: Event) {
    const input = event.target as HTMLInputElement;
    const day = input.value;

    this.selectedDay = day;
    this.selectedHour = null; // Resetear hora seleccionada
    this.errorMessage = null;

    // Obtener el día de la semana en inglés (lowercase)
    const weekday = new Date(day + 'T00:00:00').toLocaleString('en-US', {
      weekday: 'long',
      timeZone: 'UTC' // Usar UTC para evitar problemas de zona horaria
    }).toLowerCase();

    console.log('Selected date:', day);
    console.log('Weekday:', weekday);

    // Buscar availability para ese día
    const av = this.availability.find(a => a.day_of_week === weekday);

    if (!av) {
      console.log('No availability found for', weekday);
      this.availableHours = [];
      this.errorMessage = "El médico no atiende este día.";
      return;
    }

    // Generar horarios disponibles
    this.availableHours = this.generateHours(av);
    console.log('Available hours:', this.availableHours);
  }

  // ✅ Convertir nombre de día a número (0=domingo, 1=lunes, etc.)
  private dayToNumber(day: string): number {
    const map: { [key: string]: number } = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    return map[day.toLowerCase()] ?? -1;
  }

  getEnabledDaysText(): string {
    const map: { [key: number]: string } = {
      0: 'Domingo',
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado'
    };

    return this.enabledDays
      .sort((a, b) => a - b) // Ordenar por día
      .map(d => map[d])      // Convertir número a nombre
      .join(', ');           // Convertir a string con coma
  }

  // ✅ Validar que el día seleccionado esté disponible
  validateDay(event: Event) {
    const input = event.target as HTMLInputElement;
    const day = input.value;

    if (!day) return;

    // Obtener el día de la semana (0-6, donde 0 es domingo)
    const selectedDate = new Date(day + 'T00:00:00');
    const weekday = selectedDate.getUTCDay();

    console.log('Validating day:', day);
    console.log('Weekday number:', weekday);
    console.log('Enabled days:', this.enabledDays);

    if (!this.enabledDays.includes(weekday)) {
      this.errorMessage = "El médico no atiende ese día. Por favor seleccione otro día.";
      this.selectedDay = null;
      input.value = ""; // Limpiar selección
      this.availableHours = [];
      return;
    }

    // Si el día es válido, continuar con el proceso normal
    this.selectDay(event);
  }

  confirmTurno() {
    if (!this.selectedType || !this.selectedDay || !this.selectedHour) {
      this.errorMessage = 'Información incompleta para crear el turno.';
      return;
    }

    // Buscar disponibilidad correspondiente al día
    const weekday = new Date(this.selectedDay + 'T00:00:00').toLocaleString('en-US', {
      weekday: 'long',
      timeZone: 'UTC'
    }).toLowerCase();

    const av = this.availability.find(a => a.day_of_week === weekday);

    if (!av) {
      this.errorMessage = 'No hay disponibilidad para este día.';
      return;
    }

    const start_time = `${this.selectedHour}:00`;

    // Calcular hora de fin según period_time
    const [h, m] = this.selectedHour.split(':').map(Number);
    const endMinutes = h * 60 + m + av.period_time;
    const endHour = Math.floor(endMinutes / 60).toString().padStart(2, "0");
    const endMin = (endMinutes % 60).toString().padStart(2, "0");
    const end_time = `${endHour}:${endMin}:00`;

    const user: AuthCurrentUser | null = this.authService.getCurrentUser();

    const data: AppointmentCreate = {
      availability_id: av.id,
      doctor_id: this.doctor.id,
      patient_id: user!.data!.id, // ✅ lo ideal es obtenerlo del auth
      day: this.selectedDay,
      start_time,
      end_time,
      consultation_type: this.selectedType
    };

    console.log("🚀 Enviando cita al backend:", data);

    this.appointmentService.createAppointment(data).subscribe({
      next: (res) => {
        console.log('✅ Cita creada:', res);
        this.turnoConfirmed.emit(res);
        this.close();
      },
      error: (err) => {
        console.error('❌ Error al crear cita:', err);
        this.errorMessage = err?.error?.message || "Error al crear el turno.";
      }
    });
  }
}


// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { Building2, Calendar1, Clock, LucideAngularModule, LucideIconData, Video } from 'lucide-angular';
// import { DoctorService } from '../../../../../core/services/doctor/doctor.service';
// import { AvailabilityService } from '../../../../../core/services/availability/availability.service';


// @Component({
//   selector: 'app-create-appointment',
//   imports: [CommonModule, FormsModule, LucideAngularModule],
//   templateUrl: './create-appointment.component.html',
//   styleUrl: './create-appointment.component.css'
// })
// export class CreateAppointmentComponent {
//   @Input() doctor: any;
//   @Output() closeDialog = new EventEmitter<void>();
//   @Output() turnoConfirmed = new EventEmitter<any>();

//   step = 1;

//   selectedType: string | null = null;
//   selectedDay: string | null = null;
//   selectedHour: string | null = null;

//   today = new Date().toISOString().split('T')[0]; // fecha mínima para el calendario

//   availableHours = ['09:00', '10:00', '11:00', '16:00', '17:00'];

//   errorMessage: string | null = null;

//   constructor(private doctorServic: DoctorService, private availabilityService: AvailabilityService) { }

//   availability: any[] = [];
//   ngOnInit() {
//     this.availabilityService.getAllAvailabilitiesByDoctor(this.doctor.id).subscribe({
//       next: (data) => {
//         console.log(data);
//         this.availability = data;
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     })
//   }

//   selectType(type: string) {
//     this.selectedType = type;
//     this.errorMessage = null; // limpiar error al seleccionar
//   }

//   selectHour(hour: string) {
//     this.selectedHour = hour;
//     this.errorMessage = null;
//   }

//   nextStep() {
//     if (!this.canNext()) {
//       this.errorMessage = this.getErrorMessage();
//       return;
//     }
//     this.errorMessage = null;
//     if (this.step < 3) this.step++;
//   }

//   prevStep() {
//     this.errorMessage = null;
//     if (this.step > 1) this.step--;
//   }

//   goStep(s: number) {
//     if (s === 1 || (s === 2 && this.selectedType) || (s === 3 && this.selectedDay)) {
//       this.step = s;
//       this.errorMessage = null;
//     }
//   }

//   canNext(): boolean {
//     if (this.step === 1) return !!this.selectedType;
//     if (this.step === 2) return !!this.selectedDay;
//     if (this.step === 3) return !!this.selectedHour;
//     return false;
//   }

//   getErrorMessage(): string {
//     if (this.step === 1) return 'Debes seleccionar Presencial o Virtual antes de continuar.';
//     if (this.step === 2) return 'Debes seleccionar un día antes de continuar.';
//     if (this.step === 3) return 'Debes seleccionar una hora antes de continuar.';
//     return '';
//   }

//   confirmTurno() {
//     if (!this.canNext()) {
//       this.errorMessage = this.getErrorMessage();
//       return;
//     }
//     const turno = {
//       type: this.selectedType,
//       day: this.selectedDay,
//       hour: this.selectedHour
//     };
//     console.log('Turno confirmado:', turno);
//     this.close();
//   }


//   close() { this.closeDialog.emit(); }

//   cancelTurno() {
//     this.resetForm();
//     this.close();
//     console.log('Operación cancelada.');
//   }

//   private resetForm() {
//     this.step = 1;
//     this.selectedType = null;
//     this.selectedDay = null;
//     this.selectedHour = null;
//     this.errorMessage = null;
//   }

//   private iconMap: { [key: string]: LucideIconData } = {
//     'building-2': Building2,
//     'calendar-1': Calendar1,
//     'clock': Clock,
//     'video': Video,
//   };


//   getIcon(iconName: string): LucideIconData {
//     return this.iconMap[iconName] || this.iconMap['info'];
//   }

//   private generateHours(av: any): string[] {
//     const times: string[] = [];
//     const start = this.toMinutes(av.start_time);
//     const end = this.toMinutes(av.end_time);
//     const restStart = this.toMinutes(av.rest_start_time);
//     const restEnd = this.toMinutes(av.rest_end_time);
//     const step = av.period_time;

//     for (let t = start; t < end; t += step) {
//       if (t >= restStart && t < restEnd) continue; // excluir horario de descanso
//       times.push(this.toTimeString(t));
//     }

//     return times;
//   }

//   private toMinutes(time: string): number {
//     const [h, m] = time.split(":").map(Number);
//     return h * 60 + m;
//   }

//   private toTimeString(minutes: number): string {
//     const h = Math.floor(minutes / 60).toString().padStart(2, "0");
//     const m = (minutes % 60).toString().padStart(2, "0");
//     return `${h}:${m}`;
//   }

//   selectDay(event: Event) {
//     const input = event.target as HTMLInputElement;
//     const day = input.value;

//     this.selectedDay = day;
//     this.errorMessage = null;

//     const weekday = new Date(day).toLocaleString('en-US', { weekday: 'long' }).toLowerCase();

//     const av = this.availability.find(a => a.day_of_week === weekday);

//     if (!av) {
//       this.availableHours = [];
//       return;
//     }

//     this.availableHours = this.generateHours(av);
//   }

//   private dayToNumber(day: string): number {
//     const map: any = {
//       monday: 1,
//       tuesday: 2,
//       wednesday: 3,
//       thursday: 4,
//       friday: 5,
//       saturday: 6,
//       sunday: 0
//     };
//     return map[day] ?? 0;
//   }

//   enabledDays: number[] = [];

//   validateDay(event: Event) {
//     const input = event.target as HTMLInputElement;
//     const day = input.value;
//     const weekday = new Date(day).getDay(); // 0-6

//     if (!this.enabledDays.includes(weekday)) {
//       this.errorMessage = "El médico no atiende ese día.";
//       this.selectedDay = null;
//       input.value = ""; // limpiar selección
//       this.availableHours = [];
//       return;
//     }

//     this.selectDay(event); // continúa el proceso normal ✅
//   }

// }


