import {Component, OnInit, OnDestroy, signal, WritableSignal} from '@angular/core';
import {DataManagementComponent} from '../data-management/data-management.component';
import {Team} from '../../interfaces/team.interface';
import {DataTableColumn} from '../../interfaces/data-table-column.interface';
import {UserService} from '../../services/user.service';
import {TeamService} from '../../services/team.service';
import {FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {
  filter,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  tap,
  of,
  finalize,
  takeUntil,
  Subject
} from 'rxjs';
import {FormHelperService} from "../../services/form-helper.service";
import {ActivatedRoute, Router} from '@angular/router';
import {AlertComponent} from '../alert/alert.component';
import {EntityManagement} from '../../interfaces/entity-management.interface';
import {BaseTableData} from '../../interfaces/base-table-data.interface';
import {UserRow} from '../../interfaces/user-row.interface';
import {InfiniteScrollDirective} from 'ngx-infinite-scroll';

@Component({
  selector: 'app-user-management',
  imports: [
    DataManagementComponent,
    ReactiveFormsModule,
    NgClass,
    AlertComponent,
    InfiniteScrollDirective
  ],
  templateUrl: './user-management.component.html',
  standalone: true,
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent extends EntityManagement implements OnInit, OnDestroy {
  chosenTeam: { name: string, id: string } = {name: '', id: ''};
  roleOptions = [
    {value: 'ROLE_SA', name: 'Administrator'},
    {value: 'ROLE_PM', name: 'Project Manager'},
    {value: 'ROLE_TM', name: 'Team Member'}
  ];
  validRoles: string[] = ['ROLE_SA', 'ROLE_PM', 'ROLE_TM'];
  teams: Team[] = [];
  searchTeam: FormControl = new FormControl('');
  error: string | null = null;
  isLoading: boolean = false;
  teamPage: number = 0;
  destroy: Subject<void> = new Subject<void>();
  showTeams: boolean = false;
  getTeamsParams = [
    {key: 'searchNameOnly', filterBy: 'true', queryParamName: 'searchNameOnly'}
  ];

  constructor(protected userService: UserService, teamService: TeamService, router: Router, route: ActivatedRoute, formHelper: FormHelperService) {
    super(router, route, teamService, formHelper);

    this.thead = this.getWritableSignal();

    this.entity = 'user';

    this.form = this.createFormGroup();

    this.loadData();
  }

  getWritableSignal(): WritableSignal<DataTableColumn[]> {
    return signal<DataTableColumn[]>([
      {key: 'id', title: 'ID', sortable: true, sortOrder: 'ASC', isEnabled: false},
      {
        key: 'fullName',
        title: 'Full Name',
        sortable: true,
        sortOrder: 'ASC',
        isEnabled: true,
        queryParamName: 'fullNameAsc'
      },
      {key: 'team', title: 'Team', sortable: true, sortOrder: 'ASC', isEnabled: false},
      {
        key: 'role', title: 'Role', isEnum: true, badge: true, customCssClass: {
          ROLE_PM: 'text-blue-600 bg-blue-50 rounded-lg ring-blue-800/30',
          ROLE_TM: 'text-orange-600 bg-orange-50 rounded-lg ring-orange-800/30',
          ROLE_SA: 'text-purple-600 bg-purple-50 rounded-lg ring-purple-800/30'
        }, queryParamName: 'role'
      },
      {
        key: 'deleted', title: 'Account Status', isFlag: true, badge: true, customCssClass: {
          'true': 'text-red-600 bg-red-50 rounded-lg ring-red-800/30',
          'false': 'text-green-600 bg-green-50 rounded-lg ring-green-800/30'
        }, queryParamName: 'isDeleted'
      },
      {
        key: 'createdAt',
        title: 'Created At',
        sortable: true,
        isDate: true,
        sortOrder: 'DESC',
        isEnabled: true,
        queryParamName: 'oldestToNewestCreated'
      },
    ]);
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      id: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern('^(?:0[67]\\d{8}|\\+212[67]\\d{8}|\\+\\d{5,15})$')]),
      role: new FormControl('', [Validators.required, this.roleValidator()]),
      teamId: new FormControl('', [Validators.required])
    })
  }

  toggleIsLoading() {
    this.isLoading = !this.isLoading;
  }

  loadData() {
    this.toggleIsLoading();
    this.teamService.getPage(this.getTeamsParams, this.searchTeam.value, this.teamPage)
      .subscribe({
        next: data => {
          if (this.teamService.isValidResponse(data))
            this.teams = [...this.teams, ...(data.content as Team[])];
        }, error: error => {
          console.log(error);
        },
        complete: () => {
          this.toggleIsLoading()
        }
      });
  }

  onScroll() {
    this.teamPage++;
    this.loadData();
    console.log(this.teams);
  }

  roleValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;

      if (!value)
        return null;

      return this.validRoles.includes(value.toUpperCase()) ? null : {invalidRole: true};
    }
  }

  set chosenTeamId(teamId: string) {
    this.chosenTeam.id = teamId;
  }

  set chosenTeamName(teamName: string) {
    this.chosenTeam.name = teamName;
  }

  get chosenTeamId() {
    return this.chosenTeam.id;
  }

  get chosenTeamName() {
    return this.chosenTeam.name;
  }

  setChosenTeam(id: string, name: string) {
    this.chosenTeamId = id;
    this.chosenTeamName = name;
    this.form.controls['teamId'].setValue(this.chosenTeamId);
    console.log(this.form.controls['teamId'].value)
  }

  ngOnInit(): void {
    // subscribe to changes on the search input control
    this.searchTeam.valueChanges.pipe(
      // 1. filter: type guard to ensure the emitted value is a string.
      //    Without this, valueChanges could theoretically emit null/undefined or other shapes.
      //    Requires importing 'filter' from rxjs
      filter((v): v is string => typeof v === 'string'),

      // 2. Skipping search values that are empty/too short
      // filter((v) => v.trim().length >= 2),

      // 3. debounceTime: wait until the user pauses typing for 300ms before proceeding.
      //    This batches rapid keystrokes so you don't fire a request per character.
      debounceTime(300),

      // 4. distinctUntilChanged: if the query string is exactly the same as the previous
      //    one, do not continue. Prevents duplicate requests for identical input.
      distinctUntilChanged(),

      // 5. tap: side effect before the request goes out.
      //    Sets the loading flag so the UI can show a spinner, and clears prior errors.
      tap(() => {
        this.toggleIsLoading();
        this.teams.length = 0;
        this.teamPage = 0;
        this.error = null;
      }),

      // 6. switchMap: maps the incoming query string into an HTTP observable.
      //    If a new query comes before the prior one completes, it cancels the previous request.
      switchMap((v: string) => {
        return this.teamService.getPage(this.getTeamsParams, v, this.teamPage).pipe(
          catchError(err => {
            console.log(err);
            this.error = 'Search failed. Please try again later';
            return of([]);
          }),

          // finalize: always run when the inner observable completes or errors
          // turns off the loading indicator regardless of success or failure
          finalize(() => {
            this.toggleIsLoading();
          }));
      }),

      // 7. takeUntil: automatically unsubscribe from the whole pipeline when `destroy` emits.
      //    Prevents memory leaks when the component is destroyed.
      takeUntil(this.destroy)

      // actual subscription: receives the resolved data from switchMap
    ).subscribe(data => {
      if (this.teamService.isValidResponse(data)) {
        this.teams = data.content as Team[];

        if (this.teams.length === 0)
          this.error = 'No corresponding teams.';
      }
    })
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  onSubmit() {
    console.log(`Is form valid? ${this.form.valid}`);
    const controls = this.form.controls;

    if (!this.form.valid) {
      Object.entries(controls).forEach(([name, control]) => {
        if (control.invalid)
          console.log(`Control "${name}" is invalid. Errors:`, control.errors);
      });
      console.log('Form is invalid. Errors:');
      const errs = this.form.errors ?? {};
      console.log(this.form.errors);
      this.form.markAllAsTouched();

      for (const err of Object.keys(errs))
        console.log(`Error code: ${err} ----- Error: ${errs[err]}`);


      for (const [key, control] of Object.entries(controls))
        console.log(`Control: ${key} ----- value: ${control.value}`);


      return;
    }


    let body = {};

    for (const [key, control] of Object.entries(controls)) {
      if (key === 'teamId' && this.role?.value === 'ROLE_SA')
        continue;

      body = {...body, [key]: control.value};
    }

    console.log(body);

    if (this.singleAction.action === -1) {
      this.userService.createInstance({...body, password: 'Password@1'}).subscribe({
        next: resp => {
          this.afterSubmit(this.getMessage(true), {searchText: this.id?.value ?? ""}, true);
        },
        error: err => {
          console.log(err)
          this.afterSubmit(this.getMessage(), {});
          const errResp = err as HttpErrorResponse;
          this.msg += " " + errResp.error?.message;
        },
      });
      return;
    }

    if (this.singleAction.action === 2) {
      this.userService.editEntry(this.id?.value, body).subscribe({
        next: resp => {
          this.afterSubmit(this.getMessage(true), {searchText: this.id?.value ?? ""}, true);
          console.log("EDITING...")
        },
        error: err => {
          console.log(err)
          this.afterSubmit(this.getMessage(), {});
          const errResp = err as HttpErrorResponse;
          this.msg += " " + errResp.error?.message;
        },
      });
      return;
    }
  }

  getMessage(success: boolean = false): string {
    if (success)
      return `User "${this.firstName?.value} ${this.lastName?.value}" (ID: ${this.id?.value}) created successfully.`;

    return `Failed to create user "${this.firstName?.value} ${this.lastName?.value}" (ID: ${this.id?.value}).`
  }

  toggleShowTeams(): void {
    console.log(`Change in role: ${this.role?.value}`);

    this.showTeams = ['ROLE_PM', 'ROLE_TM'].includes(this.role?.value);
    console.log(this.showTeams);
    this.form.controls['teamId'].disable();
  }

  // Getters
  get id(): AbstractControl | null {
    return this.form.controls['id'];
  }

  get firstName(): AbstractControl | null {
    return this.form.controls['firstName'];
  }

  get lastName(): AbstractControl | null {
    return this.form.controls['lastName'];
  }

  get email(): AbstractControl | null {
    return this.form.controls['email'];
  }

  get phoneNumber(): AbstractControl | null {
    return this.form.controls['phoneNumber'];
  }

  get role(): AbstractControl | null {
    return this.form.controls['role'];
  }

  get team(): AbstractControl | null {
    return this.form.controls['teamId'];
  }

  // Setters
  set id(id: string) {
    this.form.controls['id'].setValue(id);
  }

  set firstName(firstName: string) {
    this.form.controls['firstName'].setValue(firstName);
  }

  set lastName(lastName: string){
    this.form.controls['lastName'].setValue(lastName);
  }

  set email(email: string) {
    this.form.controls['email'].setValue(email);
  }

  set phoneNumber(phoneNumber: string) {
    this.form.controls['phoneNumber'].setValue(phoneNumber);
  }

  set role(role: string) {
    this.form.controls['role'].setValue(role);
  }

  set team(teamId: string) {
    this.form.controls['teamId'].setValue(teamId);
  }

  fillForm(event: { entity: BaseTableData | null; action: number }) {
    this.setSingleAction(event);
    if (this.singleAction.action === -1)
      return;

    const user = this.singleAction.entity as UserRow;
    console.log("USER", user)

    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.role = user.role;
    this.team = user.team?.id ?? "";

    this.toggleShowTeams();

    if (['ROLE_TM', 'ROLE_PM'].includes(user.role))
      this.chosenTeam = {id: user.team?.id ?? "", name: user.team?.name ?? ""};

    this.id?.disable();

    if (!this.formHelper.isSubmittable(this.singleAction)) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].disable();
      })
    }
  }
}
