import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<string> {
    return this.http.post(`${environment.apiUrl}/account/login`, credentials, {
      responseType: 'text'
    }).pipe(
      tap(token => this.setToken(token))
    );
  }

  setToken(token: string): void {
    // API returns token as JSON string with quotes, strip them
    const cleanToken = token.replace(/^"|"$/g, '');
    localStorage.setItem(this.TOKEN_KEY, cleanToken);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    // Strip quotes if present (legacy cleanup)
    return token ? token.replace(/^"|"$/g, '') : null;
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
