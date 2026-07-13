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

  readonly examId       = signal(0);
  readonly examTitle    = signal('');
  readonly entries      = signal<LeaderboardEntry[]>([]);
  readonly totalEntries = signal(0);
  readonly isLoading    = signal(true);
  readonly loadFailed   = signal(false);

  readonly userRank  = computed(() => this.entries().find(e => e.is_current_user)?.rank ?? null);
  readonly myEntry   = computed(() => this.entries().find(e => e.is_current_user) ?? null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('examId'));
    this.examId.set(id);
    this.http.get<any>(`${this.base}/quiz/past-exam/${id}/leaderboard/`).subscribe({
      next: (data) => {
        this.examTitle.set(data.exam_title);
        this.entries.set(data.entries);
        this.totalEntries.set(data.total_entries);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); this.loadFailed.set(true); },
    });
  }

  getInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() ?? '?';
  }

  getPct(e: LeaderboardEntry): number {
    return e.total_questions > 0 ? Math.round(e.score / e.total_questions * 100) : 0;
  }
}
