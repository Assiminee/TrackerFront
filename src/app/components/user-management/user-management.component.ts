import {Component, signal, Signal, WritableSignal} from '@angular/core';
import {DataManagementComponent} from '../data-management/data-management.component';
import {BaseTableData} from '../../interfaces/base-table-data.interface';
import {UserRow} from '../../interfaces/user-row.interface';
import {MockDataService} from '../../services/mock-data.service';
import {DataTableColumn} from '../../interfaces/data-table-column.interface';
import {CreateUserComponent} from './create-user/create-user.component';

@Component({
  selector: 'app-user-management',
  imports: [
    DataManagementComponent,
    CreateUserComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent {
  thead!: WritableSignal<DataTableColumn[]>;
  data!: UserRow[];
  entity!: string;

  constructor(private mockDataService: MockDataService) {
    this.data = this.mockDataService.getMockUserData();

    this.thead = signal<DataTableColumn[]>([
      {key: 'id', title: 'ID', sortable: true, sortOrder: 'ASC', isEnabled: false},
      {key: 'fullName', title: 'Full Name', sortable: true, sortOrder: 'ASC', isEnabled: true},
      {key: 'team', title: 'Team', sortable: true, sortOrder: 'ASC', isEnabled: false},
      {
        key: 'role', title: 'Role', isEnum: true, badge: true, customCssClass: {
          ROLE_PM: 'text-blue-600 bg-blue-50 rounded-lg',
          ROLE_TM: 'text-orange-600 bg-orange-50 rounded-lg',
          ROLE_SA: 'text-purple-600 bg-purple-50 rounded-lg'
        }
      },
      {
        key: 'deleted', title: 'Account Status', isFlag: true, badge: true, customCssClass: {
          'true': 'text-red-600 bg-red-50 rounded-lg',
          'false': 'text-green-600 bg-green-50 rounded-lg'
        }
      },
    ]);

    this.entity = 'user';
  }

  formatData(): BaseTableData[] {
    const data: BaseTableData[] = [];

    for (const userRow of this.data) {
      const row = {
        id: userRow.id,
        fullName: userRow.firstName + ' ' + userRow.lastName,
        team: userRow?.team?.name ?? '',
        deleted: userRow.deleted,
        role: userRow.role,
      };

      data.push(row);
    }

    console.log(data);
    return data;
  }
}
