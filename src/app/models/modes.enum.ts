export enum Mode {
  CREATE = -1,
  DELETE = 0,
  VIEW = 1,
  EDIT = 2,
  DOWNLOAD = 3
}

export function isCreate(mode: Mode) {
  return mode === Mode.CREATE;
}
