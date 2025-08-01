import { Injectable } from '@angular/core';
import {BaseEntityService} from './base-entity.service';
import {BaseTableData} from '../interfaces/base-table-data.interface';
import {JwtDecoderService} from './jwt-decoder.service';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseEntityService {
  constructor(jwtDecoderService : JwtDecoderService, client: HttpClient) {
    super(jwtDecoderService, client);
    this.entity = 'user';
  }

  private roles: Record<string, string> = {
    ROLE_PM: 'Project Manager',
    ROLE_TM: 'Team Member',
    ROLE_SA: 'Administrator'
  }

  getEntryValue(key: string, entry: BaseTableData): string {
    let value;

    if (key === 'role') value = this.roles[entry['role']];
    else if (key === 'fullName') value = entry?.['firstName'] + ' ' + entry['lastName'];
    else if (key === 'team') value = entry['team']?.name ?? '';
    else value = entry[key] ?? '';

    // console.log(`KEY: ${key} -------- VALUE: ${value}`);

    return value;
  }
}
