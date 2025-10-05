import {SubColumn} from './sub-column.interface';

export interface Column {
  id: string;
  columnName: string;
  columnIndex: number;
  subColumns: SubColumn[];
}
