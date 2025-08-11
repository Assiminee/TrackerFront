import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {AsyncPipe} from '@angular/common';
import {IonicModule, InfiniteScrollCustomEvent} from '@ionic/angular';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
  catchError
} from 'rxjs';
import {Team} from '../interfaces/team.interface';
import {TeamService} from '../services/team.service';
import {InfiniteScrollDirective} from 'ngx-infinite-scroll';

type PageResp = { content: Team[]; last?: boolean; totalPages?: number };

@Component({
  selector: 'app-tst',
  standalone: true,
  imports: [ReactiveFormsModule, IonicModule, AsyncPipe, InfiniteScrollDirective],
  templateUrl: './tst.component.html',
  styleUrl: './tst.component.css'
})
export class TstComponent implements OnInit {
  searchTerm = new FormControl<string>('', {nonNullable: true});
  teams: Team[] = [];
  isLoading: boolean = false;
  currentPage = 0;
  getTeamsParams = [
    {key: 'searchNameOnly', filterBy: 'true', queryParamName: 'searchNameOnly'}
  ];
  toggleIsLoading = () => this.isLoading = !this.isLoading;

  constructor(private teamService: TeamService) {}

  loadData() {
    this.toggleIsLoading();
    this.teamService.getPage(this.getTeamsParams, this.searchTerm.value, this.currentPage)
      .subscribe({
        next: data => {
          if (this.teamService.isValidResponse(data))
            this.teams = data.content as Team[];
        }, error: error => {
          console.log(error);
        },
        complete: () => {
          this.toggleIsLoading()
        }
      });
  }

  appendData() {
    this.toggleIsLoading();
    this.teamService.getPage(this.getTeamsParams, this.searchTerm.value, this.currentPage)
      .subscribe({
        next: data => {
          if (this.teamService.isValidResponse(data)) {
            this.teams = [...this.teams, ...(data.content as Team[])];
            console.log(this.teams)
          }
        }, error: error => {
          console.log(error);
        },
        complete: () => {
          this.toggleIsLoading();
        }
      })
  }

  onScroll() {
    this.currentPage++;
    this.appendData();
  }

  ngOnInit(): void {
    this.loadData();
  }

}
