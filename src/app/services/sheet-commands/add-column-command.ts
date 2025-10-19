import {Command} from './command.interface';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';

export class AddColumnCommand implements Command {
  constructor(private component : SheetTemplatesComponent) {}

  execute(): boolean {
    this.addRemoveColumn();
    this.component.redoCommands = [];
    return true;
  }

  undo(): boolean {
    this.addRemoveColumn(false);
    return true;
  }

  redo(): boolean {
    this.addRemoveColumn();
    return true;
  }

  addRemoveColumn(add: boolean = true) {
    const increment = add ? 1 : -1;

    this.component.cols += increment;
    this.component.sheetMapDisplay.sheetInfo[this.component.currentSheetTemplateId].columnCount += increment;
    this.component.sheetTemplateStorage[this.component.currentSheetTemplateId].columnCount += increment;

    this.component.markUnsaved(add);
  }
}
