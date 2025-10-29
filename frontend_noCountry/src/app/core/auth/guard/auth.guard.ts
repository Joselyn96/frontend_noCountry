import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
  const isLoggedIn = authService.isLogin();
  
  if (!isLoggedIn) {
    console.log('NO logueado, redirigiendo a login...');
    router.navigate(['/login']);
    return false;
  }

  const currentPath = state.url;

  // try cached user first (no HTTP)
  const cached = authService.getCurrentUser();
  if (cached) {
    console.log('Verificando acceso - Rol:', cached.role, 'Ruta:', currentPath);
    const role = (cached as any).role;
    if (role === 'admin' && currentPath.includes('/dashboard/admin')) return true;
    if (role === 'medico' && currentPath.includes('/dashboard/doctor')) return true;
    if (role === 'paciente' && currentPath.includes('/dashboard/patient')) return true;

    // redirect to correct dashboard if role doesn't match route
    if (role === 'admin') { router.navigate(['/dashboard/admin']); return false; }
    if (role === 'medico') { router.navigate(['/dashboard/doctor']); return false; }
    if (role === 'paciente') { router.navigate(['/dashboard/patient']); return false; }

    router.navigate(['/login']);
    return false;
  }
  
  return authService.getAuthCurrent().pipe(
    map((response: any) => {
      const role = response.user?.role;
      const currentPath = state.url;
      
      console.log('Verificando acceso - Rol:', role, 'Ruta:', currentPath);
      
      if (role === 'admin' && currentPath.includes('/dashboard/admin')) {
        return true; // Permitir acceso
      } else if (role === 'medico' && currentPath.includes('/dashboard/doctor')) {
        return true; // Permitir acceso
      } else if (role === 'paciente' && currentPath.includes('/dashboard/patient')) {
        return true; // Permitir acceso
      }
      
      // Si intenta acceder a una ruta que no le corresponde, redirigir
      console.log('Acceso denegado, redirigiendo a su dashboard...');
      if (role === 'admin') {
        router.navigate(['/dashboard/admin']);
      } else if (role === 'medico') {
        router.navigate(['/dashboard/doctor']);
      } else if (role === 'paciente') {
        router.navigate(['/dashboard/patient']);
      } else {
        router.navigate(['/login']);
      }
      
      return false; // Bloquear acceso a la ruta incorrecta
    }),
    catchError((err) => {
      console.error('Error al verificar usuario:', err);
      authService.logout();
      router.navigate(['/login']);
      return of(false);
    })
  );
};


