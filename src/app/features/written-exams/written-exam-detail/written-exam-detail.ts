import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { WrittenExam } from '../../../core/models/content.model';

@Component({ selector: 'app-written-exam-detail', imports: [RouterLink], templateUrl: './written-exam-detail.html', styleUrl: './written-exam-detail.scss' })
export class WrittenExamDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly contentService = inject(ContentService);
  readonly exam = signal<WrittenExam | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.contentService.getWrittenExam(id).subscribe({
      next: (e) => { this.exam.set(e); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
}
