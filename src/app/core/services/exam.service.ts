import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Category,
  ExamDetail,
  ExamListItem,
  ExamQuestionsResponse,
  ExamStartResponse,
  ExamSubmitRequest,
  ExamSubmitResponse,
  ExamAttempt,
  ExamType,
  Organization,
} from '../models/exam.model';
import { PastExamAttempt, PastExamListItem, PastExamSubmitResponse } from '../models/past-exam.model';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/quiz/categories/`);
  }

  getExamTypes(): Observable<ExamType[]> {
    return this.http.get<ExamType[]>(`${this.baseUrl}/quiz/exam-types/`);
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${this.baseUrl}/quiz/organizations/`);
  }

  getExams(): Observable<ExamListItem[]> {
    return this.http.get<ExamListItem[]>(`${this.baseUrl}/quiz/exams/`);
  }

  getExamDetail(examId: string): Observable<ExamDetail> {
    return this.http.get<ExamDetail>(`${this.baseUrl}/quiz/exams/${examId}/`);
  }

  startExam(examId: string): Observable<ExamStartResponse> {
    return this.http.get<ExamStartResponse>(`${this.baseUrl}/quiz/exams/${examId}/start/`);
  }

  getExamQuestions(examId: string): Observable<ExamQuestionsResponse> {
    return this.http.get<ExamQuestionsResponse>(`${this.baseUrl}/quiz/exams/${examId}/questions/`);
  }

  submitExam(examId: string, payload: ExamSubmitRequest): Observable<ExamSubmitResponse> {
    return this.http.post<ExamSubmitResponse>(`${this.baseUrl}/quiz/exams/${examId}/submit/`, payload);
  }

  getUserAttempts(): Observable<ExamAttempt[]> {
    return this.http.get<ExamAttempt[]>(`${this.baseUrl}/quiz/attempts/user_attempts/`);
  }

  getExamLeaderboard(examId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/quiz/exam/${examId}/leaderboard/`);
  }

  // --- Past exams ---

  getPastExams(): Observable<PastExamListItem[]> {
    return this.http.get<PastExamListItem[]>(`${this.baseUrl}/quiz/past-exams/`);
  }

  getPastExamDetail(id: number): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/quiz/past-exams/${id}/`);
  }

  submitPastExam(id: number, payload: ExamSubmitRequest): Observable<PastExamSubmitResponse> {
    return this.http.post<PastExamSubmitResponse>(`${this.baseUrl}/quiz/past-exams/${id}/submit/`, payload);
  }

  getPastExamUserAttempts(): Observable<PastExamAttempt[]> {
    return this.http.get<PastExamAttempt[]>(`${this.baseUrl}/quiz/past_exam/user_attempts/`);
  }

  // --- Permission check (call before allowing a user to open any exam) ---

  checkExamPermission(examId: string | number): Observable<{ has_access: boolean; trial?: boolean; reason?: string }> {
    return this.http.get<{ has_access: boolean; trial?: boolean; reason?: string }>(
      `${this.baseUrl}/api/check-permission/${examId}/`,
    );
  }
}
