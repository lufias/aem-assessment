import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../auth.state';
import { LoginState } from './login.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectLoginState = createSelector(
  selectAuthState,
  (state) => state.login
);

export const selectLoginToken = createSelector(
  selectLoginState,
  (state: LoginState) => state.token
);

export const selectLoginLoading = createSelector(
  selectLoginState,
  (state: LoginState) => state.loading
);

export const selectLoginError = createSelector(
  selectLoginState,
  (state: LoginState) => state.error
);

export const selectIsAuthenticated = createSelector(
  selectLoginToken,
  (token) => !!token
);
