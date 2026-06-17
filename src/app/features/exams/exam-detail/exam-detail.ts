import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ExamDetail as ExamDetailModel } from '../../../core/models/exam.model';

@Component({
  selector: 'app-exam-detail',
  imports: [],
  templateUrl: './exam-detail.html',
  styleUrl: './exam-detail.scss',
})
export class ExamDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);

  readonly exam = signal<ExamDetailModel | null>(null);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);
  examId = '';

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('examId') ?? '';
    if (!this.examId) {
      this.isLoading.set(false);
      this.loadFailed.set(true);
      return;
    }

    this.examService.getExamDetail(this.examId).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  formatDuration(duration: string | undefined): string {
    if (!duration) return 'N/A';
    const [hours, minutes] = duration.split(':').map(Number);
    let result = '';
    if (hours) result += `${hours} ঘণ্টা `;
    if (minutes) result += `${minutes} মিনিট`;
    return result.trim() || '০ মিনিট';
  }

  // exam.status is a time-based computed value from the backend
  // ("Upcoming" | "active" | "Ongoing" | "archived"), not a publish-workflow
  // status — see core/models/exam.model.ts for details.
  statusLabel(status: string | undefined): string {
    switch (status) {
      case 'Upcoming':
        return 'আসছে';
      case 'active':
        return 'চলছে';
      case 'Ongoing':
        return 'চলমান';
      case 'archived':
        return 'সমাপ্ত';
      default:
        return status ?? '';
    }
  }

  isActive(status: string | undefined): boolean {
    return status === 'active' || status === 'Ongoing';
  }

  goToStart(): void {
    this.router.navigate(['/model-tests', 'take', this.examId]);
  }

  goToResults(): void {
    this.router.navigate(['/model-tests', 'results', this.examId]);
  }

  goToLeaderboard(): void {
    this.router.navigate(['/model-tests', 'leaderboard', this.examId]);
  }
}
