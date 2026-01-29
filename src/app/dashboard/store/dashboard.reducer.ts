import { createReducer, on } from '@ngrx/store';
import { initialDashboardState } from './dashboard.state';
import * as DashboardActions from './dashboard.actions';

export const dashboardReducer = createReducer(
  initialDashboardState,

  on(DashboardActions.loadDashboard, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(DashboardActions.loadDashboardSuccess, (state, { chartDonut, chartBar, tableUsers }) => ({
    ...state,
    chartDonut,
    chartBar,
    tableUsers,
    loading: false,
    error: null
  })),

  on(DashboardActions.loadDashboardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
