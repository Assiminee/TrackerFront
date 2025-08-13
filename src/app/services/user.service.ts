import { Injectable } from '@angular/core';
import {BaseEntityService} from './base-entity.service';
import {BaseTableData} from '../interfaces/base-table-data.interface';
import {JwtDecoderService} from './jwt-decoder.service';
import {HttpClient} from '@angular/common/http';
import {UserRow} from '../interfaces/user-row.interface'
import {getRoleName, Role} from '../models/roles.enum';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseEntityService {
  constructor(client: HttpClient) {
    super(client);
    this.entity = 'user';
  }

  getEntryValue(key: string, entry: BaseTableData): string {
    let value;

    if (key === 'role') value = getRoleName(entry['role']) ?? '';
    else if (key === 'fullName') value = entry?.['firstName'] + ' ' + entry['lastName'];
    else if (key === 'team') value = entry['team']?.name ?? '';
    else value = entry[key] ?? '';

    // console.log(`KEY: ${key} -------- VALUE: ${value}`);

    return value;
  }

  formatForDelete(data: BaseTableData[], ids: string[]): { [p: string]: any }[] {
    const userData = data as UserRow[];

    return userData.filter(user => ids.includes(user.id)).map(user => {
      return  {
        ID: user.id,
        'Full Name': `${user.lastName} ${user.firstName}`,
        Role: getRoleName(user.role) ?? '',
        Team: user.role === Role.Admin ? '' : user.team?.name
      };
    });
  }
}
