import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  WrittenExam,
  WordPuzzle,
  Word,
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

  // --- Language center ---
  getWordOfTheDay(): Observable<Word> {
    return this.http.get<Word>(`${this.baseUrl}/api/word-of-the-day/`);
  }

  getWordsAZ(): Observable<Record<string, Word[]>> {
    return this.http.get<Record<string, Word[]>>(`${this.baseUrl}/api/words/az/`);
  }

  getWordDetail(id: number): Observable<Word> {
    return this.http.get<Word>(`${this.baseUrl}/api/words/${id}/`);
  }

  searchWords(query: string): Observable<Word[]> {
    return this.http.get<Word[]>(`${this.baseUrl}/api/words/search/`, { params: { q: query } });
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
