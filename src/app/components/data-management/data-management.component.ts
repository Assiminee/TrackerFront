import {
  Component, ContentChild,
  effect, EventEmitter,
  HostListener,
  Input, OnChanges, OnDestroy,
  OnInit, Output,
  signal, SimpleChanges,
  WritableSignal
} from '@angular/core';
import {DataTableComponent} from "../data-table/data-table.component";
import {ListHeaderComponent} from "../list-header/list-header.component";
import {BaseTableData} from '../../interfaces/base-table-data.interface';
import {DataTableColumn} from '../../interfaces/data-table-column.interface';
import {EntityService} from '../../interfaces/entity-service.interface';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AlertComponent} from '../alert/alert.component';
import {NgClass} from '@angular/common';
import {FormGroupDirective} from '@angular/forms';
import {Mode} from '../../models/modes.enum';
import {SingleActionWithEntity, SingleActionWithId} from '../../models/single-action.type';
import {AuthService} from '../../services/auth.service';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-data-management',
  imports: [
    DataTableComponent,
    ListHeaderComponent,
    AlertComponent,
    NgClass
  ],
  templateUrl: './data-management.component.html',
  standalone: true,
  styleUrl: './data-management.component.css'
})
export class DataManagementComponent implements OnInit, OnChanges, OnDestroy {
  // Reference to the form in ng-content
  @ContentChild(FormGroupDirective, {static: true}) modalFormDir!: FormGroupDirective;

  // General information to display at the header
  @Input() subTitle!: string;
  @Input() entity!: string;

  // Service responsible for performing the various API requests
  @Input() entityService!: EntityService;

  // Signals to keep track and modify query and filter parameters
  @Input() thead!: WritableSignal<DataTableColumn[]>;
  currentPage: WritableSignal<number> = signal(1);
  searchText: WritableSignal<string> = signal("");

  // Responsible for showing a message after an API is called
  @Input() success!: boolean;
  @Input() showSuccess!: boolean;
  @Input() p1!: string;
  @Input() p2!: string;

  // Responsible for informing the parent element of what action is being performed on the data
  // entity: an instance of BaseTableData (Team, User, or Report) containing the actual entity
  // to perform an action on.
  // action: a number denoting what to do with the entity
  //   -1 => CREATE
  //    0 => DELETE
  //    1 => VIEW
  //    2 => EDIT
  //    3 => DOWNLOAD
  @Output() singleActionEmitter: EventEmitter<SingleActionWithEntity> = new EventEmitter<SingleActionWithEntity>();

  // Action to perform on a given entity (source: DataTableManagement component)
  singleAction: SingleActionWithId = {id: null, action: Mode.CREATE};

  // The data to display on the table
  data: BaseTableData[] = [];

  // Responsible for showing or hiding the modal
  show: boolean = false;

  // List of entity IDs to delete
  deleteIds: string[] = [];

  // Responsible for showing the delete component
  deleteOp: boolean = false;

  // Not yet used but eventually will be used to toggle between list and grid display
  isListDisplay = true;

  // Opens options menu at the top
  openOptionsMenu: boolean = false;

  // Shows delete warning
  showWarning: boolean = true;

  // Responsible for opening the options menu on each table row (the one clicked)
  openMenuIndex: string = "";

  // Total pages available to display
  pages!: number;

  // Total elements to display
  totalElements!: number;

