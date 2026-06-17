import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GameActivityResponse } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getGameActivity(): Observable<GameActivityResponse> {
    return this.http.get<GameActivityResponse>(`${this.baseUrl}/api/v1/game-activity/`);
  }
}
