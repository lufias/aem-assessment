import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from, TimeoutError } from 'rxjs';
import { map, exhaustMap, catchError, tap, timeout, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { PouchDBService } from '../../../core/services/pouchdb.service';
import * as LoginActions from './login.actions';

@Injectable()
export class LoginEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.login),
      exhaustMap(({ credentials }) => {
        // Check if offline first - skip API call entirely
        if (!navigator.onLine) {
          return this.tryOfflineLogin(credentials);
        }

        // Online - try API first
        return this.authService.login(credentials).pipe(
          timeout(10000), // 10 second timeout for API call
          map(token => LoginActions.loginSuccess({ token, credentials })),
          catchError(error => {
            // Check if it's a network error (offline scenario)
            if (this.isNetworkError(error)) {
              return this.tryOfflineLogin(credentials);
            }
            return of(LoginActions.loginFailure({ error: error.error || 'Login failed' }));
          })
        );
      })
    )
  );

  private tryOfflineLogin(credentials: { username: string; password: string }) {
    return from(this.pouchDBService.validateOfflineCredentials(
      credentials.username,
      credentials.password
    )).pipe(
      map(result => {
        if (result.valid && result.token) {
          return LoginActions.loginSuccess({
            token: result.token,
            isOffline: true
          });
        }
        return LoginActions.loginFailure({
          error: 'No network connection and no offline credentials found'
        });
      }),
      catchError(() => of(LoginActions.loginFailure({
        error: 'Offline validation failed'
      })))
    );
  }

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.loginSuccess),
      switchMap(({ token, credentials, isOffline }) => {
        // Store token in localStorage
        this.authService.setToken(token);

        // Store credentials in PouchDB for offline login (only if online login)
        if (credentials && !isOffline) {
          return from(this.pouchDBService.storeCredentials(
            credentials.username,
            credentials.password,
            token
          )).pipe(
            tap(() => console.log('Credentials stored in PouchDB')),
            catchError(err => {
              console.error('Failed to store offline credentials:', err);
              return of(null);
            }),
            tap(() => this.router.navigate(['/dashboard']))
          );
        }

        this.router.navigate(['/dashboard']);
        return of(null);
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.logout),
      tap(() => {
        this.authService.removeToken();
        // Optionally clear PouchDB data on logout
        // Uncomment the next line if you want to clear offline data on logout
        // this.pouchDBService.clearAllData();
        this.router.navigate(['/login']);
      })
    ),
    { dispatch: false }
  );

  private isNetworkError(error: any): boolean {
    // Check for common network error indicators
    return (
      error instanceof TimeoutError ||
      error.name === 'TimeoutError' ||
      error.status === 0 ||
      error.status === undefined ||
      (error.name === 'HttpErrorResponse' && error.status === 0) ||
      error.message?.includes('network') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('timeout') ||
      !navigator.onLine
    );
  }

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private pouchDBService: PouchDBService,
    private router: Router
  ) {}
}
