import {Injectable} from '@angular/core';
import {EntityService} from '../interfaces/entity-service.interface';
import {HttpHeaders, HttpParams} from '@angular/common/http';
import {DataTableColumn} from '../interfaces/data-table-column.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseEntityService implements EntityService {
  constructHttpHeaders(token: string): { headers: HttpHeaders } {
    return {headers: new HttpHeaders({Authorization: `Bearer ${token}`})};
  }

  getDataTableColumnDefinition(dataTableColumns: DataTableColumn[], key: string): DataTableColumn | undefined {
    return dataTableColumns.find(data => data.key === key);
  }

  abstract constructHttpParams(
    dataTableColumns: DataTableColumn[],
    searchText?: string,
    pageNumber?: number
  ): { params: HttpParams };

  abstract getPage(
    dataTableColumns: DataTableColumn[],
    dataSetter: Function,
    searchText?: string,
    pageNumber?: number
  ): void;
}
