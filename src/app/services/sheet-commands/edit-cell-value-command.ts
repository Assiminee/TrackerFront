import {Command} from './command.interface';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';
import {GridCell} from '../../core/utils/sheet-map.types';
import {Column} from '../../models/report/shared/column.interface';
import {Table} from '../../models/report/shared/table.interface';

type SheetEntities = [string, string | undefined, Table | undefined, Column | undefined];

export class EditCellValueCommand implements Command {
  private oldValue: string;
  private newValue: string | null;

  constructor(
    private component: SheetTemplatesComponent,
    private gridCell: GridCell
  ) {
    this.oldValue = gridCell.content.value;
    this.newValue = null;
  }

  execute(): boolean {
    this.newValue = this.gridCell.content.value;
    if (this.newValue === null) return false;

    if (this.gridCell.isStandaloneCell) {
      const standaloneCell = this.component.sheetTemplateStorage[this.component.currentSheetTemplateId].standaloneCells
        .find(sc => sc.id.toLowerCase() === this.gridCell.id.toLowerCase());

      if (!standaloneCell) return false;

      standaloneCell.standaloneCellValue = this.newValue;
    } else {
      const [_, columnId, table, column] = this.getSheetEntities();

      if (!columnId || !table || !column) return false;

      if (this.gridCell.isHeaderCell) {
        column.columnName = this.newValue;
      } else {
        const subCol = column.subColumns
          .find(subCol => subCol.id.toLowerCase() === this.gridCell.id.toLowerCase())

        if (!subCol) return false;

        subCol.name = this.newValue;
      }
    }

    this.component.redoCommands = [];
    this.component.markUnsaved();
    return true;
  }

  undo(): boolean {
    this.changeValue();
    this.component.markUnsaved(false)
    return true;
  }

  redo(): boolean {
    this.changeValue();
    this.component.markUnsaved()
    return true;
  }

  getSheetEntities() : SheetEntities {
    const sheetId = this.component.currentSheetTemplateId;
    const table = this.component.sheetTemplateStorage[sheetId]
      .tables.find(t => t.id.toLowerCase() === this.gridCell.tableId?.toLowerCase());

    const columnId = this.gridCell.isHeaderCell ? this.gridCell.id : this.gridCell.parentId;
    const column = table?.columns.find(col => {
      return col.id.toLowerCase() === columnId?.toLowerCase();
    });

    return [sheetId, columnId, table, column];
  }

  changeValue() : boolean {
    if (this.newValue === null) return false;

    const oldValue = this.oldValue;

    if (this.gridCell.isStandaloneCell) {
      this.component.sheetMapDisplay
        .sheets[this.component.currentSheetTemplateId][this.gridCell.gridRowIndex][this.gridCell.gridColumnIndex]
        .content.setValue(oldValue);

      const standaloneCell = this.component.sheetTemplateStorage[this.component.currentSheetTemplateId].standaloneCells
        .find(sc => sc.id.toLowerCase() === this.gridCell.id.toLowerCase());

      if (!standaloneCell) return false;

      standaloneCell.standaloneCellValue = this.newValue;
    } else {

      const [sheetId, columnId, table, column] = this.getSheetEntities();
      if (!columnId || !table || !column) return false;

      this.component.sheetMapDisplay
        .sheets[sheetId][this.gridCell.gridRowIndex][this.gridCell.gridColumnIndex]
        .content.setValue(oldValue);

      if (this.gridCell.isHeaderCell) {
        column.columnName = oldValue;
      } else {
        const subColumn = column.subColumns
          .find(subCol => subCol.id.toLowerCase() === this.gridCell.id.toLowerCase());
        if (!subColumn) return false;
        subColumn.name = oldValue;
      }
    }

    this.oldValue = this.newValue;
    this.newValue = oldValue;

    // this.component.setSelected(this.gridCell);
    return true;
  }

  getGridCellContent() {
    return this.gridCell.content.value;
  }

  getOldValue() {
    return this.oldValue;
  }
}
