import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExamService } from '../../../core/services/exam.service';
import { ExamAttempt } from '../../../core/models/exam.model';

@Component({
  selector: 'app-exam-results',
  imports: [DatePipe],
  templateUrl: './exam-results.html',
  styleUrl: './exam-results.scss',
})
export class ExamResults implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly examService = inject(ExamService);

  readonly attempts = signal<ExamAttempt[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('examId') ?? '';
    if (!examId) {
      this.isLoading.set(false);
      this.loadFailed.set(true);
      return;
    }

    this.examService.getUserAttempts(examId).subscribe({
      next: (attempts) => {
        this.attempts.set(attempts);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });
  }
}
