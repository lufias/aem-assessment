import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';

export interface AppState {
  // Add feature states here, e.g.:
  // users: UsersState;
}

export const reducers: ActionReducerMap<AppState> = {
  // Add feature reducers here, e.g.:
  // users: usersReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
