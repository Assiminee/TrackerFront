import {Component, EventEmitter, Output, Signal, signal, WritableSignal} from '@angular/core';
import {DataManagementComponent} from "../data-management/data-management.component";
import {Team} from '../../interfaces/team.interface';
import {MockDataService} from '../../services/mock-data.service';
import {DataTableColumn} from '../../interfaces/data-table-column.interface';
import {TeamService} from '../../services/team.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators, ɵFormGroupRawValue,
  ɵGetProperty,
  ɵTypedOrUntyped
} from '@angular/forms';

@Component({
  selector: 'app-team-management',
  imports: [
    DataManagementComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './team-management.component.html',
  styleUrl: './team-management.component.css'
})
export class TeamManagementComponent {
  @Output() deleteIdsEvent : EventEmitter<string[]> = new EventEmitter<string[]>();
  data!: Team[];
  entity!: string;
  thead!: WritableSignal<DataTableColumn[]>;
  createTeamForm!: FormGroup;

  constructor(private mockDataService: MockDataService, protected teamService: TeamService) {
    this.data = this.mockDataService.getMockTeams();

    this.thead = signal<DataTableColumn[]>([
      {key: 'name', title: 'Team Name', sortable: true, sortOrder: 'ASC', isEnabled: false, queryParamName: 'nameAsc'},
      {key: 'createdAt', title: 'Created At', sortable: true, isDate: true, sortOrder: 'DESC', isEnabled: true, queryParamName: 'oldestToNewestCreated'},
      {key: 'updatedAt', title: 'Last Updated', sortable: true, isDate: true, sortOrder: 'DESC', isEnabled: false, queryParamName: 'oldestToNewestUpdated'},
      {key: 'pm', title: 'PM', sortable: true, sortOrder: 'ASC', isEnabled: false, queryParamName: 'pmAsc'},
      {key: 'deleted', title: 'Team Status', isFlag: true, filterBy: null, badge: true, customCssClass: {
          'true': 'text-red-600 bg-red-50 rounded-lg',
          'false': 'text-green-600 bg-green-50 rounded-lg'
        }, queryParamName: 'isDeleted'},
    ]);

    this.entity = 'team';
    this.createTeamForm = new FormGroup({name: new FormControl("", Validators.required)});
  }

  get name() {
    return this.createTeamForm.get('name');
  }

  onSubmit() {
    console.log("submitting")
    if (this.createTeamForm.invalid) {
      console.log("It's fucking invalid");
      return;
    }

    this.teamService.createTeam(this.name?.value ?? '');
  }

  isInvalid(control: AbstractControl<ɵGetProperty<ɵTypedOrUntyped<any, ɵFormGroupRawValue<any>, any>, "id">> | null): boolean {
    return control !== null && control.invalid && (control.dirty || control.touched);
  }

}
