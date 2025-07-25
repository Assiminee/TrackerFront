import {Component} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Router} from '@angular/router';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators, ɵFormGroupRawValue,
  ɵGetProperty,
  ɵTypedOrUntyped
} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {ErrorPopupComponent} from '../error-popup/error-popup.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    ErrorPopupComponent
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  show: boolean = false;
  eye: string = "show-pwd.png";
  success: boolean = true;
  loginForm: FormGroup;
  showFormError: boolean = false;
  errorMessage: string = "";

  constructor(private router: Router, private auth: AuthService) {
    if (this.auth.isLoggedIn())
      this.router.navigate(['/home']);

    this.loginForm = new FormGroup({
      id: new FormControl("", [Validators.required, Validators.minLength(8)]),
      password: new FormControl("", [Validators.required]),
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

  isInvalid(control: AbstractControl<ɵGetProperty<ɵTypedOrUntyped<any, ɵFormGroupRawValue<any>, any>, "id">> | null): boolean {
    return control !== null && control.invalid && (control.dirty || control.touched);
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
      (ok: boolean, message?: string) => this.succeeded(ok, message)
    );
  }
}
