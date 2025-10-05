import {Editor} from './editor.interface';
import {Cell} from '../shared/cell.interface';

export interface Row {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tableId: string;
  sheetId: string;
  editor: Editor;
  cells: Cell[];
}
