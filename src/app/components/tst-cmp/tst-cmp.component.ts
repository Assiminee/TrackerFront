import { Component } from '@angular/core';
import {MainComponent} from '../main/main.component';
import {TableComponent} from '../table/table.component';
import {PreviewComponent} from '../preview/preview.component';
import {Table} from '../../interfaces/table.interface';

@Component({
  selector: 'app-tst-cmp',
  imports: [
    MainComponent,
    TableComponent,
    PreviewComponent,
  ],
  templateUrl: './tst-cmp.component.html',
  styleUrl: './tst-cmp.component.css'
})
export class TstCmpComponent {
  tables : Table[] = [
    {
      report_id: '',
      report_name: 'Report name placeholder',
      sheet_id: '',
      sheet_name: 'Sheet name placeholder',
      table_id: '',
      createdAt: null,
      updatedAt: new Date(2025, 6, 1),
      rowCount: 159,
      colCount: 4,
      cols: [{ name: '', subCols: []}],
      row: {
        id: '', createdAt: new Date(), updatedAt: new Date(), editor: {
          userId: '', firstName: '', lastName: ''
        }
      },
    }
  ];
}
