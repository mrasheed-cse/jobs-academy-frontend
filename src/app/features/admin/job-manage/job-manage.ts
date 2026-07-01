import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { JobsService } from '../../../core/services/jobs.service';
import { GovernmentJob } from '../../../core/models/content.model';
import { environment } from '../../../../environments/environment';

interface OrgOption { id: number; name: string; }
interface DeptOption { id: number; name: string; }
interface PosOption { id: number; name: string; }

@Component({
  selector: 'app-job-manage',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './job-manage.html',
  styleUrl: './job-manage.scss',
})
export class JobManage implements OnInit {
  private readonly jobsService = inject(JobsService);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly baseUrl = environment.apiBaseUrl;

  readonly jobs = signal<GovernmentJob[]>([]);
  readonly organizations = signal<OrgOption[]>([]);
  readonly departments = signal<DeptOption[]>([]);
  readonly positions = signal<PosOption[]>([]);
  readonly isLoading = signal(true);
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly isSaving = signal(false);
  readonly isDeleting = signal<number | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly errorMsg = signal<string | null>(null);
  readonly selectedPdf = signal<File | null>(null);

  readonly form = this.fb.group({
    title: ['', Validators.required],
    location: ['', Validators.required],
    description: [''],
    deadline: ['', Validators.required],
    official_link: [''],
    organization_id: [null as number | null, Validators.required],
    department_id: [null as number | null],
    send_notification: [false],
  });

  ngOnInit(): void {
    this.loadJobs();
    this.http.get<OrgOption[]>(`${this.baseUrl}/api/organizations/`).subscribe({
      next: (orgs) => this.organizations.set(orgs), error: () => {}
    });
    this.http.get<DeptOption[]>(`${this.baseUrl}/api/departments/`).subscribe({
      next: (depts) => this.departments.set(depts), error: () => {}
    });
    this.http.get<PosOption[]>(`${this.baseUrl}/api/positions/`).subscribe({
      next: (pos) => this.positions.set(pos), error: () => {}
    });
  }

  private loadJobs(): void {
    this.isLoading.set(true);
    this.jobsService.getJobs().subscribe({
      next: (jobs) => { this.jobs.set(jobs); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  openCreate(): void {
    this.form.reset({ send_notification: false });
    this.selectedPdf.set(null);
    this.editingId.set(null);
    this.showForm.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);
  }

  openEdit(job: GovernmentJob): void {
    this.form.patchValue({
      title: job.title,
      location: job.location,
      description: job.description,
      deadline: job.deadline,
      official_link: job.official_link ?? '',
      organization_id: job.organization?.id ?? null,
      department_id: job.department?.id ?? null,
      send_notification: false,
    });
    this.selectedPdf.set(null);
    this.editingId.set(job.id);
    this.showForm.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);
  }

  cancelForm(): void { this.showForm.set(false); this.editingId.set(null); }

  onPdfSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedPdf.set(file);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const fd = new FormData();
    const v = this.form.getRawValue();
    fd.append('title', v.title ?? '');
    fd.append('location', v.location ?? '');
    fd.append('description', v.description ?? '');
    fd.append('deadline', v.deadline ?? '');
    if (v.official_link) fd.append('official_link', v.official_link);
    fd.append('organization_id', String(v.organization_id));
    if (v.department_id) fd.append('department_id', String(v.department_id));
    fd.append('send_notification', v.send_notification ? 'true' : 'false');
    if (this.selectedPdf()) fd.append('pdf', this.selectedPdf()!);

    const op = this.editingId()
      ? this.jobsService.updateJob(this.editingId()!, fd)
      : this.jobsService.createJob(fd);

    op.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMsg.set(this.editingId() ? 'চাকরি আপডেট হয়েছে।' : 'চাকরির বিজ্ঞপ্তি প্রকাশিত হয়েছে।');
        this.showForm.set(false);
        this.loadJobs();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.errorMsg.set(err.error?.detail ?? JSON.stringify(err.error) ?? 'সংরক্ষণ ব্যর্থ হয়েছে।');
      },
    });
  }

  deleteJob(id: number): void {
    if (!confirm('এই বিজ্ঞপ্তিটি মুছে দিতে চান?')) return;
    this.isDeleting.set(id);
    this.jobsService.deleteJob(id).subscribe({
      next: () => { this.isDeleting.set(null); this.loadJobs(); },
      error: () => this.isDeleting.set(null),
    });
  }
}
