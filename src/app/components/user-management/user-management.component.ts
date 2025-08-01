import {Component, OnInit, OnDestroy, signal, WritableSignal} from '@angular/core';
import {DataManagementComponent} from '../data-management/data-management.component';
import {Team} from '../../interfaces/team.interface';
import {DataTableColumn} from '../../interfaces/data-table-column.interface';
import {UserService} from '../../services/user.service';
import {TeamService} from '../../services/team.service';
import {FormControl, FormGroup, Validators, ValidatorFn, AbstractControl, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from '@angular/common';
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

@Component({
    selector: 'app-user-management',
    imports: [
        DataManagementComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './user-management.component.html',
    standalone: true,
    styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit, OnDestroy {
    thead!: WritableSignal<DataTableColumn[]>;
    entity: string;
    chosenTeam: { name: string, id: string };
    roleOptions = [
        {value: 'ROLE_SA', name: 'Administrator'},
        {value: 'ROLE_PM', name: 'Project Manager'},
        {value: 'ROLE_TM', name: 'Team Member'}
    ];
    validRoles: string[];
    createUserForm: FormGroup;
    teams: Team[] = [];
    searchTeam: FormControl = new FormControl('');
    loading: boolean = false;
    error: string | null = null;
    destroy: Subject<void> = new Subject<void>();
    isInvalid: Function;

    constructor(protected userService: UserService, private teamService: TeamService, formHelper: FormHelperService) {
        this.thead = this.getWritableSignal();
        this.entity = 'user';
        this.createUserForm = this.createFormGroup();
        this.validRoles = ['ROLE_SA', 'ROLE_PM', 'ROLE_TM'];
        this.teamService.getPage()?.subscribe({
            next: data => {
                if (this.teamService.isValidResponse(data))
                    this.teams = data.content as Team[];

                console.log(this.teams);
            },
            error: err => {
                console.log(err);
            }
        });
        this.chosenTeam = {name: '', id: ''};
        this.isInvalid = formHelper.isInvalid;
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
                    ROLE_PM: 'text-blue-600 bg-blue-50 rounded-lg',
                    ROLE_TM: 'text-orange-600 bg-orange-50 rounded-lg',
                    ROLE_SA: 'text-purple-600 bg-purple-50 rounded-lg'
                }, queryParamName: 'role'
            },
            {
                key: 'deleted', title: 'Account Status', isFlag: true, badge: true, customCssClass: {
                    'true': 'text-red-600 bg-red-50 rounded-lg',
                    'false': 'text-green-600 bg-green-50 rounded-lg'
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
            team: new FormControl('', [Validators.required])
        })
    }

    roleValidator(): ValidatorFn {
        return (control: AbstractControl) => {
            const value = control.value.toUpperCase();

            if (!value)
                return null;

            return this.validRoles.includes(value) ? null : {invalidRole: true};
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
        this.createUserForm.controls['team'].setValue(this.chosenTeamId);
        console.log(this.createUserForm.controls['team'].value)
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
                this.loading = true;
                this.error = null;
            }),

            // 6. switchMap: maps the incoming query string into an HTTP observable.
            //    If a new query comes before the prior one completes, it cancels the previous request.
            switchMap((v: string) => {
                const observable = this.teamService.getPage([], v);

                if (observable === undefined) {
                    this.error = 'Search failed. Please try again later';
                    this.loading = false; // no request is pending, so stop loading indicator
                    return of([]); // return a safe empty observable so the stream continues
                }

                return observable.pipe(
                    catchError(err => {
                        console.log(err);
                        this.error = 'Search failed. Please try again later';
                        return of([]);
                    }),

                    // finalize: always run when the inner observable completes or errors
                    // turns off the loading indicator regardless of success or failure
                    finalize(() => {
                        this.loading = false;
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
        console.log(`Is form valid? ${this.createUserForm.valid}`);
        if (!this.createUserForm.valid) {
            Object.entries(this.createUserForm.controls).forEach(([name, control]) => {
                if (control.invalid) {
                    console.log(`Control "${name}" is invalid. Errors:`, control.errors);
                }
            });
            console.log('Form is invalid. Errors:');
            const errs = this.createUserForm.errors ?? {};
            console.log(this.createUserForm.errors);
            this.createUserForm.markAllAsTouched();

            for (const err of Object.keys(errs)) {
                console.log(`Error code: ${err} ----- Error: ${errs[err]}`);
            }
        }

        const controls = this.createUserForm.controls;

        for (const key of Object.keys(controls)) {
            let value;

            value = controls[key].value;

            console.log(`Control name: ${key} --------- Control Value: ${value}`);
        }
    }

    // Getters
    get id() : AbstractControl | null {
        return this.createUserForm.controls['id'];
    }

    get firstName() : AbstractControl | null {
        return this.createUserForm.controls['firstName'];
    }

    get lastName() : AbstractControl | null {
        return this.createUserForm.controls['lastName'];
    }

    get email() : AbstractControl | null {
        return this.createUserForm.controls['email'];
    }

    get phoneNumber() : AbstractControl | null {
        return this.createUserForm.controls['phoneNumber'];
    }

    get role() : AbstractControl | null {
        return this.createUserForm.controls['role'];
    }

    get team() : AbstractControl | null {
        return this.createUserForm.controls['team'];
    }
}
