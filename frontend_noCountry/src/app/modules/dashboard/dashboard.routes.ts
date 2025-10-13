import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { DoctorComponent } from './doctor/doctor.component';
import { PatientComponent } from './patient/patient.component';

export const DASHBOARD_ROUTES: Routes = [
  // { path: '', pathMatch: 'full', redirectTo: 'home'},
  { path: 'admin', component: AdminComponent },
  { path: 'doctor', component: DoctorComponent },
  { path: 'patient', component: PatientComponent },
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