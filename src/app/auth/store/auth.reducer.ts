import { combineReducers } from '@ngrx/store';
import { loginReducer } from './login/login.reducer';

export const authReducer = combineReducers({
  login: loginReducer
});
