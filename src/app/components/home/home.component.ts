import {Component} from '@angular/core';
import {MainComponent} from '../main/main.component';
import {TableComponent} from '../table/table.component';
import {PreviewComponent} from '../preview/preview.component';
import {Table} from '../../interfaces/table.interface';
import {TableDisplayService} from '../../services/table-display.service';

@Component({
  selector: 'app-home',
  imports: [
    MainComponent,
    PreviewComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent {
  tables: Table[];

  constructor(tableDisplayService: TableDisplayService) {
    this.tables = tableDisplayService.getData();
  }
}
