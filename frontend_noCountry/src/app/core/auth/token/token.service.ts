import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private cookies: CookieService) { }
  getToken(){
    const token = this.cookies.get('token') ?? '';
    console.log(token);
    return token;
  }
 saveToken(token: string){
    // ensure cookie is set on root path so delete with same path works
    this.cookies.set('token', token, undefined, '/');
    console.log('Token saved (cookie set on path /)');
  }

  deleteToken(){
    // delete using the same path used to set the cookie
    this.cookies.delete('token', '/');
    console.log('deleteToken called (attempted delete on path /)');
  }

  // fallback that tries a more aggressive cleanup
  forceDeleteToken() {
    try {
      this.cookies.delete('token', '/');
      // deleteAll with path '/' as an extra effort
      this.cookies.deleteAll('/');
      console.log('forceDeleteToken: attempted delete and deleteAll on path /');
    } catch (err) {
      console.error('forceDeleteToken error:', err);
    }
  }

  existToken(){
    // faster check using cookie check
    return this.cookies.check('token');
  }
  // saveToken(token: string){
  //   this.cookies.set('token', token);
  // }

  // deleteToken(){
  //   this.cookies.delete('token');
  // }

  // existToken(){
  //   return !!this.getToken();
  // }
}
