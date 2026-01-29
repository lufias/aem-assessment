import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { DashboardService } from '../services/dashboard.service';
import { AuthService } from '../../auth/services/auth.service';
import { PouchDBService } from '../../core/services/pouchdb.service';
import * as DashboardActions from './dashboard.actions';

@Injectable()
export class DashboardEffects {
  loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboard),
      exhaustMap(() => {
        const token = this.authService.getToken();
        if (!token) {
          return of(DashboardActions.loadDashboardFailure({ error: 'No authentication token' }));
        }
        return this.dashboardService.getDashboardData(token).pipe(
          tap(response => {
            // Cache data in PouchDB for offline access
            this.pouchDBService.storeDashboardData(
              response.chartDonut,
              response.chartBar,
              response.tableUsers
            ).catch(err => console.error('Failed to cache dashboard data:', err));
          }),
          map(response => DashboardActions.loadDashboardSuccess({
            chartDonut: response.chartDonut,
            chartBar: response.chartBar,
            tableUsers: response.tableUsers
          })),
          catchError(error => {
            // Check if it's a network error
            if (this.isNetworkError(error)) {
              // Try to load from PouchDB cache
              return from(this.pouchDBService.getDashboardData()).pipe(
                map(cachedData => {
                  if (cachedData) {
                    return DashboardActions.loadDashboardSuccess({
                      chartDonut: cachedData.chartDonut,
                      chartBar: cachedData.chartBar,
                      tableUsers: cachedData.tableUsers
                    });
                  }
                  return DashboardActions.loadDashboardFailure({
                    error: 'No network connection and no cached data available'
                  });
                }),
                catchError(() => of(DashboardActions.loadDashboardFailure({
                  error: 'Failed to load cached data'
                })))
              );
            }
            const message = error.error?.message || error.message || error.statusText || 'Failed to load dashboard data';
            return of(DashboardActions.loadDashboardFailure({ error: message }));
          })
        );
      })
    )
  );

  private isNetworkError(error: any): boolean {
    return (
      error.status === 0 ||
      error.status === undefined ||
      error.name === 'HttpErrorResponse' && error.status === 0 ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      !navigator.onLine
    );
  }

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private pouchDBService: PouchDBService
  ) {}
}
