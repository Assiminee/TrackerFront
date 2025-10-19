import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input, OnDestroy,
  Output
} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass} from '@angular/common';
import {FormHelperService} from '../../../../services/form-helper.service';
import {ReportTemplateService} from '../../../../services/report-template.service';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-edit-modal',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.css'
})
export class EditModalComponent implements AfterContentInit, OnDestroy {
  @Input() showEditModal!: boolean;
  @Input() reportId!: string;
  @Input() reportName!: string;
  @Input() reportDescription!: string;
  @Output() reportNameChange = new EventEmitter<string>();
  @Output() reportDescriptionChange = new EventEmitter<string>();
  @Output() showEditModalChange = new EventEmitter<boolean>();
  private destroy: Subject<boolean> = new Subject();
  reportForm!: FormGroup;

  constructor(protected formHelper: FormHelperService,
              private reportTemplateService: ReportTemplateService
  ) {  }

  createForm() {
    return new FormGroup({
      name: new FormControl(this.reportName, [Validators.required, Validators.minLength(2), Validators.maxLength(200)]),
      description: new FormControl(this.reportDescription , Validators.maxLength(500)),
    })
  }

  onSubmit() {
    console.log(this.reportForm.valid)
    if (!this.reportForm.valid) {
      this.reportForm.markAllAsTouched();
      this.reportForm.markAllAsDirty();
      return;
    }

    this.reportTemplateService.editEntry(this.reportId, this.reportForm.value)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: result => {
          console.log(result);
          this.reportName = this.name.value;
          this.reportDescription = this.description.value;
          this.reportNameChange.emit(this.reportName);
          this.reportDescriptionChange.emit(this.reportDescription);
        },
        error: error => {
          console.log("Failed to edit report template information", error);
        }
      });

    this.dismiss()

  }

  get name(): AbstractControl {
    return this.reportForm.controls['name'];
  }

  get description(): AbstractControl {
    return this.reportForm.controls['description'];
  }

  dismiss() {
    this.showEditModalChange.emit(false);
  }

  ngAfterContentInit(): void {
    this.reportForm = this.createForm();
  }

  ngOnDestroy(): void {
    this.destroy.next(true);
    this.destroy.complete();
  }
}
