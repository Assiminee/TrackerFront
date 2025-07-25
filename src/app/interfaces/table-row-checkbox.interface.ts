export interface TableRowCheckbox {
  name: string;
  selected: boolean;
  childCheckboxes?: TableRowCheckbox[];
}
