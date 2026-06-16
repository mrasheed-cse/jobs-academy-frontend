import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { NewsService } from '../../core/services/news.service';
import { NewsItem } from '../../core/models/content.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SlicePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Home implements OnInit {
  readonly news = signal<NewsItem[]>([]);
  readonly isLoadingNews = signal(true);
  readonly newsLoadFailed = signal(false);

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.newsService.getNews().subscribe({
      next: (items) => {
        // Most recent first, limit to a reasonable carousel size.
        this.news.set(
          [...items]
            .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
            .slice(0, 6),
        );
        this.isLoadingNews.set(false);
      },
      error: () => {
        this.isLoadingNews.set(false);
        this.newsLoadFailed.set(true);
      },
    });
  }
}
