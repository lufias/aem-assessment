import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartConfiguration, ChartData } from 'chart.js';
import { LoginActions } from '../auth/store';
import {
  DashboardActions,
  selectChartDonut,
  selectChartBar,
  selectTableUsers,
  selectDashboardLoading,
  selectDashboardError
} from './store';
import { TableUser } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  tableUsers$: Observable<TableUser[]>;

  donutChartData$: Observable<ChartData<'doughnut'>>;
  barChartData$: Observable<ChartData<'bar'>>;

  donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(private store: Store) {
    this.loading$ = this.store.select(selectDashboardLoading);
    this.error$ = this.store.select(selectDashboardError);
    this.tableUsers$ = this.store.select(selectTableUsers);

    const chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    this.donutChartData$ = this.store.select(selectChartDonut).pipe(
      map(data => ({
        labels: data.map(item => item.name),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: chartColors,
          hoverBackgroundColor: chartColors
        }]
      }))
    );

    this.barChartData$ = this.store.select(selectChartBar).pipe(
      map(data => ({
        labels: data.map(item => item.name),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: chartColors,
          hoverBackgroundColor: chartColors
        }]
      }))
    );
  }

  ngOnInit(): void {
    this.store.dispatch(DashboardActions.loadDashboard());
  }

  logout(): void {
    this.store.dispatch(LoginActions.logout());
  }
}
