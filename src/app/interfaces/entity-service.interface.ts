import {DataTableColumn} from './data-table-column.interface';
import {HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseTableData} from './base-table-data.interface';

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export interface EntityService {
  constructHttpParams(dataTableColumns: DataTableColumn[], searchText?: string, pageNumber?: number): { params: HttpParams };
  constructHttpHeaders(token: string) : { headers: HttpHeaders };
  getDataTableColumnDefinition(dataTableColumns: DataTableColumn[], key: string): DataTableColumn | undefined;
  getPage(dataTableColumns: DataTableColumn[], searchText?: string, pageNumber?: number) : Observable<Object> | undefined ;
  createInstance(body: object) : Observable<Object> | undefined;
  isValidResponse<T>(data: any): data is PagedResponse<T>;
  set entity(value: string);
  get entity(): string;
  getEntryValue(key: string, entry: BaseTableData): string;
}
