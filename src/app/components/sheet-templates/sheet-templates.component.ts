import {Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {createBlankTable, mapSheet} from '../../core/utils/sheet-utils';
import {GridCell, GridRecord, SheetDisplayMap, SheetId} from '../../core/utils/sheet-map.types';
import {Router} from '@angular/router';
import {Sheet} from '../../models/report/shared/sheet.interface';
import {ReportTemplate} from '../../models/report/templates/report-template.interface';
import {Table} from '../../models/report/shared/table.interface';
import {Column} from '../../models/report/shared/column.interface';
import {SubColumn} from '../../models/report/shared/sub-column.interface';
import {SheetTemplateService} from '../../services/sheet-template.service';
import {Observable, Subject, takeUntil} from 'rxjs';
import {Mode} from '../../models/modes.enum';
import {FormHelperService} from '../../services/form-helper.service';
import {Action, ActionType} from '../../models/report/shared/action.interface';
import {MainComponent} from "../main/main.component";

type GridCellDisplay = {
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;
  styling?: { [className: string]: boolean };
}

@Component({
  selector: 'app-sheet-templates',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MainComponent
  ],
  templateUrl: './sheet-templates.component.html',
  standalone: true,
  styleUrl: './sheet-templates.component.css'
})
export class SheetTemplatesComponent implements OnInit, OnDestroy {
  @ViewChild('gridContainer', {static: true}) gridContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('cellEl', {read: ElementRef}) cellEls!: QueryList<ElementRef<HTMLTableCellElement>>;

  // drag state
  dragging = false;
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  selectionBox: Record<string, string> = {};
  containerRect!: DOMRect;
  selection!: { startCol: number; endCol: number; startRow: number; endRow: number } | undefined;

  report: ReportTemplate;
  showEditModal: boolean = false;
  reportForm!: FormGroup;

  undo: Action[] = [];
  redo: Action[] = [];

  hasSubCols: FormControl = new FormControl(false);
  sheetMapDisplay: SheetDisplayMap = {sheets: {}, sheetInfo: {}};

  cols: number = 40;
  rows: number = 40;

  currentSheetTemplateId !: string;
  sheetTemplateStorage: Record<SheetId, Sheet> = {};

  showDialog: boolean = false;

  destroy: Subject<void> = new Subject();

  // selection store as "r,c"
  protected selected = new Set<string>();
  protected selectedCellContent: string | undefined;
  protected selectedCell: FormControl | undefined;
  protected hoveredOverCell: { row: number; column: number } = {row: -1, column: -1};

  constructor(private router: Router, private service: SheetTemplateService, protected formHelper: FormHelperService) {
    this.report = history.state?.['reportTemplate'];
    const firstSheetTemplate = history.state?.['firstSheetTemplate'];

    this.reportForm = this.createForm();

    if (!this.report) {
      this.router.navigate(['report-templates']);
      return;
    }

    if (!firstSheetTemplate) {
      this.generateBlankSheet();
    } else {
      this.sheetTemplateStorage[firstSheetTemplate.id] = firstSheetTemplate;
      this.currentSheetTemplateId = firstSheetTemplate.id;
      this.sheetMapDisplay = mapSheet(this.sheetTemplateStorage[this.currentSheetTemplateId], Mode.EDIT);

      this.report.sheetTemplates.forEach(sheetTemplate => {
        if (!this.sheetMapDisplay.sheetInfo[sheetTemplate.sheetTemplateId])
          this.sheetMapDisplay.sheetInfo[sheetTemplate.sheetTemplateId] = {
            name: new FormControl(sheetTemplate.name),
            rowCount: -1,
            columnCount: -1,
            visits: 0,
            isNameEditable: false,
            mode: Mode.EDIT
          }
      })
    }
  }

  createForm = () => {
    return new FormGroup({
      name: new FormControl(this.report.name, [Validators.required, Validators.minLength(2), Validators.maxLength(200)]),
      description: new FormControl(this.report.description, Validators.maxLength(500)),
    })
  }

