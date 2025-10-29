import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface MedicalRecord {
  id: number;
  patientId: number;
  date: string; // ISO
  doctorName: string;
  summary: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  private records: MedicalRecord[] = [
    { id: 1, patientId: 1, date: new Date().toISOString(), doctorName: 'Dr. García', summary: 'Consulta general: control de presión', notes: 'Recomendado seguimiento en 6 meses' },
    { id: 2, patientId: 1, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), doctorName: 'Dra. Pérez', summary: 'Control diabetes', notes: 'Ajustar medicación' }
  ];

  constructor() {}

  getRecordsByPatient(patientId: number): Observable<MedicalRecord[]> {
    return of(this.records.filter(r => r.patientId === patientId));
  }
}
