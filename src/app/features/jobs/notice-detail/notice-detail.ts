import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { JobsService } from '../../../core/services/jobs.service';
import { Notice } from '../../../core/models/content.model';

@Component({ selector: 'app-notice-detail', imports: [RouterLink, DatePipe], templateUrl: './notice-detail.html', styleUrl: './notice-detail.scss' })
export class NoticeDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly jobsService = inject(JobsService);
  readonly notice = signal<Notice | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.jobsService.getNotice(id).subscribe({
      next: (n) => { this.notice.set(n); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
}
