import {Table} from './table.interface';
import {StandaloneCell} from './standalone-cell.interface';

export interface Sheet {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  columnCount: number;
  rowCount: number;
  tables: Table[];
  standaloneCells: StandaloneCell[];
}
