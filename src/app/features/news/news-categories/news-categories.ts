import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NewsService } from '../../../core/services/news.service';
import { NewsCategory } from '../../../core/models/content.model';

@Component({ selector: 'app-news-categories', imports: [], templateUrl: './news-categories.html', styleUrl: './news-categories.scss' })
export class NewsCategories implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly router = inject(Router);
  readonly categories = signal<NewsCategory[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.newsService.getCategories().subscribe({
      next: (cats) => { this.categories.set(cats); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
  openCategory(id: number): void { this.router.navigate(['/news', id]); }
}
