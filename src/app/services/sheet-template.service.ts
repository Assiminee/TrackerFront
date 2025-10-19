import {Injectable} from '@angular/core';
import {Sheet} from '../models/report/shared/sheet.interface';
import {HttpClient} from '@angular/common/http';
import {Table} from '../models/report/shared/table.interface';
import {validate} from 'uuid';
import {DeleteElements, SendDeleteElements} from '../core/utils/delete-elements.interface';
import {ROOT_URL} from '../core/utils/globals';

@Injectable({
  providedIn: 'root'
})
export class SheetTemplateService {
  protected ROOT_URL: string = ROOT_URL;

  constructor(private client: HttpClient) {
  }

  requestSetup(sheet: Sheet, reportTemplateId: string, edit: boolean = true) {
    const url = `report-templates/${reportTemplateId}/sheet-templates` + (edit ? `/${sheet.id}` : ``)


    const body = {
      name: sheet.name,
      rowCount: sheet.rowCount,
      columnCount: sheet.columnCount,
      tables: sheet.tables.map(table => this.mapTable(table, edit)),
      standaloneCells: sheet.standaloneCells.map(sac => {
        const s = {
          standaloneCellValue: sac.standaloneCellValue,
          rowIndex: sac.rowIndex,
          columnIndex: sac.columnIndex,
        };

        return (edit && !validate(sac.id)) ? {...s, id: sac.id} : s;
      }),
    }

    return [url, ((edit && !validate(sheet.id)) ? {...body, id: sheet.id} : body)];
  }

  createSheetTemplate(sheet: Sheet, reportTemplateId: string) {
    const [url, body] = this.requestSetup(sheet, reportTemplateId, false);

    return this.client.post(this.ROOT_URL + url, {sheets: [body]})
  }

  editSheetTemplate(sheet: Sheet, reportTemplateId: string, elementsToDelete: DeleteElements) {
    let [url, mappedSheet] = this.requestSetup(sheet, reportTemplateId);
    const removables = this.getRemovables(elementsToDelete);

    const body = Object.keys(removables).length > 0 ?
      {sheet: mappedSheet, ...removables} :
      {sheet: mappedSheet};

    if (Object.keys(removables).length > 0) url += "?delete=true";
    return this.client.put(this.ROOT_URL + url, body);
  }

  deleteSheetTemplate(sheetTemplateId: string, reportTemplateId: string) {
    return this.client.delete(this.ROOT_URL + `report-templates/${reportTemplateId}/sheet-templates/${sheetTemplateId}`);
  }

  mapTable(table: Table, edit: boolean): object {
    const mappedTable = {
      startingColumn: table.startingColumn,
      endingColumn: table.endingColumn,
      startingRow: table.startingRow,
      endingRow: table.endingRow,
      hasSubColumns: table.hasSubColumns,
      columns: table.columns.map(column => {
        const col = {
          columnIndex: column.columnIndex,
          columnName: column.columnName,
          subColumns: column.subColumns.map(subColumn => {
            const subCol = {
              subColumnIndex: subColumn.subColumnIndex,
              name: subColumn.name
            }

            return (edit && !validate(subColumn.id)) ? {...subCol, id: subColumn.id} : subCol;
          })
        };

        return (edit && !validate(column.id)) ? {...col, id: column.id} : col;
      })
    };

    return (edit && !validate(table.id)) ? {...mappedTable, id: table.id} : mappedTable;
  }

  getSheetTemplate(sheetId: string, reportTemplateId: string) {
    const url = this.ROOT_URL + 'report-templates/' + reportTemplateId + '/sheet-templates/' + sheetId;
    return this.client.get(url);
  }

  getRemovables(elementsToDelete: DeleteElements): Partial<SendDeleteElements> {
    const removables: Partial<SendDeleteElements> = {};

    if (Array.from(elementsToDelete.tableIds).length > 0)
      removables.tableIds = Array.from(elementsToDelete.tableIds);

    if (Array.from(elementsToDelete.standaloneCellIds).length > 0)
      removables.standaloneCellIds = Array.from(elementsToDelete.standaloneCellIds);

    Object.entries(elementsToDelete.columnIds).forEach(entry => {
      const [key, set] = entry;

      if (Array.from(set).length > 0) {
        if (!removables.columnIds) removables.columnIds = {};
        removables.columnIds = {...removables.columnIds, [key]: Array.from(set)};
      }
    });

    Object.entries(elementsToDelete.subColumnIds).forEach(entry => {
        const [recordKey, record] = entry;

        Object.entries(record).forEach(entry => {
          const [key, set] = entry;
          if (Array.from(set).length > 0) {
            if (!removables.subColumnIds) removables.subColumnIds = {};
            removables.subColumnIds = {...removables.subColumnIds, ...{[recordKey]: {[key]: Array.from(set)}}};
          }
        })
      }
    )

    return removables;
  }
}
