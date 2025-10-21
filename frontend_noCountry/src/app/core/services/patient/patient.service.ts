import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  path = environment.apiUrl + 'patient';

  constructor(private httpClient: HttpClient) { }

  registerPatient(patientData: {
    firstName: string,
    lastName: string,
    phone: string | null,
    email: string,
    password: string,
    repeatPassword: string,
    dateOfBirth: string,
    gender: string,
    dni: string
  }): Observable<HttpResponse<any>> {
    return this.httpClient.post(
      this.path+'/create',
      patientData,
      { observe: 'response' }
    ).pipe(
      tap((response: any) => {
        console.log('Respuesta del registro de paciente:', response);
        const body = response.body as any;

        console.log('body:', body);
      }),
      catchError((error) => {
        console.error('Error en registerPatient:', error);
        return throwError(() => error);
      })
    );
  }

  getAllPatients(): Observable<HttpResponse<Object>> {
    return this.httpClient.get(
      this.path,
      { observe: 'response' }
    );
  }
}
