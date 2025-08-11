import {BaseTableData} from './base-table-data.interface';

interface EmbeddedTeam {
  id: string;
  name: string;
}

export interface UserRow extends BaseTableData {
  firstName: string;
  lastName: string;
  role: string;
  team?: EmbeddedTeam;
  phoneNumber: string;
  email: string;
  deleted: boolean;
  createdAt: Date;
}
