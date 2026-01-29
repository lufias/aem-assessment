import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LoginActions, selectLoginToken } from '../auth/store';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  token$: Observable<string | null>;

  constructor(private store: Store) {
    this.token$ = this.store.select(selectLoginToken);
  }

  logout(): void {
    this.store.dispatch(LoginActions.logout());
  }
}
