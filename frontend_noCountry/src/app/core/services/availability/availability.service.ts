import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Availability, AvailabilityCreate, TimeSlotsByDay } from '../../models/availability';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = `${environment.apiUrl}availabilities`;

  constructor(private http: HttpClient) { }

  createAvailability(data: AvailabilityCreate): Observable<Availability> {
    console.log("createAvailability")
    return this.http.post<Availability>(this.apiUrl, data);
  }

  createBulkAvailabilities(data: AvailabilityCreate[]): Observable<Availability[]> {
    return this.http.post<Availability[]>(`${this.apiUrl}/bulk`, data);
  }

  getAllAvailabilitiesByDoctor(doctorId: number): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  generateTimeSlots(doctorId: string): Observable<TimeSlotsByDay> {
    return this.http.get<TimeSlotsByDay>(`${this.apiUrl}/doctor/${doctorId}/slots`);
  }

  updateAvailability(id: string, data: Partial<AvailabilityCreate>): Observable<Availability> {
    return this.http.patch<Availability>(`${this.apiUrl}/${id}`, data);
  }

  deleteAvailability(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
