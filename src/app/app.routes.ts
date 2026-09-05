import { Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard.component/dashboard.component';
import { LoginComponent } from './components/login.component/login.component';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
