import {Injectable, signal, WritableSignal} from '@angular/core';
import {Col, ColWithSubCols} from '../interfaces/col.interface';
import {Row} from '../interfaces/row.interface';
import {Table} from '../interfaces/table.interface';
import {TableRowCheckbox} from '../interfaces/table-row-checkbox.interface';
import {TemplatePortal} from '@angular/cdk/portal';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class TableDisplayService {

  constructor(private overlay: Overlay) { }

  hasSubCols(col: Col) : col is ColWithSubCols {
    return Array.isArray(col.subCols);
  }

  getColsWithSubCols(cols: Col[]) : Col[] {
    return cols.filter((col: Col) => 'subCols' in col && col.name !== 'editor')
  }

  createRow(cols: Col[], fullRow: Row): any[] {
    const row: any[] = [];

    for (let col of cols) {
      if (!Object.hasOwn(fullRow, col.name)) {
        row.push('');
        continue;
      }

      if (col.name === 'editor') {
        row.push(fullRow.editor.firstName + ' ' + fullRow.editor.lastName);
        continue;
      }

      if (this.hasSubCols(col)) {
        const embedded = fullRow[col.name] as Record<string, unknown>;

        for (let subCol of col.subCols)
          row.push(String(embedded[subCol] ?? ''))

        continue;
      }

      row.push(String(fullRow[col.name] ?? ''));
    }
    return row;
  }

  lastEdited(time : number, unit: string) : [number, string] {
    let lastEdited : string = "";

    if (time > 0)
      lastEdited = time > 1 ? time + ` ${unit}s ago` : time + ` ${unit} ago`;

    return [time, lastEdited];
  }

  calculateLastEdited(table: Table): string | null {
    if (table.row.updatedAt === null)
      return null;

    let lastEdited: string;
    let time: number;
    const today = new Date();

    const years = today.getFullYear() - table.row.updatedAt.getFullYear();
    [time, lastEdited] = this.lastEdited(years, "year");

    if (time > 0)
      return lastEdited;

    const months = today.getMonth() - table.row.updatedAt.getMonth();
    [time, lastEdited] = this.lastEdited(months, "month");

    if (time > 0)
      return lastEdited;

    const diffMs = today.getTime() - table.row.updatedAt.getTime();
    const MS_IN_SECOND = 1_000;
    const MS_IN_MINUTE = 60 * MS_IN_SECOND;
    const MS_IN_HOUR = 60 * MS_IN_MINUTE;
    const MS_IN_DAY = 24 * MS_IN_HOUR;

    const days = Math.floor(diffMs / MS_IN_DAY);
    [time, lastEdited] = this.lastEdited(days, "day");

    if (time > 0)
      return lastEdited;

    const hours = Math.floor((diffMs % MS_IN_DAY) / MS_IN_HOUR);
    [time, lastEdited] = this.lastEdited(hours, "hour");

    if (time > 0)
      return lastEdited;

    const minutes  = Math.floor((diffMs % MS_IN_HOUR) / MS_IN_MINUTE);
    [time, lastEdited] = this.lastEdited(minutes, "minute");

    if (time > 0)
      return lastEdited;

    const seconds  = Math.floor((diffMs % MS_IN_MINUTE) / MS_IN_SECOND);
    [time, lastEdited] = this.lastEdited(seconds, "second");

    if (time > 0)
      return lastEdited;

    return null;
  }

  getData(): Table[] {
    return [
      {
        report_id: 'rpt-001',
        report_name: 'Monthly Sales (July 2025)',
        sheet_id: 'sh-sales-01',
        sheet_name: 'Sales Sheet',
        table_id: 'tbl-sales-01',
        createdAt: new Date(2024, 11, 1),
        updatedAt: new Date(2025, 6, 15),
        rowCount: 50,
        colCount: 7,
        cols: [
          {name: 'date'},
          {name: 'region'},
          {name: 'product'},
          {name: 'amount'},
          {name: 'editor', subCols: ['userId', 'firstName', 'lastName']}
        ],
        row: {
          id: 'row-sales-0001',
          createdAt: new Date(2025, 6, 14, 12),   // 2025‑07‑15 12:00
          updatedAt: new Date(2025, 6, 14, 16),
          date: new Date(2025, 6, 1),
          region: 'EMEA',
          product: 'Widget X',
          amount: 10250.75,
          editor: {
            userId: 'u-100',
            firstName: 'Alice',
            lastName: 'Doe'
          }
        }
      },
      {
        report_id: 'rpt-002',
        report_name: 'Inventory Audit Q3',
        sheet_id: 'sh-inv-03',
        sheet_name: 'Inventory Sheet',
        table_id: 'tbl-inv-03',
        createdAt: new Date(2025, 5, 30, 9, 30),  // 2025‑06‑30 09:30
        updatedAt: new Date(2025, 6, 1, 15, 47),          // 2025‑07‑01
        rowCount: 200,
        colCount: 8,
        cols: [
          {name: 'itemCode'},
          {name: 'itemName'},
          {name: 'warehouseLocation', subCols: ['aisle', 'shelf']},
          {name: 'quantity'},
          {name: 'editor', subCols: ['userId', 'firstName', 'lastName']},
          {name: 'lastCheckedAt'}
        ],
        row: {
          id: 'row-inv-0420',
          createdAt: new Date(2025, 6, 14, 17, 45), // 2025‑07‑14 17:45
          updatedAt: new Date(2025, 6, 14, 17, 45),
          itemCode: 'WX‑889',
          itemName: 'Gear Assembly',
          warehouseLocation: {
            aisle: 'A3',
            shelf: 'S7'
          },
          quantity: 128,
          editor: {
            userId: 'u-200',
            firstName: 'Marlyne',
            lastName: 'Monroe'
          },
          lastCheckedAt: new Date(2025, 6, 14, 10, 15)
        }
      },
      {
        report_id: 'rpt-003',
        report_name: 'Customer Feedback Snapshot',
        sheet_id: 'sh-cf-07',
        sheet_name: 'Feedback',
        table_id: 'tbl-cf-07',
        createdAt: new Date(2024, 10, 10, 8),      // 2025‑07‑10 08:00
        updatedAt: new Date(2025, 6, 15),         // 2025‑07‑15
        rowCount: 87,
        colCount: 7,
        cols: [
          {name: 'feedbackId'},
          {name: 'rating'},
          {name: 'comment'},
          {name: 'editor', subCols: ['userId', 'firstName', 'lastName']},
          {name: 'submittedAt'}
        ],
        row: {
          id: 'row-cf-0029',
          createdAt: new Date(2025, 3, 15, 11, 20), // 2025‑07‑15 11:20
          updatedAt: new Date(2025, 5, 15, 11, 20),
          feedbackId: 'fb‑0029',
          rating: 4,
          comment: 'Great product, shipping could be faster.',
          editor: {
            userId: 'u-312',
            firstName: 'Marco',
            lastName: 'Silva'
          },
          submittedAt: new Date(2025, 6, 14, 22, 5) // 2025‑07‑14 22:05
        }
      }
    ]
  }
}
