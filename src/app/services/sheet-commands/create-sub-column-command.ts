import {Command} from './command.interface';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';
import {SubColumn} from '../../models/report/shared/sub-column.interface';
import {gridCellToSubColumn, mapSheet} from '../../core/utils/sheet-utils';
import {GridCell} from '../../core/utils/sheet-map.types';
import {Table} from '../../models/report/shared/table.interface';
import {Column} from '../../models/report/shared/column.interface';
import {v4 as uuidV4} from 'uuid';
import {Operation, Orientation, ShiftParameters, SourceTarget} from './shift-parameters.interface';
import {expandSheet, isOverlapping} from './column-management-helpers';
import {getShiftParameters, shiftGridCells} from './sub-column-management-helpers';


type SheetEntities = [string, string | undefined, table: Table | undefined, column: Column | undefined]

export class CreateSubColumnCommand implements Command {

  constructor(private component: SheetTemplatesComponent, private gridCell: GridCell, private toTheLeft: boolean) {
  }

  execute(): boolean {
    this.component.setClickedCell(-1, -1);
    const [sheetId, columnId, table, column] = this.getSheetEntities();

    if (!table || !columnId || !column) return false;

    if (this.skipExecution(sheetId, table)) return false;

    const sheet = this.component.sheetTemplateStorage[sheetId];
    expandSheet(sheet, table, this.component.cols, this.component.rows);
    this.component.cols = sheet.columnCount;
    this.component.rows = sheet.rowCount;

    const shiftParameters: ShiftParameters = getShiftParameters(Operation.ADD, this.toTheLeft);
    shiftGridCells(table, column, shiftParameters, {...this.gridCell}, null);

    const subColumn: SubColumn = this.createSubColumn(this.gridCell, table, column, this.toTheLeft);

    const mode = this.component.sheetMapDisplay.sheetInfo[sheetId].mode
    this.component.sheetMapDisplay = mapSheet(
      this.component.sheetTemplateStorage[sheetId],
      mode, this.component.sheetMapDisplay
    );

    this.gridCell = this.component.sheetMapDisplay
      .sheets[sheetId][table.startingRow + 2][subColumn.subColumnIndex + 1];
    this.component.redoCommands = [];
    this.component.markUnsaved();
    return true;
  }

  undo(): boolean {
    const [_, __, table, column] = this.getSheetEntities();
    if (!table || !column) return false;

    const index = column.subColumns
      .findIndex(sc => sc.id.toLowerCase() === this.gridCell.id.toLowerCase());
    if (index === -1) return false;

    column.subColumns.splice(index, 1);

    const shiftParameters: ShiftParameters = getShiftParameters(Operation.REMOVE, this.toTheLeft);
    shiftGridCells(table, column, shiftParameters, null, {...this.gridCell});

    let hasSubCols = false;

    for (const col of table.columns) {
      if (col.subColumns.length > 0) {
        hasSubCols = true;
        break;
      }
    }

    table.hasSubColumns = hasSubCols;

    this.component.resetMap();
    this.component.markUnsaved(false);
    return true;
  }

  redo(): boolean {
    const [_, __, table, column] = this.getSheetEntities();

    if (!table || !column) return false;

    const subColumn = gridCellToSubColumn(this.gridCell);

    const shiftParameters: ShiftParameters = getShiftParameters(Operation.ADD, this.toTheLeft);
    shiftGridCells(table, column, shiftParameters, null, {...this.gridCell});

    column.subColumns.push(subColumn);

    table.hasSubColumns = true;
    this.component.resetMap();
    this.component.markUnsaved();
    return true;
  }

  getSheetEntities(): SheetEntities {
    const columnId = this.gridCell.isHeaderCell ? this.gridCell.id : this.gridCell.parentId;
    const sheetId = this.component.currentSheetTemplateId;

    const table = this.component.sheetTemplateStorage[sheetId].tables
      .find(table => table.id.toLowerCase() === this.gridCell.tableId?.toLowerCase());

    const column = table?.columns
      .find(col => col.id.toLowerCase() === columnId?.toLowerCase());

    return [sheetId, columnId, table, column];
  }

  createSubColumn(gridCell: GridCell, table: Table, column: Column, toTheLeft: boolean) {
    let subColumnIndex: number;

    if (gridCell.isSubHeaderCell) {
      if (column.subColumns.length === 0) subColumnIndex = column.columnIndex;
      else subColumnIndex = toTheLeft ? gridCell.columnIndex : gridCell.columnIndex + 1;
    } else {
      subColumnIndex = toTheLeft ? column.columnIndex : column.columnIndex + column.subColumns.length;
    }

    const subColumn: SubColumn = {
      id: uuidV4(),
      subColumnIndex: subColumnIndex,
      name: `Sub Column ${column.subColumns.length}`
    };

    table.hasSubColumns = true;
    column.subColumns.push(subColumn);

    return subColumn;
  }

  skipExecution(sheetId: string, table: Table): boolean {
    const sheetMap = this.component.sheetMapDisplay.sheets[sheetId];
    let parent: GridCell | undefined = this.gridCell.isSubHeaderCell ?
      sheetMap[this.gridCell.gridRowIndex - 1][this.gridCell.gridColumnIndex] :
      undefined;

    const skipOp = (
        this.gridCell.isHeaderCell === true &&
        this.gridCell.childIds !== undefined &&
        this.gridCell.childIds.length >= 1
      ) ||
      (
        parent !== undefined &&
        parent.childIds !== undefined &&
        parent.childIds.length >= 1
      )

    if (skipOp && isOverlapping(table, sheetMap)) {
      alert("Cannot add a new column since there's a table adjacent to it");
      return true;
    }

    return false;
  }
}
