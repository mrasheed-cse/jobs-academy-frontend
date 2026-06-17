import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ExamLeaderboardEntry } from '../../../core/models/exam.model';

@Component({
  selector: 'app-exam-leaderboard',
  imports: [],
  templateUrl: './exam-leaderboard.html',
  styleUrl: './exam-leaderboard.scss',
})
export class ExamLeaderboard implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly examService = inject(ExamService);

  readonly topEntries = signal<ExamLeaderboardEntry[]>([]);
  readonly myEntry = signal<ExamLeaderboardEntry | null>(null);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('examId') ?? '';
    if (!examId) {
      this.isLoading.set(false);
      this.loadFailed.set(true);
      return;
    }

    this.examService.getExamLeaderboard(examId).subscribe({
      next: (res) => {
        this.topEntries.set(res.top_10);
        this.myEntry.set(res.me);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });
  }
}
