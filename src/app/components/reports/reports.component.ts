import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {MainComponent} from '../main/main.component';
import {ReportData} from '../../interfaces/report-data.interface';
import {DataManagementComponent} from '../data-management/data-management.component';
import {MockDataService} from '../../services/mock-data.service';
import {DataTableColumn} from '../../interfaces/data-table-column.interface';

@Component({
  selector: 'app-reports',
  imports: [MainComponent, DataManagementComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
  standalone: true,
})
export class ReportsComponent implements OnInit {
  thead!: WritableSignal<DataTableColumn[]>;
  data!: ReportData[];
  entity!: string;

  constructor(private mockDataService: MockDataService) {
    this.data = this.mockDataService.getMockReports();

    this.thead = signal<DataTableColumn[]>([
      {key: 'title', title: 'Report Name', sortable: true, sortOrder: 'ASC', isEnabled: true},
      {key: 'createdAt', title: 'Creation Date', sortable: true, sortOrder: 'DESC', isDate: true, isEnabled: false},
      {key: 'updatedAt', title: 'Last Updated', sortable: true, sortOrder: 'DESC', isDate: true, isEnabled: false},
      {key: 'creator', title: 'Created By', sortable: true, sortOrder: 'ASC', isEnabled: false},
    ]);

    this.entity = 'report';
  }

  ngOnInit(): void {}
}
