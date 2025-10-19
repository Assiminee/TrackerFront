import {Injectable} from '@angular/core';
import {BaseEntityService} from './base-entity.service';
import {BaseTableData} from '../interfaces/base-table-data.interface';
import {HttpClient} from '@angular/common/http';
import {Team} from '../interfaces/team.interface';
import {entityNames} from '../core/utils/globals';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends BaseEntityService {

  constructor(client: HttpClient) {
    super(client);
    this.entity = entityNames.team;
  }

  getEntryValue(key: string, entry: BaseTableData): string {
    if (key === 'pm') {
      if (entry['pm'] === null)
        return 'Not Assigned';

      return entry?.['pm']?.['lastName'] + " " + entry['pm']?.['firstName'];
    }

    return entry[key];
  }

  formatForDelete(data: BaseTableData[], ids: string[]): { [key: string]: any }[] {
    const teamData = data as Team[];

    return teamData.filter(team => ids.includes(team.id)).map(team => {
      return {
        'Team Name': team.name,
        PM: team.pm !== null ? `${team.pm?.lastName} ${team.pm?.firstName} (ID: ${team.pm?.id})` : "Not assigned",
        'Total Members': team.memberCount
      }
    });
  }
}
