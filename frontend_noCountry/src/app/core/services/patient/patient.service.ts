import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PatientCreate, PatientCreateByAdmin } from '../../models/patient';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  path = environment.apiUrl + 'patient';

  constructor(private httpClient: HttpClient) { }

  registerPatient(patientData: PatientCreate): Observable<HttpResponse<any>> {
    return this.httpClient.post(
      this.path + '/create',
      patientData,
      { observe: 'response' }
    );
  }

  getAllPatients(page: number, limit: number): Observable<HttpResponse<Object>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.httpClient.get(
      this.path,
      { params, observe: 'response' }
    );
  }

  getPatientsByName(name: string) {
    const params = new HttpParams().set('name', name);
    return this.httpClient.get(
      this.path + '/search',
      { params, observe: 'response' }
    );
  }

  patientCreateByAdmin(createPatient: PatientCreateByAdmin): Observable<HttpResponse<Object>> {
    return this.httpClient.post(
      this.path + '/create_by_admin',
      createPatient,
      { observe: 'response' }
    );
  }
}
