// import {Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
// import {MainComponent} from '../main/main.component';
// import {NgClass, NgStyle} from '@angular/common';
// import {MockDataService} from '../../services/mock-data.service';
// import {ReportData} from '../../interfaces/report-data.interface';
// import {Sheet} from '../../models/report/shared/sheet.interface';
//
// @Component({
//   selector: 'app-spreadsheets',
//   imports: [
//     MainComponent,
//     NgStyle,
//     NgClass
//   ],
//   templateUrl: './spreadsheets.component.html',
//   styleUrl: './spreadsheets.component.css'
// })
// export class SpreadsheetsComponent {
//   report!: Report;
//   sheets: Sheet[] = [];
//   colCount!: number[];
//
//   constructor(mockDataService: MockDataService) {
//     this.getArr(this.cols).forEach((i) => {
//       this.letters.push(this.getLetter(i + 1));
//     });
//
//     this.data = mockDataService.getMockReports();
//
//     this.report = mockDataService.getMockReport(0);
//
//     const sheet = mockDataService.getSheet(this.report.sheetTemplates[0].sheetId);
//
//     if (sheet)
//       this.sheets.push(sheet);
//   }
//
//   getColCount(): number[] {
//     if (!this.colCount)
//       this.colCount = [...Array(this.cols).keys()].map((i) => i);
//
//     return this.colCount;
//   }
//
//   getRow(i: number) {
//     let data: string[] | ReportData;
//
//     if (i === 0) {
//       data = this.letters;
//       return data;
//     }
//
//     if (i > this.data.length)
//       return [...Array(this.cols).keys()].map((i) => '');
//
//     i = i - 1;
//     data = this.data[i]
//
//     if (i === 0) {
//       data = Object.keys(data)
//       if (data.length < this.cols) {
//         const tst = [...Array(this.cols - data.length).keys()].map(key => '');
//         data.push(...tst);
//       }
//       return data;
//     }
//
//     data = Object.values(data)
//     if (data.length < this.cols) {
//       const tst = [...Array(this.cols - data.length).keys()].map(key => '');
//       data.push(...tst);
//     }
//     return data;
//   }
//
//   getTableRow(i: number) {
//     if (i === -1)
//       return {isHeader: false, colIndex: 0, data: this.letters};
//
//     const table = this.sheets[0].tables.find(table => table.startingRow === i);
//
//     if (table) {
//       return {isHeader: true, colIndex: table.startingCol, data: table.cols.map(col => col.columnName)};
//     }
//
//     return {
//       isHeader: false, colIndex: 0,
//       data: [...Array(this.cols).keys()].map((_) => '')
//     }
//   }
//
//   private cachedTable: Table | undefined;
//   private index: number | undefined;
//
//   getCachedTable(i: number): Table | undefined {
//     if (this.index !== i) {
//       this.index = i;
//       this.cachedTable = this.sheets[0].tables.find(table => table.startingRow === i);
//     }
//
//     return this.cachedTable;
//   }
//
//   getTh(i: number, j: number) {
//     const table = this.getCachedTable(i);
//
//     if (!table)
//       return;
//
//     const col = table.cols.find(col => col.columnIndex === j);
//
//     if (!col)
//       return;
//
//     return {startingIndex: table.startingCol, col: col};
//   }
//
//   getSubCols(i: number, j: number) {
//     if (i === 0)
//       return;
//
//     const table = this.getCachedTable(i - 1);
//
//     if (!table) return;
//
//     const col = table?.cols.find(col => col.columnIndex === j);
//
//     if (!col) return;
//
//     return {startingIndex: table.startingCol, columnIndex: col.columnIndex, subCols: col.subColumns};
//   }
//
//   cols: number = 50;
//   rows: number = 200;
//   letters: string[] = [];
//   data !: ReportData[];
//
//   @ViewChild('gridContainer', {static: true}) gridContainer!: ElementRef<HTMLDivElement>;
//   @ViewChildren('cellEl', {read: ElementRef}) cellEls!: QueryList<ElementRef<HTMLTableCellElement>>;
//
//   // drag state
//   dragging = false;
//   startX = 0;
//   startY = 0;
//   currentX = 0;
//   currentY = 0;
//   selectionBox: Record<string, string> = {};
//   containerRect!: DOMRect;
//
//   // selection store as "r,c"
//   private selected = new Set<string>();
//
//   ngAfterViewInit(): void {
//     // nothing special here, but QueryList will be ready
//   }
//
//   /** public helper for template */
//   isCellSelected(row: number, col: number) {
//     return this.selected.has(this.key(row, col));
//   }
//
//   // mouse handlers
//   onMouseDown(event: MouseEvent) {
//     if (event.button !== 0) return; // left click only
//     // start drag in container coords
//     this.containerRect = this.gridContainer.nativeElement.getBoundingClientRect();
//     const {x, y} = this.toContainerCoords(event);
//     this.dragging = true;
//     this.startX = x;
//     this.startY = y;
//     this.currentX = x;
//     this.currentY = y;
//     this.updateBox();
//     // optional: clear previous selection unless Ctrl/Meta for additive
//     if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
//       this.selected.clear();
//     }
//     // prevent text selection
//     event.preventDefault();
//   }
//
//   onMouseMove(event: MouseEvent) {
//     if (!this.dragging) return;
//     const {x, y} = this.toContainerCoords(event);
//     this.currentX = x;
//     this.currentY = y;
//     this.updateBox();
//     this.applyHitTest(event);
//   }
//
//   onMouseUp(_event: MouseEvent) {
//     if (!this.dragging) return;
//     this.dragging = false;
//     // keep final box for a beat or clear immediately:
//     this.selectionBox = {};
//   }
//
//   // --- utils ---
//
//   private toContainerCoords(evt: MouseEvent) {
//     // position inside the scrollable container viewport
//     const rect = this.containerRect ?? this.gridContainer.nativeElement.getBoundingClientRect();
//     const x = evt.clientX - rect.left + this.gridContainer.nativeElement.scrollLeft;
//     const y = evt.clientY - rect.top + this.gridContainer.nativeElement.scrollTop;
//     return {x, y};
//   }
//
//   private updateBox() {
//     // style object for the marquee rectangle (absolute inside container, uses scroll offsets)
//     const left = Math.min(this.startX, this.currentX);
//     const top = Math.min(this.startY, this.currentY);
//     const width = Math.abs(this.currentX - this.startX);
//     const height = Math.abs(this.currentY - this.startY);
//     this.selectionBox = {
//       left: `${left - this.gridContainer.nativeElement.scrollLeft}px`,
//       top: `${top - this.gridContainer.nativeElement.scrollTop}px`,
//       width: `${width}px`,
//       height: `${height}px`,
//     };
//   }
//
//   private applyHitTest(event: MouseEvent) {
//     const add = event.ctrlKey || event.metaKey || event.shiftKey; // additive selection
//     const hits = this.hitCellsInCurrentBox();
//     // if not additive, start from cleared set each move
//     const base = add ? new Set(this.selected) : new Set<string>();
//     hits.forEach((k) => base.add(k));
//     this.selected = base;
//   }
//
//   private hitCellsInCurrentBox(): string[] {
//     const container = this.gridContainer.nativeElement;
//     const cRect = container.getBoundingClientRect();
//
//     // selection box in viewport coordinates (like getBoundingClientRect)
//     const boxViewport = {
//       left:
//         Math.min(this.startX, this.currentX) - container.scrollLeft + cRect.left,
//       top:
//         Math.min(this.startY, this.currentY) - container.scrollTop + cRect.top,
//       right:
//         Math.max(this.startX, this.currentX) - container.scrollLeft + cRect.left,
//       bottom:
//         Math.max(this.startY, this.currentY) - container.scrollTop + cRect.top,
//     };
//
//     const hits: string[] = [];
//     this.cellEls.forEach((ref: { nativeElement: any; }) => {
//       const td = ref.nativeElement;
//       const rect = td.getBoundingClientRect();
//
//       // quick reject if outside container viewport entirely
//       if (
//         rect.right < cRect.left ||
//         rect.left > cRect.right ||
//         rect.bottom < cRect.top ||
//         rect.top > cRect.bottom
//       ) {
//         return;
//       }
//
//       // intersect selection box vs cell in viewport coords
//       const intersect =
//         rect.left < boxViewport.right &&
//         rect.right > boxViewport.left &&
//         rect.top < boxViewport.bottom &&
//         rect.bottom > boxViewport.top;
//
//       if (intersect) {
//         const r = Number(td.dataset['row']);
//         const c = Number(td.dataset['col']);
//         hits.push(this.key(r, c));
//       }
//     });
//     return hits;
//   }
//
//   private key(r: number, c: number) {
//     return `${r},${c}`;
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
// }
//
// // import {Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
// // import {MainComponent} from '../main/main.component';
// // import {NgClass, NgStyle} from '@angular/common';
// // import {MockDataService} from '../../services/mock-data.service';
// // import {ReportData} from '../../interfaces/report-data.interface';
// // import {Report} from '../../models/report.interface';
// // import {Sheet} from '../../models/sheet.interface';
// // import {Table} from '../../models/table.interface';
// //
// // @Component({
// //   selector: 'app-spreadsheets',
// //   imports: [MainComponent, NgStyle, NgClass],
// //   templateUrl: './spreadsheets.component.html',
// //   styleUrl: './spreadsheets.component.css'
// // })
// // export class SpreadsheetsComponent {
// //   report!: Report;
// //   sheets: Sheet[] = [];
// //   colCount!: number[];
// //   cols: number = 6; // Minimum columns
// //   rows: number = 20; // Minimum rows
// //   letters: string[] = [];
// //   data!: ReportData[];
// //   @ViewChild('gridContainer', {static: true}) gridContainer!: ElementRef<HTMLDivElement>;
// //   @ViewChildren('cellEl', {read: ElementRef}) cellEls!: QueryList<ElementRef<HTMLTableCellElement>>;
// //
// //   // drag state
// //   dragging = false;
// //   startX = 0;
// //   startY = 0;
// //   currentX = 0;
// //   currentY = 0;
// //   selectionBox: Record<string, string> = {};
// //   containerRect!: DOMRect;
// //   // selection store as "r,c"
// //   private selected = new Set<string>();
// //
// //   constructor(private mockDataService: MockDataService) {
// //     this.data = mockDataService.getMockReports(); // Assuming this returns ReportData[], but adjust if needed
// //     this.report = mockDataService.getMockReport(0);
// //     const sheet = mockDataService.getSheet(this.report.sheets[0].sheetId);
// //     if (sheet) this.sheets.push(sheet);
// //
// //     // Compute dynamic cols and rows based on tables' data
// //     this.computeGridSize();
// //
// //     // Generate letters
// //     this.letters = this.getArr(this.cols).map(i => this.getLetter(i + 1));
// //   }
// //
// //   private computeGridSize() {
// //     let maxCol = 0;
// //     let maxRow = 0;
// //     for (const sheet of this.sheets) {
// //       for (const table of sheet.tables) {
// //         maxRow = Math.max(maxRow, table.rowIndex + table.rowCount);
// //         for (const col of table.cols) {
// //           const width = col.subColumns ? col.subColumns.length : 1;
// //           const endCol = col.columnIndex + width - 1;
// //           maxCol = Math.max(maxCol, endCol);
// //         }
// //       }
// //     }
// //     this.cols = Math.max(this.cols, maxCol + 1);
// //     this.rows = Math.max(this.rows, maxRow + 1);
// //   }
// //
// //   getColCount(): number[] {
// //     if (!this.colCount) this.colCount = this.getArr(this.cols);
// //     return this.colCount;
// //   }
// //
// //   private cachedTable: Table | undefined;
// //   private index: number | undefined;
// //   getCachedTable(i: number): Table | undefined {
// //     if (this.index !== i) {
// //       this.index = i;
// //       this.cachedTable = this.sheets[0].tables.find(table => table.rowIndex === i);
// //     }
// //     return this.cachedTable;
// //   }
// //
// //   getTh(i: number, j: number) {
// //     const table = this.getCachedTable(i);
// //     if (!table) return;
// //     const col = table.cols.find(col => col.columnIndex === j);
// //     if (!col) return;
// //     return {startingIndex: table.colIndex, col};
// //   }
// //
// //   getSub(i: number, j: number) {
// //     const table = this.getCachedTable(i - 1); // Subheaders from previous row's table
// //     if (!table) return;
// //     const col = table.cols.find(col => col.subColumns && col.columnIndex <= j && j < col.columnIndex + col.subColumns.length);
// //     if (!col) return;
// //     const subIndex = j - col.columnIndex;
// //     return col.subColumns?.[subIndex];
// //   }
// //
// //   isCellSelected(row: number, col: number) {
// //     return this.selected.has(this.key(row, col));
// //   }
// //
// //   // mouse handlers
// //   onMouseDown(event: MouseEvent) {
// //     if (event.button !== 0) return; // left click only
// //     this.containerRect = this.gridContainer.nativeElement.getBoundingClientRect();
// //     const {x, y} = this.toContainerCoords(event);
// //     this.dragging = true;
// //     this.startX = x;
// //     this.startY = y;
// //     this.currentX = x;
// //     this.currentY = y;
// //     this.updateBox();
// //     if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
// //       this.selected.clear();
// //     }
// //     event.preventDefault();
// //   }
// //
// //   onMouseMove(event: MouseEvent) {
// //     if (!this.dragging) return;
// //     const {x, y} = this.toContainerCoords(event);
// //     this.currentX = x;
// //     this.currentY = y;
// //     this.updateBox();
// //     this.applyHitTest(event);
// //   }
// //
// //   onMouseUp(_event: MouseEvent) {
// //     if (!this.dragging) return;
// //     this.dragging = false;
// //     this.selectionBox = {};
// //   }
// //
// //   private toContainerCoords(evt: MouseEvent) {
// //     const rect = this.containerRect ?? this.gridContainer.nativeElement.getBoundingClientRect();
// //     const x = evt.clientX - rect.left + this.gridContainer.nativeElement.scrollLeft;
// //     const y = evt.clientY - rect.top + this.gridContainer.nativeElement.scrollTop;
// //     return {x, y};
// //   }
// //
// //   private updateBox() {
// //     const left = Math.min(this.startX, this.currentX);
// //     const top = Math.min(this.startY, this.currentY);
// //     const width = Math.abs(this.currentX - this.startX);
// //     const height = Math.abs(this.currentY - this.startY);
// //     this.selectionBox = {
// //       left: `${left - this.gridContainer.nativeElement.scrollLeft}px`,
// //       top: `${top - this.gridContainer.nativeElement.scrollTop}px`,
// //       width: `${width}px`,
// //       height: `${height}px`,
// //     };
// //   }
// //
// //   private applyHitTest(event: MouseEvent) {
// //     const add = event.ctrlKey || event.metaKey || event.shiftKey;
// //     const hits = this.hitCellsInCurrentBox();
// //     const base = add ? new Set(this.selected) : new Set<string>();
// //     hits.forEach((k) => base.add(k));
// //     this.selected = base;
// //   }
// //
// //   private hitCellsInCurrentBox(): string[] {
// //     const container = this.gridContainer.nativeElement;
// //     const cRect = container.getBoundingClientRect();
// //     const boxViewport = {
// //       left: Math.min(this.startX, this.currentX) - container.scrollLeft + cRect.left,
// //       top: Math.min(this.startY, this.currentY) - container.scrollTop + cRect.top,
// //       right: Math.max(this.startX, this.currentX) - container.scrollLeft + cRect.left,
// //       bottom: Math.max(this.startY, this.currentY) - container.scrollTop + cRect.top,
// //     };
// //     const hits: string[] = [];
// //     this.cellEls.forEach((ref) => {
// //       const td = ref.nativeElement;
// //       const rect = td.getBoundingClientRect();
// //       if (rect.right < cRect.left || rect.left > cRect.right || rect.bottom < cRect.top || rect.top > cRect.bottom) {
// //         return;
// //       }
// //       const intersect = rect.left < boxViewport.right && rect.right > boxViewport.left &&
// //         rect.top < boxViewport.bottom && rect.bottom > boxViewport.top;
// //       if (intersect) {
// //         const r = Number(td.dataset['row']);
// //         const c = Number(td.dataset['col']);
// //         hits.push(this.key(r, c));
// //       }
// //     });
// //     return hits;
// //   }
// //
// //   private key(r: number, c: number) {
// //     return `${r},${c}`;
// //   }
// //
// //   getLetter(n: number): string {
// //     if (!Number.isInteger(n) || n <= 0) {
// //       throw new Error("n must be a positive integer (1-based).");
// //     }
// //     let result = "";
// //     while (n > 0) {
// //       n--;
// //       const rem = n % 26;
// //       result = String.fromCharCode(65 + rem) + result;
// //       n = Math.floor(n / 26);
// //     }
// //     return result;
// //   }
// //
// //   getArr(len: number) {
// //     return [...Array(len).keys()];
// //   }
// //
// //   incrementCols() {
// //     this.cols += 1;
// //     this.letters.push(this.getLetter(this.cols));
// //   }
// //
// //   incrementRows() {
// //     this.rows += 1;
// //   }
// //
// //   protected readonly Object = Object;
// //   protected readonly log = console.log;
// // }
