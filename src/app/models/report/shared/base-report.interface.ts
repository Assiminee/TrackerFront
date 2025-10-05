import {PMInfo} from './pm-info.interface';

export interface BaseReport {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  owner: PMInfo;
  isDeleted: boolean;
}
