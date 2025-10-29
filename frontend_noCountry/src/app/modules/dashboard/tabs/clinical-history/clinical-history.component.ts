import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaz para los detalles de la consulta médica
export interface MedicalConsultationDetail {
  id: number;
  doctor_id: number;
  patient_id: number;
  appointment_id: number;
  reason_for_consultation: string;
  description?: string;
  diagnosis: string;
  instructions?: string;
  notes?: string;
  created_at: string; // Usamos string para simplificar, pero podría ser Date
  updated_at: string; // Usamos string para simplificar, pero podría ser Date
  // Campos adicionales que vendrían de un JOIN o procesamiento en el backend/servicio
  doctorName: string;
  patientName: string;
  appointmentDay: string; // Fecha de la cita asociada
  appointmentStartTime: string; // Hora de inicio de la cita asociada
}

@Component({
  selector: 'app-clinical-history',
  imports: [CommonModule],
  templateUrl: './clinical-history.component.html',
  styleUrl: './clinical-history.component.css'
})
export class ClinicalHistoryComponent implements OnInit {
  medicalConsultations: MedicalConsultationDetail[] | null = null;
  public readonly Array = Array; // Para usar Array en el template para la paginación

  // Paginación
  currentPage = signal<number>(1);
  pageSize = signal<number>(5); // Mostraremos 5 consultas por página
  totalPages = signal<number>(0);

