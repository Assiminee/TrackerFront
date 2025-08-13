import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {FormHelperService} from '../../services/form-helper.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  standalone: true,
  styleUrl: './login.css'
})
export class Login implements OnDestroy {
  show: boolean = false;
  eye: string = "show-pwd.png";
  success: boolean = true;
  loginForm!: FormGroup;
  showFormError: boolean = false;
  errorMessage: string = "";
  redirectUrl: string = "/home";
  isInvalid!: Function;
  subscription!: Subscription;

  constructor(private router: Router, private auth: AuthService, private route: ActivatedRoute, formHelper: FormHelperService) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate([this.redirectUrl]);
      return;
    }

    this.isInvalid = formHelper.isInvalid;

    this.loginForm = new FormGroup({
      id: new FormControl("", [Validators.required, Validators.minLength(8)]),
      password: new FormControl("", [Validators.required]),
    });

    this.subscription = this.route.queryParams.subscribe(params => {
      const redirectUrl = params['returnUrl'];

      if (params['sessionExpired'] === 'true') {
        this.errorMessage = 'Your session has expired. Please log in again.';
        this.success = false;
      }

      if (redirectUrl)
        this.redirectUrl = redirectUrl;
    });
  }

  showPassword() {
    this.show = !this.show;
    this.eye = this.show ? "hide-pwd.png" : "show-pwd.png";
  }

  get id() {
    return this.loginForm.get('id');
  }

  get password() {
    return this.loginForm.get('password');
  }

  succeeded(succeeded: boolean, message?: string) {
    this.success = succeeded;

    if (message)
      this.errorMessage = message;
  }

  login() {
    if (this.loginForm.invalid) {
      this.showFormError = true;

      setTimeout(() => {
        this.showFormError = false;
      }, 6000);

      return;
    }

    this.auth.login(
      this.id?.value ?? "", this.password?.value ?? "", this.redirectUrl,
      (ok: boolean, message?: string) => this.succeeded(ok, message)
    );
  }

  ngOnDestroy(): void {
    if (this.subscription)
      this.subscription.unsubscribe();
  }
}
