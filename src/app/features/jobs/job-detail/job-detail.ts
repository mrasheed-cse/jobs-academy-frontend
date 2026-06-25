import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobsService } from '../../../core/services/jobs.service';
import { GovernmentJob } from '../../../core/models/content.model';

@Component({ selector: 'app-job-detail', imports: [RouterLink], templateUrl: './job-detail.html', styleUrl: './job-detail.scss' })
export class JobDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly jobsService = inject(JobsService);
  readonly job = signal<GovernmentJob | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.jobsService.getJob(id).subscribe({
      next: (job) => { this.job.set(job); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
}
