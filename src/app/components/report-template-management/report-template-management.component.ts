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
import {InfiniteScrollDirective} from 'ngx-infinite-scroll';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {getRoleName, VALID_ROLES} from '../../models/roles.enum';
import {Mode} from '../../models/modes.enum';
import {NgClass} from '@angular/common';

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
    this.entity = 'report template';
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
      // {
      //   key: 'deleted', title: 'Team Status', isFlag: true, filterBy: null, badge: true, customCssClass: {
      //     'true': 'text-red-600 bg-red-50 rounded-lg ring-red-800/30',
      //     'false': 'text-green-600 bg-green-50 rounded-lg ring-green-800/30'
      //   }, queryParamName: 'isDeleted'
      // },
      {key: 'team', title: 'Team', badge: true, customCssClass: 'text-black bg-white ring-gray-300'},
    ]);
  }

  get name() : AbstractControl {
    return this.form.controls['name'];
  }

  get description() : AbstractControl {
    return this.form.controls['description'];
  }

  fillForm(event: SingleActionWithEntity) {

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

    this.service.createInstance({name: this.name.value, description: this.description.value})
      .subscribe(instance => {
        console.log(instance);
      })

  }
}
