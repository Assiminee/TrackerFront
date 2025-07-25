import {BaseTableData} from './base-table-data.interface';

interface EmbeddedTeam {
  teamId: string;
  name: string;
}

export interface UserRow extends BaseTableData {
  firstName: string;
  lastName: string;
  role: string;
  team?: EmbeddedTeam;
  deleted: boolean;
}
