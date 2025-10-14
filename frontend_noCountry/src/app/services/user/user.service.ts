import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { TokenService } from '../../core/auth/token/token.service';
import { jwtDecode } from 'jwt-decode';

export interface UserToken {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url: string = `${environment.apiUrl}user`;
  private userSubject = new BehaviorSubject<UserToken | null>(null);

  constructor(
    private httpClient: HttpClient,
    private tokenService: TokenService
  ) {
    if (this.tokenService.existToken()) {
      try {
        this.decodingJWT();
      } catch (error) {
        console.error('Error al decodificar token en constructor:', error);
        this.deleteToken(); // Limpiar token corrupto
      }
    }
  }

  private decodingJWT() {
    const token = this.tokenService.getToken();

    // VALIDACIÓN 1: Token no vacío
    // if (!token || token.trim() === '') {
    //   throw new Error('Token vacío o inválido');
    // }

    // VALIDACIÓN 2: Formato JWT (3 partes)
    // const parts = token.split('.');
    // if (parts.length !== 3) {
    //   throw new Error(`Token JWT inválido: tiene ${parts.length} partes, se esperan 3`);
    // }

    // VALIDACIÓN 3: Decodificar con try-catch
    try {
      const decoded = jwtDecode<{
        id: string;
        email: string;
        role: string;
        iat?: number;
        exp?: number;
      }>(token);

      // Verificar que tenga los campos requeridos
      if (!decoded.id || !decoded.email || !decoded.role) {
        throw new Error('Token JWT no contiene campos requeridos (id, email, role)');
      }

      // Verificar expiración (opcional)
      // if (decoded.exp) {
      //   const now = Math.floor(Date.now() / 1000);
      //   if (decoded.exp < now) {
      //     throw new Error('Token JWT ha expirado');
      //   }
      // }

      const user: UserToken = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        iat: decoded.iat,
        exp: decoded.exp
      };

      this.userSubject.next(user);
      console.log('Token decodificado exitosamente:', user);

    } catch (error) {
      console.error('Error al decodificar JWT:', error);
      throw error;
    }
  }

  getUserSubject() {
    return this.userSubject.asObservable();
  }

  saveToken(token: string) {
    this.tokenService.saveToken(token);
    this.decodingJWT();
  }

  deleteToken() {
    this.tokenService.deleteToken();
    this.userSubject.next(null);
  }

  isLogin() {
    return this.tokenService.existToken();
  }

  getUserRole(): string | null {
    return this.userSubject.value?.role || null;
  }
}