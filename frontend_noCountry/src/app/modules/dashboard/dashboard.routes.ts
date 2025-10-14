import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from '../../core/auth/guard/auth.guard';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  // { path: '', pathMatch: 'full', redirectTo: 'home'},
  // // { path: 'home', component: HomeComponent },
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