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
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);

  readonly exams      = signal<PastExamListItem[]>([]);
  readonly isLoading  = signal(true);
  readonly loadFailed = signal(false);
  readonly orgName    = signal('');

  ngOnInit(): void {
    const orgId  = this.route.snapshot.paramMap.get('orgId');
    const typeId = this.route.snapshot.paramMap.get('typeId');

    if (orgId) {
      // Filter by organization
      this.examService.getPastExamsByOrganization(orgId).subscribe({
        next: (exams) => {
          this.exams.set(exams);
          if (exams.length > 0) {
            this.orgName.set((exams[0] as any).organization ?? '');
          }
          this.isLoading.set(false);
        },
        error: () => { this.isLoading.set(false); this.loadFailed.set(true); },
      });
    } else if (typeId) {
      // Legacy: filter by exam type
      this.examService.getPastExamsByType(typeId).subscribe({
        next: (exams) => { this.exams.set(exams); this.isLoading.set(false); },
        error: () => { this.isLoading.set(false); this.loadFailed.set(true); },
      });
    }
  }

  openDetail(id: number): void {
    this.router.navigate(['/past-exams', 'details', id]);
  }

  goBack(): void {
    this.router.navigate(['/past-exams']);
  }
}
