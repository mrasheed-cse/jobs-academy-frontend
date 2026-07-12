import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EditorOption {
  id: number;
  text: string | null;
  image: string | null;
  is_correct: boolean;
}

export interface EditorQuestion {
  peq_id: number;
  order: number;
  id: number;
  text: string | null;
  image: string | null;
  marks: number;
  subject: string;
  status: string;
  options: EditorOption[];
}

export interface ExamManageDetail {
  id: number;
  title: string;
  is_published: boolean;
  total_questions: number;
  questions: EditorQuestion[];
}

@Injectable({ providedIn: 'root' })
export class ExamEditorService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getExamQuestions(examId: number): Observable<ExamManageDetail> {
    return this.http.get<ExamManageDetail>(
      `${this.base}/api/exam-import/exams/${examId}/manage/`
    );
  }

  updateQuestion(id: number, data: FormData): Observable<any> {
    return this.http.patch(`${this.base}/api/exam-import/questions/${id}/`, data);
  }

  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/exam-import/questions/${id}/`);
  }

  updateOption(id: number, data: FormData): Observable<any> {
    return this.http.patch(`${this.base}/api/exam-import/options/${id}/`, data);
  }

  publishExam(examId: number, action: 'publish' | 'unpublish'): Observable<any> {
    return this.http.post(
      `${this.base}/api/exam-import/exams/${examId}/publish/`,
      { action }
    );
  }
}
