import {Component} from '@angular/core';
import {ErrorPopupComponent} from '../error-popup/error-popup.component';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FormHelperService} from '../../services/form-helper.service';
import {NgClass} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-activate-account',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgClass,
  ],
  templateUrl: './activate-account.component.html',
  styleUrl: './activate-account.component.css',
  standalone: true
})
export class ActivateAccountComponent {
  success: boolean = true;
  form: FormGroup;
  showPassword: boolean = false;
  showConfPwd: boolean = false;
  email: string | null = null;
  token: string | null = null;
  msg: string = '';
  requestNewToken: boolean = false;
  warning: boolean = true;

  constructor(private route: ActivatedRoute, private router: Router, protected formHelper: FormHelperService, private authService: AuthService) {
    const validators = [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\W).{8,}$')
    ];

    this.form = new FormGroup({
      password: new FormControl('', validators),
      confirmPassword: new FormControl('', [...validators, this.identicalPasswordsValidator()]),
    });

    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.token = params['token'];

      console.log(this.token);
      console.log(this.email);
      if (!this.isValidParams()) {
        this.success = false;
        this.password.disable();
        this.confirmPassword.disable();
        this.msg = 'Missing email or token';
        this.warning = true;
        return;
      }
    })
  }

  isValidParams(): boolean {
    return this.email != null && this.token != null;
  }

  identicalPasswordsValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;

      if (!value)
        return null;

      return value === this.password.value ? null : {different: true};
    }
  }

  get password(): AbstractControl {
    return this.form.controls['password'];
  }

  get confirmPassword(): AbstractControl {
    return this.form.controls['confirmPassword'];
  }

  onSubmit() {
    if (this.email === null || this.token === null)
      return;

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.activateAccount(this.email, this.password.value, this.confirmPassword.value, this.token)
      .subscribe({
        next: result => {
          this.success = true;

          this.router.navigate(['/login']);
        },
        error: (error: HttpErrorResponse) => {
          this.warning = true;
          this.success = false;
          if ([400, 500].includes(error.status)) {
            this.requestNewToken = true;
          }

          this.msg = error.error.message;

          if (error.status === 404) {
            this.msg = "Unknown email"
          }
        }
      })
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfPwd() {
    this.showConfPwd = !this.showConfPwd;
  }

  requestToken() {
    this.authService.requestActivationEmail(this.email ?? '')
      .subscribe({
        next: result => {
          this.msg = `An activation email was sent to '${this.email}'`;
          this.warning = false;
        },
        error: (error: HttpErrorResponse) => {
          this.msg = error.error.message;
          this.warning = true;
        }
      })
  }
}
