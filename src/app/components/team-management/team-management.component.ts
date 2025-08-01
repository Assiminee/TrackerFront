import {Component, EventEmitter, Output, signal, WritableSignal} from '@angular/core';
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

@Component({
  selector: 'app-team-management',
  imports: [
    DataManagementComponent,
    ReactiveFormsModule,
    AlertComponent,
  ],
  templateUrl: './team-management.component.html',
  standalone: true,
  styleUrl: './team-management.component.css'
})
export class TeamManagementComponent {
  @Output() deleteIdsEvent: EventEmitter<string[]> = new EventEmitter<string[]>();
  entity!: string;
  createTeamForm!: FormGroup;
  thead!: WritableSignal<DataTableColumn[]>;
  msg: string = '';
  showFailed: boolean = false;
  showSuccess: boolean = false;
  success: boolean = false;
  isInvalid : Function;

  constructor(
    protected teamService: TeamService,
    private router: Router,
    private route: ActivatedRoute,
    formHelper: FormHelperService
  ) {
    this.thead = this.getSignal();

    this.entity = 'team';
    this.createTeamForm = new FormGroup({name: new FormControl("", Validators.required)});

    this.isInvalid = formHelper.isInvalid;
  }

  getSignal() : WritableSignal<DataTableColumn[]> {
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
          'true': 'text-red-600 bg-red-50 rounded-lg',
          'false': 'text-green-600 bg-green-50 rounded-lg'
        }, queryParamName: 'isDeleted'
      },
    ]);
  }

  get name() {
    return this.createTeamForm.get('name');
  }

  onSubmit() {
    if (this.createTeamForm.invalid)
      return;

    this.teamService.createInstance({name: this.name?.value ?? ''})?.subscribe({
      next: (resp) => {
        console.log(resp);
        this.afterSubmit(true);

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {searchText: this.name?.value ?? ""},
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      },
      error: (err) => {
        console.log(err);
        this.afterSubmit();
      }
    })
  }

  afterSubmit(success: boolean = false) {
    this.success = success;
    this.msg = success ? `Team "${this.name?.value}" created successfully.` : `Failed to create team "${this.name?.value}".`;

    setTimeout(() => {
      this.showSuccess = false;
      this.showFailed = false;
    }, 4000);

    this.showSuccess = success;
    this.showFailed = !success;
  }
}
