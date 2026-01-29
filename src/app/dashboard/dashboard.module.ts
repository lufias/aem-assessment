import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgChartsModule } from 'ng2-charts';

import { DashboardComponent } from './dashboard.component';
import { dashboardReducer, DashboardEffects } from './store';

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgChartsModule,
    StoreModule.forFeature('dashboard', dashboardReducer),
    EffectsModule.forFeature([DashboardEffects])
  ]
})
export class DashboardModule { }
