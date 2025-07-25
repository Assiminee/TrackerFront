import {DataTableColumn} from './data-table-column.interface';
import {HttpHeaders, HttpParams} from '@angular/common/http';

export interface EntityService {
  constructHttpParams(dataTableColumns: DataTableColumn[], searchText?: string, pageNumber?: number): { params: HttpParams };
  constructHttpHeaders(token: string) : { headers: HttpHeaders };
  getDataTableColumnDefinition(dataTableColumns: DataTableColumn[], key: string): DataTableColumn | undefined;
  getPage(dataTableColumns: DataTableColumn[], dataSetter: Function, searchText?: string, pageNumber?: number) : void;
}
