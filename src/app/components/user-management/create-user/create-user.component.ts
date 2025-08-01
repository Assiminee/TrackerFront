import {Component} from '@angular/core';

@Component({
  selector: 'app-create-user',
  imports: [],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
  roleOptions = [
    {value: 'ROLE_SA', name: 'Administrator'},
    {value: 'ROLE_PM', name: 'Project Manager'},
    {value: 'ROLE_TM', name: 'Team Member'}
  ];
  filteredOptions;
  chosenTeam: string = "Choose a team";

  constructor() {
    this.filteredOptions = [...this.roleOptions];
  }

  hide(name: string) {
    return this.filteredOptions
      .filter(option => option.name.toLowerCase().includes(name.toLowerCase())).length === 0;
  }
}
