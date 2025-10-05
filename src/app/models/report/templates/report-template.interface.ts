import {PMInfo} from '../shared/pm-info.interface';
import {SheetInfo} from '../shared/sheet-info.interface';
import {BaseReport} from '../shared/base-report.interface';

export interface ReportTemplate extends BaseReport {
  sheetTemplates: SheetInfo[];
  sheetTemplatesCount: number;
}


