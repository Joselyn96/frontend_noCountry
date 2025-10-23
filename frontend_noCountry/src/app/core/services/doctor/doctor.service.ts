import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DoctorCreate, DoctorCreateByAdmin } from '../../models/doctor';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  path = environment.apiUrl + 'doctor';

  constructor(private httpClient: HttpClient) { }

  getAllDoctors(limit: number, page: number): Observable<HttpResponse<Object>> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('page', page.toString());
    return this.httpClient.get(
      this.path,
      { params, observe: 'response' }
    );
  }

  createDoctor(createDoctor: DoctorCreate): Observable<HttpResponse<Object>> {
    return this.httpClient.post(
      this.path + '/create',
      createDoctor,
      { observe: 'response' }
    );
  }

  getDoctorsByName(name: string) {
    const params = new HttpParams().set('name', name);
    return this.httpClient.get(
      this.path + '/search',
      { params, observe: 'response' }
    );
  }

  createDoctorByAdmin(createDoctor: DoctorCreateByAdmin): Observable<HttpResponse<Object>> {
    return this.httpClient.post(
      this.path + '/create_by_admin',
      createDoctor,
      { observe: 'response' }
    );
  }
}
