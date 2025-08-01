import { Injectable } from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormHelperService {

  constructor() { }

  isInvalid(control: AbstractControl | null): boolean {
    return control !== null && control.invalid && (control.dirty || control.touched);
  }
}
