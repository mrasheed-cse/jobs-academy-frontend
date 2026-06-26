import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ExamSummary {
  username?: string;
  total_attempts: number;
  total_passed: number;
  total_failed: number;
  total_questions: number;
  total_answered: number;
  total_correct_answers: number;
  total_wrong_answers: number;
  obtained_marks?: number;
}

@Component({ selector: 'app-performance-stats', imports: [DecimalPipe], templateUrl: './performance-stats.html', styleUrl: './performance-stats.scss' })
export class PerformanceStats implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  readonly modelSummary = signal<ExamSummary | null>(null);
  readonly pastSummary = signal<ExamSummary | null>(null);
  readonly isLoading = signal(true);
  readonly activeTab = signal<'model' | 'past'>('model');

  ngOnInit(): void {
    // Get user id from JWT
    const token = localStorage.getItem('access_token');
    if (!token) { this.isLoading.set(false); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.user_id;
      this.http.get<ExamSummary>(`${this.baseUrl}/quiz/user-exam-summary/${userId}`).subscribe({
        next: (s) => { this.modelSummary.set(s); this.isLoading.set(false); },
        error: () => this.isLoading.set(false),
      });
      this.http.get<ExamSummary>(`${this.baseUrl}/quiz/user-past-exam-summary/${userId}/`).subscribe({
        next: (s) => this.pastSummary.set(s),
        error: () => {},
      });
    } catch { this.isLoading.set(false); }
  }

  setTab(tab: 'model' | 'past'): void { this.activeTab.set(tab); }
}
