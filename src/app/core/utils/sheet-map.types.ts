import {FormControl} from '@angular/forms';
import {Mode} from '../../models/modes.enum';

export type SheetId = string;
type ColumnIndex = number;
type RowIndex = number;
export type SheetInfo = {
  columnCount: number, rowCount: number,
  name: FormControl, isGeneratedInClient: boolean,
  isNameEditable: boolean, visits: number,
  mode: Mode.CREATE | Mode.EDIT, changes: number
};

export type GridRecord = Record<ColumnIndex, GridCell>;
export type RowRecord = Record<RowIndex, GridRecord>;

export interface SheetDisplayMap {
  sheetInfo: Record<SheetId, SheetInfo>
  sheets: Record<SheetId, RowRecord>;
}

export interface GridCell {
  id: string;

  tableId?: string;

  columnIndex: number;
  rowIndex: number;
  gridColumnIndex: number;
  gridRowIndex: number;

  isFirstColumn?: boolean;
  isLastColumn?: boolean;
  isFirstRow?: boolean;
  isLastRow?: boolean;

  isHeaderCell?: boolean;
  isSubHeaderCell?: boolean;
  isDataCell?: boolean;
  isStandaloneCell?: boolean;

  parentId?: string;
  childIds?: string[];

  columnId?: string;
  subColumnId?: string;

  content: FormControl;

  span?: number;

  isEditable: boolean;
}
