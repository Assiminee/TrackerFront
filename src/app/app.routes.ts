import { Routes } from '@angular/router';
import {Login} from './components/login/login';
import {TstCmpComponent} from './components/tst-cmp/tst-cmp.component';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', component: TstCmpComponent },

];


