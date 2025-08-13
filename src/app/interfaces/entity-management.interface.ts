import {WritableSignal} from '@angular/core';
import {DataTableColumn} from './data-table-column.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {FormHelperService} from '../services/form-helper.service';
import {FormGroup} from '@angular/forms';
import {TeamService} from '../services/team.service';
import {BaseTableData} from './base-table-data.interface';
import {SingleActionWithEntity} from '../models/single-action.type';

interface EntityManagementInterface {
  thead: WritableSignal<DataTableColumn[]>;
  msg: string;
  showFailed: boolean;
  showSuccess: boolean;
  success: boolean;
  isInvalid: Function;

  afterSubmit(msg: string, queryParams: object, success: boolean): void
}

export class EntityManagement implements EntityManagementInterface {
  thead!: WritableSignal<DataTableColumn[]>;
  msg: string = '';
  showFailed: boolean = false;
  showSuccess: boolean = false;
  success: boolean = false;
  isInvalid!: Function;
  entity!: string;
  form!: FormGroup;
  singleAction: { entity: BaseTableData | null, action: number } = {entity: null, action: -1};

  constructor(protected router: Router, protected route: ActivatedRoute,  protected teamService: TeamService, protected formHelper: FormHelperService) {}

  afterSubmit(msg: string, queryParams: object, success: boolean = false): void {
    this.toggleShowMessages(msg, success);

    if (Object.keys(queryParams).length > 0) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }

  toggleShowMessages(msg: string, success: boolean = false): void {
    this.success = success;
    this.msg = msg;

    setTimeout(() => {
      this.showSuccess = false;
      this.showFailed = false;
    }, 6000);

    this.showSuccess = success;
    this.showFailed = !success;
  }

  setSingleAction(event: SingleActionWithEntity) {
    this.singleAction = event;
    console.log("Single action: ", this.singleAction)
  }
}
