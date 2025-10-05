import {Column} from './column.interface';

export interface  Table {
  id: string;
  columns: Column[];
  startingRow: number;
  endingRow: number;
  startingColumn: number;
  endingColumn: number;
  hasSubColumns: boolean;
}
