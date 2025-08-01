import { Injectable } from '@angular/core';
import {ReportData} from '../interfaces/report-data.interface';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // private mockTeams: Team[] = [
  //   {
  //     id: 't-001',
  //     name: 'Alpha Squad',
  //     createdAt: new Date('2024-11-12T09:15:00Z'),
  //     updatedAt: new Date('2025-01-03T14:22:10Z'),
  //     pm: { id: 'pm-101', firstName: 'Jane', lastName: 'Doe' },
  //     // deleted: false
  //   },
  //   {
  //     id: 't-002',
  //     name: 'Beta Builders',
  //     createdAt: new Date('2024-12-01T12:00:00Z'),
  //     updatedAt: new Date('2025-02-18T08:05:45Z'),
  //     pm: { id: 'pm-102', firstName: 'Carlos', lastName: 'Alvarez' },
  //     // deleted: false
  //   },
  //   {
  //     id: 't-003',
  //     name: 'Gamma Gurus',
  //     createdAt: new Date('2025-01-05T10:30:00Z'),
  //     updatedAt: new Date('2025-03-11T16:41:00Z'),
  //     // deleted: true
  //   },
  //   {
  //     id: 't-004',
  //     name: 'Delta Devs',
  //     createdAt: new Date('2024-10-23T07:45:13Z'),
  //     updatedAt: new Date('2025-02-01T18:12:33Z'),
  //     pm: { id: 'pm-103', firstName: 'Amina', lastName: 'Farouk' },
  //     // deleted: false
  //   },
  //   {
  //     id: 't-005',
  //     name: 'Epsilon Engineers',
  //     createdAt: new Date('2024-08-14T13:05:27Z'),
  //     updatedAt: new Date('2025-01-25T09:55:02Z'),
  //     pm: { id: 'pm-104', firstName: 'Luca', lastName: 'Bianchi' },
  //     // deleted: true
  //   },
  //   {
  //     id: 't-006',
  //     name: 'Zeta Zephyrs',
  //     createdAt: new Date('2024-09-02T11:00:00Z'),
  //     updatedAt: new Date('2025-03-02T11:45:00Z'),
  //     // deleted: false
  //   },
  //   {
  //     id: 't-007',
  //     name: 'Omega Ops',
  //     createdAt: new Date('2024-07-19T15:20:00Z'),
  //     updatedAt: new Date('2025-02-10T10:10:10Z'),
  //     pm: { id: 'pm-105', firstName: 'Sofia', lastName: 'Müller' },
  //     // deleted: false
  //   },
  //   {
  //     id: 't-008',
  //     name: 'Sigma Systems',
  //     createdAt: new Date('2024-06-30T08:08:08Z'),
  //     updatedAt: new Date('2025-03-15T12:34:56Z'),
  //     // deleted: true
  //   },
  //   {
  //     id: 't-009',
  //     name: 'Phoenix Force',
  //     createdAt: new Date('2024-05-21T09:00:00Z'),
  //     updatedAt: new Date('2025-01-30T17:25:00Z'),
  //     pm: { id: 'pm-106', firstName: 'Noah', lastName: 'Johnson' },
  //     // deleted: false
  //   },
  //   {
  //     id: 't-010',
  //     name: 'Nova Nexus',
  //     createdAt: new Date('2024-04-11T21:45:00Z'),
  //     updatedAt: new Date('2025-02-20T06:30:00Z'),
  //     // deleted: false
  //   }
  // ];

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

  // private mockUserData: UserRow[] = [
  //   {
  //     id: 'H3G4H2235FELL',
  //     firstName: 'Jane',
  //     lastName: 'Doe',
  //     deleted: false,
  //     role: 'ROLE_PM',
  //     team: {
  //       teamId: '52g3h3bf23',
  //       name: 'IAMNPM'
  //     }
  //   },
  //   {
  //     id: 'UEW738R8F32XY',
  //     firstName: 'Lana',
  //     lastName: 'Del Rey',
  //     deleted: true,
  //     role: 'ROLE_TM',
  //     team: {
  //       teamId: '52g3h3bf23',
  //       name: 'IAMNPM'
  //     }
  //   },
  //   {
  //     id: 'P21EH12RBWQZ',
  //     firstName: 'Ruby',
  //     lastName: 'Jule',
  //     deleted: false,
  //     role: 'ROLE_TM',
  //     team: {
  //       teamId: '52g3h3bf23',
  //       name: 'IAMNPM'
  //     }
  //   },
  //   {
  //     id: '125141H4JNBV22',
  //     firstName: 'Ryan',
  //     lastName: 'Renolds',
  //     deleted: false,
  //     role: 'ROLE_PM',
  //     team: {
  //       teamId: '62HG4B12A',
  //       name: 'RF'
  //     }
  //   },
  //   {
  //     id: 'H3G4H2235FEE',
  //     firstName: 'Jane',
  //     lastName: 'Doe',
  //     deleted: false,
  //     role: 'ROLE_PM',
  //     team: {
  //       teamId: '52g3h3bf23',
  //       name: 'IAMNPM'
  //     }
  //   },
  //   {
  //     id: 'UEW738R8F32YH',
  //     firstName: 'Lana',
  //     lastName: 'Del Rey',
  //     deleted: true,
  //     role: 'ROLE_SA'
  //   },
  //   {
  //     id: 'P21EH12RBWQ',
  //     firstName: 'Ruby',
  //     lastName: 'Jule',
  //     deleted: false,
  //     role: 'ROLE_TM',
  //     team: {
  //       teamId: '52g3h3bf23',
  //       name: 'IAMNPM'
  //     }
  //   },
  //   {
  //     id: '125141H4JNBV',
  //     firstName: 'Ryan',
  //     lastName: 'Renolds',
  //     deleted: false,
  //     role: 'ROLE_PM',
  //     team: {
  //       teamId: '62HG4B12A',
  //       name: 'RF'
  //     }
  //   }
  // ];



  constructor() { }

  // getMockTeams() {
  //   return this.mockTeams;
  // }

  getMockReports() {
    return this.mockReports;
  }

  // getMockUserData() {
  //   return this.mockUserData;
  // }
}
