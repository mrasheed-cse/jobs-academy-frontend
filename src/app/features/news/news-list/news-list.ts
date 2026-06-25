import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SlicePipe, DatePipe } from '@angular/common';
import { NewsService } from '../../../core/services/news.service';
import { NewsItem } from '../../../core/models/content.model';

@Component({ selector: 'app-news-list', imports: [SlicePipe, DatePipe], templateUrl: './news-list.html', styleUrl: './news-list.scss' })
export class NewsList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly newsService = inject(NewsService);
  private readonly router = inject(Router);
  readonly news = signal<NewsItem[]>([]);
  readonly isLoading = signal(true);
  readonly currentPage = signal(1);
  readonly hasMore = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.newsService.getNews(this.currentPage()).subscribe({
      next: (items) => { this.news.update((prev) => [...prev, ...items]); this.hasMore.set(items.length === 10); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  loadMore(): void { this.currentPage.update((p) => p + 1); this.load(); }
  openArticle(id: number): void { this.router.navigate(['/news', 'details', id]); }
}
