import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { DoctorComponent } from './doctor/doctor.component';
import { PatientComponent } from './patient/patient.component';
import { authGuard } from '../../core/auth/guard/auth.guard';
import { authResolver } from '../../core/auth/auth.resolver';

export const DASHBOARD_ROUTES: Routes = [
  // { path: '', component: DashboardComponent, canActivate: [authGuard] },
  // { path: '', pathMatch: 'full', redirectTo: 'home'},
  {
    path: '',
    resolve: { redirect: authResolver },
    children: [] // Componente vacío, solo redirige
  },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'doctor', component: DoctorComponent, canActivate: [authGuard] },
  { path: 'patient', component: PatientComponent, canActivate: [authGuard] },
  // {
  //   path:'',
  //   component: HomeComponent,
  //   children:[
  //     {
  //       path: 'home',
  //       loadChildren: () =>
  //         import('./initial/initial.routes').then((m) => m.INITIAL_ROUTES),
  //     },
  //     {
  //       path: 'login',
  //       loadChildren: () =>
  //         import('./login/login.routes').then((m) => m.LOGIN_ROUTES),
  //       canMatch: [loginGuard]
  //     },
  //     {
  //       path: 'register',
  //       loadChildren: () =>
  //         import('./register/register.routes').then((m) => m.REGISTER_ROUTES),
  //       canMatch: [loginGuard]
  //     },

  //   ]
  // }
];