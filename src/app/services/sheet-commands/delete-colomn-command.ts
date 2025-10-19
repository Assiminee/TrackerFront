import {Command} from './command.interface';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';
import {GridCell} from '../../core/utils/sheet-map.types';
import {Column} from '../../models/report/shared/column.interface';
import {Table} from '../../models/report/shared/table.interface';
import {Sheet} from '../../models/report/shared/sheet.interface';
import {Operation, Orientation, ShiftParameters, SourceTarget} from './shift-parameters.interface';
import {shiftGridCells} from './column-management-helpers';

type SheetEntities = [Sheet, Table | undefined, Column | undefined];

export class DeleteColumnCommand implements Command {
  private table: Table | null = null;
  private column: Column | null = null;

  constructor(private component: SheetTemplatesComponent, private gridCell: GridCell) {}

  execute(): boolean {
    this.component.setClickedCell(-1, -1);
    const [sheet, table, column] = this.getEntities();

    if (!table || !column) return false;

    if (table.columns.length === 1) {
      this.table = table;
      if (!this.dropTable(sheet, table)) return false;

      this.component.elementsToDelete.tableIds.add(table.id);
    } else {
      this.column = column;
      if (!this.dropColumn(table, column)) return false;

      const shiftParameters : ShiftParameters = {
        actionTrigger: SourceTarget.Column,
        actionTarget: SourceTarget.Column,
        operation: Operation.REMOVE,
        orientation: Orientation.ToTheLeft
      }

      if (!this.component.elementsToDelete.columnIds[table.id])
        this.component.elementsToDelete.columnIds[table.id] = new Set<string>();

      this.component.elementsToDelete.columnIds[table.id].add(column.id);

      shiftGridCells(table, column, shiftParameters);
    }

    this.component.resetMap();
    this.component.redoCommands = [];
    this.component.markUnsaved();
    return true;
  }

  undo(): boolean {
    const [sheet, table, _] = this.getEntities();

    if (table && this.column !== null) {
      const shiftParameters : ShiftParameters = {
        actionTrigger: SourceTarget.Column,
        actionTarget: SourceTarget.Column,
        operation: Operation.ADD,
        orientation: Orientation.ToTheLeft
      }

      shiftGridCells(table, this.column, shiftParameters);
      table.columns.push(this.column);

      this.component.elementsToDelete.columnIds[table.id].delete(this.column.id);
    } else if (this.table !== null) {
      sheet.tables.push(this.table);
      this.component.elementsToDelete.tableIds.delete(this.table.id);
    }

    this.component.resetMap();
    this.component.markUnsaved(false);
    return true;
  }

  redo(): boolean {
    const [sheet, table, column] = this.getEntities();

    if (!table || !column) return false;

    if (this.column !== null) {
      if (!this.dropColumn(table, column)) return false;

      const shiftParameters : ShiftParameters = {
        actionTrigger: SourceTarget.Column,
        actionTarget: SourceTarget.Column,
        operation: Operation.REMOVE,
        orientation: Orientation.ToTheLeft
      }

      shiftGridCells(table, column, shiftParameters);
      this.component.elementsToDelete.columnIds[table.id].add(column.id);
    }
    else if (this.table !== null) {
      if (!this.dropTable(sheet, table)) return false;
      this.component.elementsToDelete.tableIds.add(table.id);
    }

    this.component.resetMap();
    this.component.markUnsaved();
    return true;
  }

  dropColumn(table: Table, column: Column): boolean {
    const index = table.columns
      .findIndex(c => c.id.toLowerCase() === column.id.toLowerCase());

    if (index === -1) return false;

    table.columns.splice(index, 1);
    return true;
  }

  dropTable(sheet: Sheet, table: Table): boolean {
    const index = sheet.tables
      .findIndex(t => t.id.toLowerCase() === table.id.toLowerCase());

    if (index === -1) return false;

    sheet.tables.splice(index, 1);
    return true;
  }

  getEntities() : SheetEntities {
    const sheetId = this.component.currentSheetTemplateId;
    const sheet = this.component.sheetTemplateStorage[sheetId];
    const table = sheet.tables
      .find(t => t.id.toLowerCase() === this.gridCell.tableId?.toLowerCase());

    const column = table?.columns
      .find(c => c.id.toLowerCase() === this.gridCell.id.toLowerCase());

    return [sheet, table, column];
  }
}
