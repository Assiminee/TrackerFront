import {Command} from './command.interface';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';
import {StandaloneCell} from '../../models/report/shared/standalone-cell.interface';
import {v4 as uuidV4} from 'uuid';
import {GridCell} from '../../core/utils/sheet-map.types';
import {standaloneCellToGridCell} from '../../core/utils/sheet-utils';

export class CreateStandaloneCellCommand implements Command {
  constructor(
    private component: SheetTemplatesComponent,
    private currentValue: string | null,
    private i: number, private j: number
  ) {}

  execute(): boolean {
    if (this.currentValue === null) return false;

    const standaloneCell: StandaloneCell = {
      id: uuidV4(),
      rowIndex: this.i - 1,
      columnIndex: this.j - 1,
      standaloneCellValue: this.currentValue,
    }

    this.component.sheetTemplateStorage[this.component.currentSheetTemplateId].standaloneCells.push(standaloneCell);

    if (!this.component.sheetMapDisplay.sheets[this.component.currentSheetTemplateId][this.i])
      this.component.sheetMapDisplay.sheets[this.component.currentSheetTemplateId][this.i] = {};

    this.component.sheetMapDisplay.sheets[this.component.currentSheetTemplateId][this.i][this.j] = standaloneCellToGridCell(standaloneCell);

    this.component.redoCommands = [];
    this.component.markUnsaved();
    return true;
  }

  undo(): boolean {
    return false;
  }

  redo(): boolean {
    return false;
  }

  setCurrentValue(text: string | null): void {
    this.currentValue = text;
  }
}
