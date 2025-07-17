import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import {HomeComponent} from './components/home/home.component';
import {ReportsComponent} from './components/reports/reports.component';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'reports', component: ReportsComponent },

];


