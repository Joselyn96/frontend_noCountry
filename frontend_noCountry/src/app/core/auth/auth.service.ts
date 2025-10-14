import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private router: Router
  ) { }

  auth(email: string, password: string): Observable<HttpResponse<any>> {
    const login_model = { email, password };
    
    return this.httpClient.post(
      environment.apiUrl + 'auth/login', 
      login_model,
      { observe: 'response' }
    ).pipe(
      tap((response) => {
        console.log('Respuesta del servidor:', response);
        const body = response.body as any;
        const token = body?.token || body?.accessToken;
        
        if (!token) {
          throw new Error('El servidor no devolvió un token de autenticación');
        }
    
        try {
          this.userService.saveToken(token);
        } catch (error) {
          throw error;
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  logout() {
    this.userService.deleteToken();
    this.router.navigate(['/login']);
  }
}