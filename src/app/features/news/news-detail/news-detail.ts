import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NewsService } from '../../../core/services/news.service';
import { NewsItem } from '../../../core/models/content.model';

@Component({
  selector: 'app-news-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.scss',
})
export class NewsDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly newsService = inject(NewsService);
  readonly article = signal<NewsItem | null>(null);
  readonly related = signal<NewsItem[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.isLoading.set(true);
      this.newsService.getNewsItem(id).subscribe({
        next: (item) => {
          this.article.set(item);
          this.isLoading.set(false);
          this.newsService.getRecommended(id).subscribe({
            next: (r) => this.related.set(r.slice(0, 5)),
          });
        },
        error: () => this.isLoading.set(false),
      });
    });
  }

  currentUrl(): string {
    return encodeURIComponent(window.location.href);
  }
}