  // Formatted data of the entities selected for deletion
  // to be displayed in a table
  formattedDataToDelete: { [key: string]: string }[] = [];
  destroy: Subject<void> = new Subject();

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService) {
    this.setQueryParamsFromSignal();
  }

  ngOnInit(): void {
    this.updateSignalFromURL();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showSuccess'] && !changes['showSuccess'].isFirstChange()) {
      this.showSuccess = changes['showSuccess'].currentValue;

      if (this.showSuccess)
        this.dismiss();
    }
  }

  fetchData(): void {
    this.entityService.getPage(
      this.thead(),
      this.searchText(),
      this.currentPage() <= 0 ? 0 : this.currentPage() - 1,
    ).pipe(takeUntil(this.destroy))
      .subscribe({
        next: (data) => {
          if (!this.entityService.isValidResponse(data)) {
            this.setData(1, 0, []);
            return;
          }

          this.setData(data.totalPages < 1 ? 1 : data.totalPages, data.totalElements, data.content as BaseTableData[]);
        },
        error: (err) => {
          this.setData(1, 0, []);
        }
      });
  }

  updateSignalFromURL() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy))
      .subscribe(params => {
        let pageNumber = params['page'];
        let searchText = params['searchText'] ?? "";

        pageNumber = pageNumber !== undefined ? parseInt(pageNumber, 10) || 1 : 1;
        pageNumber = pageNumber < 1 ? 1 : pageNumber;

        if (pageNumber !== this.currentPage())
          this.currentPage.set(pageNumber);

        if (searchText.trim() !== this.searchText())
          this.searchText.set(searchText);

        const cols = this.updateSignal(params);

        if (cols === null)
          return;

        this.thead.set(cols);
      });
  }

  changeQueryParams() {
    let params: Record<string, any> = {page: this.currentPage(), searchText: this.searchText()};

    for (const col of this.thead()) {
      if (col.sortable)
        params[col.queryParamName!] = col.isEnabled ? col.sortOrder : null;

      if (col.isFlag)
        params[col.queryParamName!] = col.filterBy;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  setQueryParamsFromSignal() {
    effect(() => {
      const page = this.currentPage();

      if (page > this.pages)
        this.currentPage.set(this.pages);

      this.changeQueryParams();

      this.fetchData();
    });

    effect(() => {
      const cols = this.thead();
      this.currentPage.set(1);
    });

    effect(() => {
      const searchText = this.searchText();
      this.currentPage.set(1);
    })
  }

  updateSignal(params: Params) {
    const cols: DataTableColumn[] = [];
    let changed = false;

    for (const col of this.thead()) {
      const val = params[col.queryParamName!];
      if (val === undefined) {
        if (col.sortable && col.isEnabled === true) {
          changed = true;
          col.isEnabled = true;
        }
      } else if (col.sortable) {
        if (col.sortOrder !== val) {
          col.sortOrder = val;
          changed = true;
        }

      } else if (col.isFlag) {
        if (col.filterBy !== val) {
          col.filterBy = val;
          changed = true;
        }
      }

      cols.push(col);
    }

    if (!changed)
      return null;

    return cols;
  }

  prevPage() {
    if (this.currentPage() <= 1)
      return;

    this.currentPage.set(this.currentPage() - 1);
  }

  nextPage() {
    if (this.currentPage() === this.pages)
      return;

    this.currentPage.set(this.currentPage() + 1);
  }

  showModal(open: boolean) {
    this.singleAction.id = null;
    this.singleAction.action = Mode.CREATE;
    this.singleActionEmitter.emit({entity: null, action: Mode.CREATE});
    this.show = open;
  }

  setData(totalPages: number, totalElements: number, data: BaseTableData[]) {
    this.data = data;
    this.pages = totalPages;
    this.totalElements = totalElements;

    if (this.currentPage() > this.pages)
      this.currentPage.set(this.pages);
  }

  changeDisplay(isList: boolean) {
    this.isListDisplay = isList;
  }

  toggleMenu(index: string) {
    this.openMenuIndex = index;
    this.openOptionsMenu = false;
  }

  @HostListener('document:click')
  closeAllMenus() {
    this.openMenuIndex = '';
    this.openOptionsMenu = false;
  }

  toggleOptions(open: boolean) {
    this.openOptionsMenu = open;
    this.openMenuIndex = '';
  }

  dismiss() {
    this.show = false;
    this.modalFormDir.resetForm();
    this.deleteOp = false;
    this.formattedDataToDelete = [];
  }

  idsToDelete(ids: string[]) {
    this.deleteIds.length = 0;

    for (const id of ids)
      this.deleteIds.push(id);
  }

  toggleDeletion(deleteEntities: boolean) {
    const p1 = 'Unable to perform a delete operation';

    if (this.deleteIds.length === 0) {
      this.afterOperation(p1, `No ${this.entity}s have been selected`);
      return;
    }

    if (this.entity === 'user') {
      const loggedInUser = this.authService.loggedInUser();
      const user = this.deleteIds.find(id => id === loggedInUser?.sub);

      if (user) {
        this.afterOperation(p1, `You've selected your own account for deletion. That action forbidden.`);
        return;
      }
    }

    const entities = this.data.filter(entity => this.deleteIds.includes(entity.id));

    if (!this.entityService.entitiesDeletable(entities)) {
      this.afterOperation(p1, `Some of the ${this.entity}s selected for deletion have already been deleted`);
      return;
    }

    this.show = true;
    this.formattedDataToDelete = this.entityService.formatForDelete(this.data, this.deleteIds)
    this.deleteOp = deleteEntities;
    this.showWarning = true;
  }

  getDeletionTh() {
    if (this.formattedDataToDelete.length < 1)
      return [];

    return Object.keys(this.formattedDataToDelete[0]);
  }

  deleteEntities() {
    const params = {forceDelete: 'true', mode: 'deactivate'};

    this.entityService.deleteEntries(this.deleteIds, params)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: resp => {
          this.afterOperation("The delete operation was a success", `The selected ${this.entity}(s) have been deleted successfully`, true);
        },
        error: err => {
          this.afterOperation('', `An error occurred while deleting the selected ${this.entity}(s). Please try again later`);
        }
      })
  }

  dismissWarning(show: boolean) {
    this.showWarning = show;
  }

  performSingleAction(event: SingleActionWithId) {
    this.singleAction = event;

    const entity = this.data.find(entry => entry.id === this.singleAction?.id);

    if (!entity || !this.singleAction)
      return;

    if (this.singleAction.action === Mode.DELETE) {
      if (this.singleAction?.id === null)
        return;

      this.idsToDelete([this.singleAction.id]);
      this.toggleDeletion(true);
      return;
    }

    this.singleActionEmitter.emit({entity: entity, action: this.singleAction.action})
    this.show = true;
  }

  afterOperation(p1: string, p2: string, success: boolean = false): void {
    this.success = success;
    this.p1 = p1;
    this.p2 = p2;
    this.dismiss();

    setTimeout(() => {
      this.showSuccess = false;
    }, 6000);

    this.showSuccess = true;

    if (success)
      this.router.navigate([], {relativeTo: this.route});
  }

  isSubmittable() {
    return this.singleAction && this.singleAction.action !== Mode.VIEW
  }

  patchEntity = (entity: BaseTableData) => {
    const entry = this.data.find(entry => entry.id.toUpperCase() === entity.id.toUpperCase())

    if (!entry)
      return;

    const index = this.data.indexOf(entry);

    if (index === -1)
      return;

    this.data[index] = entity;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
