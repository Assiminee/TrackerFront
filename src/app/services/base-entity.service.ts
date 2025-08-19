import {Injectable} from '@angular/core';
import {EntityService, PagedResponse} from '../interfaces/entity-service.interface';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DataTableColumn} from '../interfaces/data-table-column.interface';
import {Observable, of, from, mergeMap, catchError, toArray} from 'rxjs';
import {BaseTableData} from '../interfaces/base-table-data.interface';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseEntityService implements EntityService {
  protected ROOT_URL : string = "http://localhost:8080/api/";

  protected constructor(private client: HttpClient) {}

  abstract getEntryValue(key: string, entry: BaseTableData): string;
  abstract formatForDelete(data: BaseTableData[], ids: string[]): { [key: string]: any }[] ;

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

  constructQueryParams(queryParams: { [key: string]: string }) : { params: HttpParams } {
    let params = new HttpParams();

    for (const key in queryParams)
      params = params.set(key, queryParams[key]);

    return {params: params};
  }

  getPage(dataTableColumns: DataTableColumn[] = [], searchText?: string, pageNumber?: number) : Observable<Object>{
    const params = this.constructHttpParams(dataTableColumns, searchText, pageNumber);

    return this.client.get(this.url, params)
  }

  createInstance(body: object) : Observable<Object> {
    return this.client.post(this.url, body);
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

  deleteEntry(entryId: string, queryParams: {[key: string]: string}): Observable<Object> {
    const params = this.constructQueryParams(queryParams);

    return this.client.delete(this.url + "/" + entryId, params);
  }

  deleteEntries(ids: string[], queryParams: {[key: string]: string}): Observable<Object> {
    const CONCURRENCY = 3; // Number of parallel calls to make

    // 1. Array of identifiers.
    //    from(ids) turns the array into an observable that emits each id one at a time, then completes.
    return from(ids).pipe(
      // 2. mergeMap(fn, CONCURRENCY)
      //    For each id emitted by `from(ids)`, call a function (performing an api call in this case.
      //    mergeMap will subscribe to up to 'CONCURRENCY' inner observables at once.
      //    When one completes, it will pick up the next id and launch another,
      //    so you never have more than CONCURRENCY pending HTTP calls.
      mergeMap(id => {
        return this.deleteEntry(id, queryParams).pipe(
          // 3. catchError: if this single HTTP call fails,
          //    log the error and emit `id` instead of letting the whole stream error out.
          catchError(err => {
            console.error(err);
            return of(id);
          })
        )}, CONCURRENCY
      ),
      // 4. toArray: wait until the outer `from(ids)` and all inner mergeMap observables complete.
      //    Then collect every emitted value (including those nulls on error) into one array and emit it once.
      toArray()
    );
  }

  editEntry(id: string, entry: Object): Observable<Object> {
    return this.client.put(this.url + '/' + id, entry);
  }

  entitiesDeletable(entries: BaseTableData[]): boolean {
    return entries.every(entry => entry?.['deleted'] === false);
  }
}
