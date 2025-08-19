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
import {Subject, Subscription, takeUntil} from 'rxjs';
import {NgClass} from '@angular/common';
import {AlertComponent} from '../alert/alert.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    NgClass,
    AlertComponent
  ],
  templateUrl: './login.html',
  standalone: true,
  styleUrl: './login.css'
})
export class Login implements OnDestroy {
  show: boolean = false;
  showModal: boolean = false;
  eye: string = "show-pwd.png";
  success: boolean = true;
  loginForm!: FormGroup;
  showFormError: boolean = false;
  errorMessage: string = "";
  redirectUrl: string = "/home";
  isInvalid!: Function;
  subscription!: Subscription;
  showInner: boolean = false;
  p1: string = "";
  p2: string = "";
  form!: FormGroup;
  destroy: Subject<void> = new Subject();
  modalSuccess: boolean = true;

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

    this.form = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
    })

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
      this.id?.value ?? "", this.password?.value ?? "",
      (ok: boolean, message?: string) => this.succeeded(ok, message),
      this.redirectUrl
    );
  }

  ngOnDestroy(): void {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  get email() {
    return this.form.controls['email'];
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.markAllAsDirty();
      return;
    }

    this.modalMessage(true, "Sending activation email...", "Please wait", true);

    this.auth.requestActivationEmail(this.email.value)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (resp) => {
          this.modalMessage(true, "Successfully sent an activation email", "Please access your email and click on the activation link to login.", true);
        },
        error: err => {
          this.modalMessage(true, "Failed to send an activation email", err.error.message, false);
        }
      })
  }

  modalMessage(show: boolean, p1: string, p2: string, succeeded: boolean) {
    this.showInner = show;
    this.p1 = p1;
    this.p2 = p2;
    this.modalSuccess = succeeded;

    setTimeout(() => {
      this.showInner = false;
      this.p1 = "";
      this.p2 = "";
    }, 4000);
  }
}
