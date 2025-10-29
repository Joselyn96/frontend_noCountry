import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Appointment, AppointmentCreate, PaginatedAppointments, TimeSlot, AppointmentStatus } from '../../models/appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) { }

  createAppointment(appointment: AppointmentCreate): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  getUpcomingAppointment(patientId: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/upcoming/${patientId}`);
  }

  getAllAppointmentsByDoctor(id: string, status?: string, limit?: number, page?: number): Observable<PaginatedAppointments> {
    let params = new HttpParams();
    if (status) params = params.append('status', status);
    if (page) params = params.append('page', page.toString());
    if (limit) params = params.append('limit', limit.toString());

    return this.http.get<PaginatedAppointments>(`${this.apiUrl}/doctor/${id}`, { params });
  }

  getAllAppointmentsByPatient(id: string, status?: string, limit?: number, page?: number): Observable<PaginatedAppointments> {
    let params = new HttpParams();
    if (status) params = params.append('status', status);
    if (page) params = params.append('page', page.toString());
    if (limit) params = params.append('limit', limit.toString());

    return this.http.get<PaginatedAppointments>(`${this.apiUrl}/patient/${id}`, { params });
  }

  getAvailableSlots(doctorId: string, day: string): Observable<TimeSlot[]> {
    const params = new HttpParams().set('day', day);
    return this.http.get<TimeSlot[]>(`${this.apiUrl}/available/${doctorId}`, { params });
  }

  updateAppointment(id: string, appointment: Partial<AppointmentCreate>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}`, appointment);
  }

  cancelAppointment(id: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/cancel`, {});
  }

  completeAppointment(id: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/complete`, {});
  }

  confirmAppointment(id: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/confirm`, {});
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}