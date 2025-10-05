import {StandaloneCell} from '../../models/report/shared/standalone-cell.interface';
import {FormControl} from '@angular/forms';
import {GridCell, SheetDisplayMap} from './sheet-map.types';
import {Table} from '../../models/report/shared/table.interface';
import {Column} from '../../models/report/shared/column.interface';
import {SubColumn} from '../../models/report/shared/sub-column.interface';
import {Row} from '../../models/report/base/row.interface';
import {Sheet} from '../../models/report/shared/sheet.interface';
import {Mode} from '../../models/modes.enum';

// Maps standalone cells to a GridCell
function standaloneCellsToGridCells(standaloneCells: StandaloneCell[]): GridCell[] {
  return standaloneCells.map(cell => ({
    id: cell.id,
    columnIndex: cell.columnIndex,
    rowIndex: cell.rowIndex,
    gridColumnIndex: cell.columnIndex + 1,
    gridRowIndex: cell.rowIndex + 1,
    content: new FormControl(cell.standaloneCellName),
    isEditable: false
  }));
}

// Maps a single column (header) cell to a GridCell
function columnToGridCell(table: Table, col: Column): GridCell {
  const span = col.subColumns.length || 1;

  return {
    id: col.id,
    tableId: table.id,
    content: new FormControl(col.columnName),
    isHeaderCell: true,
    isFirstColumn: col.columnIndex === table.startingColumn,
    isLastColumn: (col.columnIndex + span - 1) === table.endingColumn,
    isFirstRow: true,
    isLastRow: false,
    columnIndex: col.columnIndex,
    rowIndex: table.startingRow,
    gridColumnIndex: col.columnIndex + 1,
    gridRowIndex: table.startingRow + 1,
    childIds: col.subColumns.map(subCol => subCol.id),
    span: span,
    isEditable: false
  }
}

// Maps a single sub-column (sub-header) cell to a GridCell
function subColumnToGridCell(table: Table, col: Column, sc?: SubColumn): GridCell {
  const colIndex = sc ? sc.subColumnIndex + col.columnIndex : col.columnIndex;
  const rowIndex = table.startingRow + 1;

  return {
    id: sc ? sc.id : '',
    tableId: table.id,
    content: new FormControl(sc ? sc.name : ''),
    isSubHeaderCell: true,
    columnIndex: colIndex,
    rowIndex: rowIndex,
    gridColumnIndex: colIndex + 1,
    gridRowIndex: rowIndex + 1,
    isFirstColumn: colIndex === table.startingColumn,
    isLastColumn: colIndex === table.endingColumn,
    isFirstRow: false,
    isLastRow: false,
    parentId: col.id,
    isEditable: false
  }
}

// Maps both header and sub-header cells to GridCells
function createGridCells(table: Table, col: Column): GridCell[] {
  const gridCells: GridCell[] = [columnToGridCell(table, col)];

  if (table.hasSubColumns) {
    if (col.subColumns.length) {
      const subColumnsGridCells = col.subColumns.map((sc: SubColumn): GridCell => {
        return subColumnToGridCell(table, col, sc);
      });

      gridCells.push(...subColumnsGridCells);
    } else {
      gridCells.push(subColumnToGridCell(table, col));
    }
  }

  return gridCells;
}

// Creates blank data cells (GridCells). Helpful for display when no data is available yet
function createBlankDataGridCells(col: Column, hasSubCols: boolean, startCol: number, startRow: number, endCol: number, endRow: number): GridCell[] {
  const rowCount = endRow - startRow;

  if (rowCount <= 0) return [];

  const rowIndex = startRow + (hasSubCols ? 2 : 1);
  let gridCells : GridCell[] = [];

  if (!col.subColumns.length) {
    let j = 0;
    const stop = hasSubCols ? rowIndex + rowCount - 1 : rowIndex + rowCount;

    for (let i = rowIndex; i < stop; i++) {
      gridCells.push({
        id: `${col.id}_CELL_${j}`,
        isDataCell: true,
        columnIndex: col.columnIndex,
        rowIndex: i,
        gridColumnIndex: col.columnIndex + 1,
        gridRowIndex: i + 1,
        isLastColumn: col.columnIndex === endCol,
        isFirstColumn: col.columnIndex === startCol,
        isFirstRow: i === startRow,
        isLastRow: i === endRow,
        content: new FormControl(),
        columnId: col.id,
        isEditable: false
      });

      j++;
    }
  }

  for (const subColumn of col.subColumns) {
    const blankCells : GridCell[] = []
    const subColumnIndex = col.columnIndex + subColumn.subColumnIndex;
    let j = 0;

    for (let i = rowIndex; i < rowIndex + rowCount - 1; i++) {
      blankCells.push({
        id: `${subColumn.id}_CELL_${j}`,
        isDataCell: true,
        columnIndex: subColumnIndex,
        rowIndex: i,
        gridColumnIndex: subColumnIndex + 1,
        gridRowIndex: i + 1,
        isLastColumn: subColumnIndex === endCol,
        isFirstColumn: subColumnIndex === startCol,
        isFirstRow: i === startRow,
        isLastRow: i === endRow,
        content: new FormControl(`${subColumn.id}_CELL_${j}_INDEX_${j}`),
        columnId: col.id,
        subColumnId: subColumn.id,
        isEditable: false
      });

      j++;
    }

    gridCells.push(...blankCells);
  }

  return gridCells;
}

