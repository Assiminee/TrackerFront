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
  p1: string;
  p2: string;
  success: boolean;
  showInner: boolean;
  showOuter: boolean;
  isInvalid: Function;
  entity: string;
  form: FormGroup;
  singleAction: { entity: BaseTableData | null, action: number };

  afterSubmit(p1: string, p2: string, queryParams: object, showInner: boolean, success: boolean): void
}

export class EntityManagement implements EntityManagementInterface {
  thead!: WritableSignal<DataTableColumn[]>;
  p1: string = '';
  p2: string = '';
  success: boolean = false;
  showInner: boolean = false;
  showOuter: boolean = false;
  isInvalid!: Function;
  entity!: string;
  form!: FormGroup;
  singleAction: { entity: BaseTableData | null, action: number } = {entity: null, action: -1};

  constructor(protected router: Router, protected route: ActivatedRoute,  protected teamService: TeamService, protected formHelper: FormHelperService) {}

  afterSubmit(p1: string, p2: string, queryParams: object, showInner: boolean, success: boolean = false): void {
    this.toggleShowMessages(p1, p2, showInner, success);

    if (Object.keys(queryParams).length > 0) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }

  toggleShowMessages(p1: string, p2: string, showInner: boolean, success: boolean = false): void {
    this.success = success;
    this.showInner = showInner;
    this.showOuter = !showInner;

    this.p1 = p1;
    this.p2 = p2;

    setTimeout(() => {
      this.showInner = false;
      this.showOuter = false;
      this.p1 = '';
      this.p2 = '';
    }, 6000);
  }

  setSingleAction(event: SingleActionWithEntity) {
    this.singleAction = event;
  }
}
