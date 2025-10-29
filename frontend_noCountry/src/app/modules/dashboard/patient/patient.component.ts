import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { DoctorsManagementComponent } from '../tabs/doctors-management/doctors-management.component';
import { StatData } from '../../../shared/interfaces/stat-data.interface';
import { AppointmentManagementComponent } from '../tabs/appointment-management/appointment-management.component';
import { DataManagementComponent } from '../tabs/data-management/data-management.component';
import { ClinicalHistoryComponent } from "../tabs/clinical-history/clinical-history.component";
import { PatientMetricComponent } from '../../../shared/components/patient-metric/patient-metric.component';
import { AppointmentResponse } from '../tabs/appointment-management/appointment-management.component'; // Import AppointmentResponse

interface NextAppointmentDisplay extends AppointmentResponse {
  virtualUrl?: string;
  bgColor?: string;
  iconColor?: string;
}

type TabValue = 'doctors' | 'data' | 'history' | 'appointments';
type Tab = { label: string; value: TabValue };

@Component({
  selector: 'app-patient',
  imports: [NavbarComponent, CommonModule, AppointmentManagementComponent, DoctorsManagementComponent, DataManagementComponent, ClinicalHistoryComponent, PatientMetricComponent],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css',
  standalone: true
})

export class PatientComponent {
  stats: StatData[] = [
    {
      title: 'Total Usuarios',
      value: '1,247',
      change: '+12% vs mes anterior',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'users'
    },
    {
      title: 'Presenciales',
      value: '89',
      change: 'Realizadas',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'user-check'
    },
    {
      title: 'Teleconsultas',
      value: '156',
      change: 'Realizadas',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: 'monitor-play'
    }
  ];

  // nextAppointment: NextAppointmentDisplay | null = null;
  nextAppointment: NextAppointmentDisplay | null = {
    id: 101,
    availability_id: 501,
    doctor_id: 1,
    patient_id: 1,
    day: '2024-07-29',
    start_time: '14:00',
    end_time: '14:45',
    status: 'confirmado',
    consultation_type: 'virtual',
    patientName: 'Daniel Pérez',
    doctorName: 'Dr. Ana García',
    doctorSpecialty: 'Oftalmología',
    virtualUrl: 'https://zoom.us/j/1234567890',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  };

  tabs = [
    { label: 'Doctores', value: 'doctors' },
    { label: 'Citas', value: 'appointments' },
    { label: 'Mis Datos', value: 'data' },
    { label: 'Historia Clinica', value: 'history' } // opcional
  ] as const satisfies ReadonlyArray<Tab>;

  activeTab: TabValue = 'doctors';

  setActive(value: TabValue) {
    this.activeTab = value;
  }
}
