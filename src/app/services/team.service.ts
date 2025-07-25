import {Injectable} from '@angular/core';
import {JwtDecoderService} from './jwt-decoder.service';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {DataTableColumn} from '../interfaces/data-table-column.interface';
import {BaseEntityService} from './base-entity.service';

interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService extends BaseEntityService {
  ROOT_URL: string = "http://localhost:8080/api/teams";

  constructor(private jwtDecoderService: JwtDecoderService, private client: HttpClient) {
    super();
  }

  constructHttpParams(dataTableColumns: DataTableColumn[], searchText?: string, pageNumber?: number): {
    params: HttpParams
  } {
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

    // console.log(params);

    return {params: params};
  }

  getPage(dataTableColumns: DataTableColumn[], dataSetter: Function, searchText?: string, pageNumber?: number) {
    const token = this.jwtDecoderService.getToken();

    if (!token)
      return;

    const headers = this.constructHttpHeaders(token);
    const params = this.constructHttpParams(dataTableColumns, searchText, pageNumber);

    this.client.get(this.ROOT_URL, {...headers, ...params})
      .subscribe({
        next: (data) => {
          // console.log(data)
          if (!this.isValidResponse(data)) {
            dataSetter(0, 0, []);
            return;
          }

          dataSetter(data.totalPages, data.totalElements, data.content);
        },
        error: (err) => {
          console.log(err);
          dataSetter(0, 0, []);
        }
      });
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

  createTeam(name: string) {
    const token = this.jwtDecoderService.getToken();

    if (!token)
      return;

    const headers = this.constructHttpHeaders(token);

    this.client.post(this.ROOT_URL, {name: name}, headers)
      .subscribe({
        next: (resp) => {
          console.log(resp);
        },
        error: (err) => {
          console.log(err);
        }
      })
  }

}
