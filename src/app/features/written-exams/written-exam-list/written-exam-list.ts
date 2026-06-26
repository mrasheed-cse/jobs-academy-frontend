import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { WrittenExam } from '../../../core/models/content.model';

@Component({ selector: 'app-written-exam-list', imports: [], templateUrl: './written-exam-list.html', styleUrl: './written-exam-list.scss' })
export class WrittenExamList implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);
  readonly exams = signal<WrittenExam[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.contentService.getWrittenExams().subscribe({
      next: (exams) => { this.exams.set(exams); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
  openDetail(id: number): void { this.router.navigate(['/written-exams', id]); }
}
