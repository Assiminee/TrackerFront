import {Component, Input, OnInit} from '@angular/core';
import {Table} from "../../interfaces/table.interface";
import {TableComponent} from "../table/table.component";
import {TableDisplayService} from '../../services/table-display.service';

@Component({
  selector: 'app-preview',
  imports: [TableComponent],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css'
})
export class PreviewComponent implements OnInit {
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
  link: string = "";

  constructor(private tableDisplayService: TableDisplayService) {
  }

  ngOnInit() {
    if (this.table.row.updatedAt === null)
      return;

    this.link = `/reports/${this.table.report_id}/sheets/${this.table.sheet_id}`;

    this.last_edited = this.tableDisplayService.calculateLastEdited(this.table) ?? "";
  }

  lastEdited(time : number, unit: string) {
    if (time > 0)
      this.last_edited = time > 1 ? time + ` ${unit}s ago` : time + ` ${unit} ago`;

    return time;
  }
}
