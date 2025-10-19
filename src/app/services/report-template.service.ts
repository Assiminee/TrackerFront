import {Injectable} from '@angular/core';
import {BaseEntityService} from './base-entity.service';
import {BaseTableData} from '../interfaces/base-table-data.interface';
import {HttpClient} from '@angular/common/http';
import {isUserInfo} from '../models/user-info.interface';
import {isTeamInfo} from '../models/team-info.interface';
import {Router} from '@angular/router';
import {SheetTemplateService} from './sheet-template.service';
import {ReportTemplate} from '../models/report/templates/report-template.interface';
import {take} from 'rxjs';
import {Sheet} from '../models/report/shared/sheet.interface';
import {mapSheet} from '../core/utils/sheet-utils';
import {entityNames} from '../core/utils/globals';

@Injectable({
  providedIn: 'root'
})
export class ReportTemplateService extends BaseEntityService {

  constructor(client: HttpClient) {
    super(client);
    this.entity = entityNames.reportTemplate.replace(" ", "-");
  }

  formatForDelete(data: BaseTableData[], ids: string[]): { [p: string]: any }[] {
    return (data as ReportTemplate[]).filter(rt => ids.includes(rt.id))
      .map((r) => ({
        Title: r.name,
        Owner: r.owner.firstName + ' ' + r.owner.lastName,
        'Sheet Template Count': r.sheetTemplates.length
      }));
  }

  isOwner(key: string, entry: BaseTableData): boolean {
    return (
      key === 'owner' &&
      entry.hasOwnProperty(key) &&
      isUserInfo(entry[key])
    )
  }

  isTeam(key: string, entry: BaseTableData): boolean {
    return (
      key === 'team' &&
      entry.hasOwnProperty(key) &&
      isTeamInfo(entry[key])
    )
  }

  getEntryValue(key: string, entry: BaseTableData): string {
    if (this.isOwner(key, entry))
      return entry[key].firstName + ' ' + entry[key].lastName;

    return entry[key];
  }
}
