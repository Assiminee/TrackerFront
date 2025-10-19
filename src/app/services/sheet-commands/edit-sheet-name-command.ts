import {Command} from './command.interface';
import {SheetTemplatesComponent} from '../../components/sheet-templates/sheet-templates.component';
import {FormControl} from '@angular/forms';

export class EditSheetNameCommand implements Command {
  private oldName!: string;

  constructor(
    private component: SheetTemplatesComponent,
    private sheetNameFormControl: FormControl
  ) {
    this.oldName = this.sheetNameFormControl.value;
  }

  execute(): boolean {
    this.finalize();
    return true;
  }

  undo(): boolean {
    this.changeName();
    this.finalize(false);
    return true;
  }

  redo(): boolean {
    this.changeName();
    this.finalize();
    return false;
  }

  changeName() {
    const newName = this.sheetNameFormControl.value;
    this.sheetNameFormControl.setValue(this.oldName);
    this.component.sheetMapDisplay.sheetInfo[this.component.currentSheetTemplateId].name.setValue(this.oldName);
    this.oldName = newName;
  }

  finalize(change: boolean = true) {
    this.component.sheetTemplateStorage[this.component.currentSheetTemplateId].name = this.sheetNameFormControl.value;
    this.component.redoCommands = [];
    this.component.markUnsaved(change);
  }

  getOldName() {
    return this.oldName;
  }

  getCurrentSheetName() {
    return this.sheetNameFormControl.value;
  }
}
