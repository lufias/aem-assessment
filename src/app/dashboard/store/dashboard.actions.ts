import { createAction, props } from '@ngrx/store';
import { ChartDataItem, TableUser } from '../services/dashboard.service';

export const loadDashboard = createAction('[Dashboard] Load Dashboard');

export const loadDashboardSuccess = createAction(
  '[Dashboard] Load Dashboard Success',
  props<{
    chartDonut: ChartDataItem[];
    chartBar: ChartDataItem[];
    tableUsers: TableUser[];
  }>()
);

export const loadDashboardFailure = createAction(
  '[Dashboard] Load Dashboard Failure',
  props<{ error: string }>()
);
