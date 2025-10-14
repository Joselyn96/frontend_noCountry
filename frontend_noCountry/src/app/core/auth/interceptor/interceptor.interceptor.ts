import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../token/token.service';

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  if (req.url.includes('auth/login') || req.url.includes('auth/register')) {
    return next(req);
  }
if (tokenService.existToken()) {
    const token = tokenService.getToken();
    const headers = new HttpHeaders().append('Authorization', ` Bearer ${token}`);

    req = req.clone({ headers: headers});
  }
  return next(req);
};
