import {Injectable} from '@angular/core';
import {BaseEntityService} from './base-entity.service';
import {HttpClient} from '@angular/common/http';
import {entityNames} from '../core/utils/globals';
import {BaseTableData} from '../interfaces/base-table-data.interface';
import {isUserInfo} from '../models/user-info.interface';
import {Report} from '../models/report/base/report.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends BaseEntityService {
  constructor(client: HttpClient) {
    super(client);
    this.entity = entityNames.report;
  }

  isOwner(key: string, entry: BaseTableData): boolean {
    return (
      key === 'owner' &&
      entry.hasOwnProperty(key) &&
      isUserInfo(entry[key])
    )
  }

  formatForDelete(data: BaseTableData[], ids: string[]): { [p: string]: any }[] {
    return (data as Report[]).map(rep => {
      return {
        Title: rep.name,
        Creator: rep.owner.firstName + " " + rep.owner.lastName,
        'Sheet Count': rep.sheetCount,
      }
    });
  }

  getEntryValue(key: string, entry: BaseTableData): string {
    if (this.isOwner(key, entry))
      return entry[key].firstName + ' ' + entry[key].lastName;

    return entry[key];
  }
}
