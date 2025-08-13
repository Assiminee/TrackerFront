import { Injectable } from '@angular/core';
import {ReportData} from '../interfaces/report-data.interface';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockReports: ReportData[] = [
    {
      id: "rpt-001",
      title: "Monthly Sales (July 2025)",
      createdAt: new Date(2024, 11, 10, 12, 55, 23),
      updatedAt: new Date(2025, 6, 14, 11, 17, 22, 44),
      creator: "Yasmine Znatni",
    },
    {
      id: "rpt-002",
      title: "Inventory Audit Q3",
      createdAt: new Date(2023, 5, 2, 12, 55, 23),
      updatedAt: new Date(2024, 6, 14, 11, 17, 22, 44),
      creator: "Rania Bouabid",
    },
    {
      id: "rpt-003",
      title: "Monthly Sales (July 2025)",
      createdAt: new Date(2024, 11, 10, 12, 55, 23),
      updatedAt: new Date(2025, 6, 14, 11, 17, 22, 44),
      creator: "Yasmine Znatni",
    },
    {
      id: "rpt-004",
      title: "Inventory Audit Q3",
      createdAt: new Date(2023, 5, 2, 12, 55, 23),
      updatedAt: new Date(2024, 6, 14, 11, 17, 22, 44),
      creator: "Rania Bouabid",
    },
    {
      id: "rpt-005",
      title: "Monthly Sales (July 2025)",
      createdAt: new Date(2024, 11, 10, 12, 55, 23),
      updatedAt: new Date(2025, 6, 14, 11, 17, 22, 44),
      creator: "Yasmine Znatni",
    }
  ];

  constructor() { }

  getMockReports() {
    return this.mockReports;
  }
}
