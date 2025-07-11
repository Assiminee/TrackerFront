import { Component, Input } from '@angular/core';
import {Col} from "../../interfaces/col.interface";

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @Input() rowCount: number = 150;
  @Input() cols: Col[] = [{name: ''}];

}
