import {
  Component,
  EventEmitter,
  Output,
  signal,
  WritableSignal
} from '@angular/core';
import {DataManagementComponent} from "../data-management/data-management.component";
import {DataTableColumn} from '../../interfaces/data-table-column.interface';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertComponent} from '../alert/alert.component';
import {TeamService} from '../../services/team.service';
import {FormHelperService} from "../../services/form-helper.service";
import {EntityManagement} from '../../interfaces/entity-management.interface';
import {Team} from '../../interfaces/team.interface';
import {BaseTableData} from '../../interfaces/base-table-data.interface';
import {NgClass} from '@angular/common';
import {Mode} from '../../models/modes.enum';

@Component({
  selector: 'app-team-management',
  imports: [
    DataManagementComponent,
    ReactiveFormsModule,
    AlertComponent,
    NgClass,
  ],
  templateUrl: './team-management.component.html',
  standalone: true,
  styleUrl: './team-management.component.css'
})
export class TeamManagementComponent extends EntityManagement {
  @Output() deleteIdsEvent: EventEmitter<string[]> = new EventEmitter<string[]>();

  constructor(
    teamService: TeamService,
    router: Router, route: ActivatedRoute, formHelper: FormHelperService
  ) {
    super(router, route, teamService, formHelper);

    this.thead = this.getSignal();

    this.entity = 'team';
    this.form = new FormGroup({name: new FormControl("", Validators.required)});
  }

  getSignal(): WritableSignal<DataTableColumn[]> {
    return signal<DataTableColumn[]>([
      {key: 'name', title: 'Team Name', sortable: true, sortOrder: 'ASC', isEnabled: false, queryParamName: 'nameAsc'},
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
      {key: 'pm', title: 'PM', sortable: true, sortOrder: 'ASC', isEnabled: false, queryParamName: 'pmAsc'},
      {
        key: 'deleted', title: 'Team Status', isFlag: true, filterBy: null, badge: true, customCssClass: {
          'true': 'text-red-600 bg-red-50 rounded-lg ring-red-800/30',
          'false': 'text-green-600 bg-green-50 rounded-lg ring-green-800/30'
        }, queryParamName: 'isDeleted'
      },
      {key: 'memberCount', title: 'Members Count', badge: true, customCssClass: 'text-black bg-white ring-gray-300'},
    ]);
  }

  get name() {
    return this.form.get('name');
  }

  onSubmit() {
    if (this.form.invalid)
      return;

    if (this.singleAction.action === Mode.CREATE) {
      this.createTeam();
      return;
    }

    if (this.singleAction.action === Mode.EDIT) {
      this.editTeam();
      return;
    }

  }

  createTeam() {
    this.teamService.createInstance({name: this.name?.value ?? ''})?.subscribe({
      next: (resp) => {
        this.afterSubmit('Success', this.getMessage("create", true), {searchText: this.name?.value ?? ""}, false, true);
      },
      error: (err) => {
        this.afterSubmit('Failed', this.getMessage("create"), {}, false);
        this.p2 += " " + err.error.message;
      }
    });
  }

  editTeam() {
    this.teamService.editEntry(this.singleAction?.entity?.id ?? "", {name: this.name?.value})
      .subscribe({
        next: (resp) => {
          this.afterSubmit('Success', this.getMessage("edite", true), {searchText: this.name?.value ?? ""}, false, true);
        },
        error: (err) => {
          this.afterSubmit('Failed', this.getMessage("edite"), {}, false);
          this.p2 += " " + err.error.message;
        }
      })
  }

  getMessage(action: string, success: boolean = false): string {
    if (success)
      return `Team "${this.name?.value}" ${action}d successfully.`;

    return `Failed to ${action} team "${this.name?.value}".`;
  }

  setTeamName(event: { entity: BaseTableData | null, action: number }) {
    this.setSingleAction(event);

    this.form.enable();
    this.form.reset();

    if (this.singleAction.action !== Mode.CREATE) {
      this.form.controls?.['name'].setValue((this.singleAction.entity as Team).name);

      if (!this.formHelper.isSubmittable(this.singleAction))
        this.form.controls?.['name'].disable();
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
