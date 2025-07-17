export interface ReportCheckbox {
  name: string;
  selected: boolean;
  subReports?: ReportCheckbox[];
}
