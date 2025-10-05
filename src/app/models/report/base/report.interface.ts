import {SheetInfo} from '../shared/sheet-info.interface';
import {BaseReport} from '../shared/base-report.interface';

export interface Report extends BaseReport {
  sheets: SheetInfo[];
  sheetCount: number;
}

// export interface ReportTemplate {
//   id: string;
//   name: string;
//   createdAt: Date;
//   updatedAt: Date;
//   description: string;
//   isDeleted: boolean;
//   team: {
//     id: string;
//     name: string;
//   };
//   schemaVersion: number;
//   owner: {
//     id: string;
//     firstName: string;
//     lastName: string;
//   };
//   sheetTemplateCount: number;
//   sheetTemplates: [
//     {
//       id: string;
//       name: string;
//       createdAt: Date;
//       updatedAt: Date;
//
//       columnCount: number;
//       rowCount: number;
//       tables: [
//         {
//           id: string;
//
//           columns: [
//             {
//               id: string;
//
//               columnName: string;
//               columnIndex: number;
//               subColumns?: [
//                 {
//                   id: string;
//
//                   subColumnIndex: number;
//                   subColumnName: string;
//                 }
//               ];
//             }
//           ];
//           startingRow: number;
//           endingRow: number;
//           startingColumn: number;
//           endingColumn: number;
//           hasSubColumns: boolean;
//         }
//       ];
//       standaloneCells: [
//         {
//           id: string;
//
//           columnIndex: number;
//           rowIndex: number;
//           standaloneCellName: string;
//         }
//       ]
//     },
//   ]
// }
//
// interface ReportTemplate2 {
//   id: string;
//   name: string;
//   createdAt: Date;
//   updatedAt: Date;
//   description: string;
//   isDeleted: boolean;
//   owner: {
//     id: string;
//     firstName: string;
//     lastName: string;
//   };
//   sheetTemplateCount: number;
//   sheetTemplates: [
//     {
//       id: string;
//       name: string;
//     },
//   ];
// }
