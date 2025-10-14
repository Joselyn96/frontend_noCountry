import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../token/token.service';

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  // if (req.url.includes('auth/login') || req.url.includes('auth/register')) {
  //   return next(req);
  // }
  console.log('interceptor');
  if (tokenService.existToken()) {
    const token = tokenService.getToken();
    // const headers = new HttpHeaders().append('Authorization', `Bearer ${token}`);
    console.log(token);
    // req = req.clone({ headers: headers });
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};
