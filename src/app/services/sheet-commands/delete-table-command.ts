import {Command} from './command.interface';
import {Sheet} from '../../models/report/shared/sheet.interface';
import {Table} from '../../models/report/shared/table.interface';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';
import {GridCell, RowRecord} from '../../core/utils/sheet-map.types';
import {validate} from 'uuid';

type SheetEntities = [Sheet | undefined, Table | undefined];

export class DeleteTableCommand implements Command {
  private readonly table: Table | undefined;
  private readonly sheet: Sheet | undefined;
  private readonly map: RowRecord;

  constructor(private component: SheetTemplatesComponent, private gridCell: GridCell) {
    this.sheet = this.component.sheetTemplateStorage[this.component.currentSheetTemplateId];
    this.table = this.sheet.tables
      .find(table => table.id.toString() === this.gridCell.tableId?.toString());
    this.map = {};
  }

  execute(): boolean {
    this.component.setClickedCell(-1, -1);
    return this.deleteTable();
  }

  undo(): boolean {
    if (!this.sheet || !this.table) return false;

    this.sheet.tables.push(this.table);

    const map = this.component.sheetMapDisplay.sheets[this.component.currentSheetTemplateId];

    for (let i = this.table.startingColumn + 1; i <= this.table.endingRow + 1; i++) {
      if (!map[i]) map[i] = {};
      map[i] = {...map[i], ...this.map[i]};
    }

    this.component.redoCommands = [];
    this.component.markUnsaved(false);
    return true;
  }

  redo(): boolean {
    return this.deleteTable();
  }

  deleteTable(): boolean {
    if (!this.sheet || !this.table) return false;

    const table = this.table;

    const index = this.sheet.tables
      .findIndex(t => t.id.toString() === table.id);

    if (index === -1) return false;

    this.sheet.tables.splice(index, 1);
    const map = this.component.sheetMapDisplay.sheets[this.component.currentSheetTemplateId];

    for (let i = this.table.startingRow + 1; i <= this.table.endingRow + 1; i++) {
      if (!this.map[i]) this.map[i] = {};

      for (let j = this.table.startingColumn + 1; j <= this.table.endingColumn + 1; j++) {
        if (!this.map[i][j]) this.map[i][j] = {...map[i][j]};
        delete map[i][j];
      }
      if (Object.keys(map[i]).length === 0) delete map[i];
    }

    if (!validate(table.id))
      this.component.elementsToDelete.tableIds.add(this.table.id);

    console.log(this.component.elementsToDelete)

    this.component.redoCommands = [];
    this.component.markUnsaved();
    return true;
  }
}
