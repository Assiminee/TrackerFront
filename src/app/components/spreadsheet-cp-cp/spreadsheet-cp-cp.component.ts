import {Component} from '@angular/core';
import {MainComponent} from '../main/main.component';
import {MockDataService} from '../../services/mock-data.service';
import {mapSheet} from '../../core/utils/sheet-utils';
import {GridCell, GridRecord, RowRecord, SheetDisplayMap} from '../../core/utils/sheet-map.types';
import {NgClass} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Sheet} from '../../models/report/shared/sheet.interface';
import {ReportTemplate} from '../../models/report/templates/report-template.interface';
import {Mode} from '../../models/modes.enum';

type GridCellDisplay = {
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;
  styling?: { [className: string]: boolean };
}

@Component({
  selector: 'app-spreadsheets',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    MainComponent
  ],
  templateUrl: './spreadsheet-cp-cp.component.html',
  styleUrl: './spreadsheet-cp-cp.component.css'
})
export class SpreadsheetCpCpComponent {
  report!: ReportTemplate;
  sheets: Sheet[] = [];

  cols!: number;
  rows!: number;

  selectedCellContent!: string | undefined;
  selectedCell!: FormControl | undefined;

  protected sheetDisplayMap!: SheetDisplayMap;

  private currentSheetId!: string;
  private currentSheet!: Sheet;
  protected currentSheetMap!: RowRecord;

  constructor(mockDataService: MockDataService) {
    this.report = mockDataService.getMockReport(0);
    const sheet = mockDataService.getSheet(this.report.sheetTemplates[0].sheetTemplateId);

    if (sheet)
      this.sheets.push(sheet);

    this.currentSheetId = this.sheets[0].id;
    this.currentSheet = this.sheets[0];

    this.sheetDisplayMap = mapSheet(this.sheets[0], Mode.EDIT, this.sheetDisplayMap);

    this.currentSheetMap = this.sheetDisplayMap.sheets[this.currentSheetId];

    this.cols = this.sheetDisplayMap.sheetInfo[this.currentSheetId].columnCount;
    this.rows = this.sheetDisplayMap.sheetInfo[this.currentSheetId].rowCount;

    console.log(this.currentSheetMap)
  }

  getLetter(n: number): string {
    if (!Number.isInteger(n) || n <= 0) {
      return '&nbsp;';
    }

    let result = "";

    while (n > 0) {
      n--; // shift to 0-based
      const rem = n % 26;
      result = String.fromCharCode(65 + rem) + result; // 65 = 'A'
      n = Math.floor(n / 26);
    }

    return result;
  }

  getArr(len: number) {
    return [...Array(len).keys()];
  }

  incrementCols() {
    this.cols += 1;
  }

  incrementRows() {
    this.rows += 1;
  }

  getGridTemplateColumns() {
    return 'auto ' + Array(this.cols).fill('minmax(150px, max-content)').join(' ');
  }

  getColumn(row: GridRecord | null | undefined, j: number) {
    if (!row || !row.hasOwnProperty(j))
      return

    let col = row[j];
    let prevCol = row.hasOwnProperty(j - 1) ? row[j - 1] : undefined;

    if (!prevCol || col.isSubHeaderCell)
      return col;

    if (col.id === prevCol.id)
      return -1;

    return col;
  }

  getGridCellDisplay(i: number, j: number | null, column?: GridCell): GridCellDisplay | undefined {
    const gridCellDisplay: GridCellDisplay = {
      columnStart: 1,
      columnEnd: 2,
      rowStart: i + 1,
      rowEnd: i + 2
    }

    if (j) {
      gridCellDisplay.columnStart = column ? column.gridColumnIndex + 1 : j + 1;
      gridCellDisplay.styling = {'cell': true};

      if (column) {
        gridCellDisplay.columnEnd = column.isHeaderCell
          ? column.gridColumnIndex + 1 + (column.span ? column.span : 0)
          : column.gridColumnIndex + 2;

        gridCellDisplay.styling = {
          ...gridCellDisplay.styling,
          'border-r-2 border-r-black': column.isLastColumn ?? false,
          'border-2 border-r-0 border-black': true,
          'border-t-0': !column.isHeaderCell,
          'bg-red-300': column.isHeaderCell ?? false,
          'bg-red-200': column.isSubHeaderCell ?? false,
          'p-1': true
        }
      } else gridCellDisplay.columnEnd = j + 2;
    }

    return gridCellDisplay;
  }

  protected readonly log = console.log;
  protected readonly Object = Object;

  setSelected(column: GridCell | undefined) {
    this.selectedCellContent = column ? column.content.value : undefined;
    this.selectedCell = column?.content;
  }

  setCellValue() {
    if (!this.selectedCell)
      return;

    this.selectedCell.setValue(this.selectedCellContent);
  }
}
