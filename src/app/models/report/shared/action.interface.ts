export interface Action {
  type: ActionType;
}

export interface DataAction {
  targetId: string;
  value: string;
}

export function isDataAction(action: any): action is DataAction {
  return (
    action && typeof action === 'object' &&
    'targetId' in action && 'value' in action
  );
}

export enum ActionType {
  CREATE_TABLE,
  DELETE_TABLE,

  ADD_COLUMN,
  DELETE_COLUMN,

  ADD_ROW,
  DELETE_ROW,

  ADD_HEADER_FIELD,
  DELETE_HEADER_FIELD,

  ADD_SUB_HEADER_FIELD,
  DELETE_SUB_HEADER_FIELD,

  EDIT_CELL_VALUE,

  EDIT_SHEET_NAME,
  DELETE_SHEET
}
