export interface Col {
  name: string;
  subCols?: string[];
}

export interface ColWithSubCols extends Col {
  subCols: string[];
}
