import {Col} from './col.interface';
import {Row} from './row.interface';

export interface PreviewTable {
  report_id: string;
  report_name: string;
  sheet_id: string;
  sheet_name: string;
  table_id: string;

  createdAt: Date | null;
  updatedAt: Date | null;
  rowCount: number;
  colCount: number;

  cols: Col[];

  rows: Row[];
}
