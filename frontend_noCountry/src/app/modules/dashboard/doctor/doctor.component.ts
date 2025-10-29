import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { StatData } from '../../../shared/interfaces/stat-data.interface';
import { AppointmentManagementComponent } from '../tabs/appointment-management/appointment-management.component';
import { DataManagementComponent } from '../tabs/data-management/data-management.component';
import { PatientMetricComponent } from '../../../shared/components/patient-metric/patient-metric.component';
import { PatientsManagementComponent } from '../tabs/patients-management/patients-management.component';
import { AvailabilityManagementComponent } from '../tabs/availability-management/availability-management.component';


interface AppointmentResponse {
  id: number;
  availability_id: number;
  doctor_id: number;
  patient_id: number;
  day: string;
  start_time: string;
  end_time: string;
  status: 'confirmado' | 'pendiente' | 'cancelado';
  consultation_type: 'presencial' | 'virtual';
  patientName?: string;
  doctorName?: string;
  doctorSpecialty?: string;
}

interface NextAppointmentDisplay extends AppointmentResponse {
  virtualUrl?: string;
  bgColor?: string;
  iconColor?: string;
}

type TabValue = 'patients' | 'appointments' | 'data' | 'availability';
type Tab = { label: string; value: TabValue };

@Component({
  selector: 'app-doctor',
  imports: [NavbarComponent, CommonModule, AppointmentManagementComponent, PatientsManagementComponent, DataManagementComponent, PatientMetricComponent, AvailabilityManagementComponent],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.css',
  standalone: true
})
export class DoctorComponent {
  stats: StatData[] = [
    {
      title: 'Pacientes Atendidos',
      value: '254',
      change: '+30 este mes',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: 'users'
    },
    {
      title: 'Citas Próximas (7d)',
      value: '42',
      change: 'vs semana anterior',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'calendar'
    },
    {
      title: 'Ingresos del Mes',
      value: '$4,850',
      change: '+15% vs mes anterior',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      icon: 'trending-up'
    }
  ];

  nextAppointment: NextAppointmentDisplay | null = null; // Puedes inicializarlo con datos si lo necesitas

  tabs: ReadonlyArray<Tab> = [
    { label: 'Pacientes', value: 'patients' },
    { label: 'Agenda', value: 'appointments' },
    { label: 'Mi Perfil', value: 'data' },
    { label: 'Disponibilidad', value: 'availability' }
  ];

  activeTab: TabValue = 'patients';

  setActive(value: TabValue) {
    this.activeTab = value;
  }
}
