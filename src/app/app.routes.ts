import {Routes} from '@angular/router';
import {Login} from './components/login/login';
import {HomeComponent} from './components/home/home.component';
import {ReportsComponent} from './components/reports/reports.component';
import {AdminComponent} from './components/admin/admin.component';
import {UserManagementComponent} from './components/user-management/user-management.component';
import {TeamManagementComponent} from './components/team-management/team-management.component';
import {ActivateAccountComponent} from './components/activate-account/activate-account.component';
import {ForbiddenComponent} from './components/error-pages/forbidden/forbidden.component';
import {AdminAuthGuardService} from './services/admin-auth-guard.service';
import {
  ReportTemplateManagementComponent
} from './components/report-template-management/report-template-management.component';
import {SpreadsheetsComponent} from './components/spreadsheets/spreadsheets.component';

export const routes: Routes = [
  {path: 'login', component: Login},
  {path: 'confirm', component: ActivateAccountComponent},
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'reports', component: ReportsComponent},
  {path: 'report-templates', component: ReportTemplateManagementComponent},
  {path: 'spreadsheets', component: SpreadsheetsComponent},
  {
    path: 'admin', component: AdminComponent, canActivate: [AdminAuthGuardService], children: [
      {path: 'manage-users', component: UserManagementComponent},
      {path: 'manage-teams', component: TeamManagementComponent},
    ]
  },
  {path: 'forbidden', component: ForbiddenComponent},
];


