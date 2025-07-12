import {Component, Input} from '@angular/core';
import {Col, ColWithSubCols} from "../../interfaces/col.interface";
import {Row} from '../../interfaces/row.interface';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @Input() rowCount: number = 150;
  @Input() cols: Col[] = [{name: 'editor', subCols: ['userId', 'firstName', 'lastName']}, {name: 'text'}, {
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

  ngOnInit() {
    this.colsWithSubCols = this.cols.filter((col: Col) => 'subCols' in col);
    console.log(this.colsWithSubCols);
    for (let col of this.cols) {
      console.log(col.name)
      console.log(this.fullRow[col.name]);
      if (!Object.hasOwn(this.fullRow, col.name)) {
        this.row.push('');
        continue;
      }

      if (this.hasSubCols(col)) {
        const embedded = this.fullRow[col.name] as Record<string, unknown>;
        console.log(embedded);
        console.log(col.name);

        for (let subCol of col.subCols)
          this.row.push(String(embedded[subCol] ?? ''))

        continue;
      }

      this.row.push(String(this.fullRow[col.name] ?? ''));
    }

    for (const val of this.row) {
      console.log(val)
    }
  }

  hasSubCols(col: Col) : col is ColWithSubCols {
    return Array.isArray(col.subCols);
  }
}
