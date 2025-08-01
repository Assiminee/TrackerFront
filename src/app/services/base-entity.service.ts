import {Injectable} from '@angular/core';
import {EntityService, PagedResponse} from '../interfaces/entity-service.interface';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {DataTableColumn} from '../interfaces/data-table-column.interface';
import {Observable} from 'rxjs';
import {JwtDecoderService} from './jwt-decoder.service';
import {BaseTableData} from '../interfaces/base-table-data.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseEntityService implements EntityService {
  protected ROOT_URL : string = "http://localhost:8080/api/";

  constructor(private jwtDecoderService: JwtDecoderService, private client: HttpClient) {}

  constructHttpHeaders(token: string): { headers: HttpHeaders } {
    return {headers: new HttpHeaders({Authorization: `Bearer ${token}`})};
  }

  getDataTableColumnDefinition(dataTableColumns: DataTableColumn[], key: string): DataTableColumn | undefined {
    return dataTableColumns.find(data => data.key === key);
  }

  constructHttpParams(
    dataTableColumns: DataTableColumn[],
    searchText?: string,
    pageNumber?: number
  ): { params: HttpParams } {
    const sortCol = dataTableColumns.find(
      col => col.sortOrder !== undefined && col.isEnabled
    );

    const filterCols = dataTableColumns.filter(
      col => col.filterBy !== null && col.queryParamName !== undefined
    );

    let params = new HttpParams();

    for (const filterCol of filterCols) {
      if (filterCol.queryParamName === undefined || filterCol.filterBy === undefined || filterCol.filterBy === null)
        continue;

      params = params.set(filterCol.queryParamName, filterCol.filterBy);
    }

    if (sortCol !== undefined && sortCol?.queryParamName !== undefined)
      params = params.set(sortCol.queryParamName, sortCol.sortOrder === 'ASC');

    if (searchText !== undefined && searchText.trim().length > 0)
      params = params.set('searchText', searchText);

    params = params.set('page', pageNumber ?? 0);

    return {params: params};
  }

  getPage(dataTableColumns: DataTableColumn[] = [], searchText?: string, pageNumber?: number) : Observable<Object> | undefined {
    const token = this.jwtDecoderService.getToken();

    if (!token)
      return;

    const headers = this.constructHttpHeaders(token);
    const params = this.constructHttpParams(dataTableColumns, searchText, pageNumber);

    console.log(headers)
    console.log(params);

    return this.client.get(this.url, {...headers, ...params})
  }

  createInstance(body: object) : Observable<Object> | undefined {
    const token = this.jwtDecoderService.getToken();

    if (!token)
      return;

    const headers = this.constructHttpHeaders(token);

    return this.client.post(this.url, body, headers);
  }

  isValidResponse<T>(data: any): data is PagedResponse<T> {
    return (
      data !== null &&
      typeof data === 'object' &&
      'content' in data &&
      'totalPages' in data &&
      'totalElements' in data
    );
  }

  set entity(entity: string) {
    this.ROOT_URL += `${entity}s`;
  }

  get url(): string {
    return this.ROOT_URL;
  }

  abstract getEntryValue(key: string, entry: BaseTableData): string;
}
