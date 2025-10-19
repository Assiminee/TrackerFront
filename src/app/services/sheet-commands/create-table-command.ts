import {Command} from './command.interface';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';
import {createBlankTable, mapSheet} from '../../core/utils/sheet-utils';
import {Table} from '../../models/report/shared/table.interface';
import {Sheet} from '../../models/report/shared/sheet.interface';

export class CreateTableCommand implements Command {
  private table!: Table

  constructor(private component: SheetTemplatesComponent) {}

  execute(): boolean {
    const selection = this.component.selection;

    if (!selection) return false;

    const existingTable = this.component.sheetTemplateStorage[this.component.currentSheetTemplateId].tables
      .find(table => {
        const rowOverlap = (selection.startRow <= table.endingRow + 2 && selection.endRow >= table.startingRow);
        const columnOverlap = (selection.startCol <= table.endingColumn + 2 && selection.endCol >= table.startingColumn);

        return rowOverlap && columnOverlap;
      })

    if (existingTable) {
      alert("The zone selected overlaps with an existing table");
      return false;
    }

    const table = createBlankTable(
      this.component.currentSheetTemplateId,
      this.component.sheetMapDisplay,
      selection.startCol,
      selection.endCol,
      selection.startRow,
      selection.endRow,
      this.component.hasSubCols.value,
      this.component.sheetTemplateStorage[this.component.currentSheetTemplateId].tables.length
    );

    this.component.sheetTemplateStorage[this.component.currentSheetTemplateId].tables.push(table);

    this.table = table;
    this.component.redoCommands = [];
    this.component.markUnsaved();
    return true;
  }

  undo(): boolean {
    let [sheetId, sheet] = this.getSheetEntities();
    const tableIndex = sheet.tables
      .findIndex(t => t.id.toLowerCase() === this.table.id.toLowerCase());

    if (tableIndex === -1) return false;

    sheet.tables.splice(tableIndex, 1);
    this.resetMap(sheetId, sheet);
    this.component.markUnsaved(false);
    return true;
  }

  redo(): boolean {
    let [sheetId, sheet] = this.getSheetEntities();
    sheet.tables.push(this.table);
    this.resetMap(sheetId, sheet);
    this.component.markUnsaved();
    return true;
  }

  resetMap(sheetId: string, sheet: Sheet): void {
    const mode = this.component.sheetMapDisplay.sheetInfo[sheetId].mode

    delete this.component.sheetMapDisplay.sheetInfo[sheetId];
    delete this.component.sheetMapDisplay.sheets[sheetId];
    this.component.sheetMapDisplay = mapSheet(sheet, mode, this.component.sheetMapDisplay);
  }

  getSheetEntities(): [string, Sheet] {
    return [
      this.component.currentSheetTemplateId,
      this.component.sheetTemplateStorage[this.component.currentSheetTemplateId]
    ];
  }
}
