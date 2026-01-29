import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { DashboardService } from '../services/dashboard.service';
import { AuthService } from '../../auth/services/auth.service';
import * as DashboardActions from './dashboard.actions';

@Injectable()
export class DashboardEffects {
  loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboard),
      exhaustMap(() => {
        const token = this.authService.getToken();
        console.log('Dashboard API - Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NULL');
        if (!token) {
          return of(DashboardActions.loadDashboardFailure({ error: 'No authentication token' }));
        }
        return this.dashboardService.getDashboardData(token).pipe(
          map(response => DashboardActions.loadDashboardSuccess({
            chartDonut: response.chartDonut,
            chartBar: response.chartBar,
            tableUsers: response.tableUsers
          })),
          catchError(error => {
            const message = error.error?.message || error.message || error.statusText || 'Failed to load dashboard data';
            return of(DashboardActions.loadDashboardFailure({ error: message }));
          })
        );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}
}
