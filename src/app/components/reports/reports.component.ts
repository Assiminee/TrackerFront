import {Component, HostListener, OnInit, signal} from '@angular/core';
import {MainComponent} from '../main/main.component';
import {MatCheckbox} from '@angular/material/checkbox';
import {ListHeaderComponent} from '../list-header/list-header.component';
import {ReportData} from '../../interfaces/report-data.interface';
import {ReportCheckbox} from '../../interfaces/report-checkbox.interface';
import {DataTableComponent} from '../data-table/data-table.component';

@Component({
  selector: 'app-reports',
  imports: [MainComponent, MatCheckbox, ListHeaderComponent, DataTableComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  reports: ReportData[] = [
    {
      report_id: "rpt-001",
      title: "Monthly Sales (July 2025)",
      createdAt: new Date(2024, 11, 10, 12, 55, 23),
      updatedAt: new Date(2025, 6, 14, 11, 17, 22, 44),
      creator: "Yasmine Znatni",
    },
    {
      report_id: "rpt-002",
      title: "Inventory Audit Q3",
      createdAt: new Date(2023, 5, 2, 12, 55, 23),
      updatedAt: new Date(2024, 6, 14, 11, 17, 22, 44),
      creator: "Rania Bouabid",
    },
    {
      report_id: "rpt-003",
      title: "Monthly Sales (July 2025)",
      createdAt: new Date(2024, 11, 10, 12, 55, 23),
      updatedAt: new Date(2025, 6, 14, 11, 17, 22, 44),
      creator: "Yasmine Znatni",
    },
    {
      report_id: "rpt-004",
      title: "Inventory Audit Q3",
      createdAt: new Date(2023, 5, 2, 12, 55, 23),
      updatedAt: new Date(2024, 6, 14, 11, 17, 22, 44),
      creator: "Rania Bouabid",
    },
    {
      report_id: "rpt-005",
      title: "Monthly Sales (July 2025)",
      createdAt: new Date(2024, 11, 10, 12, 55, 23),
      updatedAt: new Date(2025, 6, 14, 11, 17, 22, 44),
      creator: "Yasmine Znatni",
    }
  ];
  isListDisplay = true;
  openMenuIndex : string = "";
  openOptionsMenu : boolean = false;
  pages = 4;
  currentPage = 1;

  ngOnInit(): void {
  }

  changeDisplay(isList: boolean) {
    this.isListDisplay = isList;
  }

  toggleMenu(index: string) {
    this.openMenuIndex = index;
    this.openOptionsMenu = false;
  }

  @HostListener('document:click')
  closeAllMenus() {
    this.openMenuIndex = '';
    this.openOptionsMenu = false;
  }

  toggleOptions(open: boolean) {
    this.openOptionsMenu = open;
    this.openMenuIndex = '';
  }

  prevPage() {
    if (this.currentPage === 1)
      return;

    this.currentPage--;
  }

  nextPage() {
    if (this.currentPage === this.pages)
      return;

    this.currentPage++;
  }

  protected readonly String = String;
}
