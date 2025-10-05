import { Injectable } from '@angular/core';
import {Sheet} from '../models/report/shared/sheet.interface';
import {HttpClient} from '@angular/common/http';
import {Table} from '../models/report/shared/table.interface';

@Injectable({
  providedIn: 'root'
})
export class SheetTemplateService {
  protected ROOT_URL : string = "http://localhost:8080/api/";

  constructor(private client: HttpClient) {}

  requestSetup(sheet: Sheet, reportTemplateId: string) {
    const url = `report-templates/${reportTemplateId}/sheet-templates`;

    const body = {
      name: sheet.name,
      rowCount: sheet.rowCount,
      columnCount: sheet.columnCount,
      tables: sheet.tables.map(table => this.mapTable(table)),
      standaloneCells: sheet.standaloneCells.map(sac => {
        return {
          standaloneCellName: sac.standaloneCellName,
          rowIndex: sac.rowIndex,
          columnIndex: sac.columnIndex,
        }
      }),
    }

    return [url, body];
  }

  createSheetTemplate(sheet: Sheet, reportTemplateId: string) {
    const [url, body] = this.requestSetup(sheet, reportTemplateId);

    console.log(body);

    return this.client.post(this.ROOT_URL + url, {sheets: [body]})
  }

  editSheetTemplate(sheet: Sheet, reportTemplateId: string) {
    const [url, body] = this.requestSetup(sheet, reportTemplateId);

    return this.client.put(this.ROOT_URL + url, {sheets: [body]})
  }

  mapTable(table : Table) : object {
    return {
      startingColumn: table.startingColumn,
      endingColumn: table.endingColumn,
      startingRow: table.startingRow,
      endingRow: table.endingRow,
      hasSubColumns: table.hasSubColumns,
      columns: table.columns.map(column => {
        return {
          columnIndex: column.columnIndex,
          columnName: column.columnName,
          subColumns: column.subColumns.map(subColumn => {
            return {
              subColumnIndex: subColumn.subColumnIndex,
              name: subColumn.name
            }
          })
        };
      })
    };
  }

  getSheetTemplate(sheetId: string, reportTemplateId: string) {
    const url = this.ROOT_URL + 'report-templates/' + reportTemplateId + '/sheet-templates/' + sheetId;
    return this.client.get(url);
  }
}
