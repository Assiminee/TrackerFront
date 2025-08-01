import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-main',
  imports: [
    FormsModule
  ],
  templateUrl: './main.component.html',
  standalone: true,
  styleUrl: './main.component.css'
})
export class MainComponent {
  initials: string = "";
  role: string = "";
  searchText: string = "";

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

      if (searchText !== this.searchText)
        this.searchText = searchText;
    });
  }

  pushSearchText() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchText: this.searchText },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
