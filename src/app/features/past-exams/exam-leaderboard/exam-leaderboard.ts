import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface LeaderboardEntry {
  username: string;
  user_id: number;
  position: number;
  exam_title: string;
  current_score: number;
  best_score: number;
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
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  readonly currentUserId = signal<number | null>(null);

  readonly userRank = computed(() => {
    const uid = this.currentUserId();
    if (!uid) return null;
    const e = this.entries().find(e => e.user_id === uid);
    return e?.position ?? null;
  });

  readonly myEntry = computed(() => {
    const uid = this.currentUserId();
    return uid ? this.entries().find(e => e.user_id === uid) ?? null : null;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('examId'));
    this.examId.set(id);

    // Get current user from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      this.http.get<any>(`${this.base}/api/user-profile/`).subscribe({
        next: (u) => this.currentUserId.set(u.id),
        error: () => {}
      });
    }

    this.http.get<LeaderboardEntry[]>(`${this.base}/quiz/past-exam/${id}/leaderboard/`).subscribe({
      next: (data) => {
        this.entries.set(data);
        if (data.length > 0) this.examTitle.set(data[0].exam_title);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); this.loadFailed.set(true); },
    });
  }

  isCurrentUser(entry: LeaderboardEntry): boolean {
    return this.currentUserId() === entry.user_id;
  }

  getInitial(username: string): string {
    return username?.charAt(0)?.toUpperCase() ?? '?';
  }

  getPercentage(entry: LeaderboardEntry): number {
    return 0; // score without total questions — show score only
  }
}
