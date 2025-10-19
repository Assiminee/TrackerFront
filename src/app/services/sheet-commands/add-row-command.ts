import {Command} from './command.interface';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';

export class AddRowCommand implements Command {
  constructor(private component: SheetTemplatesComponent) {
  }

  execute(): boolean {
   this.addRemoveRow();
    this.component.redoCommands = [];
    return true;
  }

  undo(): boolean {
   this.addRemoveRow(false);
    return true;
  }

  redo(): boolean {
    this.addRemoveRow();
    return true;
  }

  addRemoveRow(add: boolean = true) {
    const increment = add ? 1 : -1;

    this.component.rows += increment;
    this.component.sheetMapDisplay.sheetInfo[this.component.currentSheetTemplateId].rowCount += increment;
    this.component.sheetTemplateStorage[this.component.currentSheetTemplateId].rowCount += increment;

    this.component.markUnsaved(add);
  }
}
