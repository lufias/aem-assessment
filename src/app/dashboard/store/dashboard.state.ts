import { ChartDataItem, TableUser } from '../services/dashboard.service';

export interface DashboardState {
  chartDonut: ChartDataItem[];
  chartBar: ChartDataItem[];
  tableUsers: TableUser[];
  loading: boolean;
  error: string | null;
}

export const initialDashboardState: DashboardState = {
  chartDonut: [],
  chartBar: [],
  tableUsers: [],
  loading: false,
  error: null
};
