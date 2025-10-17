import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { DoctorCreate, DoctorUpdate } from '../../models/doctor';
import { PatientCreateAdmin, PatientUpdateAdmin } from '../../models/patient';
import { UpdatePassword } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  path = environment.apiUrl + 'patient';

  constructor(private httpClient: HttpClient) { }

  createDoctor(createDoctor: DoctorCreate): Observable<HttpResponse<Object>> {
    return this.httpClient.post(
      this.path + '/create_doctor',
      createDoctor,
      { observe: 'response' }
    );
  }

  createPatient(createPatient: PatientCreateAdmin): Observable<HttpResponse<Object>> {
    return this.httpClient.post(
      this.path + '/create_patient',
      createPatient,
      { observe: 'response' }
    );
  }

  updateDoctor(updateDoctor: DoctorUpdate): Observable<HttpResponse<Object>> {
    return this.httpClient.put(
      this.path + '/update_doctor',
      updateDoctor,
      { observe: 'response' }
    );
  }

  updatePatient(updatePatient: PatientUpdateAdmin): Observable<HttpResponse<Object>> {
    return this.httpClient.put(
      this.path + '/update',
      updatePatient,
      { observe: 'response' }
    );
  }

  updateActivationUser(active: boolean): Observable<HttpResponse<Object>> {
    const params = new HttpParams().set('active', active.toString());

    return this.httpClient.put(
      this.path + '/update_activation',
      null,
      { params, observe: 'response' }
    );
  }

  updatePassword(updatePass: UpdatePassword): Observable<HttpResponse<Object>> {
    return this.httpClient.put(
      this.path + '/update_password',
      updatePass,
      { observe: 'response' }
    );
  }
}
