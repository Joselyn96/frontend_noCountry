import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Building2, Calendar1, Clock, LucideAngularModule, LucideIconData, Video } from 'lucide-angular';
import { DoctorService } from '../../../../../core/services/doctor/doctor.service';
import { AvailabilityService } from '../../../../../core/services/availability/availability.service';


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

  selectedType: string | null = null;
  selectedDay: string | null = null;
  selectedHour: string | null = null;

  today = new Date().toISOString().split('T')[0]; // fecha mínima para el calendario

  availableHours = ['09:00', '10:00', '11:00', '16:00', '17:00'];

  errorMessage: string | null = null;

  constructor(private doctorServic: DoctorService, private availabilityService: AvailabilityService) {}

  availability: any[] = [];
  ngOnInit() {
    this.availabilityService.getAllAvailabilitiesByDoctor(this.doctor.id).subscribe({
      next: (data) => {
        this.availability = data;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  selectType(type: string) { 
    this.selectedType = type; 
    this.errorMessage = null; // limpiar error al seleccionar
  }

  selectHour(hour: string) { 
    this.selectedHour = hour; 
    this.errorMessage = null;
  }

  nextStep() {
    if(!this.canNext()) {
      this.errorMessage = this.getErrorMessage();
      return;
    }
    this.errorMessage = null;
    if(this.step<3) this.step++;
  }

  prevStep() { 
    this.errorMessage = null; 
    if(this.step>1) this.step--; 
  }

  goStep(s: number) {
    if(s===1 || (s===2 && this.selectedType) || (s===3 && this.selectedDay)) {
      this.step = s;
      this.errorMessage = null;
    }
  }

  canNext(): boolean {
    if(this.step===1) return !!this.selectedType;
    if(this.step===2) return !!this.selectedDay;
    if(this.step===3) return !!this.selectedHour;
    return false;
  }

  getErrorMessage(): string {
    if(this.step===1) return 'Debes seleccionar Presencial o Virtual antes de continuar.';
    if(this.step===2) return 'Debes seleccionar un día antes de continuar.';
    if(this.step===3) return 'Debes seleccionar una hora antes de continuar.';
    return '';
  }

  confirmTurno() {
    if(!this.canNext()) {
      this.errorMessage = this.getErrorMessage();
      return;
    }
    const turno = {
      type: this.selectedType,
      day: this.selectedDay,
      hour: this.selectedHour
    };
    console.log('Turno confirmado:', turno);
    this.close();
  }


  close() { this.closeDialog.emit(); }

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
    return this.iconMap[iconName] || this.iconMap['info'];
  }
}