  ngOnInit() {}

  generateBlankSheet() {
    const date = new Date();
    const id = 'blank_sheet_1';
    this.cols = 40;
    this.rows = 40;

    this.sheetTemplateStorage[id] = {
      id: id,
      name: 'Sheet 1',
      createdAt: date,
      updatedAt: date,
      rowCount: this.rows,
      columnCount: this.cols,
      tables: [],
      standaloneCells: []
    };

    this.sheetMapDisplay = mapSheet(this.sheetTemplateStorage[id], Mode.CREATE);
    this.currentSheetTemplateId = id;
  }

  /** public helper for template */
  isCellSelected(row: number, col: number) {
    return this.selected.has(this.key(row, col));
  }

  // --- utils ---

  private toContainerCoords(evt: MouseEvent) {
    // position inside the scrollable container viewport
    const rect = this.containerRect ?? this.gridContainer.nativeElement.getBoundingClientRect();
    const x = evt.clientX - rect.left + this.gridContainer.nativeElement.scrollLeft;
    const y = evt.clientY - rect.top + this.gridContainer.nativeElement.scrollTop;

    return {x, y};
  }

  // mouse handlers
  onMouseDown(event: MouseEvent) {
    if (event.button !== 0) return; // left click only
    // start drag in container coords

    this.containerRect = this.gridContainer.nativeElement.getBoundingClientRect();
    const {x, y} = this.toContainerCoords(event);

    this.dragging = true;
    this.startX = x;
    this.startY = y;
    this.currentX = x;
    this.currentY = y;

    this.updateBox();
    // optional: clear previous selection unless Ctrl/Meta for additive

    if (!event.ctrlKey && !event.metaKey && !event.shiftKey) this.selected.clear();

    // prevent text selection
    // event.preventDefault();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.dragging) return;

    const {x, y} = this.toContainerCoords(event);
    this.currentX = x;
    this.currentY = y;

    this.updateBox();
    this.applyHitTest(event);
  }

