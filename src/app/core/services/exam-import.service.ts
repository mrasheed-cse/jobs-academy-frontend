import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ImportJobStatus {
  job_id:          number;
  status:          'pending' | 'processing' | 'done' | 'failed';
  progress:        number;
  total_pages:     number;
  processed_pages: number;
  questions_found: number;
  current_page:    string;
  error_log:       string;
  past_exam_id?:   number;
  past_exam_title?: string;
}

export interface PastExamSummary {
  id:              number;
  title:           string;
  organization:    string;
  position:        string;
  exam_date:       string;
  total_questions: number;
  is_published:    boolean;
  negative_mark:   number;
}

export interface QuestionOption {
  id:         number;
  text:       string;
  is_correct: boolean | null;
}

export interface ExamQuestion {
  id:      number;
  order:   number;
  text:    string;
  subject: string;
  marks:   number;
  options: QuestionOption[];
}

export interface PastExamDetail {
  id:              number;
  title:           string;
  organization:    string;
  position:        string;
  exam_date:       string;
  duration:        number;
  total_questions: number;
  pass_mark:       number;
  negative_mark:   number;
  is_published:    boolean;
  questions:       ExamQuestion[];
}

@Injectable({ providedIn: 'root' })
export class ExamImportService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  startImport(formData: FormData): Observable<{ job_id: number; total_pages: number }> {
    return this.http.post<{ job_id: number; total_pages: number }>(
      `${this.base}/api/exam-import/start/`, formData
    );
  }

  getStatus(jobId: number): Observable<ImportJobStatus> {
    return this.http.get<ImportJobStatus>(`${this.base}/api/exam-import/${jobId}/status/`);
  }

  getExams(): Observable<PastExamSummary[]> {
    return this.http.get<PastExamSummary[]>(`${this.base}/api/exam-import/exams/`);
  }

  getExamDetail(id: number, showAnswers = false): Observable<PastExamDetail> {
    const q = showAnswers ? '?show_answers=1' : '';
    return this.http.get<PastExamDetail>(`${this.base}/api/exam-import/exams/${id}/questions/${q}`);
  }

  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/exam-import/exams/?id=${id}`);
  }
}
