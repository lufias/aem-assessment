import { createReducer, on } from '@ngrx/store';
import { initialLoginState } from './login.state';
import * as LoginActions from './login.actions';

export const loginReducer = createReducer(
  initialLoginState,

  on(LoginActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(LoginActions.loginSuccess, (state, { token }) => ({
    ...state,
    token,
    loading: false,
    error: null
  })),

  on(LoginActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(LoginActions.logout, (state) => ({
    ...state,
    token: null,
    error: null
  }))
);
