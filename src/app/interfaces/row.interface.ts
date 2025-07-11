import {Editor} from './editor.interface';

export interface Row {
  id: string;
  createdAt: string;
  updatedAt: string;
  editor: Editor;
  [key: string]: unknown;
}
