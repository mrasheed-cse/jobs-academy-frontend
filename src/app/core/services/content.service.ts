import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  WrittenExam,
  WordPuzzle,
  DictLanguage,
  DictWord,
  DictWordAZEntry,
  DictWordSearchResult,
  DictWordCreateRequest,
  DictExcelUploadResult,
  SubscriptionPlan,
  UserSubscription,
} from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // --- Written exams ---
  getWrittenExams(): Observable<WrittenExam[]> {
    return this.http.get<WrittenExam[]>(`${this.baseUrl}/api/wr-exams/`);
  }

  getWrittenExam(id: number): Observable<WrittenExam> {
    return this.http.get<WrittenExam>(`${this.baseUrl}/api/wr-exams/${id}/`);
  }

  // --- Word games / puzzles ---
  getWordPuzzles(): Observable<WordPuzzle[]> {
    return this.http.get<WordPuzzle[]>(`${this.baseUrl}/api/word-puzzles/`);
  }

  // --- Language center (read) ---

  // GET /api/word-of-the-day/ uses WordSerializer - full nested shape.
  // 404 with no body when no words exist yet; callers should handle that.
  getWordOfTheDay(): Observable<DictWord> {
    return this.http.get<DictWord>(`${this.baseUrl}/api/word-of-the-day/`);
  }

  // GET /api/words/az/ uses WordAZSerializer, grouped by first letter -
  // flat shape, NOT the same as DictWord (no senses, part_of_speech is
  // a plain string). Confirmed via direct backend code inspection.
  getWordsAZ(): Observable<Record<string, DictWordAZEntry[]>> {
    return this.http.get<Record<string, DictWordAZEntry[]>>(`${this.baseUrl}/api/words/az/`);
  }

  // GET /api/words/{id}/ uses WordSerializer - same full nested shape
  // as word-of-the-day.
  getWordDetail(id: number): Observable<DictWord> {
    return this.http.get<DictWord>(`${this.baseUrl}/api/words/${id}/`);
  }

  // GET /api/words/search/ uses WordListSerializer - flat, no senses.
  searchWords(query: string): Observable<DictWordSearchResult[]> {
    return this.http.get<DictWordSearchResult[]>(`${this.baseUrl}/api/words/search/`, {
      params: { q: query },
    });
  }

  // --- Language center (admin/teacher write — requires IsTeacherOrAdmin) ---

  getLanguages(): Observable<DictLanguage[]> {
    return this.http.get<DictLanguage[]>(`${this.baseUrl}/api/languages/`);
  }

  createWord(languageId: number, payload: DictWordCreateRequest): Observable<DictWord> {
    return this.http.post<DictWord>(
      `${this.baseUrl}/api/language/${languageId}/words/create/`,
      payload,
    );
  }

  uploadDictionaryExcel(languageId: number, file: File): Observable<DictExcelUploadResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<DictExcelUploadResult>(
      `${this.baseUrl}/api/language/${languageId}/words/upload/`,
      form,
    );
  }

  // --- Subscription ---
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.baseUrl}/api/subscription-plans/`);
  }

  getUserSubscriptions(): Observable<UserSubscription[]> {
    return this.http.get<UserSubscription[]>(`${this.baseUrl}/api/user-subscriptions/`);
  }

  subscribe(priceId: number): Observable<UserSubscription> {
    return this.http.post<UserSubscription>(`${this.baseUrl}/api/user-subscriptions/`, { price: priceId });
  }
}
