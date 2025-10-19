// import {
//   Component,
//   ElementRef,
//   HostListener,
//   OnDestroy,
//   OnInit,
//   QueryList,
//   ViewChild,
//   ViewChildren
// } from '@angular/core';
// import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
// import {createBlankSheet, mapSheet, updateSheetInfo} from '../../core/utils/sheet-utils';
// import {GridCell, GridRecord, SheetDisplayMap, SheetId} from '../../core/utils/sheet-map.types';
// import {NavigationStart, Router} from '@angular/router';
// import {Sheet} from '../../models/report/shared/sheet.interface';
// import {ReportTemplate} from '../../models/report/templates/report-template.interface';
// import {SheetTemplateService} from '../../services/sheet-template.service';
// import {filter, Subject, takeUntil} from 'rxjs';
// import {Mode} from '../../models/modes.enum';
// import {FormHelperService} from '../../services/form-helper.service';
// import {MainComponent} from "../main/main.component";
// import {NgClass, NgStyle} from "@angular/common";
// import {v4 as uuidV4, validate} from 'uuid';
// import {Command, executeCommand} from '../../services/sheet-commands/command.interface';
// import {AddRowCommand} from '../../services/sheet-commands/add-row-command';
// import {AddColumnCommand} from '../../services/sheet-commands/add-column-command';
// import {CreateTableCommand} from '../../services/sheet-commands/create-table-command';
// import {CreateSubColumnCommand} from '../../services/sheet-commands/create-sub-column-command';
// import {CreateColumnCommand} from '../../services/sheet-commands/create-column-command';
// import {EditCellValueCommand} from '../../services/sheet-commands/edit-cell-value-command';
// import {DeleteColumnCommand} from '../../services/sheet-commands/delete-colomn-command';
// import {DeleteElements} from '../../core/utils/delete-elements.interface';
// import {DeleteSubColumnCommand} from '../../services/sheet-commands/delete-subcolumn-command';
// import {DeleteTableCommand} from '../../services/sheet-commands/delete-table-command';
// import {EditSheetNameCommand} from '../../services/sheet-commands/edit-sheet-name-command';
// import {CreateStandaloneCellCommand} from '../../services/sheet-commands/create-standalone-cell-command';
// import {getArr, getLetter} from '../../core/utils/helpers';
// import {SelectionService} from '../../services/selection-service.service';
// import {EditModalComponent} from './partials/edit-modal/edit-modal.component';
// import {CreateTableModalComponent} from './partials/create-table-modal/create-table-modal.component';
// import {DeleteSheetModalComponent} from './partials/delete-sheet-modal/delete-sheet-modal.component';
//
// type GridCellDisplay = {
//   columnStart: number;
//   columnEnd: number;
//   rowStart: number;
//   rowEnd: number;
//   styling?: { [className: string]: boolean };
// }
//
// @Component({
//   selector: 'app-sheet-templates',
//   imports: [
//     ReactiveFormsModule,
//     FormsModule,
//     MainComponent,
//     NgStyle,
//     NgClass,
//     EditModalComponent,
//     CreateTableModalComponent,
//     DeleteSheetModalComponent
//   ],
//   templateUrl: './sheet-templates.component.html',
//   standalone: true,
//   styleUrl: './sheet-templates.component.css'
// })
// export class SheetTemplatesComponent implements OnDestroy, OnInit {
//   @ViewChildren('cellEl', {read: ElementRef}) cellEls!: QueryList<ElementRef<HTMLTableCellElement>>;
//   @ViewChild('gridContainer', {static: true}) gridContainer!: ElementRef<HTMLDivElement>;
//   dragging = false;
//   startX = 0;
//   startY = 0;
//   currentX = 0;
//   currentY = 0;
//   selectionBox: Record<string, string> = {};
//   containerRect!: DOMRect;
//   selection!: { startCol: number; endCol: number; startRow: number; endRow: number } | undefined;
//   protected selected = new Set<string>();
//   protected selectedCellContent: string | undefined;
//   protected selectedGridCell: GridCell | undefined;
//   protected clickedCell: { row: number; column: number } = {row: -1, column: -1};
//   protected menuLeft: number = 0;
//   protected menuTop: number = 0;
//   protected readonly Object = Object;
//   protected readonly getLetter = getLetter;
//   protected readonly getArr = getArr;
//
//   report: ReportTemplate;
//   sheetMapDisplay: SheetDisplayMap = {sheets: {}, sheetInfo: {}};
//   currentSheetTemplateId !: string;
//   sheetTemplateStorage: Record<SheetId, Sheet> = {};
//   cols: number = 40;
//   rows: number = 40;
//   hasSubCols: FormControl = new FormControl(false);
//   undoCommands: Command[] = [];
//   redoCommands: Command[] = [];
//   elementsToDelete!: DeleteElements;
//   showDialog: boolean = false;
//   showEditModal: boolean = false;
//   destroy: Subject<void> = new Subject<void>();
//   showDeleteSheetModal: boolean = false;
//   sheetIdToDelete: string | undefined = undefined;
//   sheetNameToDelete: string | undefined = undefined;
//
//   constructor(
//     private router: Router,
//     private service: SheetTemplateService,
//     protected formHelper: FormHelperService,
//     protected selectionService: SelectionService
//   ) {
//     const storedReport = localStorage.getItem('reportTemplate');
//
//     if (!storedReport) {
//       this.report = history.state?.['reportTemplate'];
//       localStorage.setItem('reportTemplate', JSON.stringify(this.report));
//     } else {
//       this.report = JSON.parse(storedReport) as ReportTemplate;
//     }
//
//     if (!this.report) {
//       this.router.navigate(['report-templates']);
//       return;
//     }
//
//     this.generateBlankSheet();
//     this.initSheetTemplateStorage();
//     this.initElementsToDelete();
//   }
//
//   ngOnInit(): void {
//     this.router.events
//       .pipe(filter(event => event instanceof NavigationStart))
//       .pipe(takeUntil(this.destroy))
//       .subscribe((event: NavigationStart) => {
//         if (!event.url.startsWith('/spreadsheets')) {
//           localStorage.removeItem('reportTemplate');
//         }
//       });
//   }
//
//   private toContainerCoords(evt: MouseEvent) {
//     return this.selectionService.toContainerCoords(evt, this.containerRect, this.gridContainer);
//   }
//
//   onMouseDown(event: MouseEvent) {
//     if (event.button !== 0) return;
//     this.containerRect = this.gridContainer.nativeElement.getBoundingClientRect();
//     const {x, y} = this.toContainerCoords(event);
//     this.dragging = true;
//     this.startX = x;
//     this.startY = y;
//     this.currentX = x;
//     this.currentY = y;
//     this.updateBox();
//     if (!event.ctrlKey && !event.metaKey && !event.shiftKey) this.selected.clear();
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
//   private updateBox() {
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
//     const base = add ? new Set(this.selected) : new Set<string>();
//     hits.forEach((k) => base.add(k));
//     this.selected = base;
//   }
//
//   onMouseUp(_event: MouseEvent) {
//     if (!this.dragging) return;
//     this.dragging = false;
//     this.selectionBox = {};
//   }
//
//   private hitCellsInCurrentBox(): string[] {
//     const container = this.gridContainer.nativeElement;
//     const cRect = container.getBoundingClientRect();
//     const boxViewport = this.selectionService
//       .getBoxViewport(container, cRect, this.startX, this.currentX, this.startY, this.currentY);
//
//     const hits: string[] = [];
//     this.cellEls.forEach((ref: { nativeElement: any; }) => {
//       this.selectionService.locateSelectedCells(ref, cRect, boxViewport, hits);
//     });
//     return hits;
//   }
//
//   @HostListener('document:mousedown', ['$event'])
//   onGlobalMouseDown(event: MouseEvent) {
//     if (this.clickedCell.row !== -1 && this.clickedCell.column !== -1) {
//       const visibleMenus = Array.from(document.querySelectorAll('.context-menu:not(.hidden)'));
//       const isClickInsideMenu = visibleMenus.some(menu => menu.contains(event.target as Node));
//       if (!isClickInsideMenu) this.setClickedCell(-1, -1);
//     }
//   }
//
//   setClickedCell(row: number, column: number) {
//     this.clickedCell = {row, column};
//   }
//
//   setSelected(column: GridCell | undefined) {
//     this.selectedCellContent = column ? column.content.value : undefined;
//   }
//
//   show(row: number, column: number) {
//     return this.clickedCell.row === row && this.clickedCell.column === column;
//   }
//
//   setCellValue() {
//     if (this.selectedGridCell) this.selectedGridCell.content.setValue(this.selectedCellContent);
//   }
//
//   allowEdit(column: GridCell) {
//     column.isEditable = true;
//   }
//
//   getGridCellDisplay(i: number, j: number | null, column?: GridCell): GridCellDisplay | undefined {
//     const gridCellDisplay: GridCellDisplay = {columnStart: 1, columnEnd: 2, rowStart: i + 1, rowEnd: i + 2}
//
//     if (j) {
//       gridCellDisplay.columnStart = column ? column.gridColumnIndex + 1 : j + 1;
//       gridCellDisplay.styling = {'cell': true};
//       gridCellDisplay.styling = {...gridCellDisplay.styling, selected: this.selected.has(`${i},${j}`)};
//
//       if (column) {
//         gridCellDisplay.columnEnd = column.isHeaderCell
//           ? column.gridColumnIndex + 1 + (column.span ?? 0)
//           : column.gridColumnIndex + 2;
//
//         gridCellDisplay.styling = {
//           ...gridCellDisplay.styling,
//           'border-r-2 border-r-black': column.isLastColumn ?? false,
//           'border-2 border-r-0 border-black': !column.isStandaloneCell,
//           'border-t-0': !column.isHeaderCell,
//           'bg-red-300': column.isHeaderCell ?? false,
//           'bg-red-200': column.isSubHeaderCell ?? false,
//           'p-1': true
//         }
//       } else {
//         gridCellDisplay.columnEnd = j + 2;
//       }
//     }
//
//     return gridCellDisplay;
//   }
//
//   initElementsToDelete() {
//     this.elementsToDelete = {
//       tableIds: new Set<string>(),
//       columnIds: {},
//       subColumnIds: {},
//       standaloneCellIds: new Set<string>()
//     };
//   }
//
//   generateBlankSheet(count: number = 1) {
//     if (this.currentSheetTemplateId && this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId].changes > 0) {
//       alert("Please save the current sheet before switching to a different one");
//       return;
//     }
//     const id = uuidV4();
//     this.cols = 40;
//     this.rows = 40;
//     this.sheetTemplateStorage[id] = createBlankSheet(id, count, this.rows, this.cols);
//     this.sheetMapDisplay = mapSheet(this.sheetTemplateStorage[id], Mode.CREATE, this.sheetMapDisplay);
//     this.sheetMapDisplay.sheetInfo[id].changes = 1;
//     this.currentSheetTemplateId = id;
//   }
//
//   initSheetTemplateStorage() {
//     if (this.report.sheetTemplates.length === 0) {
//       this.report.sheetTemplates.push({
//         sheetTemplateId: this.currentSheetTemplateId,
//         name: this.sheetTemplateStorage[this.currentSheetTemplateId].name,
//       });
//       localStorage.setItem('reportTemplate', JSON.stringify(this.report));
//       return;
//     }
//
//     this.service.getSheetTemplate(this.report.sheetTemplates[0].sheetTemplateId, this.report.id)
//       .pipe(takeUntil(this.destroy))
//       .subscribe({
//         next: data => {
//           const firstSheet = data as Sheet;
//           delete this.sheetMapDisplay.sheets[this.currentSheetTemplateId];
//           delete this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId];
//           this.sheetMapDisplay = mapSheet(firstSheet, Mode.EDIT, this.sheetMapDisplay);
//           delete this.sheetTemplateStorage[this.currentSheetTemplateId];
//           this.sheetTemplateStorage[firstSheet.id] = firstSheet;
//
//           console.log(this.currentSheetTemplateId);
//           console.log(this.sheetTemplateStorage[this.currentSheetTemplateId])
//           console.log(this.sheetTemplateStorage)
//           this.currentSheetTemplateId = firstSheet.id;
//
//           this.cols = firstSheet.columnCount;
//           this.rows = firstSheet.rowCount;
//
//           this.report.sheetTemplates.forEach((sheetTemplate, index) => {
//             if (!this.sheetMapDisplay.sheetInfo[sheetTemplate.sheetTemplateId])
//               this.sheetMapDisplay.sheetInfo[sheetTemplate.sheetTemplateId] = {
//                 name: new FormControl(sheetTemplate.name),
//                 isGeneratedInClient: false,
//                 isNameEditable: false,
//                 columnCount: -1,
//                 rowCount: -1,
//                 visits: 0,
//                 mode: Mode.EDIT,
//                 changes: 0
//               }
//           })
//         },
//         error: err => {
//           console.log("ERR" + err);
//         }
//       });
//   }
//
//   createTable() {
//     this.showDialog = this.selected.size > 0;
//
//     if (!this.showDialog) {
//       alert("No selected cells");
//       return;
//     }
//
//     const arr = Array.from(this.selected);
//     const min = arr.shift();
//     const max = arr.pop();
//
//     if (!min || !max) return;
//
//     const [maxRow, maxCol] = max.split(",").map(Number);
//     const [minRow, minCol] = min.split(",").map(Number);
//
//     this.selection = {startCol: minCol, startRow: minRow, endCol: maxCol, endRow: maxRow}
//   }
//
//   dismiss() {
//     this.showDialog = false;
//     this.hasSubCols.setValue(false);
//   }
//
//   getColumn(row: GridRecord | null | undefined, j: number): GridCell | -1 | undefined {
//     if (!row || !row.hasOwnProperty(j)) return;
//
//     let col = row[j];
//     let prevCol = row.hasOwnProperty(j - 1) ? row[j - 1] : undefined;
//
//     if (!prevCol || col.isSubHeaderCell) return col;
//
//     if (col.id === prevCol.id) return -1;
//
//     return col;
//   }
//
//   cellRightClicked(event: MouseEvent, i: number, j: number) {
//     if (event.button === 2) event.preventDefault();
//
//     const cell = this.cellEls.find(cellEl => {
//       return Number(cellEl.nativeElement.dataset['row']) === i &&
//         Number(cellEl.nativeElement.dataset['col']) === j;
//     })
//
//     if (event.button !== 2 || !cell) {
//       i = -1;
//       j = -1;
//     }
//
//     if (cell) {
//       const boundingRect = cell.nativeElement.getBoundingClientRect();
//       this.menuLeft = event.clientX - boundingRect.left;
//       this.menuTop = event.clientY - boundingRect.top;
//     }
//
//     this.setClickedCell(i, j);
//   }
//
//   sendCreateSheetTemplateRequest() {
//     this.service.createSheetTemplate(this.sheetTemplateStorage[this.currentSheetTemplateId], this.report.id)
//       .pipe(takeUntil(this.destroy))
//       .subscribe({
//         next: (data) => {
//           // @ts-ignore
//           const newSheet = data[0] as Sheet;
//           this.sheetTemplateStorage[newSheet.id] = newSheet;
//           this.sheetMapDisplay = mapSheet(newSheet, Mode.EDIT, this.sheetMapDisplay);
//           this.report.sheetTemplates.push({sheetTemplateId: newSheet.id, name: newSheet.name});
//
//           const index = this.report.sheetTemplates
//             .findIndex(ts => ts.sheetTemplateId.toLowerCase() === this.currentSheetTemplateId.toLowerCase());
//
//           if (index >= 0) this.report.sheetTemplates.splice(index, 1);
//
//           delete this.sheetMapDisplay.sheets[this.currentSheetTemplateId];
//           delete this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId];
//           delete this.sheetTemplateStorage[this.currentSheetTemplateId];
//
//           this.currentSheetTemplateId = newSheet.id;
//           this.undoCommands = [];
//           this.redoCommands = [];
//           this.initElementsToDelete();
//
//           localStorage.setItem('reportTemplate', JSON.stringify(this.report));
//         },
//         error: (err) => {
//           console.error("Failed to create new sheet", err);
//         }
//       })
//   }
//
//   sendEditSheetTemplateRequest() {
//     this.service
//       .editSheetTemplate(this.sheetTemplateStorage[this.currentSheetTemplateId], this.report.id, this.elementsToDelete)
//       .pipe(takeUntil(this.destroy))
//       .subscribe({
//         next: (data) => {
//           const responseSheet = data as Sheet;
//           updateSheetInfo(responseSheet, this.sheetMapDisplay.sheetInfo[responseSheet.id]);
//           delete this.sheetMapDisplay.sheets[responseSheet.id];
//           this.sheetMapDisplay = mapSheet(responseSheet, Mode.EDIT, this.sheetMapDisplay);
//           this.undoCommands = [];
//           this.redoCommands = [];
//           this.initElementsToDelete();
//
//           if (responseSheet.name !== this.sheetTemplateStorage[this.currentSheetTemplateId].name) {
//             const index = this.report.sheetTemplates
//               .findIndex(st => st.sheetTemplateId.toLowerCase() === this.currentSheetTemplateId.toLowerCase());
//
//             if (index >= 0) {
//               this.report.sheetTemplates[index].name = responseSheet.name;
//               localStorage.setItem('reportTemplate', JSON.stringify(this.report));
//             }
//           }
//
//           this.sheetTemplateStorage[responseSheet.id] = responseSheet;
//         },
//         error: (err) => {
//           console.error("Failed to edit sheet", err);
//         }
//       })
//   }
//
//   save() {
//     (document.activeElement as HTMLElement)?.blur();
//     if (this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId].changes === 0) return;
//     const mode = this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId].mode;
//
//     if (mode === Mode.CREATE)
//       this.sendCreateSheetTemplateRequest();
//     else if (mode === Mode.EDIT)
//       this.sendEditSheetTemplateRequest();
//   }
//
//   increment(columns: boolean = true): void {
//     const command = columns ? new AddColumnCommand(this) : new AddRowCommand(this);
//     command.execute();
//     this.undoCommands.push(command);
//   }
//
//   undoRedoAction(undo: boolean = true) {
//     const command = undo ? this.undoCommands.pop() : this.redoCommands.pop();
//     if (!command) return;
//     const res = undo ? command.undo() : command.redo();
//     if (res) undo ? this.redoCommands.push(command) : this.undoCommands.push(command);
//     else undo ? this.undoCommands.push(command) : this.redoCommands.push(command);
//   }
//
//   onInputBlur(column: GridCell | null) {
//     if (column === null) {
//       if (!this.selectedGridCell) return;
//       column = this.selectedGridCell;
//       this.selectedGridCell = undefined;
//       this.selectedCellContent = undefined;
//     }
//
//     column.isEditable = false;
//     const command = this.undoCommands[this.undoCommands.length - 1];
//
//     if (!(command instanceof EditCellValueCommand)) return;
//
//     if (command.getGridCellContent() === command.getOldValue()) {
//       this.undoCommands.pop();
//       return;
//     }
//
//     if (!command.execute())
//       this.undoCommands.pop();
//   }
//
//   onInputFocus(gridCell: GridCell) {
//     this.setSelected(gridCell);
//     this.selectedGridCell = gridCell;
//     this.pushEditCellCommand(gridCell);
//   }
//
//   pushEditCellCommand(gridCell: GridCell | null) {
//     if (gridCell === null) {
//       if (!this.selectedGridCell) return;
//       gridCell = this.selectedGridCell;
//     }
//
//     this.undoCommands.push(new EditCellValueCommand(this, gridCell));
//   }
//
//   resetMap(): void {
//     const sheetId = this.currentSheetTemplateId;
//     const sheet = this.sheetTemplateStorage[sheetId];
//     const mode = this.sheetMapDisplay.sheetInfo[sheetId].mode;
//
//     delete this.sheetMapDisplay.sheets[sheetId];
//     this.sheetMapDisplay.sheetInfo[sheetId].columnCount = sheet.columnCount;
//     this.sheetMapDisplay.sheetInfo[sheetId].rowCount = sheet.rowCount;
//
//     this.sheetMapDisplay = mapSheet(
//       this.sheetTemplateStorage[sheetId],
//       mode,
//       this.sheetMapDisplay
//     );
//   }
//
//   deleteColumn(column: GridCell) {
//     executeCommand(DeleteColumnCommand, this.undoCommands, this, column);
//   }
//
//   deleteSubColumn(subColumn: GridCell) {
//     executeCommand(DeleteSubColumnCommand, this.undoCommands, this, subColumn);
//   }
//
//   deleteTable(gridCell: GridCell) {
//     executeCommand(DeleteTableCommand, this.undoCommands, this, gridCell);
//   }
//
//   addSubColumnToTable(gridCell: GridCell, toTheLeft: boolean = false) {
//     executeCommand(CreateSubColumnCommand, this.undoCommands, this, gridCell, toTheLeft);
//   }
//
//   addColumnToTable(gridCell: GridCell, toTheLeft: boolean = true) {
//     executeCommand(CreateColumnCommand, this.undoCommands, this, gridCell, toTheLeft);
//   }
//
//   confirmCreateTable() {
//     executeCommand(CreateTableCommand, this.undoCommands, this);
//     this.dismiss();
//   }
//
//   markUnsaved(change: boolean = true) {
//     this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId].changes += (change ? 1 : -1)
//   }
//
//   isUnsaved(): boolean {
//     return this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId].changes > 0;
//   }
//
//   onSheetNameFocus(nameFormControl: FormControl) {
//     this.undoCommands.push(new EditSheetNameCommand(this, nameFormControl));
//   }
//
//   onSheetNameBlur(id: string) {
//     this.sheetMapDisplay.sheetInfo[id].isNameEditable = false;
//     const command = this.undoCommands[this.undoCommands.length - 1];
//
//     if (!(command instanceof EditSheetNameCommand)) return;
//
//     if (command.getOldName() === command.getCurrentSheetName()) {
//       this.undoCommands.pop();
//       return;
//     }
//
//     command.execute();
//   }
//
//   getSheetNames() {
//     return Object.entries(this.sheetMapDisplay.sheetInfo).map(([key, value]) => {
//       return {id: key, name: value.name};
//     });
//   }
//
//   switchId(sheetId: string) {
//     if (this.currentSheetTemplateId === sheetId) return;
//
//     if (this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId].changes > 0) {
//       alert("Please save before you switch to a different sheet");
//       return;
//     }
//
//     if (Object.keys(this.sheetMapDisplay.sheets).includes(sheetId)) {
//       this.currentSheetTemplateId = sheetId;
//       this.sheetMapDisplay.sheetInfo[sheetId].visits += 1;
//       return;
//     }
//
//     this.getSheet(sheetId);
//   }
//
//   getSheet(sheetId: string) {
//     this.service.getSheetTemplate(sheetId, this.report.id)
//       .pipe(takeUntil(this.destroy))
//       .subscribe({
//         next: (response) => {
//           const sheet = response as Sheet;
//           delete this.sheetMapDisplay.sheetInfo[sheet.id];
//           delete this.sheetMapDisplay.sheets[sheet.id];
//           this.sheetMapDisplay = mapSheet(sheet, Mode.EDIT, this.sheetMapDisplay);
//           this.sheetTemplateStorage[sheet.id] = sheet;
//           this.currentSheetTemplateId = sheet.id;
//         },
//         error: (error) => {
//           console.error("Unable to fetch sheet", error);
//         }
//       });
//   }
//
//   isReadOnly(id: string) {
//     return !this.sheetMapDisplay.sheetInfo[id].isNameEditable;
//   }
//
//   unsetReadonly(id: string) {
//     this.sheetMapDisplay.sheetInfo[id].isNameEditable = true;
//   }
//
//   createNewSheet() {
//     this.generateBlankSheet(this.report.sheetTemplates.length + 1);
//
//     this.report.sheetTemplates.push({
//       sheetTemplateId: this.currentSheetTemplateId,
//       name: this.sheetMapDisplay.sheetInfo[this.currentSheetTemplateId].name.value
//     });
//
//     localStorage.setItem('reportTemplate', JSON.stringify(this.report));
//   }
//
//   onStandaloneCellFocus(i: number, j: number) {
//     this.selectedGridCell = undefined;
//     this.selectedCellContent = undefined;
//     this.undoCommands.push(new CreateStandaloneCellCommand(this, null, i, j));
//   }
//
//   onStandaloneCellBlur(event: FocusEvent) {
//     const command = this.undoCommands[this.undoCommands.length - 1];
//
//     if (!(command instanceof CreateStandaloneCellCommand)) return;
//     const value = (event.target as HTMLInputElement).value;
//
//     command.setCurrentValue(value.trim().length === 0 ? null : value);
//
//     if (!command.execute())
//       this.undoCommands.pop();
//   }
//
//   ngOnDestroy(): void {
//     this.destroy.next();
//     this.destroy.complete();
//   }
//
//   setSheetIdToDelete($event: MouseEvent, id: string, name: string) {
//     $event.stopPropagation();
//
//     if (this.sheetMapDisplay.sheetInfo[id].changes > 0) {
//       alert("Please save before you switch to a different sheet");
//       return;
//     }
//     this.sheetIdToDelete = id;
//     this.sheetNameToDelete = name;
//     this.showDeleteSheetModal = true;
//   }
//
//   sendDeleteSheetRequest($event: boolean) {
//     if (!this.sheetIdToDelete) return;
//
//     const id = this.sheetIdToDelete;
//     this.sheetIdToDelete = undefined;
//     this.sheetNameToDelete = undefined;
//
//     if (!$event) return;
//
//     if (validate(id)) {
//       this.deleteSheetFromUI(id);
//       return;
//     }
//
//     this.service.deleteSheetTemplate(id, this.report.id)
//       .pipe(takeUntil(this.destroy))
//       .subscribe({
//         next: (response) => this.deleteSheetFromUI(id),
//         error: (error) => console.error("Unable to delete sheet", error)
//       })
//   }
//
//   deleteSheetFromUI(id: string) {
//     const index = this.report.sheetTemplates
//       .findIndex(st => st.sheetTemplateId.toLowerCase() === id.toLowerCase());
//     if (index === -1) return;
//
//     if (this.report.sheetTemplates.length === 1) {
//       this.generateBlankSheet();
//
//       this.report.sheetTemplates.push({
//         sheetTemplateId: this.sheetTemplateStorage[this.currentSheetTemplateId].id,
//         name: this.sheetTemplateStorage[this.currentSheetTemplateId].name
//       });
//     } else if (this.currentSheetTemplateId.toLowerCase() === id.toLowerCase()) {
//       const nextSheetIndex = index + 1 >= this.report.sheetTemplates.length ? index - 1 : index + 1;
//       const nextSheet = this.report.sheetTemplates[nextSheetIndex];
//
//       if (!this.sheetTemplateStorage[nextSheet.sheetTemplateId]) this.getSheet(nextSheet.sheetTemplateId);
//       else this.currentSheetTemplateId = nextSheet.sheetTemplateId;
//     }
//
//     delete this.sheetTemplateStorage[id];
//     delete this.sheetMapDisplay.sheets[id];
//     delete this.sheetMapDisplay.sheetInfo[id];
//     this.report.sheetTemplates.splice(index, 1);
//     localStorage.setItem('reportTemplate', JSON.stringify(this.report));
//   }
//
//   protected readonly validate = validate;
//
//   handleChange($event: string, isNameChange: boolean = true) {
//     console.log($event);
//     if (isNameChange) this.report.name = $event;
//     else this.report.description = $event;
//
//     localStorage.setItem('reportTemplate', JSON.stringify(this.report));
//   }
// }
