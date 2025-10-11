import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';

export const HOME_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home'},
  // { path: 'home', component: HomeComponent },
  // {
  //   path:'',
  //   component: HomeComponent,
  //   children:[
  //   ]
  // },
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];