import { ResolveFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';

export const authResolver: ResolveFn<boolean> = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Ejecutando authResolver...');

  return authService.getAuthCurrent().pipe(
    map((response: any) => {
      const role = response.user?.role;
      console.log('Resolver - Usuario con rol:', role);

      if (role === 'paciente') {
        router.navigate(['/dashboard/patient']);
      } else if (role === 'medico') {
        router.navigate(['/dashboard/doctor']);
      } else if (role === 'admin') {
        router.navigate(['/dashboard/admin']);
      } else {
        router.navigate(['/login']);
      }
      
      return true;
    }),
    catchError((err) => {
      console.error('Error en resolver:', err);
      router.navigate(['/login']);
      return of(false);
    })
  );
};

