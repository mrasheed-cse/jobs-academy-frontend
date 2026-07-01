import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NewsService } from '../../../core/services/news.service';
import { NewsItem, NewsCategory } from '../../../core/models/content.model';

@Component({
  selector: 'app-news-manage',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './news-manage.html',
  styleUrl: './news-manage.scss',
})
export class NewsManage implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly fb = inject(FormBuilder);

  readonly newsList = signal<NewsItem[]>([]);
  readonly categories = signal<NewsCategory[]>([]);
  readonly isLoading = signal(true);
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly isDeleting = signal<number | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly errorMsg = signal<string | null>(null);
  readonly selectedImages = signal<File[]>([]);

  readonly form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    category: [null as number | null],
    send_notification: [false],
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.newsService.getCategories().subscribe({ next: (c) => this.categories.set(c) });
    this.newsService.getNews(1).subscribe({
      next: (items) => { this.newsList.set(items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  openCreate(): void {
    this.form.reset({ send_notification: false });
    this.selectedImages.set([]);
    this.editingId.set(null);
    this.showForm.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);
  }

  openEdit(item: NewsItem): void {
    this.form.patchValue({
      title: item.title,
      content: item.content,
      category: item.category ?? null,
      send_notification: false,
    });
    this.selectedImages.set([]);
    this.editingId.set(item.id);
    this.showForm.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);
  }

  cancelForm(): void { this.showForm.set(false); this.editingId.set(null); }

  onImagesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.selectedImages.set(files);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const fd = new FormData();
    const v = this.form.getRawValue();
    fd.append('title', v.title ?? '');
    fd.append('content', v.content ?? '');
    if (v.category) fd.append('category_id', String(v.category));
    fd.append('send_notification', v.send_notification ? 'true' : 'false');
    this.selectedImages().forEach((f) => fd.append('uploaded_images', f));

    const op = this.editingId()
      ? this.newsService.updateNews(this.editingId()!, fd)
      : this.newsService.createNews(fd);

    op.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMsg.set(this.editingId() ? 'সংবাদ আপডেট হয়েছে।' : 'সংবাদ প্রকাশিত হয়েছে।');
        this.showForm.set(false);
        this.loadData();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.errorMsg.set(err.error?.detail ?? 'সংরক্ষণ ব্যর্থ হয়েছে।');
      },
    });
  }

  deleteNews(id: number): void {
    if (!confirm('এই সংবাদটি মুছে দিতে চান?')) return;
    this.isDeleting.set(id);
    this.newsService.deleteNews(id).subscribe({
      next: () => { this.isDeleting.set(null); this.loadData(); },
      error: () => this.isDeleting.set(null),
    });
  }

  categoryName(id: number | null | undefined): string {
    if (!id) return '—';
    return this.categories().find((c) => c.id === id)?.name ?? '—';
  }
}
