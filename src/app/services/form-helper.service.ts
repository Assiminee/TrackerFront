import { Injectable } from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';
import {BaseTableData} from '../interfaces/base-table-data.interface'

@Injectable({
  providedIn: 'root'
})
export class FormHelperService {

  constructor() { }

  isInvalid(control: AbstractControl | null): boolean {
    return control !== null && control.invalid && (control.dirty || control.touched);
  }

  isSubmittable(singleAction: {entity: BaseTableData | null, action: number} | null) : boolean {
    return singleAction !== null && singleAction.action !== 1;
  }
}
