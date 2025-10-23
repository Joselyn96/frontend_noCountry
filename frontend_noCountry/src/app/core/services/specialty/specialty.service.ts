import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {
  path = environment.apiUrl + 'specialty';

  constructor(private httpClient: HttpClient) { }

  getAllSpecialty(): Observable<HttpResponse<any>> {
    return this.httpClient.get(
      this.path,
      { observe: 'response' }
    );
  }

}
