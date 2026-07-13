import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface LeaderboardEntry {
  rank: number;
  username: string;
  full_name: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  percentage: number;
  attempt_time: string;
  is_current_user: boolean;
}

@Component({
  selector: 'app-exam-leaderboard',
  imports: [RouterLink],
  templateUrl: './exam-leaderboard.html',
  styleUrl: './exam-leaderboard.scss',
})
export class ExamLeaderboard implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http  = inject(HttpClient);
  private readonly base  = environment.apiBaseUrl;

  readonly examId    = signal(0);
  readonly examTitle = signal('');
  readonly entries   = signal<LeaderboardEntry[]>([]);
  readonly totalEntries = signal(0);
  readonly userRank  = signal<number | null>(null);
  readonly isLoading = signal(true);

  readonly myEntry = computed(() =>
    this.entries().find(e => e.is_current_user) ?? null
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('examId'));
    this.examId.set(id);
    this.http.get<any>(`${this.base}/quiz/past-exam/${id}/leaderboard/`).subscribe({
      next: (data) => {
        this.examTitle.set(data.exam_title);
        this.entries.set(data.entries);
        this.totalEntries.set(data.total_entries);
        this.userRank.set(data.user_rank);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
