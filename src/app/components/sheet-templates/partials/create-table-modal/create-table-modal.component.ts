import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from '@angular/common';
import {getLetter} from '../../../../core/utils/helpers';

@Component({
  selector: 'app-create-table-modal',
  imports: [
    FormsModule,
    NgClass,
    ReactiveFormsModule
  ],
  templateUrl: './create-table-modal.component.html',
  styleUrl: './create-table-modal.component.css'
})
export class CreateTableModalComponent {
  @Input() showDialog!: boolean;
  @Output() showDialogChange = new EventEmitter<boolean>();
  @Input() selection: { startCol: number; endCol: number; startRow: number; endRow: number } | undefined
  hasSubCols : FormControl = new FormControl(false);
  @Output() hasSubColsChange = new EventEmitter<boolean>();
  @Output() confirmCreateTableEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  dismiss() {
    this.showDialogChange.emit(false);
  }

  displaySelection() {
    if (!this.selection)
      return "";

    return "[" + getLetter(this.selection.startCol) +
      " " + this.selection.startRow +
      ":" + getLetter(this.selection.endCol) +
      " " + this.selection.endRow + "]";
  }

  confirmCreateTable() {
    this.confirmCreateTableEmitter.emit(true);
    this.hasSubColsChange.emit(this.hasSubCols.value);
  }
}
