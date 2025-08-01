import {AfterContentInit, Component, ContentChild, EventEmitter, Input, Output} from '@angular/core';
import {FormGroupDirective, NgForm} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-create-edit-modal',
  imports: [
    NgClass
  ],
  templateUrl: './create-edit-modal.component.html',
  styleUrl: './create-edit-modal.component.css'
})
export class CreateEditModalComponent implements AfterContentInit {
  @Input() show!: boolean;
  @Output() dismissModalEvent : EventEmitter<boolean> = new EventEmitter<boolean>();
  @ContentChild(FormGroupDirective, { static: true }) modalFormDir!: FormGroupDirective;

  ngAfterContentInit() {
  }

  dismiss() {
    this.show = false;
    this.dismissModalEvent.emit(this.show);
  }
}
