import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DatePipe } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ExamService } from '../../../core/services/exam.service';
import { ExamAttempt, ModelExamBestScores } from '../../../core/models/exam.model';

Chart.register(...registerables);

@Component({
  selector: 'app-exam-results',
  imports: [DatePipe],
  templateUrl: './exam-results.html',
  styleUrl: './exam-results.scss',
})
export class ExamResults implements OnInit {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly examService = inject(ExamService);

  @ViewChild('progressChartCanvas') progressChartCanvas?: ElementRef<HTMLCanvasElement>;

  readonly attempts = signal<ExamAttempt[]>([]);
  readonly bestScores = signal<ModelExamBestScores | null>(null);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  // attempts() is ordered newest-first by the backend, NOT by score, so
  // the highest-scoring attempt must be computed explicitly rather than
  // assumed to be attempts()[0].
  readonly bestAttempt = computed(() => {
    const list = this.attempts();
    if (list.length === 0) return null;
    return list.reduce((best, a) => (a.score > best.score ? a : best), list[0]);
  });

  private progressChart?: Chart;

  goBack(): void { this.location.back(); }

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
        // Chart needs its canvas to exist in the DOM first; render on next tick.
        setTimeout(() => this.renderProgressChart(attempts), 0);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });

    this.examService.getModelExamBestScores(examId).subscribe({
      next: (scores) => this.bestScores.set(scores),
      error: () => {}, // Non-critical: page still works without these two cards.
    });
  }

  private renderProgressChart(attempts: ExamAttempt[]): void {
    if (!this.progressChartCanvas || attempts.length < 2) return;

    // The attempts list is ordered best-score-first for the "best result"
    // card above; the trend chart needs chronological order instead.
    const chronological = [...attempts].sort(
      (a, b) => new Date(a.attempt_time).getTime() - new Date(b.attempt_time).getTime(),
    );

    this.progressChart?.destroy();
    this.progressChart = new Chart(this.progressChartCanvas.nativeElement, this.buildProgressConfig(chronological));
  }

  private buildProgressConfig(attempts: ExamAttempt[]): ChartConfiguration {
    const dateFmt = new Intl.DateTimeFormat('bn-BD', { day: '2-digit', month: 'short' });
    return {
      type: 'line',
      data: {
        labels: attempts.map((a) => dateFmt.format(new Date(a.attempt_time))),
        datasets: [
          {
            label: 'নম্বর',
            data: attempts.map((a) => a.score),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#6366f1',
            pointHoverRadius: 6,
          },
          {
            label: 'পাস মার্ক',
            data: attempts.map((a) => a.pass_mark),
            borderColor: '#94a3b8',
            borderDash: [6, 6],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: {
          y: { grid: { color: '#f1f5f9' }, border: { display: false }, beginAtZero: true },
          x: { grid: { display: false } },
        },
      },
    };
  }
}
