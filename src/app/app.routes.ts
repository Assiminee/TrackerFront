import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import {HomeComponent} from './components/home/home.component';
import {ReportsComponent} from './components/reports/reports.component';
import {AdminComponent} from './components/admin/admin.component';
import {UserManagementComponent} from './components/user-management/user-management.component';
import {TeamManagementComponent} from './components/team-management/team-management.component';
import {ActivateAccountComponent} from './components/activate-account/activate-account.component';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'confirm', component: ActivateAccountComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'admin', component: AdminComponent, children: [
      {path: 'manage-users', component: UserManagementComponent},
      {path: 'manage-teams', component: TeamManagementComponent},
  ]},

];


