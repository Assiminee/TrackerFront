import {Injectable} from '@angular/core';
import {BaseEntityService} from './base-entity.service';
import {DataTableColumn} from '../interfaces/data-table-column.interface';
import {BaseTableData} from '../interfaces/base-table-data.interface';
import {JwtDecoderService} from './jwt-decoder.service';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends BaseEntityService {

  constructor(jwtDecoderService: JwtDecoderService, client: HttpClient) {
    super(jwtDecoderService, client);
    this.entity = 'team';
  }

  getEntryValue(key: string, entry: BaseTableData): string {
    if (key === 'pm') {
      if (entry['pm'] === null)
        return '';

      return entry?.['pm']?.['lastName'] + " " + entry['pm']?.['firstName'];
    }

    return entry[key];
  }
}
