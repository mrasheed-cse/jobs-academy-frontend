import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JobsService } from '../../../core/services/jobs.service';
import { GovernmentJob } from '../../../core/models/content.model';

@Component({ selector: 'app-job-list', imports: [], templateUrl: './job-list.html', styleUrl: './job-list.scss' })
export class JobList implements OnInit {
  private readonly jobsService = inject(JobsService);
  private readonly router = inject(Router);
  readonly jobs = signal<GovernmentJob[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.jobsService.getJobs().subscribe({
      next: (jobs) => { this.jobs.set(jobs); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
  openJob(id: number): void { this.router.navigate(['/job-circular', id]); }
}
