import { Injectable } from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {LoginResponse} from '../interfaces/login-response.interface';
import {JwtDecoderService} from './jwt-decoder.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private BASE_URL: string = "http://localhost:8080/api/auth";

  constructor(private client: HttpClient, private jwtDecoderService: JwtDecoderService, private router: Router) { }

  login(id: string, password: string, setSuccess: Function): Subscription {
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
          this.router.navigate(['/home']);
          return;
        },
        error: (error: HttpErrorResponse) => {
          console.error("Failed to login: ", error);
          setSuccess(false, (error.status >= 400 && error.status < 500)  ? "Invalid login credentials" : "Failed to login. Please try again later.");
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
      return null;

    return this.jwtDecoderService.decode(localStorage.getItem("jwt") ?? "");
  }

  logout() : void {
    localStorage.removeItem("jwt");
  }


}
