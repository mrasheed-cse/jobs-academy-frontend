import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { PastExamListItem } from '../../../core/models/past-exam.model';

@Component({
  selector: 'app-past-exam-list',
  imports: [],
  templateUrl: './past-exam-list.html',
  styleUrl: './past-exam-list.scss',
})
export class PastExamList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);

  readonly exams = signal<PastExamListItem[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  ngOnInit(): void {
    const typeId = this.route.snapshot.paramMap.get('typeId') ?? '';
    this.examService.getPastExamsByType(typeId).subscribe({
      next: (exams) => { this.exams.set(exams); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.loadFailed.set(true); },
    });
  }

  openDetail(id: number): void {
    this.router.navigate(['/past-exams', 'details', id]);
  }
}