  private updateBox() {
    // style object for the marquee rectangle (absolute inside container, uses scroll offsets)
    const left = Math.min(this.startX, this.currentX);
    const top = Math.min(this.startY, this.currentY);
    const width = Math.abs(this.currentX - this.startX);
    const height = Math.abs(this.currentY - this.startY);

    this.selectionBox = {
      left: `${left - this.gridContainer.nativeElement.scrollLeft}px`,
      top: `${top - this.gridContainer.nativeElement.scrollTop}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  }

  private applyHitTest(event: MouseEvent) {
    const add = event.ctrlKey || event.metaKey || event.shiftKey; // additive selection
    const hits = this.hitCellsInCurrentBox();
    // if not additive, start from cleared set each move
    const base = add ? new Set(this.selected) : new Set<string>();
    hits.forEach((k) => base.add(k));
    this.selected = base;
  }

  onMouseUp(_event: MouseEvent) {
    if (!this.dragging) return;
    this.dragging = false;
    // keep final box for a beat or clear immediately:
    this.selectionBox = {};
  }

  private hitCellsInCurrentBox(): string[] {
    const container = this.gridContainer.nativeElement;
    const cRect = container.getBoundingClientRect();

    // selection box in viewport coordinates (like getBoundingClientRect)
    const boxViewport = {
      left:
        Math.min(this.startX, this.currentX) - container.scrollLeft + cRect.left,
      top:
        Math.min(this.startY, this.currentY) - container.scrollTop + cRect.top,
      right:
        Math.max(this.startX, this.currentX) - container.scrollLeft + cRect.left,
      bottom:
        Math.max(this.startY, this.currentY) - container.scrollTop + cRect.top,
    };

    const hits: string[] = [];
    this.cellEls.forEach((ref: { nativeElement: any; }) => {
      const cell = ref.nativeElement;
      const rect = cell.getBoundingClientRect();

      // quick reject if outside container viewport entirely
      if (
        rect.right < cRect.left ||
        rect.left > cRect.right ||
        rect.bottom < cRect.top ||
        rect.top > cRect.bottom
      ) {
        return;
      }

      // intersect selection box vs cell in viewport coords
      const intersect =
        rect.left < boxViewport.right &&
        rect.right > boxViewport.left &&
        rect.top < boxViewport.bottom &&
        rect.bottom > boxViewport.top;

      if (intersect) {
        const r = Number(cell.dataset['row']);
        const c = Number(cell.dataset['col']);
        hits.push(this.key(r, c));
      }
    });

    return hits;
  }

  private key(r: number, c: number) {
    return `${r},${c}`;
  }

  getLetter(n: number): string {
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("n must be a positive integer (1-based).");
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
    this.undo.push({type: ActionType.ADD_COLUMN});
  }

  incrementRows() {
    this.rows += 1;
    this.undo.push({type: ActionType.ADD_ROW});
  }

  protected readonly Object = Object;
  // protected readonly log = console.log;

  createTable() {
    this.showDialog = this.selected.size > 0;

    if (!this.showDialog) {
      alert("No selected cells");
      return;
    }

    const arr = Array.from(this.selected);
    const min = arr.shift();
    const max = arr.pop();

    if (!min || !max) return;

    const [maxRow, maxCol] = max.split(",").map(Number);
    const [minRow, minCol] = min.split(",").map(Number);

    this.selection = {
      startCol: minCol,
      startRow: minRow,
      endCol: maxCol,
      endRow: maxRow
    }
  }

  dismiss() {
    this.showDialog = false;
  }

  confirmCreateTable() {
    if (!this.selection)
      return;

    const selection = this.selection;

    const existingTable = this.sheetTemplateStorage[this.currentSheetTemplateId].tables.find(table => {
      const rowOverlap = (selection.startRow <= table.endingRow + 1 && selection.endRow >= table.startingRow + 1);
      const columnOverlap = (selection.startCol <= table.endingColumn + 1 && selection.endCol >= table.startingColumn + 1);

      return rowOverlap && columnOverlap;
    })

    if (existingTable) {
      alert("The zone selected overlaps with an existing table");
      return;
    }

    this.sheetTemplateStorage[this.currentSheetTemplateId].tables.push(createBlankTable(
      this.currentSheetTemplateId,
      this.sheetMapDisplay,
      selection.startCol,
      selection.endCol,
      selection.startRow,
      selection.endRow,
      this.hasSubCols.value,
      this.sheetTemplateStorage[this.currentSheetTemplateId].tables.length
    ));

    console.log(this.sheetTemplateStorage[this.currentSheetTemplateId])

    this.dismiss();
  }

  displaySelection() {
    if (!this.selection)
      return "";

    return "[" + this.getLetter(this.selection.startCol) +
      " " + this.selection.startRow +
      ":" + this.getLetter(this.selection.endCol) +
      " " + this.selection.endRow + "]";
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
      gridCellDisplay.styling = {...gridCellDisplay.styling, selected: this.isCellSelected(i, j)};

      if (column) {
        gridCellDisplay.columnEnd = column.isHeaderCell
          ? column.gridColumnIndex + 1 + (column.span ?? 0)
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
      } else {
        gridCellDisplay.columnEnd = j + 2;
      }
    }

    return gridCellDisplay;
  }

  getColumn(row: GridRecord | null | undefined, j: number): GridCell | -1 | undefined {
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

  setSelected(column: GridCell | undefined) {
    this.selectedCellContent = column ? column.content.value : undefined;
    this.selectedCell = column?.content;
  }

  setCellValue() {
    if (!this.selectedCell)
      return;

    this.selectedCell.setValue(this.selectedCellContent);
  }

  cellElMouseEnter(gridCell: GridCell | undefined, row: number, column: number) {
    const location = {row: -1, column: -1};

    if (gridCell === undefined || gridCell?.isHeaderCell === false) {
      this.hoveredOverCell = location;
      return;
    }

    this.hoveredOverCell = {row, column};
  }

  show(row: number, column: number) {
    return this.hoveredOverCell.row === row && this.hoveredOverCell.column === column;
  }

  cellEllMouseLeave() {
    this.hoveredOverCell = {row: -1, column: -1};
  }

  createSubColumn(gridCell: GridCell, i: number, j: number) {
    const id = gridCell.isHeaderCell ? gridCell.id : gridCell.parentId;

    if (!id)
      return;

    const table: Table | undefined = this.sheetTemplateStorage[this.currentSheetTemplateId].tables
      .find(table => table.id.toLowerCase() === gridCell.tableId?.toLowerCase());

    if (!table)
      return;

    table.hasSubColumns = true;

    const column: Column | undefined = table.columns.find(col => col.id.toLowerCase() === id.toLowerCase());

    if (!column)
      return;

    const subColumnCount = column.subColumns.length;
    if (subColumnCount >= 1) {
      table.endingColumn += 1;
      table.columns.forEach(col => {
        if (col.id.toLowerCase() !== id.toLowerCase() && col.columnIndex > column.columnIndex) {
          col.columnIndex += 1;
        }
      })
    }

    const subColumn: SubColumn = {
      id: `${column.id}_SUB_COLUMN_${subColumnCount}`,
      subColumnIndex: subColumnCount,
      name: `Sub Column ${subColumnCount}`
    }

    column.subColumns.push(subColumn);
    const mode = this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId].mode

    this.sheetMapDisplay = mapSheet(this.sheetTemplateStorage[this.currentSheetTemplateId], mode, this.sheetMapDisplay);
  }

  save() {
    const mode = this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId].mode;
    let observable: Observable<any>;

    if (mode === Mode.CREATE)
      observable = this.service.createSheetTemplate(this.sheetTemplateStorage[this.currentSheetTemplateId], this.report.id);
    else if (mode === Mode.EDIT)
      observable = this.service.editSheetTemplate(this.sheetTemplateStorage[this.currentSheetTemplateId], this.report.id);
    else
      return;

    observable.pipe(takeUntil(this.destroy))
      .subscribe({
        next: (response) => {
          this.sheetTemplateStorage[this.currentSheetTemplateId] = (response as Sheet[])[0];
          this.sheetMapDisplay = mapSheet(this.sheetTemplateStorage[this.currentSheetTemplateId], Mode.EDIT, this.sheetMapDisplay);
          this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId].mode = Mode.EDIT;
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
  }

  getSheet(sheetTemplateId: string) {
    if (this.currentSheetTemplateId.toLowerCase() === sheetTemplateId.toLowerCase())
      return;


    if (Object.keys(this.sheetTemplateStorage).includes(sheetTemplateId)) {
      this.currentSheetTemplateId = sheetTemplateId;
      return;
    }

    this.service.getSheetTemplate(sheetTemplateId, this.report.id)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (response) => {
          const sheetTemplate = response as Sheet;

          this.currentSheetTemplateId = sheetTemplate.id;
          this.sheetTemplateStorage[this.currentSheetTemplateId] = sheetTemplate;

          this.sheetMapDisplay = mapSheet(this.sheetTemplateStorage[this.currentSheetTemplateId], Mode.EDIT, this.sheetMapDisplay);
        },
        error: (error) => {
          console.log(error);
        }
      })
  }

  dismissEditModal() {
    this.showEditModal = false;
  }

  editReportTemplateInfo() {

  }

  onSubmit() {

  }

  get name(): AbstractControl {
    return this.reportForm.controls['name'];
  }

  get description(): AbstractControl {
    return this.reportForm.controls['description'];
  }

  undoAction() {
    const undo = this.undo.pop();

    if (!undo)
      return;

    this.redo.push(undo);

    if (undo.type === ActionType.ADD_COLUMN)
      this.cols--;
    else if (undo.type === ActionType.ADD_ROW)
      this.rows--;
  }
}
