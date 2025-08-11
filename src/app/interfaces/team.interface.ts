import {BaseTableData} from './base-table-data.interface';

interface EmbeddedPm {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Team extends BaseTableData {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  pm?: EmbeddedPm;
  deleted: boolean;
  memberCount: number;
}
