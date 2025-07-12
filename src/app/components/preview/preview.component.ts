import { Component, Input } from '@angular/core';
import {Table} from "../../interfaces/table.interface";
import {TableComponent} from "../table/table.component";

@Component({
  selector: 'app-preview',
  imports: [TableComponent],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css'
})
export class PreviewComponent {
  @Input() table: Table = {
    report_id: '',
    report_name: '',
    sheet_id: '',
    sheet_name: '',
    table_id: '',
    createdAt: null,
    updatedAt: null,
    rowCount: 0,
    colCount: 0,
    cols: [{ name: ''}],
    row: {
      id: '', createdAt: new Date(), updatedAt: new Date(), editor: {
        userId: '', firstName: '', lastName: ''
      }
    },
  };

  last_edited: string = "";

  ngOnInit() {
    if (this.table.updatedAt === null)
      return;

    const today = new Date();

    const years = today.getFullYear() - this.table.updatedAt.getFullYear();
    if (this.lastEdited(years, "year") > 0)
      return;

    const months = today.getMonth() - this.table.updatedAt.getMonth();
    if (this.lastEdited(months, "month") > 0)
      return;

    const diffMs = today.getTime() - this.table.updatedAt.getTime();
    const MS_IN_SECOND = 1_000;
    const MS_IN_MINUTE = 60 * MS_IN_SECOND;
    const MS_IN_HOUR = 60 * MS_IN_MINUTE;
    const MS_IN_DAY = 24 * MS_IN_HOUR;

    const days = Math.floor(diffMs / MS_IN_DAY);
    if (this.lastEdited(days, "day") > 0)
      return;

    const hours = Math.floor((diffMs % MS_IN_DAY) / MS_IN_HOUR);
    if (this.lastEdited(hours, "hour") > 0)
      return;

    const minutes  = Math.floor((diffMs % MS_IN_HOUR) / MS_IN_MINUTE);
    if (this.lastEdited(minutes, "minute") > 0)
      return;

    const seconds  = Math.floor((diffMs % MS_IN_MINUTE) / MS_IN_SECOND);
    if (this.lastEdited(seconds, "second") > 0)
      return;
  }

  lastEdited(time : number, unit: string) {
    if (time > 0)
      this.last_edited = time > 1 ? time + ` ${unit}s ago` : time + ` ${unit} ago`;

    return time;
  }
}
