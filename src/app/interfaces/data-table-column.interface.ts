export interface DataTableColumn {
  key: string;
  title?: string;
  queryParamName?: string;
  sortable?: boolean;
  sortOrder?: 'ASC' | 'DESC';
  isDate?: boolean;
  isEnum?: boolean;
  isFlag?: boolean;
  badge?: boolean;
  customCssClass?: string | Record<string, string>;
  filterBy?: string | boolean | null;
  isEnabled?: boolean;
}
