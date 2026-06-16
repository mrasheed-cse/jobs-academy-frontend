import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NewsCategory, NewsItem } from '../models/content.model';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // /api/news/ is paginated (DRF PageNumberPagination) — unwrap to a plain array
  // for simple list views; pass page/pageSize through if pagination controls
  // are needed later.
  getNews(page = 1): Observable<NewsItem[]> {
    return this.http
      .get<PaginatedResponse<NewsItem>>(`${this.baseUrl}/api/news/`, { params: { page } })
      .pipe(map((res) => res.results));
  }

  getNewsPage(page = 1): Observable<PaginatedResponse<NewsItem>> {
    return this.http.get<PaginatedResponse<NewsItem>>(`${this.baseUrl}/api/news/`, { params: { page } });
  }

  getNewsItem(id: number): Observable<NewsItem> {
    return this.http.get<NewsItem>(`${this.baseUrl}/api/news/${id}/`);
  }

  getRecommended(id: number): Observable<NewsItem[]> {
    return this.http.get<NewsItem[]>(`${this.baseUrl}/api/news/${id}/recommended/`);
  }

  getCategories(): Observable<NewsCategory[]> {
    return this.http.get<NewsCategory[]>(`${this.baseUrl}/api/news-categories/`);
  }
}
