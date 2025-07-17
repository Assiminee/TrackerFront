import {Component, Input, OnInit} from '@angular/core';
import {Col} from "../../interfaces/col.interface";
import {Row} from '../../interfaces/row.interface';
import {TableDisplayService} from '../../services/table-display.service';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {
  @Input() rowCount: number = 150;
  @Input() cols: Col[] = [{
    name: 'editor', subCols: ['userId', 'firstName', 'lastName']
  }, {name: 'text'}, {
    name: 'oops',
    subCols: ['oopsie', 'oopsies']
  }];
  @Input() fullRow: Row = {
    id: '',
    editor: {
      userId: '1',
      firstName: 'Yasmine',
      lastName: 'Znatni'
    },
    createdAt: new Date(2024, 9, 11),
    updatedAt: new Date(2025, 4, 23),
    text: 'Hello',
    oops: {
      oopsie: true,
      oopsies: 12
    }
  };
  colsWithSubCols: Col[] = []
  row : any[] = [];

  constructor(private tableDisplayService: TableDisplayService) {}

  ngOnInit() {
    this.colsWithSubCols = this.tableDisplayService.getColsWithSubCols(this.cols);
    this.row = this.tableDisplayService.createRow(this.cols, this.fullRow);

    console.log(this.row);
  }
}
