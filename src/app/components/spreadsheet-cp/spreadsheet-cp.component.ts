// import {Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
// import {MainComponent} from '../main/main.component';
// import {NgClass, NgStyle} from '@angular/common';
// import {MockDataService} from '../../services/mock-data.service';
// import {Report} from '../../models/report.interface';
// import {Sheet} from '../../models/sheet.interface';
// import {Table} from '../../models/table.interface';
// import {Column} from '../../models/column.interface';
// import {SubColumn} from '../../models/sub-column.interface';
//
// type Th = {
//   startingColumn: number,
//   columns: Column[],
//   subColumns: Column[]
// }
//
// @Component({
//   selector: 'app-spreadsheets',
//   imports: [
//     MainComponent,
//     NgClass
//   ],
//   templateUrl: './spreadsheet-cp.component.html',
//   styleUrl: './spreadsheet-cp.component.css'
// })
// export class SpreadsheetCpComponent {
//   report!: Report;
//   sheets: Sheet[] = [];
//   colCount!: number[];
//
//   cols!: number;
//   rows!: number;
//
//   private cachedTables: Table[] = [];
//   private rowIndex: number | undefined;
//
//   @ViewChild('gridContainer', {static: true}) gridContainer!: ElementRef<HTMLDivElement>;
//   @ViewChildren('cellEl', {read: ElementRef}) cellEls!: QueryList<ElementRef<HTMLTableCellElement>>;
//
//   constructor(mockDataService: MockDataService) {
//     this.report = mockDataService.getMockReport(0);
//     const sheet = mockDataService.getSheet(this.report.sheetTemplates[0].sheetId);
//
//     if (sheet)
//       this.sheets.push(sheet);
//
//     this.getSheetSize();
//   }
//
//   getColCount(): number[] {
//     if (!this.colCount)
//       this.colCount = [...Array(this.cols).keys()].map((i) => i);
//
//     return this.colCount;
//   }
//
//   getCachedTables(i: number): Table[] {
//     if (this.cachedTables.length > 0) {
//       for (const table of this.cachedTables) {
//         const tableEndIndex = table.startingRow + 1 + (table.hasSubCols ? 1 : 0) + table.rowCount;
//
//         if (i >= tableEndIndex)
//           this.cachedTables = this.cachedTables
//             .filter(t => t.tableId.toLowerCase() !== table.tableId.toLowerCase());
//       }
//     }
//
//     const newTables = this.sheets[0].tables.filter(t => t.startingRow === i);
//     this.cachedTables.push(...newTables);
//     this.rowIndex = i;
//
//     return this.cachedTables;
//   }
//
//   getSheetSize() {
//     const tables = this.sheets[0].tables;
//     const tablesOnSameRow: { [index: string]: Table[] } = {};
//
//     for (const table of tables) {
//       if (!tablesOnSameRow.hasOwnProperty(`${table.startingRow}`))
//         tablesOnSameRow[`${table.startingRow}`] = [];
//
//       tablesOnSameRow[`${table.startingRow}`].push(table);
//     }
//
//     for (const index of Object.keys(tablesOnSameRow)) {
//       tablesOnSameRow[index].sort((t1, t2) => {
//         return t2.startingCol - t1.startingCol;
//       })
//     }
//
//     let maxCols = 0;
//     let maxRows = 0;
//
//     for (const tables of Object.values(tablesOnSameRow)) {
//       let colCount = tables[0].startingCol + tables[0].cols.length;
//
//       maxCols = Math.max(maxCols, colCount);
//     }
//
//     for (const table of tables) {
//       let rowCount = table.startingRow + 1 + (table.hasSubCols ? 1 : 0) + table.rowCount;
//
//       maxRows = Math.max(maxRows, rowCount);
//     }
//
//     this.cols = maxCols;
//     this.rows = maxRows;
//   }
//
//   getTh(i: number): Th | undefined {
//     const tables = this.getCachedTables(i);
//     // console.log(i, tables);
//     const columns: Column[] = [];
//     const subColumns: Column[] = [];
//     let startingColumn = 0;
//
//     if (tables.length === 0)
//       return;
//
//     for (const table of tables) {
//       const tableCols = table.cols.sort((c1, c2) => c1.columnIndex - c2.columnIndex);
//
//       if (table.startingRow === i) {
//         columns.push(...tableCols);
//       } else if (table.startingRow + 1 === i) {
//         if (table.hasSubCols)
//           subColumns.push(...tableCols);
//       }
//
//       startingColumn = Math.min(startingColumn, table.startingCol);
//     }
//
//     const ret = {startingColumn, columns, subColumns};
//
//     // console.log(i, ret);
//
//     return ret;
//   }
//
//   getColName(th: Th | undefined, colIndex: number): string[] {
//     // console.log(th)
//     let colNames : string[] = [];
//
//     if (!th)
//       colNames = [];
//
//     if (th) {
//       if (th.subColumns.length > 0) {
//         const col = th.subColumns.find(c => c.columnIndex === colIndex);
//
//         if (!col || !col.subColumns)
//           colNames = [];
//         else
//           colNames = col.subColumns
//             .sort((sc1, sc2) => sc1.subColIndex - sc2.subColIndex)
//             .map(subCol => subCol.name);
//       } else {
//         const col = th.columns.find(c => c.columnIndex === colIndex);
//
//         if (!col)
//           colNames = [];
//         else
//           colNames = [col.columnName]
//       }
//     }
//
//     console.log(colNames);
//     return colNames;
//   }
//
//   getCol(th: Th | undefined, colIndex: number): Column | undefined {
//     if (!th)
//       return;
//
//     return th.columns.find(c => c.columnIndex === colIndex);
//   }
//
//   getSubCols(th: Th | undefined, colIndex: number): SubColumn[] | undefined {
//     if (!th)
//       return;
//
//     const col = th.subColumns.find(c => c.columnIndex === colIndex);
//
//     return col?.subColumns;
//   }
//
//   getLetter(n: number): string {
//     if (!Number.isInteger(n) || n <= 0) {
//       throw new Error("n must be a positive integer (1-based).");
//     }
//
//     let result = "";
//
//     while (n > 0) {
//       n--; // shift to 0-based
//       const rem = n % 26;
//       result = String.fromCharCode(65 + rem) + result; // 65 = 'A'
//       n = Math.floor(n / 26);
//     }
//
//     return result;
//   }
//
//   getArr(len: number) {
//     return [...Array(len).keys()];
//   }
//
//   incrementCols() {
//     this.cols += 1;
//   }
//
//   incrementRows() {
//     this.rows += 1;
//   }
//
//   protected readonly Object = Object;
//   protected readonly log = console.log;
//
//   getGridTemplateColumns() {
//     return 'auto ' + Array(this.cols).fill('max-content').join(' ');
//   }
// }
