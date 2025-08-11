import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {JwtDecoderService} from '../services/jwt-decoder.service';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private jwtDecoder: JwtDecoderService,
    private auth: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.jwtDecoder.getToken();

    const clonedReq = token ? req.clone({ setHeaders: {Authorization: `Bearer ${token}` } }) : req;

    return next.handle(clonedReq).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) : Observable<any> {
    this.handleUnauthorized(err);
    this.handleForbidden(err);

    console.error(err);

    return throwError(() => err);
  }

  private handleUnauthorized(err: HttpErrorResponse) {
    if (err.status === 401) {
      this.auth.logout();
      // After the session expires, this 401 handler would be triggered
      // At this stage, the user will be redirected to the login page
      // to login again. Once logged in, queryParams: { returnUrl: this.router.url }
      // will make it so that the user is routed back to the page they were
      // in before being sent over to login.
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url, expiredSession: true }
      });
      console.log("attached query params")
    }
  }

  private handleForbidden(err: HttpErrorResponse) {
    if (err.status === 403)
      this.router.navigate(['/forbidden']);
  }
}
