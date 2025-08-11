import {DataTableColumn} from './data-table-column.interface';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseTableData} from './base-table-data.interface';

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last?: boolean;
  first?: boolean;
}

export interface EntityService {
  constructHttpParams(dataTableColumns: DataTableColumn[], searchText?: string, pageNumber?: number): { params: HttpParams };
  getDataTableColumnDefinition(dataTableColumns: DataTableColumn[], key: string): DataTableColumn | undefined;
  getPage(dataTableColumns: DataTableColumn[], searchText?: string, pageNumber?: number) : Observable<Object>;
  createInstance(body: object) : Observable<Object> | undefined;
  isValidResponse<T>(data: any): data is PagedResponse<T>;
  set entity(value: string);
  get entity(): string;
  getEntryValue(key: string, entry: BaseTableData): string;
  entitiesDeletable(entries: BaseTableData[]): boolean;
  formatForDelete(data: BaseTableData[], ids: string[]) : { [key: string]: any }[];
  deleteEntry(entryId: string, queryParams: {[key: string]: string}): Observable<Object>;
  deleteEntries(ids: string[], queryParams: {[key: string]: string}) : Observable<Object>;
  editEntry(id: string, entry: Object) : Observable<Object>;
}
