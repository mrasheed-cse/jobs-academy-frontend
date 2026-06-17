import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ExamService } from '../../core/services/exam.service';
import { GameActivityResponse } from '../../core/models/dashboard.model';
import { ExamAttempt, ExamListItem } from '../../core/models/exam.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly examService = inject(ExamService);

  @ViewChild('practiceChartCanvas') practiceChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('puzzleChartCanvas') puzzleChartCanvas?: ElementRef<HTMLCanvasElement>;

  readonly currentUser = this.authService.currentUser;
  readonly activity = signal<GameActivityResponse | null>(null);
  readonly recentAttempts = signal<ExamAttempt[]>([]);
  readonly upcomingExams = signal<ExamListItem[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  private practiceChart?: Chart;
  private puzzleChart?: Chart;

  get initial(): string {
    const name = this.currentUser()?.username ?? '?';
    return name.charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    // Make sure we have an up-to-date profile (e.g. on a hard refresh where
    // only tokens, not the user object, may be in storage yet).
    if (!this.currentUser()) {
      this.authService.fetchAndStoreCurrentUser().subscribe();
    }

    this.dashboardService.getGameActivity().subscribe({
      next: (data) => {
        this.activity.set(data);
        this.isLoading.set(false);
        // Charts need their canvas to exist in the DOM first; render on next tick.
        setTimeout(() => this.renderCharts(data), 0);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });

    // NOTE: there is currently no backend endpoint that returns a user's
    // attempts across ALL exams without specifying one exam_id first
    // (confirmed via live testing — /quiz/attempts/user_attempts/ requires
    // exam_id). Recent-attempts history is left empty until either a
    // cross-exam endpoint is added server-side, or this is reworked to
    // fetch per-exam via getUserAttempts(examId) for a known set of exams.
    this.recentAttempts.set([]);

    this.examService.getExams().subscribe({
      next: (exams) => this.upcomingExams.set(exams.slice(0, 3)),
      error: () => this.upcomingExams.set([]),
    });
  }

  private renderCharts(data: GameActivityResponse): void {
    if (this.practiceChartCanvas) {
      this.practiceChart?.destroy();
      this.practiceChart = new Chart(this.practiceChartCanvas.nativeElement, this.buildPracticeConfig(data));
    }
    if (this.puzzleChartCanvas && data.history.puzzles.length) {
      this.puzzleChart?.destroy();
      this.puzzleChart = new Chart(this.puzzleChartCanvas.nativeElement, this.buildPuzzleConfig(data));
    }
  }

  private buildPracticeConfig(data: GameActivityResponse): ChartConfiguration {
    const sessions = data.history.practice;
    return {
      type: 'line',
      data: {
        labels: sessions.map((_, i) => `S${i + 1}`),
        datasets: [
          {
            label: 'Score',
            data: sessions.map((s) => s.score),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#f1f5f9' }, border: { display: false } },
          x: { grid: { display: false } },
        },
      },
    };
  }

  private buildPuzzleConfig(data: GameActivityResponse): ChartConfiguration {
    const puzzles = data.history.puzzles;
    return {
      type: 'bar',
      data: {
        labels: puzzles.map((g) => g.puzzle__title.split(' ')[0]),
        datasets: [
          {
            data: puzzles.map((g) => g.total_puzzle_score),
            backgroundColor: '#7c3aed',
            borderRadius: 5,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { display: false }, x: { grid: { display: false } } },
      },
    };
  }
}
