import {Command} from './command.interface';
import {GridCell} from '../../core/utils/sheet-map.types';
import {Column} from '../../models/report/shared/column.interface';
import {v4 as uuidV4} from 'uuid';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';
import {Table} from '../../models/report/shared/table.interface';
import {gridCellToColumn} from '../../core/utils/sheet-utils';
import {Operation, Orientation, ShiftParameters, SourceTarget} from './shift-parameters.interface';
import {expandSheet, isOverlapping, shiftGridCells} from './column-management-helpers';

type SheetEntities = [string, table: Table | undefined, column: Column | undefined];

export class CreateColumnCommand implements Command {
  constructor(private component: SheetTemplatesComponent, private gridCell: GridCell, private toTheLeft: boolean) {
  }

  execute(): boolean {
    this.component.setClickedCell(-1, -1);
    const [sheetId, table, column] = this.getSheetEntities();

    if (!table || !column) return false;

    const sheetMap = this.component.sheetMapDisplay.sheets[sheetId];

    if (isOverlapping(table, sheetMap)) {
      alert("Cannot add a new column to this table since there's a table adjacent to it");
      return false;
    }

    const sheet = this.component.sheetTemplateStorage[sheetId];
    expandSheet(sheet, table, this.component.cols, this.component.rows);
    this.component.cols = sheet.columnCount;
    this.component.rows = sheet.rowCount;

    const columnIndex = this.toTheLeft ?
      column.columnIndex :
      column.columnIndex + (column.subColumns.length || 1);

    const newColumn: Column = {
      id: uuidV4(),
      columnName: "Column " + (table.columns.length + 1),
      columnIndex: columnIndex,
      subColumns: []
    };

    const shiftParameters : ShiftParameters = {
      actionTrigger: SourceTarget.Column,
      actionTarget: SourceTarget.Column,
      operation: Operation.ADD,
      orientation: this.toTheLeft ? Orientation.ToTheLeft : Orientation.ToTheRight
    }

    shiftGridCells(table, column, shiftParameters, newColumn);

    table.columns.push(newColumn);
    this.component.resetMap();
    this.gridCell = this.component.sheetMapDisplay
      .sheets[sheetId][table.startingRow + 1][newColumn.columnIndex + 1];
    this.component.redoCommands = [];
    this.component.markUnsaved();
    return true;
  }

  undo(): boolean {
    const [_, table, column] = this.getSheetEntities();
    if (!table || !column) return false;

    const index = table.columns
      .findIndex(col => col.id.toLowerCase() === column.id.toLowerCase());

    if (index === -1) return false;

    table.columns.splice(index, 1);

    const shiftParameters : ShiftParameters = {
      actionTrigger: SourceTarget.Column,
      actionTarget: SourceTarget.Column,
      operation: Operation.REMOVE,
      orientation: Orientation.ToTheLeft
    }

    shiftGridCells(table, column, shiftParameters);
    this.component.resetMap();
    this.component.markUnsaved(false);
    return true;
  }

  redo(): boolean {
    const [_, table, __] = this.getSheetEntities();
    const column = gridCellToColumn(this.gridCell);

    if (!table) return false;

    const shiftParameters : ShiftParameters = {
      actionTrigger: SourceTarget.Column,
      actionTarget: SourceTarget.Column,
      operation: Operation.ADD,
      orientation: Orientation.ToTheLeft
    }

    shiftGridCells(table, column, shiftParameters);
    table.columns.push(column);
    this.component.resetMap();
    this.component.markUnsaved();
    return true;
  }

  getSheetEntities(): SheetEntities {
    const sheetId = this.component.currentSheetTemplateId;
    const table = this.component.sheetTemplateStorage[sheetId].tables
      .find(t => t.id.toLowerCase() === this.gridCell.tableId?.toLowerCase());
    const column = table?.columns
      .find(c => c.id.toLowerCase() === this.gridCell.id.toLowerCase());

    return [sheetId, table, column];
  }
}
