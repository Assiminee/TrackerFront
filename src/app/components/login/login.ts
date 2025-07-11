import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  show : boolean = false;
  eye : string = "show-pwd.png";

  constructor(private router: Router) {}

  showPassword() {
    this.show = !this.show;
    this.eye = this.show ? "hide-pwd.png" : "show-pwd.png";
  }

  goToApp() {
    this.router.navigate(['/home']);
  }
}
