import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { PastExamListItem } from '../../../core/models/past-exam.model';

@Component({
  selector: 'app-past-exam-detail',
  imports: [],
  templateUrl: './past-exam-detail.html',
  styleUrl: './past-exam-detail.scss',
})
export class PastExamDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);

  readonly exam = signal<PastExamListItem | null>(null);
  readonly isLoading = signal(true);
  examId = 0;

  ngOnInit(): void {
    this.examId = Number(this.route.snapshot.paramMap.get('examId'));
    this.examService.getPastExamDetail(this.examId).subscribe({
      next: (exam) => { this.exam.set(exam); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  startExam(): void { this.router.navigate(['/past-exams', 'take', this.examId]); }
  viewLeaderboard(): void { this.router.navigate(['/past-exams', 'leaderboard', this.examId]); }
}
