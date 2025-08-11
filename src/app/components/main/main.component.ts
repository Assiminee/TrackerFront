import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-main',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './main.component.html',
  standalone: true,
  styleUrl: './main.component.css'
})
export class MainComponent {
  initials: string = "";
  role: string = "";
  searchText: FormControl = new FormControl('');

  constructor(protected auth: AuthService, protected router: Router, private route: ActivatedRoute) {
    const user = this.auth.loggedInUser();

    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    this.initials = user.lastName.charAt(0).toUpperCase() + user.firstName.charAt(0).toUpperCase();
    this.role = user.role;

    this.route.queryParams.subscribe(params => {
      const searchText = (params['searchText'] ?? "").trim();

      if (searchText !== this.searchText.value)
        this.searchText.setValue(searchText);
    });
  }

  resetSearchText(): void {
    this.searchText.setValue("");
    this.pushSearchText();
  }

  pushSearchText() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchText: this.searchText.value },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
