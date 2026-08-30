import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { Organization } from '../../../core/models/exam.model';

@Component({
  selector: 'app-model-test-types',
  imports: [],
  templateUrl: './model-test-types.html',
  styleUrl: './model-test-types.scss',
})
export class ModelTestTypes implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly router = inject(Router);

  readonly organizations = signal<Organization[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  ngOnInit(): void {
    this.examService.getModelOrganizations().subscribe({
      next: (orgs) => {
        this.organizations.set(orgs);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  openOrg(orgId: number): void {
    this.router.navigate(['/model-tests', orgId]);
  }
}
