import {BaseTableData} from './base-table-data.interface';

export interface ReportData extends BaseTableData {
  title: string;
  createdAt: Date;
  updatedAt: Date;
  creator: string;
}
