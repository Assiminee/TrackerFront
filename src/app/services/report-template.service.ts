import {Injectable} from '@angular/core';
import {BaseEntityService} from './base-entity.service';
import {BaseTableData} from '../interfaces/base-table-data.interface';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportTemplateService  extends BaseEntityService {

  constructor(client: HttpClient) {
    super(client);
    this.entity = 'report-template';
  }

  formatForDelete(data: BaseTableData[], ids: string[]): { [p: string]: any }[] {
    return [];
  }

  getEntryValue(key: string, entry: BaseTableData): string {
    return '';
  }
}
