import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {MainComponent} from '../main/main.component';
import {ReportData} from '../../interfaces/report-data.interface';
import {DataManagementComponent} from '../data-management/data-management.component';
import {DataTableColumn} from '../../interfaces/data-table-column.interface';
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass} from '@angular/common';
import {entityNames, ROOT_URL} from '../../core/utils/globals';
import {AlertComponent} from '../alert/alert.component';
import {EntityManagement} from '../../interfaces/entity-management.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {TeamService} from '../../services/team.service';
import {FormHelperService} from '../../services/form-helper.service';
import {SingleActionWithEntity} from '../../models/single-action.type';
import {Mode} from '../../models/modes.enum';
import {ReportService} from '../../services/report.service';
import {InfiniteScrollDirective} from 'ngx-infinite-scroll';
import {getRoleName, VALID_ROLES} from '../../models/roles.enum';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize, of,
  Subject,
  switchMap,
  takeUntil,
  tap
} from 'rxjs';
import {ReportTemplate} from '../../models/report/templates/report-template.interface';
import {ReportTemplateService} from '../../services/report-template.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-report-management',
  imports: [MainComponent, DataManagementComponent, FormsModule, ReactiveFormsModule, NgClass, AlertComponent, InfiniteScrollDirective],
  templateUrl: './report-management.component.html',
  styleUrl: './report-management.component.css',
  standalone: true,
})
export class ReportManagementComponent extends EntityManagement implements OnInit, OnDestroy {
  protected mode: string = 'Create';
  protected showTemplates: boolean = true;
  protected chosenTemplate: { id: string, name: string } = {id: '', name: ''};
  protected searchTemplate: FormControl = new FormControl('');
  protected error: string | null = null;
  protected isLoading: boolean = false;
  private templatePage: number = 0;
  private destroy: Subject<void> = new Subject<void>();
  protected reportTemplates: ReportTemplate[] = [];
  data!: ReportData[];

  constructor(
    router: Router, route: ActivatedRoute, teamService: TeamService,
    formHelper: FormHelperService, protected reportService: ReportService,
    private reportTemplateService: ReportTemplateService
  ) {
    super(router, route, teamService, formHelper);

    this.thead = signal<DataTableColumn[]>([
      {key: 'name', title: 'Report Name', sortable: true, sortOrder: 'ASC', isEnabled: true},
      {
        key: 'createdAt',
        title: 'Creation Date',
        sortable: true,
        sortOrder: 'DESC',
        isDate: true,
        isEnabled: false,
        queryParamName: 'createdAt',
      },
      {
        key: 'updatedAt',
        title: 'Last Updated',
        sortable: true,
        sortOrder: 'DESC',
        isDate: true,
        isEnabled: false,
        queryParamName: 'updatedAt',
      },
      {
        key: 'owner',
        title: 'Created By',
        sortable: true,
        sortOrder: 'ASC',
        isEnabled: false,
        queryParamName: 'createdBy'
      },
      {key: 'sheetCount', title: 'Sheet Count'},
    ]);

    this.entity = entityNames.report;
    this.form = this.createForm();
    this.loadData();
  }


