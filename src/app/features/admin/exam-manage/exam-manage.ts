import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { ExamImportService, PastExamSummary, ImportJobStatus } from '../../../core/services/exam-import.service';

@Component({
  selector: 'app-exam-manage',
  imports: [ReactiveFormsModule, RouterLink, SlicePipe],
  templateUrl: './exam-manage.html',
  styleUrl: './exam-manage.scss',
})
export class ExamManage implements OnInit, OnDestroy {
  private readonly svc = inject(ExamImportService);
  private readonly fb  = inject(FormBuilder);
  private pollSub?: Subscription;

  readonly exams       = signal<PastExamSummary[]>([]);
  readonly isLoading   = signal(true);
  readonly showForm    = signal(false);
  readonly isUploading = signal(false);
  readonly jobStatus   = signal<ImportJobStatus | null>(null);
  readonly selectedFiles = signal<File[]>([]);
  readonly errorMsg    = signal<string | null>(null);
  readonly successMsg  = signal<string | null>(null);
  readonly isDeleting  = signal<number | null>(null);

  readonly form = this.fb.group({
    exam_title:    ['', Validators.required],
    org_name:      ['', Validators.required],
    position_name: ['', Validators.required],
    exam_year:     [new Date().getFullYear(), [Validators.required, Validators.min(1980)]],
    subject_name:  ['General Knowledge'],
    marks_per_q:   [1],
    negative_mark: [0.25],
    model:         ['google/gemini-2.5-flash'],
  });

  ngOnInit(): void { this.loadExams(); }

  ngOnDestroy(): void { this.pollSub?.unsubscribe(); }

  loadExams(): void {
    this.isLoading.set(true);
    this.svc.getExams().subscribe({
      next: (e) => { this.exams.set(e); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  openForm(): void {
    this.showForm.set(true);
    this.jobStatus.set(null);
    this.selectedFiles.set([]);
    this.errorMsg.set(null);
    this.successMsg.set(null);
    this.form.reset({
      exam_year: new Date().getFullYear(),
      subject_name: 'General Knowledge',
      marks_per_q: 1,
      negative_mark: 0.25,
      model: 'google/gemini-2.5-flash',
    });
  }

  cancelForm(): void { this.showForm.set(false); this.pollSub?.unsubscribe(); }

  onFilesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.selectedFiles.set(files);
  }

  removeFile(index: number): void {
    this.selectedFiles.update(f => f.filter((_, i) => i !== index));
  }

  startImport(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.selectedFiles().length) {
      this.errorMsg.set('অন্তত একটি ছবি ফাইল নির্বাচন করুন।');
      return;
    }

    this.isUploading.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const fd = new FormData();
    const v = this.form.getRawValue();
    fd.append('exam_title',    v.exam_title ?? '');
    fd.append('org_name',      v.org_name ?? '');
    fd.append('position_name', v.position_name ?? '');
    fd.append('exam_year',     String(v.exam_year));
    fd.append('subject_name',  v.subject_name ?? 'General Knowledge');
    fd.append('marks_per_q',   String(v.marks_per_q ?? 1));
    fd.append('negative_mark', String(v.negative_mark ?? 0.25));
    fd.append('model',         v.model ?? 'google/gemini-2.5-flash');
    this.selectedFiles().forEach(f => fd.append('images', f));

    this.svc.startImport(fd).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        this.pollProgress(res.job_id);
      },
      error: (err: HttpErrorResponse) => {
        this.isUploading.set(false);
        this.errorMsg.set(err.error?.detail ?? 'আমদানি শুরু করতে ব্যর্থ হয়েছে।');
      },
    });
  }

  private pollProgress(jobId: number): void {
    this.pollSub?.unsubscribe();
    this.pollSub = interval(2000).pipe(
      switchMap(() => this.svc.getStatus(jobId)),
      takeWhile(s => s.status === 'processing' || s.status === 'pending', true),
    ).subscribe({
      next: (status) => {
        this.jobStatus.set(status);
        if (status.status === 'done') {
          this.successMsg.set(`${status.questions_found} টি প্রশ্ন সফলভাবে আমদানি হয়েছে!`);
          this.loadExams();
        } else if (status.status === 'failed') {
          this.errorMsg.set('কিছু সমস্যা হয়েছে। নিচে বিস্তারিত দেখুন।');
        }
      },
    });
  }

  deleteExam(id: number, title: string): void {
    if (!confirm(`"${title}" পরীক্ষাটি মুছে দিতে চান?`)) return;
    this.isDeleting.set(id);
    this.svc.deleteExam(id).subscribe({
      next: () => { this.isDeleting.set(null); this.loadExams(); },
      error: () => this.isDeleting.set(null),
    });
  }

  progressBarWidth(status: ImportJobStatus | null): string {
    return `${status?.progress ?? 0}%`;
  }
}
