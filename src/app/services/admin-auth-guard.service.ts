import { Injectable } from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {AuthService} from './auth.service';
import {isAdmin} from '../models/roles.enum';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean | UrlTree {
    const loggedInUser = this.authService.loggedInUser();

    if (!loggedInUser)
      return this.router.parseUrl('/login');

    return isAdmin(loggedInUser.role) ? true : this.router.parseUrl('/forbidden');
  }
}
