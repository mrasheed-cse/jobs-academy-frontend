import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
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
  ExamLeaderboardResponse,
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

  // Requires exam_id — confirmed via live testing that this endpoint returns
  // 400 without it (it answers "my attempts for THIS exam", not "all my
  // attempts"). Also returns 404 with {message: "No attempts found..."}
  // when the user hasn't attempted this exam yet — callers should treat
  // that as an empty list, not a hard error.
  getUserAttempts(examId: string): Observable<ExamAttempt[]> {
    return this.http
      .get<ExamAttempt[]>(`${this.baseUrl}/quiz/attempts/user_attempts/`, { params: { exam_id: examId } })
      .pipe(catchError((err) => (err.status === 404 ? of([]) : throwError(() => err))));
  }

  getExamLeaderboard(examId: string): Observable<ExamLeaderboardResponse> {
    return this.http.get<ExamLeaderboardResponse>(`${this.baseUrl}/quiz/exam/${examId}/leaderboard/`);
  }

  // --- Permission check ---

  checkExamPermission(examId: string | number): Observable<{ has_access: boolean; trial?: boolean; reason?: string }> {
    return this.http.get<{ has_access: boolean; trial?: boolean; reason?: string }>(
      `${this.baseUrl}/api/check-permission/${examId}/`,
    );
  }

  // --- Model tests (a curated subset of Exam records) ---

  getModelExamTypes(): Observable<ExamType[]> {
    return this.http.get<ExamType[]>(`${this.baseUrl}/quiz/model/exam-types/`);
  }

  getModelExams(examTypeId: number | string): Observable<ExamListItem[]> {
    return this.http.get<ExamListItem[]>(`${this.baseUrl}/quiz/model-exams/`, {
      params: { exam_type: examTypeId },
    });
  }

  getModelExamDetail(examId: string): Observable<ExamDetail> {
    return this.http.get<ExamDetail>(`${this.baseUrl}/quiz/model-exams/${examId}/`);
  }

  // --- Past exams (historical exam records) ---

  getPastExamTypes(): Observable<ExamType[]> {
    return this.http.get<ExamType[]>(`${this.baseUrl}/quiz/exam-types/`);
  }

  getPastExamsByType(examTypeId: number | string): Observable<PastExamListItem[]> {
    return this.http.get<PastExamListItem[]>(`${this.baseUrl}/quiz/past-exams/`, {
      params: { exam_type: examTypeId },
    });
  }

  getPastExamsByOrganization(orgId: number | string): Observable<PastExamListItem[]> {
    return this.http.get<PastExamListItem[]>(`${this.baseUrl}/quiz/past-exams/`, {
      params: { organization: orgId },
    });
  }

  getPastExamDetail(id: number): Observable<PastExamListItem> {
    return this.http.get<PastExamListItem>(`${this.baseUrl}/quiz/past-exams/${id}/`);
  }

  getPastExamQuestions(id: number): Observable<ExamQuestionsResponse> {
    return this.http.get<ExamQuestionsResponse>(`${this.baseUrl}/quiz/past-exams/${id}/questions/`);
  }

  submitPastExam(id: number, payload: ExamSubmitRequest): Observable<PastExamSubmitResponse> {
    return this.http.post<PastExamSubmitResponse>(`${this.baseUrl}/quiz/past-exams/${id}/submit/`, payload);
  }

  getPastExamLeaderboard(id: number): Observable<ExamLeaderboardResponse> {
    return this.http.get<ExamLeaderboardResponse>(`${this.baseUrl}/quiz/past-exam/${id}/leaderboard/`);
  }
}
