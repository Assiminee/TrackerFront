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
import {UserRow} from '../../interfaces/user-row.interface';
import {InfiniteScrollDirective} from 'ngx-infinite-scroll';
import {getRoleName, isTmOrPm, isValidRole, Role, VALID_ROLES} from '../../models/roles.enum';
import {SingleActionWithEntity} from '../../models/single-action.type';
import {Mode} from '../../models/modes.enum';

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
  mode: string = 'Create';

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
          [Role.ProjectManager]: 'text-blue-600 bg-blue-50 rounded-lg ring-blue-800/30',
          [Role.TeamMember]: 'text-orange-600 bg-orange-50 rounded-lg ring-orange-800/30',
          [Role.Admin]: 'text-purple-600 bg-purple-50 rounded-lg ring-purple-800/30'
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

  loadData() {
    if (this.isLoading) return;

    this.isLoading = true;

    this.teamService.getPage(this.getTeamsParams, this.searchTeam.value, this.teamPage)
      .pipe(
        takeUntil(this.destroy),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: data => {
          if (this.teamService.isValidResponse(data))
            this.teams = [...this.teams, ...(data.content as Team[])];
        }, error: error => {
          console.log(error);
        }
      });
  }

  onScroll() {
    this.teamPage++;
    this.loadData();
  }

  roleValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;

      if (!value)
        return null;

      return isValidRole(value) ? null : {invalidRole: true};
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
        this.isLoading = true;
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
            this.isLoading = false;
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
    });
  }

  onSubmit() {
    const controls = this.form.controls;

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }


    let body = {};

    for (const [key, control] of Object.entries(controls)) {
      if (key === 'teamId' && this.role?.value === Role.Admin)
        continue;

      body = {...body, [key]: control.value};
    }

    if (this.singleAction.action === Mode.CREATE) {
      this.userService.createInstance({...body, password: 'Password@1'})
        .pipe(takeUntil(this.destroy))
        .subscribe({
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

    if (this.singleAction.action === Mode.EDIT) {
      this.userService.editEntry(this.id?.value, body)
        .pipe(takeUntil(this.destroy))
        .subscribe({
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
  }

  getMessage(success: boolean = false): string {
    if (success)
      return `User "${this.firstName?.value} ${this.lastName?.value}" (ID: ${this.id?.value}) created successfully.`;

    return `Failed to create user "${this.firstName?.value} ${this.lastName?.value}" (ID: ${this.id?.value}).`
  }

  toggleShowTeams(): void {
    console.log(this.role?.value);
    this.showTeams = isTmOrPm(this.role?.value) ?? false;
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

  set lastName(lastName: string) {
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

  fillForm(event: SingleActionWithEntity) {
    this.setSingleAction(event);
    const mode = this.singleAction.action;

    this.mode = mode === Mode.CREATE ? 'Create' : (mode === Mode.EDIT ? 'Edit' : 'View');

    const user = (this.singleAction.entity ?? null) as UserRow | null;

    this.form.reset();
    this.form.enable();

    this.form.patchValue({
      id: user?.id ?? '',
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      role: user?.role ?? '',
      teamId: user?.team?.id ?? ''
    });

    this.toggleShowTeams();

    if (mode !== Mode.CREATE && !user)
      this.toggleShowMessages('An unexpected error occurred. Unable to display user details.');

    const isTeamRole = isTmOrPm(user?.role ?? '') ?? false;

    this.chosenTeam = isTeamRole
      ? { id: user?.team?.id ?? '', name: user?.team?.name ?? '' }
      : { id: '', name: '' };

    if (mode === Mode.EDIT)
      this.id?.disable();

    if (!this.formHelper.isSubmittable(this.singleAction))
      this.form.disable();

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  protected readonly getRoleName = getRoleName;
  protected readonly VALID_ROLES = VALID_ROLES;

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  protected readonly Mode = Mode;
}
