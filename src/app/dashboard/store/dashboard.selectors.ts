import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from './dashboard.state';

export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');

export const selectChartDonut = createSelector(
  selectDashboardState,
  (state) => state.chartDonut
);

export const selectChartBar = createSelector(
  selectDashboardState,
  (state) => state.chartBar
);

export const selectTableUsers = createSelector(
  selectDashboardState,
  (state) => state.tableUsers
);

export const selectDashboardLoading = createSelector(
  selectDashboardState,
  (state) => state.loading
);

export const selectDashboardError = createSelector(
  selectDashboardState,
  (state) => state.error
);
