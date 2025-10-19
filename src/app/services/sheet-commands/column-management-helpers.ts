import {Table} from '../../models/report/shared/table.interface';
import {Column} from '../../models/report/shared/column.interface';
import {Operation, Orientation, ShiftParameters} from './shift-parameters.interface';
import {GridCell, RowRecord} from '../../core/utils/sheet-map.types';
import {Sheet} from '../../models/report/shared/sheet.interface';

export function shiftGridCells(table: Table, column: Column, shiftParameters: ShiftParameters, newColumn?: Column) {
  const increment = shiftParameters.operation === Operation.ADD ? 1 : -1;
  table.endingColumn += increment;

  table.columns.forEach((col) => {
    const skip = (column.columnIndex > col.columnIndex) ||
      (
        shiftParameters.orientation === Orientation.ToTheRight &&
        column.id.toLowerCase() === col.id.toLowerCase() && newColumn
      )
    if (skip) return;

    col.subColumns.forEach((subColumn) => subColumn.subColumnIndex += increment);
    col.columnIndex += increment;
  })
}

export function isOverlapping(table: Table, sheetMap: RowRecord): boolean {
  for (let i = table.startingRow + 1; i <= table.endingRow + 1; i++) {
    const gc1: GridCell | undefined = sheetMap[i][table.endingColumn + 2];
    const gc2: GridCell | undefined = sheetMap[i][table.endingColumn + 3];

    if (
      (gc1 && gc1.tableId?.toLowerCase() !== table.id.toLowerCase()) ||
      (gc2 && gc2.tableId?.toLowerCase() !== table.id.toLowerCase())
    ) {
      return true;
    }
  }

  return false;
}

export function expandSheet(sheet: Sheet, table: Table, columnCount: number, rowCount: number) {
  if (table.endingColumn + 2 > columnCount)
    columnCount += 1;

  if (table.endingRow + 2 > rowCount)
    rowCount += 1;

  sheet.columnCount = columnCount;
  sheet.rowCount = rowCount;
}
