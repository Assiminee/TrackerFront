import {Command} from './command.interface';
import {Sheet} from '../../models/report/shared/sheet.interface';
import {Table} from '../../models/report/shared/table.interface';
import {Column} from '../../models/report/shared/column.interface';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';
import {GridCell} from '../../core/utils/sheet-map.types';
import {SubColumn} from '../../models/report/shared/sub-column.interface';
import {getShiftParameters, shiftGridCells} from './sub-column-management-helpers';
import {Operation, ShiftParameters} from './shift-parameters.interface';
import {validate} from 'uuid';

type SheetEntities = [Sheet | undefined, Table | undefined, Column | undefined, SubColumn | undefined];

export class DeleteSubColumnCommand implements Command {
  private sheet: Sheet | undefined;
  private table: Table | undefined;
  private column: Column | undefined;
  private subColumn: SubColumn | undefined;

  constructor(private component: SheetTemplatesComponent, private gridCell: GridCell) {
    const [sheet, table, column, subColumn] = this.getSheetEntities();

    this.sheet = sheet;
    this.table = table;
    this.column = column;
    this.subColumn = subColumn;
  }
  execute(): boolean {
    this.component.setClickedCell(-1, -1);
    if (!this.sheet || !this.table || !this.column || !this.subColumn) return false;
    const subColumn = this.subColumn;

    const index = this.column.subColumns
      .findIndex(sc => sc.id.toLowerCase() === subColumn.id.toLowerCase());

    if (index === -1) return false;

    this.column.subColumns.splice(index, 1);
    const shiftParameters : ShiftParameters = getShiftParameters(Operation.REMOVE, true);
    shiftGridCells(this.table, this.column, shiftParameters, null, {...this.gridCell});

    let hasSubColumns = false;
    for (const col of this.table.columns) {
      if (col.subColumns.length > 0) {
        hasSubColumns = true;
        break;
      }
    }
    this.table.hasSubColumns = hasSubColumns;

    if (!validate(subColumn.id)) {
      if (!this.component.elementsToDelete.subColumnIds[this.table.id])
        this.component.elementsToDelete.subColumnIds[this.table.id] = {};

      if (!this.component.elementsToDelete.subColumnIds[this.table.id][this.column.id])
        this.component.elementsToDelete.subColumnIds[this.table.id][this.column.id] = new Set<string>();

      this.component.elementsToDelete.subColumnIds[this.table.id][this.column.id].add(subColumn.id);
    }

    this.component.resetMap();
    this.component.redoCommands = [];
    this.component.markUnsaved()
    return true;
  }

  undo(): boolean {
    if (!this.sheet || !this.table || !this.column || !this.subColumn) return false;

    const shiftParameters: ShiftParameters = getShiftParameters(Operation.ADD, true);
    shiftGridCells(this.table, this.column, shiftParameters, null, {...this.gridCell});
    this.column.subColumns.push(this.subColumn);
    this.table.hasSubColumns = true;

    if (!validate(this.subColumn.id))
      this.component.elementsToDelete.subColumnIds[this.table.id][this.column.id].delete(this.subColumn.id);

    this.component.resetMap();
    this.component.redoCommands = [];
    this.component.markUnsaved(false);
    return true;
  }

  redo(): boolean {
    if (!this.sheet || !this.table || !this.column || !this.subColumn) return false;

    const subColumn = this.subColumn;

    const index = this.column.subColumns
      .findIndex(sc => sc.id.toLowerCase() === subColumn.id.toLowerCase());

    if (index === -1) return false;

    this.column.subColumns.splice(index, 1);
    const shiftParameters : ShiftParameters = getShiftParameters(Operation.REMOVE, true);
    shiftGridCells(this.table, this.column, shiftParameters, null, {...this.gridCell});

    let hasSubColumns = false;
    for (const col of this.table.columns) {
      if (col.subColumns.length > 0) {
        hasSubColumns = true;
        break;
      }
    }
    this.table.hasSubColumns = hasSubColumns;

    if (!validate(this.subColumn.id))
      this.component.elementsToDelete.subColumnIds[this.table.id][this.column.id].add(this.subColumn.id);

    this.component.resetMap();
    this.component.redoCommands = [];
    this.component.markUnsaved();
    return true;
  }

  getSheetEntities() : SheetEntities {
    const sheet = this.component.sheetTemplateStorage[this.component.currentSheetTemplateId]
    const table = sheet.tables
      .find(table => table.id?.toLowerCase() === this.gridCell.tableId?.toLowerCase());
    const column = table?.columns
      .find(column => column.id?.toLowerCase() === this.gridCell.parentId?.toLowerCase());
    const subColumn = column?.subColumns
      .find(subColumn => subColumn.id?.toLowerCase() === this.gridCell.id?.toLowerCase());

    return [sheet, table, column, subColumn]
  }
}
