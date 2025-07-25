import {Component, ContentChild, EventEmitter, Input, Output} from '@angular/core';
import {FormGroupDirective, NgForm} from '@angular/forms';

@Component({
  selector: 'app-create-edit-modal',
  imports: [],
  templateUrl: './create-edit-modal.component.html',
  styleUrl: './create-edit-modal.component.css'
})
export class CreateEditModalComponent {
  @Input() show!: boolean;
  @Output() dismissModalEvent : EventEmitter<boolean> = new EventEmitter<boolean>();
  @ContentChild(FormGroupDirective, { static: false }) reactiveForm!: FormGroupDirective;

  dismiss() {
    this.show = false;
    console.log(this.show);
    this.dismissModalEvent.emit(this.show);
  }

  confirm() {
    this.submitForm();
    console.log("WELL????")
  }

  private submitForm() {
    if (this.reactiveForm) {
      this.reactiveForm.onSubmit(new Event('submit'));
    } else {
      console.warn("No reactive form found");
    }
  }
}
