import {Mode} from './modes.enum';
import {BaseTableData} from '../interfaces/base-table-data.interface';

export type SingleAction = {
  action: Mode;
}

export type SingleActionWithId = SingleAction & { id: string | null };

export type SingleActionWithEntity = SingleAction & { entity: BaseTableData | null };
