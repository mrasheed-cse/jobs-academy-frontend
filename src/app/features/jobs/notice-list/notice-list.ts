import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { JobsService } from '../../../core/services/jobs.service';
import { Notice } from '../../../core/models/content.model';

@Component({ selector: 'app-notice-list', imports: [DatePipe], templateUrl: './notice-list.html', styleUrl: './notice-list.scss' })
export class NoticeList implements OnInit {
  private readonly jobsService = inject(JobsService);
  private readonly router = inject(Router);
  readonly notices = signal<Notice[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.jobsService.getNotices().subscribe({
      next: (n) => { this.notices.set(n); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
  openNotice(id: number): void { this.router.navigate(['/notices', id, 'details']); }
}
