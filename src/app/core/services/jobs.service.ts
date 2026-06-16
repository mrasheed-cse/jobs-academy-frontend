import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GovernmentJob, Notice } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getJobs(): Observable<GovernmentJob[]> {
    return this.http.get<GovernmentJob[]>(`${this.baseUrl}/api/govt-jobs/`);
  }

  getJob(id: number): Observable<GovernmentJob> {
    return this.http.get<GovernmentJob>(`${this.baseUrl}/api/govt-jobs/${id}/`);
  }

  getNotices(): Observable<Notice[]> {
    return this.http.get<Notice[]>(`${this.baseUrl}/api/notices/`);
  }

  getNotice(id: number): Observable<Notice> {
    return this.http.get<Notice>(`${this.baseUrl}/api/notices/${id}/`);
  }
}
