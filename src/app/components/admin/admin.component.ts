import { Component } from '@angular/core';
import {MainComponent} from '../main/main.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [
    MainComponent,
    RouterOutlet
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  standalone: true
})
export class AdminComponent {

}