// Maps data rows to GridCells
function rowsToGridCells(table: Table, headerGridCells: GridCell[], rows: Row[]): GridCell[] | undefined {
  const tableRows = rows.filter(row => row.tableId.toLowerCase() === table.id.toLowerCase());
  const gridCells: GridCell[] = [];
  let i = 0;
  let rowIndex = table.startingRow + (table.hasSubColumns ? 2 : 1);

  if (tableRows.length === 0) {
    gridCells.push(...table.columns
      .map(col => createBlankDataGridCells(col, table.hasSubColumns, table.startingColumn, table.startingRow, table.endingColumn, table.endingRow)).flat()
    );
    return gridCells;
  }

  for (const row of tableRows) {
    let cellIndex = 0;
    for (const cell of row.cells) {
      const headerGridCell = headerGridCells.find(hgc => {
          const id = cell.subColumnId ? cell.subColumnId : cell.columnId;

          return id.toLowerCase() === hgc.id.toLowerCase();
        }
      );

      if (!headerGridCell)
        continue;

      let dataGridCell: GridCell = {
        id: `CELL_${cellIndex++}_${row.id}`,
        isDataCell: true,
        columnIndex: headerGridCell.columnIndex,
        rowIndex: rowIndex + i,
        gridColumnIndex: headerGridCell.gridColumnIndex,
        gridRowIndex: rowIndex + i + 1,
        isLastColumn: headerGridCell.isLastColumn,
        isFirstColumn: headerGridCell.isFirstColumn,
        isFirstRow: i === 0,
        isLastRow: i === (table.endingColumn - 1),
        content: new FormControl(cell.value),
        columnId: cell.columnId,
        isEditable: false
      };

      if (cell.subColumnId)
        dataGridCell.subColumnId = cell.subColumnId;

      if (headerGridCell.span)
        dataGridCell.span = headerGridCell.span;

      gridCells.push(dataGridCell);
    }
    i++;
  }

  return gridCells;
}

// Creates blank columns (header) cells for newly created tables
function createBlankColumn(startingCol: number, index: number, tableId: string, hasSubCols: boolean): Column {
  const id = `${tableId}_COLUMN_${index}`;

  const column: Column = {
    id: id,
    columnIndex: startingCol - 1 + index,
    columnName: `Column ${index + 1}`,
    subColumns: []
  };

  if (hasSubCols)
    column.subColumns = [{
      id: `${id}_SUB_COLUMN_0`,
      name: 'Sub Column 1',
      subColumnIndex: 0
    }];

  return column;
}

// Creates a new table with blank columns, sub-columns and data cells
export function createBlankTable(
  sheetId: string,
  map: SheetDisplayMap,
  startingColumn: number,
  endingColumn: number,
  startingRow: number,
  endingRow: number,
  hasSubColumns: boolean,
  tableCount: number
): Table {
  const columnCount = endingColumn - startingColumn + 1;

  const sheetTemplateMap = map.sheets[sheetId];

  const tableId = `SHEET_${sheetId}_TABLE_${tableCount}`;
  const cols = [...Array(columnCount).keys()].map(index => createBlankColumn(startingColumn, index, tableId, hasSubColumns));

  const table: Table = {
    id: tableId,
    startingColumn: startingColumn - 1,
    endingColumn: endingColumn - 1,
    startingRow: startingRow - 1,
    endingRow: endingRow - 1,
    columns: cols,
    hasSubColumns: hasSubColumns
  };

  const gridCells = cols.map(col => createGridCells(table, col)).flat();
  const blankDataCells = cols.map(col => createBlankDataGridCells(col, hasSubColumns, table.startingColumn, table.startingRow, table.endingColumn, table.endingRow)).flat();

  gridCells.push(...blankDataCells);

  gridCells.forEach((cell: GridCell) => {
    if (!sheetTemplateMap.hasOwnProperty(cell.gridRowIndex))
      sheetTemplateMap[cell.gridRowIndex] = {};

    if (!sheetTemplateMap[cell.gridRowIndex].hasOwnProperty(cell.gridColumnIndex))
      sheetTemplateMap[cell.gridRowIndex][cell.gridColumnIndex] = cell;
  });

  return table;
}

// Maps a sheet into a SheetDisplay map so as to create a [row x column] grid
export function mapSheet(sheet: Sheet, mode: Mode.EDIT | Mode.CREATE, map?: SheetDisplayMap): SheetDisplayMap {
  if (!map)
    map = {
      sheetInfo: {},
      sheets: {}
    };

  if (!map.sheets[sheet.id])
    map.sheets[sheet.id] = {};

  if (!map.sheetInfo[sheet.id])
    map.sheetInfo[sheet.id] = {
      columnCount: sheet.columnCount,
      rowCount: sheet.rowCount,
      name: new FormControl(sheet.name),
      visits: 1,
      isNameEditable: false,
      mode: mode
    };

  const sheetMap = map.sheets[sheet.id];
  const rows : Row[] = [];
  const gridCells: GridCell[] = [];

  if (sheet.standaloneCells.length)
    gridCells.push(...standaloneCellsToGridCells(sheet.standaloneCells));

  for (const table of sheet.tables) {
    gridCells.push(...table.columns.map((col) => createGridCells(table, col)).flat());

    const tableDataGridCells = rowsToGridCells(table, gridCells, rows);

    if (tableDataGridCells)
      gridCells.push(...tableDataGridCells);

    gridCells.forEach((cell) => {
      const rowIndex = cell.gridRowIndex;

      if (!sheetMap[rowIndex])
        sheetMap[rowIndex] = {};

      const span = cell.gridColumnIndex + (cell.span ? cell.span : 1);

      for (let k = cell.gridColumnIndex; k < span; k++) {
        sheetMap[rowIndex][k] = cell;
      }
    })
  }


  return map;
}
