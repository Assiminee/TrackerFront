import { Injectable } from '@angular/core';
import {Observable, Subscription, tap} from 'rxjs';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {LoginResponse} from '../interfaces/login-response.interface';
import {JwtDecoderService} from './jwt-decoder.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private BASE_URL: string = "http://localhost:8080/api/auth";

  constructor(private client: HttpClient, private jwtDecoderService: JwtDecoderService, private router: Router) { }

  login(id: string, password: string, url: string, setSuccess: Function): Subscription {
    return this.client.post<LoginResponse>(this.BASE_URL + "/login", {id, password}).pipe(
      tap((loginResponse: LoginResponse) => {
        if (!this.jwtDecoderService.isValid(loginResponse.token))
          throw new Error("Invalid JWT token");

        localStorage.setItem("jwt", loginResponse.token);

        const token = localStorage.getItem("jwt");

        if (token === null || token !== loginResponse.token)
          throw new Error("Failed to save token");
      }))
      .subscribe({
        next: () => {
          setSuccess(true);
          this.router.navigateByUrl(url);
          return;
        },
        error: (error: HttpErrorResponse) => {
          console.error("Failed to login: ", error);
          let message = '';

          if (error.status === 401)
            message = 'Invalid login credentials';
          else if (error.status === 403)
            message = 'Your email must be verified before you attempt to login';
          else
            message = 'Failed to login. Please try again later';

          setSuccess(false, message);
        }
    })
  }

  isLoggedIn() : boolean {
    const token = localStorage.getItem('jwt');

    if (!token)
      return false;

    return this.jwtDecoderService.isValid(token);
  }

  loggedInUser() {
    if (!this.isLoggedIn())
      this.router.navigate(['/login'], {
        queryParams: {sessionExpired: true, returnUrl: this.router.url}
      });

    return this.jwtDecoderService.decode(localStorage.getItem("jwt") ?? "");
  }

  logout() : void {
    localStorage.removeItem("jwt");
  }

  activateAccount(email: string, password: string, confirmPassword: string, token: string) {
    return this.client.post(this.BASE_URL + "/confirm", {email, newPassword: password, confirmPassword, token});
  }

  requestActivationEmail(email: string) {
    let params = new HttpParams();

    params = params.set('email', email);
    return this.client.post(this.BASE_URL + "/resend-token", null, {params: params});
  }
}
