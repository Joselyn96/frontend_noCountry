import { CanMatchFn, Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanMatchFn = (route, segments) => {
  //inyecciones de dependencias
  const userService = inject(UserService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true
  }
  const isLoggedIn = userService.isLogin();
  if (!isLoggedIn) {
    console.log('NO logueado, redirigiendo...');
    router.navigate(['/login']);
    return false;
  }
  const role = userService.getUserRole();
  if (role !== 'paciente') {
    router.navigate(['/home']); // Fuera!
    return false;
  }
  return true;
};
