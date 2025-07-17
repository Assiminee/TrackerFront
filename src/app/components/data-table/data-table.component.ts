import {Component, EventEmitter, Input, OnInit, Output, signal} from '@angular/core';
import {MatCheckbox} from "@angular/material/checkbox";
import {ReportCheckbox} from '../../interfaces/report-checkbox.interface';
import {ReportData} from '../../interfaces/report-data.interface';

@Component({
  selector: 'app-data-table',
    imports: [
        MatCheckbox
    ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent implements OnInit {
  readonly reportCheckboxes = signal<ReportCheckbox>(
    {name: 'all-rpt', selected: false}
  );
  @Input() reports: ReportData[] = [];
  @Output() menuOpenEvent: EventEmitter<string> = new EventEmitter<string>();
  @Input() openMenuIndex: string = "";

  constructor() {}

  ngOnInit(): void {
    this.initCheckboxSignal();
  }

  initCheckboxSignal() {
    const checkboxStates : ReportCheckbox[] = this.reports.map(
      (report: ReportData) => ({name: report.report_id, selected: false})
    );

    this.reportCheckboxes.set({
      name: this.reportCheckboxes.name,
      selected: false,
      subReports: checkboxStates,
    })
  }

  someUnchecked() {
    const reportCheckboxes = this.reportCheckboxes();
    if (!reportCheckboxes.subReports)
      return false;

    return reportCheckboxes.subReports.some(subReport => subReport.selected) &&
      !reportCheckboxes.subReports.every(subReport => subReport.selected);
  }

  update(selected: boolean, index?: number) {
    this.reportCheckboxes.update(repCheck => {
      // Parent is checked
      if (index === undefined) {
        // Sets everything (parent and children) to selected
        repCheck.selected = selected;
        repCheck.subReports?.forEach(r => (r.selected = selected));
      } else {
        // Sets the checked sub-report's "selected" property (based on the event)
        repCheck.subReports![index].selected = selected;
        // Sets the parent's "selected" property based on whether all sub-reports are checked or not
        repCheck.selected = repCheck.subReports?.every(r => r.selected) ?? true;
      }

      return {...repCheck};
    });
  }

  toggleMenu(menuIndex: string, event?: MouseEvent) {
    event?.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === menuIndex ? "" : menuIndex;
    this.menuOpenEvent.emit(this.openMenuIndex);
  }

  protected readonly String = String;
}
