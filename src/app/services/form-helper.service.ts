import { Injectable } from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';
import {BaseTableData} from '../interfaces/base-table-data.interface'
import {Mode} from '../models/modes.enum';
import {SingleActionWithEntity} from '../models/single-action.type';

@Injectable({
  providedIn: 'root'
})
export class FormHelperService {

  constructor() { }

  isInvalid(control: AbstractControl | null): boolean {
    return control !== null && control.invalid && (control.dirty || control.touched);
  }

  isSubmittable(singleAction: SingleActionWithEntity | null) : boolean {
    return singleAction !== null && singleAction.action !== Mode.VIEW;
  }
}
