import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  path = environment.apiUrl + 'user';

  constructor(private httpClient: HttpClient) { }

  updateUserImage(file: File): Observable<HttpResponse<Object>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post(
      this.path + '/update_image',
      formData,
      { observe: 'response' }
    );
  }
}