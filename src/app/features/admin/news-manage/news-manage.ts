import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NewsService } from '../../../core/services/news.service';
import { NewsItem, NewsCategory } from '../../../core/models/content.model';
import { environment } from '../../../../environments/environment';

declare const Quill: any;

@Component({
  selector: 'app-news-manage',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './news-manage.html',
  styleUrl: './news-manage.scss',
})
export class NewsManage implements OnInit, OnDestroy {
  private readonly newsService = inject(NewsService);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly baseUrl = environment.apiBaseUrl;

  @ViewChild('editorContainer') editorContainer?: ElementRef;
  private quill: any = null;

  readonly newsList = signal<NewsItem[]>([]);
  readonly categories = signal<NewsCategory[]>([]);
  readonly isLoading = signal(true);
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly isDeleting = signal<number | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly errorMsg = signal<string | null>(null);
  readonly uploadedImages = signal<File[]>([]);
  readonly imagePreviewUrls = signal<string[]>([]);
  readonly isUploadingImage = signal(false);

  readonly form = this.fb.group({
    title: ['', Validators.required],
    category: [null as number | null],
    send_notification: [false],
    notification_delay_hours: [null as number | null],
  });

  ngOnInit(): void {
    this.loadData();
    this.ensureQuillLoaded();
  }

  ngOnDestroy(): void { this.quill = null; }

  private ensureQuillLoaded(): void {
    if ((window as any).Quill) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js';
    document.head.appendChild(script);
  }

  private initEditor(content = ''): void {
    const waitForQuill = () => {
      if (!(window as any).Quill || !this.editorContainer) {
        setTimeout(waitForQuill, 100);
        return;
      }
      const el = this.editorContainer.nativeElement;
      el.innerHTML = '';
      const container = document.createElement('div');
      el.appendChild(container);

      this.quill = new (window as any).Quill(container, {
        theme: 'snow',
        placeholder: 'সংবাদের বিস্তারিত বিষয়বস্তু লিখুন...',
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['blockquote', 'link', 'image'],
              [{ align: [] }],
              ['clean'],
            ],
            handlers: {
              image: () => this.handleImageInsert(),
            },
          },
        },
      });

      if (content) this.quill.root.innerHTML = content;
    };
    waitForQuill();
  }

  // Quill image handler — opens file picker, uploads to server,
  // inserts the real /media/ URL so it persists across sessions.
  private handleImageInsert(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || !this.quill) return;
      this.isUploadingImage.set(true);
      const fd = new FormData();
      fd.append('image', file);
      this.http.post<{ url: string }>(`${this.baseUrl}/api/news/upload-image/`, fd).subscribe({
        next: (res) => {
          this.isUploadingImage.set(false);
          const range = this.quill.getSelection(true);
          this.quill.insertEmbed(range.index, 'image', res.url);
          this.quill.setSelection(range.index + 1);
        },
        error: () => {
          this.isUploadingImage.set(false);
          this.errorMsg.set('ছবি আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
        },
      });
    };
    input.click();
  }

  private getEditorContent(): string {
    if (!this.quill) return '';
    const html = this.quill.root.innerHTML;
    return html === '<p><br></p>' ? '' : html;
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
    this.uploadedImages.set([]);
    this.imagePreviewUrls.set([]);
    this.editingId.set(null);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.showForm.set(true);
    setTimeout(() => this.initEditor(), 150);
  }

  openEdit(item: NewsItem): void {
    this.form.patchValue({ title: item.title, category: item.category ?? null, send_notification: false });
    this.uploadedImages.set([]);
    this.imagePreviewUrls.set([]);
    this.editingId.set(item.id);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.showForm.set(true);
    setTimeout(() => this.initEditor(item.content), 150);
  }

  cancelForm(): void { this.showForm.set(false); this.editingId.set(null); this.quill = null; }

  onCoverImageSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.uploadedImages.set(files);
    this.imagePreviewUrls.set(files.map((f) => URL.createObjectURL(f)));
  }

  removeCoverImage(index: number): void {
    this.uploadedImages.update((imgs) => imgs.filter((_, i) => i !== index));
    this.imagePreviewUrls.update((urls) => urls.filter((_, i) => i !== index));
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const content = this.getEditorContent();
    if (!content) { this.errorMsg.set('সংবাদের বিষয়বস্তু লিখুন।'); return; }

    this.isSaving.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const fd = new FormData();
    const v = this.form.getRawValue();
    fd.append('title', v.title ?? '');
    fd.append('content', content);
    if (v.category) fd.append('category_id', String(v.category));
    fd.append('send_notification', v.send_notification ? 'true' : 'false');
    if (v.send_notification && v.notification_delay_hours) {
      fd.append('notification_delay_hours', String(v.notification_delay_hours));
    }
    // Cover images (attached to article separately from inline images)
    this.uploadedImages().forEach((f) => fd.append('uploaded_images', f));

    const op = this.editingId()
      ? this.newsService.updateNews(this.editingId()!, fd)
      : this.newsService.createNews(fd);

    op.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMsg.set(this.editingId() ? 'সংবাদ আপডেট হয়েছে।' : 'সংবাদ প্রকাশিত হয়েছে।');
        this.showForm.set(false);
        this.quill = null;
        this.loadData();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.errorMsg.set(err.error?.detail ?? JSON.stringify(err.error) ?? 'সংরক্ষণ ব্যর্থ হয়েছে।');
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
