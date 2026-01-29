import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChartDataItem {
  name: string;
  value: number;
}

export interface TableUser {
  firstName: string;
  lastName: string;
  username: string;
}

export interface DashboardResponse {
  success: boolean;
  chartDonut: ChartDataItem[];
  chartBar: ChartDataItem[];
  tableUsers: TableUser[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboardData(token: string): Observable<DashboardResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('Dashboard API - Sending request with Authorization:', `Bearer ${token.substring(0, 20)}...`);
    return this.http.get<DashboardResponse>(`${environment.apiUrl}/dashboard`, { headers });
  }
}
