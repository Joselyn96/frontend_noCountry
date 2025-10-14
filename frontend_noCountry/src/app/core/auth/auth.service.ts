// import { Injectable } from '@angular/core';
// import { Observable, tap, catchError, throwError } from 'rxjs';
// import { environment } from '../../../environments/environment.development';
// import { HttpClient, HttpResponse } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { UserService } from '../../services/user/user.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   constructor(
//     private httpClient: HttpClient,
//     private userService: UserService,
//     private router: Router
//   ) { }

//   auth(email: string, password: string): Observable<HttpResponse<any>> {
//     const login_model = { email, password };

//     return this.httpClient.post(
//       environment.apiUrl + 'auth/login',
//       login_model,
//       { observe: 'response' }
//     ).pipe(
//       tap((response) => {
//         console.log('Respuesta del servidor (login):', response);
//         const body = response.body as any;
//         const token = body?.token || body?.accessToken;

//         if (!token) {
//           throw new Error('El servidor no devolvió un token de autenticación');
//         }

//         this.userService.saveToken(token);
//       }),
//       catchError((error) => {
//         return throwError(() => error);
//       })
//     );
//   }

//   registerPatient(patientData: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     password: string;
//     repeatPassword: string;
//     dateOfBirth: string; // YYYY-MM-DD
//     gender: string;      // MALE | FEMALE | OTHER
//     dni: string;
//     phone?: string;      // opcional
//   }): Observable<HttpResponse<any>> {
//     return this.httpClient.post(
//       environment.apiUrl + 'patient/create',
//       patientData,
//       { observe: 'response' }
//     ).pipe(
//       tap((response) => {
//         console.log('[registerPatient] status:', response.status, 'body:', response.body);
//         // algunos backends no devuelven token en el alta
//         const body = response.body as any;
//         const token = body?.token || body?.accessToken;
//         if (token) {
//           try {
//             this.userService.saveToken(token);
//             console.log('Token guardado después de registro');
//           } catch (error) {
//             console.error('Error al guardar token después de registro:', error);
//             throw error;
//           }
//         }
//       }),
//       catchError((error) => {
//         console.error('Error en registerPatient (service):', error);
//         console.error('status:', error?.status);
//         console.error('body:', error?.error);
//         return throwError(() => error);
//       })
//     );
//   }

//   logout() {
//     this.userService.deleteToken();
//     this.router.navigate(['/login']);
//   }
// }






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
      environment.apiUrl + 'patient/create',
      patientData,
      { observe: 'response' }
    ).pipe(
      tap((response) => {
        console.log('Respuesta del registro de paciente:', response);
        const body = response.body as any;
        const token = body?.token || body?.accessToken;

        if (token) {
          try {
            this.userService.saveToken(token);
            console.log('Token guardado después de registro');
          } catch (error) {
            console.error('Error al guardar token después de registro:', error);
            throw error;
          }
        }
      }),
      catchError((error) => {
        console.error('Error en registerPatient:', error);
        return throwError(() => error);
      })
    );
  }

  logout() {
    this.userService.deleteToken();
    this.router.navigate(['/login']);
  }
}