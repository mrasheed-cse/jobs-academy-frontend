import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../../core/services/exam.service';

@Component({
  selector: 'app-past-exam-types',
  imports: [FormsModule],
  templateUrl: './past-exam-types.html',
  styleUrl: './past-exam-types.scss',
})
export class PastExamTypes implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly router = inject(Router);

  readonly organizations = signal<any[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);
  readonly searchQuery = signal('');

  readonly filtered = computed(() =>
    this.organizations().filter(o =>
      o.name.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );

  ngOnInit(): void {
    this.examService.getOrganizations().subscribe({
      next: (orgs) => {
        // Only show orgs that have past exams — filter by checking results
        // Backend returns all orgs; we show them all and let the list page handle empty
        this.organizations.set(orgs);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); this.loadFailed.set(true); },
    });
  }

  openOrg(orgId: number): void {
    this.router.navigate(['/past-exams', 'org', orgId]);
  }
}
