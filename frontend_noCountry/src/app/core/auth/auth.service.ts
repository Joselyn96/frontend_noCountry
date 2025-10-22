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
import { Observable, tap, catchError, throwError, BehaviorSubject, map, of, shareReplay, finalize } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthCurrentUser } from '../models/auth';
import { TokenService } from './token/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  route: string = environment.apiUrl + 'auth';
  authUserSubject = new BehaviorSubject<AuthCurrentUser | null>(null);

  constructor(
    private httpClient: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) { }

  auth(email: string, password: string): Observable<HttpResponse<any>> {
    const login_model = { email, password };

    return this.httpClient.post(
      this.route + '/login',
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
          this.tokenService.saveToken(token);
          this.router.navigate(['/dashboard']);
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
    this.tokenService.deleteToken();
    this.authUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getAuthCurrent(): Observable<{ user: AuthCurrentUser }> {
    return this.httpClient.get<{ user: AuthCurrentUser }>(
      this.route + '/current_user'
    ).pipe(
      tap((response) => {
        console.log('Respuesta del servidor:', response);
        this.authUserSubject.next(response.user);
      }),
      catchError((error) => {
        console.error('Error en getAuthCurrent:', error);
        return throwError(() => error);
      })
    );
  }

  // private currentUser: any = null;
  // private inFlightCurrentUser$?: Observable<any>;
  // getAuthCurrent(): Observable<any> {
  //   // si ya lo tenemos en memoria, devolverlo inmediatamente
  //   if (this.currentUser) {
  //     return of({ user: this.currentUser });
  //   }

  //   // si ya hay una petición en curso, devolver la misma observable compartida
  //   if (this.inFlightCurrentUser$) {
  //     return this.inFlightCurrentUser$;
  //   }

  //   const req$ = this.httpClient.get('/api/auth/current_user').pipe(
  //     tap((res: any) => {
  //       this.currentUser = res?.user ?? null;
  //     }),
  //     // compartir el resultado entre múltiples suscriptores
  //     shareReplay(1),
  //     catchError(err => {
  //       // limpiar inFlight en caso de error para permitir reintento posterior
  //       return throwError(() => err);
  //     }),
  //     finalize(() => {
  //       // una vez completado (exito o error), limpiar el inFlight observable
  //       this.inFlightCurrentUser$ = undefined;
  //     })
  //   );

  //   this.inFlightCurrentUser$ = req$;
  //   return req$;
  // }

  isLogin() {
    return this.tokenService.existToken();
  }

  getCurrentUser(): AuthCurrentUser | null {
    return this.authUserSubject.getValue();
  }
}