  ngOnInit(): void {
    this.searchTemplate.valueChanges.pipe(
      filter((v): v is string => typeof v === 'string'),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading = true;
        this.reportTemplates.length = 0;
        this.templatePage = 0;
        this.error = null;
      }),
      switchMap((v: string) => {
        return this.reportTemplateService.getPage(undefined, v, this.templatePage).pipe(
          catchError(err => {
            console.error(err);
            this.error = 'Search failed. Please try again later';
            return of([]);
          }),
          finalize(() => {
            this.isLoading = false;
          }));
      }),
      takeUntil(this.destroy)
    ).subscribe(data => {
      if (this.reportTemplateService.isValidResponse(data)) {
        this.reportTemplates = data.content as ReportTemplate[];

        if (this.reportTemplates.length === 0)
          this.error = 'No corresponding templates.';
      }
    });
  }

  loadData() {
    if (this.isLoading) return;

    this.isLoading = true;

    this.reportTemplateService.getPage(undefined, this.searchTemplate.value, this.templatePage)
      .pipe(
        takeUntil(this.destroy),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: data => {
          if (this.reportTemplateService.isValidResponse(data))
            this.reportTemplates = [...this.reportTemplates, ...(data.content as ReportTemplate[])];
        }, error: error => {
          console.log(error);
        }
      });
  }

  onScroll() {
    this.templatePage++;
    this.loadData();
  }

  get chosenTemplateId(): string {
    return this.chosenTemplate.id;
  }

  get chosenTemplateName(): string {
    return this.chosenTemplate.name;
  }

  set chosenTemplateName(value: string) {
    this.chosenTemplate.name = value;
  }

  set chosenTemplateId(value: string) {
    this.chosenTemplate.id = value;
  }

  fillForm(event: SingleActionWithEntity) {
    this.setSingleAction(event);
    const mode = this.singleAction.action;
    this.mode = mode === Mode.CREATE ? 'Create' : (mode === Mode.EDIT ? 'Edit' : 'View');
    this.form.enable();

    this.name.setValue(event.entity?.['name']);
    this.description.setValue(event.entity?.['description']);

    this.chosenTemplate = (mode === Mode.EDIT || mode === Mode.VIEW) ?
      {id: event.entity?.['templateId'], name: event.entity?.['templateName']} :
      {id: '', name: ''};

    this.templateId.setValue(event.entity?.['templateId']);

    if (!this.formHelper.isSubmittable(this.singleAction))
      this.form.disable();

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  createForm = () => {
    return new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]),
      description: new FormControl('', Validators.maxLength(500)),
      templateId: new FormControl('', Validators.required)
    })
  }

  get name(): AbstractControl {
    return this.form.controls['name'];
  }

  get description(): AbstractControl {
    return this.form.controls['description'];
  }

  get templateId(): AbstractControl {
    return this.form.controls['templateId'];
  }

  set templateId(value: string) {
    this.templateId.setValue(value);
  }

  onSubmit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.form.markAllAsDirty();
      return;
    }

    const body = {
      name: this.name.value,
      description: this.description.value,
      templateId: this.templateId.value
    };

    if (this.singleAction.action === Mode.CREATE) {
      this.toggleShowMessages('Creating report', 'Processing... Please wait.', true, true);
      this.reportService.createInstance(body)
        .pipe(takeUntil(this.destroy))
        .subscribe({
          next: (data) => {
            this.afterSubmit('Success', this.getMessage(true), {searchText: this.name?.value ?? ""}, false, true);
          },
          error: err => {
            this.afterSubmit('Failed', this.getMessage(), {}, false);
            const errResp = err as HttpErrorResponse;
            console.log(errResp)
            this.p2 += " " + errResp.error?.message;
          }
        });
    } else if (this.singleAction.action === Mode.EDIT) {
      this.toggleShowMessages('Editing report', 'Processing... Please wait.', true, true);
      const id = this.singleAction.entity?.id;
      this.reportService.editEntry(id ?? "", body)
        .pipe(takeUntil(this.destroy))
        .subscribe({
          next: (data) => {
            this.afterSubmit('Success', this.getMessage(true), {searchText: this.name?.value ?? ""}, false, true);
          },
          error: err => {
            this.afterSubmit('Failed', this.getMessage(), {}, false);
            const errResp = err as HttpErrorResponse;
            console.log(errResp)
            this.p2 += " " + errResp.error?.message;
          }
        });
    }
  }

  getMessage(success: boolean = false): string {
    const mode = this.singleAction.action;

    if (success) {
      if (mode === Mode.CREATE) {
        return `Report "${this.name?.value}" was created successfully using report template "${this.chosenTemplateName}".`;
      } else {
        return `Report "${this.name?.value}" was edited successfully.`;
      }
    }

    return `Failed to ${mode === Mode.CREATE ? 'create' : (mode === Mode.EDIT ? 'edit' : '')} report "${this.name?.value}"`;
  }

  protected readonly Mode = Mode;

  setChosenTemplate(id: string, name: string) {
    this.chosenTemplateName = name;
    this.chosenTemplateId = id;
    this.templateId.setValue(id);
  }


  protected readonly ROOT_URL = ROOT_URL;

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
