import {
  Component, ContentChild,
  effect,
  HostListener,
  Input, OnChanges,
  OnInit,
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

@Component({
  selector: 'app-data-management',
  imports: [
    DataTableComponent,
    ListHeaderComponent,
    AlertComponent,
    NgClass,
  ],
  templateUrl: './data-management.component.html',
  standalone: true,
  styleUrl: './data-management.component.css'
})
export class DataManagementComponent implements OnInit, OnChanges {
  @Input() subTitle!: string;
  @Input() thead!: WritableSignal<DataTableColumn[]>;
  @Input() entity!: string;
  @Input() entityService!: EntityService;
  @Input() showSuccess!: boolean;
  @Input() msg!: string;

  data: BaseTableData[] = [];

  currentPage: WritableSignal<number> = signal(1);
  searchText: WritableSignal<string> = signal("");

  show: boolean = false;
  deleteSelected: boolean = false;
  deleteIds: string[] = [];
  isListDisplay = true;
  openOptionsMenu: boolean = false;
  openMenuIndex: string = "";
  pages!: number;
  totalElements!: number;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.setQueryParamsFromSignal();
  }

  fetchData(): void {
    const observable = this.entityService.getPage(
      this.thead(),
      this.searchText(),
      this.currentPage() <= 0 ? 0 : this.currentPage() - 1,
    );

    if (observable === undefined)
      return;

    observable.subscribe({
      next: (data) => {
        if (!this.entityService.isValidResponse(data)) {
          this.setData(0, 0, []);
          return;
        }

        this.setData(data.totalPages, data.totalElements, data.content as BaseTableData[]);
      },
      error: (err) => {
        console.log(err);
        this.setData(0, 0, []);
      }
    });
  }

  updateSignalFromURL() {
    this.route.queryParams.subscribe(params => {
      let pageNumber = params['page'];
      let searchText = params['searchText'] ?? "";

      pageNumber = pageNumber !== undefined ? parseInt(pageNumber, 10) || 1 : 1;
      pageNumber = pageNumber < 1 ? 1 : pageNumber;

      if (pageNumber !== this.currentPage()) {
        // console.log("Page number Change");
        this.currentPage.set(pageNumber);
      }

      if (searchText.trim() !== this.searchText()) {
        // console.log("searchText change", searchText);
        this.searchText.set(searchText);
      }

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

    // console.log(params)

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
      // console.log(`Column signal change detected: ${cols}`);
      this.currentPage.set(1);
    });

    effect(() => {
      const searchText = this.searchText();
      // console.log(`Search text change detected: ${searchText}`);
      this.currentPage.set(1);
    })
  }

  ngOnInit(): void {
    this.updateSignalFromURL();
  }

  idsToDelete(ids: string[]) {
    this.deleteIds.length = 0;

    for (const id of ids)
      this.deleteIds.push(id);
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

  toggleDeletion(deleteEntities: boolean) {
    console.log(deleteEntities);
    this.deleteSelected = deleteEntities;

    console.log('ids to delete in parent component', this.deleteIds);
    this.deleteIds.length = 0;
  }

  prevPage() {
    if (this.currentPage() <= 1)
      return;

    this.currentPage.set(this.currentPage() - 1);
    // console.log("Page number Change");
  }

  nextPage() {
    if (this.currentPage() === this.pages)
      return;

    this.currentPage.set(this.currentPage() + 1);
    // console.log("Page number Change");
  }

  showModal(open: boolean) {
    this.show = open;
  }

  setData(totalPages: number, totalElements: number, data: BaseTableData[]) {
    this.data = data;
    this.pages = totalPages;
    this.totalElements = totalElements;

    if (this.currentPage() > this.pages)
      this.currentPage.set(this.pages);
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

  @ContentChild(FormGroupDirective, {static: true}) modalFormDir!: FormGroupDirective;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showSuccess'] && !changes['showSuccess'].isFirstChange()) {
      this.showSuccess = changes['showSuccess'].currentValue;

      if (this.showSuccess)
        this.dismiss();
    }
  }

  dismiss() {
    this.show = false;
    this.modalFormDir.resetForm()
  }
}