  paginatedMedicalConsultations = computed(() => {
    const list = this.medicalConsultations ?? [];
    const page = Math.max(1, this.currentPage());
    const size = Math.max(1, this.pageSize());
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  ngOnInit(): void {
    this.loadExampleMedicalConsultations();
  }

  loadExampleMedicalConsultations() {
    this.medicalConsultations = [
      { id: 1, doctor_id: 1, patient_id: 1, appointment_id: 1, reason_for_consultation: 'Dolor de cabeza persistente', description: 'Paciente refiere cefalea tensional desde hace 3 días.', diagnosis: 'Cefalea tensional', instructions: 'Reposo, analgésicos, hidratación.', notes: 'Revisar en una semana.', created_at: '2024-07-15T10:00:00Z', updated_at: '2024-07-15T10:00:00Z', doctorName: 'Dr. Juan Pérez', patientName: 'Ana García', appointmentDay: '2024-07-15', appointmentStartTime: '10:00' },
      { id: 2, doctor_id: 2, patient_id: 1, appointment_id: 2, reason_for_consultation: 'Revisión anual', description: 'Chequeo general de rutina.', diagnosis: 'Paciente sano', instructions: 'Mantener hábitos saludables.', notes: 'Próxima revisión en un año.', created_at: '2024-06-20T14:30:00Z', updated_at: '2024-06-20T14:30:00Z', doctorName: 'Dra. María López', patientName: 'Ana García', appointmentDay: '2024-06-20', appointmentStartTime: '14:30' },
      { id: 3, doctor_id: 1, patient_id: 2, appointment_id: 3, reason_for_consultation: 'Control de hipertensión', description: 'Paciente con antecedentes de HTA, control de medicación.', diagnosis: 'Hipertensión arterial controlada', instructions: 'Continuar medicación, dieta baja en sodio.', notes: 'Medición de TA en casa.', created_at: '2024-07-10T09:00:00Z', updated_at: '2024-07-10T09:00:00Z', doctorName: 'Dr. Juan Pérez', patientName: 'Luis Fernández', appointmentDay: '2024-07-10', appointmentStartTime: '09:00' },
      { id: 4, doctor_id: 3, patient_id: 3, appointment_id: 4, reason_for_consultation: 'Erupción cutánea', description: 'Erupción pruriginosa en brazo izquierdo.', diagnosis: 'Dermatitis de contacto', instructions: 'Crema con corticoides, evitar irritantes.', notes: 'Seguimiento en 5 días.', created_at: '2024-07-18T11:15:00Z', updated_at: '2024-07-18T11:15:00Z', doctorName: 'Dr. Pedro Gómez', patientName: 'Sofía Martínez', appointmentDay: '2024-07-18', appointmentStartTime: '11:15' },
      { id: 5, doctor_id: 2, patient_id: 4, appointment_id: 5, reason_for_consultation: 'Vacunación infantil', description: 'Administración de vacuna hexavalente.', diagnosis: 'Vacunación rutinaria', instructions: 'Observar reacción local.', notes: 'Próxima vacuna en 2 meses.', created_at: '2024-07-05T16:00:00Z', updated_at: '2024-07-05T16:00:00Z', doctorName: 'Dra. María López', patientName: 'Carlos Ruiz', appointmentDay: '2024-07-05', appointmentStartTime: '16:00' },
      { id: 6, doctor_id: 1, patient_id: 1, appointment_id: 6, reason_for_consultation: 'Seguimiento de cefalea', description: 'Paciente refiere mejoría con tratamiento.', diagnosis: 'Cefalea tensional resuelta', instructions: 'Continuar con medidas preventivas.', notes: 'Alta.', created_at: '2024-07-22T09:30:00Z', updated_at: '2024-07-22T09:30:00Z', doctorName: 'Dr. Juan Pérez', patientName: 'Ana García', appointmentDay: '2024-07-22', appointmentStartTime: '09:30' },
      { id: 7, doctor_id: 3, patient_id: 2, appointment_id: 7, reason_for_consultation: 'Consulta por alergia', description: 'Paciente con síntomas de rinitis alérgica estacional.', diagnosis: 'Rinitis alérgica', instructions: 'Antihistamínicos, evitar alérgenos.', notes: 'Considerar pruebas de alergia.', created_at: '2024-07-25T10:45:00Z', updated_at: '2024-07-25T10:45:00Z', doctorName: 'Dr. Pedro Gómez', patientName: 'Luis Fernández', appointmentDay: '2024-07-25', appointmentStartTime: '10:45' },
      { id: 8, doctor_id: 2, patient_id: 3, appointment_id: 8, reason_for_consultation: 'Control de crecimiento', description: 'Control de peso y talla en niño de 2 años.', diagnosis: 'Desarrollo normal', instructions: 'Dieta equilibrada.', notes: 'Próximo control en 6 meses.', created_at: '2024-07-01T11:00:00Z', updated_at: '2024-07-01T11:00:00Z', doctorName: 'Dra. María López', patientName: 'Sofía Martínez', appointmentDay: '2024-07-01', appointmentStartTime: '11:00' },
      { id: 9, doctor_id: 1, patient_id: 4, appointment_id: 9, reason_for_consultation: 'Dolor en el pecho', description: 'Paciente refiere dolor punzante ocasional en el lado izquierdo del pecho.', diagnosis: 'Dolor precordial inespecífico', instructions: 'Evitar estrés, observación.', notes: 'ECG normal.', created_at: '2024-07-28T13:00:00Z', updated_at: '2024-07-28T13:00:00Z', doctorName: 'Dr. Juan Pérez', patientName: 'Carlos Ruiz', appointmentDay: '2024-07-28', appointmentStartTime: '13:00' },
      { id: 10, doctor_id: 3, patient_id: 1, appointment_id: 10, reason_for_consultation: 'Revisión de lunar', description: 'Lunar en espalda con cambios recientes.', diagnosis: 'Nevus atípico', instructions: 'Biopsia excisional programada.', notes: 'Urgente.', created_at: '2024-07-30T15:00:00Z', updated_at: '2024-07-30T15:00:00Z', doctorName: 'Dr. Pedro Gómez', patientName: 'Ana García', appointmentDay: '2024-07-30', appointmentStartTime: '15:00' }
    ];
    this.totalPages.set(Math.ceil(this.medicalConsultations.length / this.pageSize()));
  }

  setPage(page: number) {
    const p = Math.min(Math.max(1, page), this.totalPages());
    this.currentPage.set(p);
    // En una aplicación real, aquí llamarías a un servicio para obtener los datos de la página
    // this.getMedicalConsultations(this.currentPage(), this.pageSize());
  }

  prevPage() {
    this.setPage(this.currentPage() - 1);
  }

  nextPage() {
    this.setPage(this.currentPage() + 1);
  }
}
