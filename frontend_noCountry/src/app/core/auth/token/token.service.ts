import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private cookies: CookieService) { }
  getToken(){
    const token = this.cookies.get('token') ?? '';
    return token;
  }

  saveToken(token: string){
    this.cookies.set('token', token);
  }

  deleteToken(){
    this.cookies.delete('token');
  }

  existToken(){
    return !!this.getToken();
  }
}
