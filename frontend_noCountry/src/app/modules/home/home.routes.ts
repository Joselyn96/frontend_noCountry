import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { loginGuard } from '../../core/auth/guard/login.guard';

export const HOME_ROUTES: Routes = [
 
  { path: 'home', component: HomeComponent },
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canMatch: [loginGuard] },
  { path: 'register', component: RegisterComponent, canMatch: [loginGuard] },
];