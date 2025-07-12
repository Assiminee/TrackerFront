import {Editor} from './editor.interface';

export interface Row {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  editor: Editor;
  [key: string]: unknown;
}
