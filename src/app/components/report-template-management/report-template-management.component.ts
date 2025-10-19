import {Component, signal, WritableSignal} from '@angular/core';
import {MainComponent} from '../main/main.component';
import {DataManagementComponent} from '../data-management/data-management.component';
import {ReportTemplateService} from '../../services/report-template.service';
import {DataTableColumn} from '../../interfaces/data-table-column.interface';
import {EntityManagement} from '../../interfaces/entity-management.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {TeamService} from '../../services/team.service';
import {FormHelperService} from '../../services/form-helper.service';
import {SingleActionWithEntity} from '../../models/single-action.type';
import {AlertComponent} from '../alert/alert.component';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {getRoleName, VALID_ROLES} from '../../models/roles.enum';
import {Mode} from '../../models/modes.enum';
import {NgClass} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {entityNames} from '../../core/utils/globals';

@Component({
  selector: 'app-report-template-management',
  imports: [
    MainComponent,
    DataManagementComponent,
    AlertComponent,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './report-template-management.component.html',
  styleUrl: './report-template-management.component.css'
})
export class ReportTemplateManagementComponent extends EntityManagement {
  protected mode: string = 'Create';

  constructor(protected service: ReportTemplateService, router: Router, route: ActivatedRoute, teamService: TeamService, formHelper: FormHelperService) {
    super(router, route, teamService, formHelper);
    this.entity = entityNames.reportTemplate;
    this.thead = this.getSignal();
    this.form = this.createForm();
  }

  createForm = () => {
    return new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]),
      description: new FormControl('', Validators.maxLength(500)),
    })
  }

  getSignal(): WritableSignal<DataTableColumn[]> {
    return signal<DataTableColumn[]>([
      {key: 'name', title: 'Template title'},
      {
        key: 'createdAt',
        title: 'Created At',
        sortable: true,
        isDate: true,
        sortOrder: 'DESC',
        isEnabled: true,
        queryParamName: 'oldestToNewestCreated'
      },
      {
        key: 'updatedAt',
        title: 'Last Updated',
        sortable: true,
        isDate: true,
        sortOrder: 'DESC',
        isEnabled: false,
        queryParamName: 'oldestToNewestUpdated'
      },
      {key: 'owner', title: 'Owner'},
      {
        key: 'deleted', title: 'Status', isFlag: true, filterBy: null, badge: true, customCssClass: {
          'true': 'text-red-600 bg-red-50 rounded-lg ring-red-800/30',
          'false': 'text-green-600 bg-green-50 rounded-lg ring-green-800/30'
        }, queryParamName: 'isDeleted'
      },
    ]);
  }

  get name(): AbstractControl {
    return this.form.controls['name'];
  }

  get description(): AbstractControl {
    return this.form.controls['description'];
  }

  fillForm(event: SingleActionWithEntity) {
    this.singleAction = event;
    this.form.enable();

    this.name.setValue(event.entity?.['name']);
    this.description.setValue(event.entity?.['description']);

    if (event.action === Mode.VIEW)
      this.form.disable();
  }

  protected readonly VALID_ROLES = VALID_ROLES;
  protected readonly getRoleName = getRoleName;
  protected readonly Mode = Mode;

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.form.markAllAsDirty();
      return;
    }

    const body = {name: this.name.value, description: this.description.value};
    let request;

    console.log(this.singleAction);

    if (this.singleAction.action === Mode.CREATE)
      request = this.service.createInstance(body);
    else if (this.singleAction.action === Mode.EDIT)
      request = this.service.editEntry(this.singleAction.entity?.id ?? "", body);
    else if (this.singleAction.action === Mode.DELETE)
      request = this.service.deleteEntry(this.singleAction.entity?.id ?? "", {});

    if (request)
      request.subscribe(this.subscriptionObject());
  }

  subscriptionObject() {
    return {
      next: (resp: Object) => {
        this.afterSubmit('Success', this.getMessage(true), {searchText: this.name?.value ?? ""}, false, true);
      },
      error: (err: HttpErrorResponse) => {
        this.afterSubmit('Failed', this.getMessage(), {}, false);
        this.p2 += " " + err.error.message;
      }
    }
  }

  getMessage(success: boolean = false): string {
    const mode = this.singleAction.action;

    if (success)
      return `Report template "${this.name.value} "
      ${mode === Mode.CREATE ? 'created' : (mode === Mode.EDIT ? 'edited' : '')} successfully.`;

    return `Failed to ${mode === Mode.CREATE ? 'create' : (mode === Mode.EDIT ? 'edit' : '')}
    report template "${this.name.value}"`;
  }
}
