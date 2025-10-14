import { CanMatchFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth.service';

export const loginGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  console.log('Verificando en loginGuard...');
  const isLoggedIn = authService.isLogin();

  if (isLoggedIn) {
    console.log('Usuario ya logueado, redirigiendo a dashboard...');
    router.navigate(['/dashboard']); // Redirige a /dashboard (el resolver hará el resto)
    return false; // Bloquea acceso a login/register
  }

  console.log('Usuario no logueado, permitiendo acceso');
  return true;
};

// import { CanMatchFn, Router} from '@angular/router';
// import { inject, PLATFORM_ID } from '@angular/core';
// import { UserService } from '../../../services/user/user.service';
// import { isPlatformBrowser } from '@angular/common';
// import { AuthService } from '../auth.service';
// import { AuthCurrentUser } from '../../models/auth';
// import { catchError, map, of, throwError } from 'rxjs';

// export const loginGuard: CanMatchFn = (route, segments) => {
//   const userService = inject(UserService);
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   const platformId = inject(PLATFORM_ID); 
//   if (!isPlatformBrowser(platformId)) { 
//     return true; 
//   }

//   console.log('Verificando si el usuario esta logueado');

//   const isLoggedIn = userService.isLogin();

//   if (isLoggedIn) {
//     console.log('Logueado, permitiendo acceso');
//     router.navigate(['/dashboard']);
//     return true;
//   //  return authService.getAuthCurrent().pipe(
//   //     map((authUser: any) => {
//   //        if (authUser.user.role === 'paciente') {
//   //         router.navigate(['/dashboard/patient']);
//   //         return true;
//   //       } else if (authUser.user.role === 'doctor') {
//   //         router.navigate(['/dashboard/doctor']);
//   //         return true;
//   //       } else if (authUser.user.role === 'admin') {
//   //         router.navigate(['/dashboard/admin']);
//   //         return true;
//   //       }

//   //       return false;
//   //     }),
//   //     catchError((err) => {
//   //       console.error('Error al obtener usuario:', err);
//   //       authService.logout(); 
//   //       return of(true); 
//   //     })
//   //   );
//   }
// console.log('Logueado, permitiendo acceso');
//   return true;
// };
