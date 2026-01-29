import { createAction, props } from '@ngrx/store';
import { LoginRequest } from '../../services/auth.service';

export const login = createAction(
  '[Auth/Login] Login',
  props<{ credentials: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth/Login] Login Success',
  props<{ token: string }>()
);

export const loginFailure = createAction(
  '[Auth/Login] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth/Login] Logout');
