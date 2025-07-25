import {
  Component,
  effect,
  HostListener,
  Input,
  OnInit,
  signal,
  WritableSignal
} from '@angular/core';
import {DataTableComponent} from "../data-table/data-table.component";
import {ListHeaderComponent} from "../list-header/list-header.component";
import {BaseTableData} from '../../interfaces/base-table-data.interface';
import {CreateEditModalComponent} from '../create-edit-modal/create-edit-modal.component';
import {DataTableColumn} from '../../interfaces/data-table-column.interface';
import {EntityService} from '../../interfaces/entity-service.interface';
import {ActivatedRoute, Params, Router} from '@angular/router';

@Component({
  selector: 'app-data-management',
  imports: [
    DataTableComponent,
    ListHeaderComponent,
    CreateEditModalComponent,
  ],
  templateUrl: './data-management.component.html',
  styleUrl: './data-management.component.css'
})
export class DataManagementComponent implements OnInit {
  @Input() data: BaseTableData[] = [];
  @Input() subTitle!: string;
  @Input() thead!: WritableSignal<DataTableColumn[]>;
  @Input() entity!: string;
  @Input() entityService!: EntityService;
  show: boolean = false;
  deleteSelected: boolean = false;
  deleteIds: string[] = [];

  isListDisplay = true;
  openOptionsMenu: boolean = false;

  openMenuIndex: string = "";

  pages!: number;
  currentPage: WritableSignal<number> = signal(1);
  totalElements!: number;
  searchText: string = "";

  constructor(private route: ActivatedRoute, private router: Router) {
    this.setQueryParamsFromSignal();
  }

  fetchData(): void {
    this.entityService.getPage(
      this.thead(), (
        totalPages: number,
        totalElements: number,
        data: BaseTableData[]
      ) => this.setData(totalPages, totalElements, data),
      this.searchText,
      this.currentPage() <= 0 ? 0 : this.currentPage() - 1,
    );
  }

  updateSignalFromURL() {
    this.route.queryParams.subscribe(params => {
      let pageNumber = params['page'];

      pageNumber = pageNumber !== undefined ? parseInt(pageNumber, 10) || 1 : 1;
      pageNumber = pageNumber < 1 ? 1 : pageNumber;

      if (pageNumber !== this.currentPage()) {
        console.log("Page number Change");
        this.currentPage.set(pageNumber);
      }

      this.searchText = params['searchText'] ?? "";

      this.updateSignal(params);
    });
  }

  changeQueryParams() {
    let params: Record<string, any> = {page: this.currentPage(), searchText: this.searchText.trim()};

    for (const col of this.thead()) {
      if (col.sortable)
        params[col.queryParamName!] = col.isEnabled ? col.sortOrder : null;

      if (col.isFlag)
        params[col.queryParamName!] = col.filterBy;
    }

    console.log(params)

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

      console.log(`Page change detected: ${page}`);

      if (page > this.pages)
        this.currentPage.set(this.pages);

      this.changeQueryParams();

      this.fetchData();
    })

    effect(() => {
      const cols = this.thead();
      console.log(`Column signal change detected: ${cols}`);
      this.currentPage.set(1);
    })
    // effect(() => {
    //   if (this.currentPage() > this.pages) {
    //     console.log("Page number Change");
    //     this.currentPage.set(this.pages);
    //   }
    //
    //   let params: Record<string, any> = {page: this.currentPage(), searchText: this.searchText.trim()};
    //
    //   for (const col of this.thead()) {
    //     if (col.sortable)
    //       params[col.queryParamName!] = col.isEnabled ? col.sortOrder : null;
    //
    //     if (col.isFlag)
    //       params[col.queryParamName!] = col.filterBy;
    //   }
    //
    //   console.log(params)
    //
    //   this.router.navigate([], {
    //     relativeTo: this.route,
    //     queryParams: params,
    //     queryParamsHandling: 'merge',
    //     replaceUrl: true
    //   });
    //
    //   this.fetchData();
    // });
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
    console.log("Page number Change");
  }

  nextPage() {
    if (this.currentPage() === this.pages)
      return;

    this.currentPage.set(this.currentPage() + 1);
    console.log("Page number Change");
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
      return;

    this.thead.set(cols);
  }
}
