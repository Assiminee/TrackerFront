export interface DeleteElements {
  tableIds: Set<string>;
  columnIds: Record<string, Set<string>>;
  subColumnIds: Record<string, Record<string, Set<string>>>;
  standaloneCellIds: Set<string>;
}

export interface SendDeleteElements {
  tableIds: string[];
  columnIds: Record<string, string[]>;
  subColumnIds: Record<string, Record<string, string[]>>;
  standaloneCellIds: string[];
}

