// import {Component, EventEmitter, Input, Output} from '@angular/core';
// import {FormsModule} from "@angular/forms";
// import {NgClass} from '@angular/common';
//
// @Component({
//   selector: 'app-delete-sheet-modal',
//   imports: [
//     FormsModule,
//     NgClass
//   ],
//   templateUrl: './delete-sheet-modal.component.html',
//   styleUrl: './delete-sheet-modal.component.css'
// })
// export class DeleteSheetModalComponent {
//   @Input() show!: boolean;
//   @Output() showChange: EventEmitter<boolean> = new EventEmitter<boolean>();
//   @Input() sheetName: string | undefined;
//   @Output() deleteSheet: EventEmitter<boolean> = new EventEmitter<boolean>();
//
//   dismiss() {
//     this.show = false;
//     this.showChange.emit(false);
//     this.deleteSheet.emit(false);
//   }
//
//   confirmDeleteSheet() {
//     this.show = false;
//     this.showChange.emit(false);
//     this.deleteSheet.emit(true);
//   }
// }
