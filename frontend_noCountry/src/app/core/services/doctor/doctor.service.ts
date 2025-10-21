import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  path = environment.apiUrl + 'patient';

  constructor(private httpClient: HttpClient) { }

  getAllDoctors() {
    return this.httpClient.get(
      this.path,
      { observe: 'response' }
    );
  }
}
