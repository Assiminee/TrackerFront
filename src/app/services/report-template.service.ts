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

@Injectable({
  providedIn: 'root'
})
export class ReportTemplateService extends BaseEntityService {

  constructor(client: HttpClient, private sheetTemplateService: SheetTemplateService) {
    super(client);
    this.entity = 'report-template';
  }

  formatForDelete(data: BaseTableData[], ids: string[]): { [p: string]: any }[] {
    return [];
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

    if (this.isTeam(key, entry))
      return entry[key].name;

    return entry[key];
  }

  navigateToSpreadsheets(router: Router, entity: BaseTableData) {
    const reportTemplate = entity as ReportTemplate;

    if (!reportTemplate.sheetTemplates.length) {
      router.navigate(['/spreadsheets'], {state: {reportTemplate: reportTemplate}});
      return;
    }

    this.sheetTemplateService.getSheetTemplate(reportTemplate.sheetTemplates[0].sheetTemplateId, reportTemplate.id)
      .pipe(take(1))
      .subscribe({
        next: data => {
          router.navigate(['/spreadsheets'], {state: {reportTemplate, firstSheetTemplate: data as Sheet}});
        },
        error: err => {
          console.log(err);
        }
      });
  }
}
