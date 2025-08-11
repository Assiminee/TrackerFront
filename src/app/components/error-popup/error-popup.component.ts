import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-error-popup',
  imports: [],
  templateUrl: './error-popup.component.html',
  standalone: true,
  styleUrl: './error-popup.component.css'
})
export class ErrorPopupComponent {
  @Input() msg!: string;

}
