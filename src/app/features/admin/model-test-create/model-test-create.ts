import { Component, OnInit, inject, signal, computed, Pipe, PipeTransform } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Pipe({ name: 'orgName', standalone: true })
export class OrgNamePipe implements PipeTransform {
  transform(orgs: any[], id: string): string {
    return orgs.find(o => String(o.id) === String(id))?.name ?? '';
  }
}

@Component({
  selector: 'app-model-test-create',
  imports: [RouterLink, FormsModule, OrgNamePipe],
  templateUrl: './model-test-create.html',
  styleUrl: './model-test-create.scss',
})
export class ModelTestCreate implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode      = signal(false);
  readonly editingExamId   = signal<string | null>(null);
  readonly isSavingDetails = signal(false);
  readonly isRegenerating  = signal(false);

  readonly method         = signal<'question_bank' | 'excel'>('question_bank');
  readonly title          = signal('');
  readonly selectedOrgId  = signal('');
  readonly examTypeId     = signal('');
  readonly totalQuestions = signal(50);
  readonly duration       = signal(60);
  readonly totalMarks     = signal(100);
  readonly passMark       = signal(50);
  readonly negativeMark   = signal(0.25);

  readonly organizations   = signal<any[]>([]);
  readonly examTypes       = signal<any[]>([]);
  readonly allPastExams    = signal<any[]>([]);
  readonly selectedExamIds = signal<number[]>([]);
  readonly recentExams     = signal<any[]>([]);
  readonly filterOrgIds    = signal<string[]>([]);

  readonly filteredPastExams = computed(() => {
    const orgIds = this.filterOrgIds();
    const all = this.allPastExams();
    if (orgIds.length === 0) return all;
    return all.filter((e: any) => orgIds.includes(String(e.organization_id)));
  });

  readonly selectedQuestionCount = computed(() =>
    this.allPastExams()
      .filter((e: any) => this.selectedExamIds().includes(e.id))
      .reduce((sum: number, e: any) => sum + (e.total_questions || 0), 0)
  );

  readonly isLoadingExams = signal(false);
  readonly isCreating     = signal(false);
  readonly toast          = signal<string | null>(null);
  readonly toastType      = signal<'ok' | 'err'>('ok');
  readonly createdExamId  = signal<string | null>(null);
  readonly excelFile      = signal<File | null>(null);
  readonly dragOver       = signal(false);

  readonly canCreate = computed(() => {
    if (!this.title().trim()) return false;
    if (this.method() === 'question_bank') return this.selectedExamIds().length > 0;
    if (this.method() === 'excel') return this.excelFile() !== null;
    return false;
  });

  ngOnInit(): void {
    this.loadOrganizations();
    this.loadExamTypes();
    this.loadRecentExams();
    this.loadAllPastExams();

    const examId = this.route.snapshot.paramMap.get('examId');
    if (examId) {
      this.isEditMode.set(true);
      this.editingExamId.set(examId);
      this.loadExamForEdit(examId);
    }
  }

  private showToast(msg: string, type: 'ok' | 'err' = 'ok'): void {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(null), 4000);
  }

  loadOrganizations(): void {
    this.http.get<any>(`${this.base}/quiz/organizations/`).subscribe({
      next: (res) => this.organizations.set(res.results || res),
      error: () => {},
    });
  }

  loadExamTypes(): void {
    this.http.get<any>(`${this.base}/quiz/exam-types/`).subscribe({
      next: (res) => {
        const types = res.results || res;
        this.examTypes.set(types);
        if (types.length > 0) this.examTypeId.set(String(types[0].id));
      },
      error: () => {},
    });
  }

  loadAllPastExams(): void {
    this.isLoadingExams.set(true);
    this.http.get<any>(`${this.base}/quiz/model-tests/past-exams/`).subscribe({
      next: (res) => { this.allPastExams.set(res.past_exams || []); this.isLoadingExams.set(false); },
      error: () => this.isLoadingExams.set(false),
    });
  }

  loadRecentExams(): void {
    this.http.get<any>(`${this.base}/quiz/user_exams_list/`).subscribe({
      next: (res) => this.recentExams.set((res.results || res).slice(0, 5)),
      error: () => {},
    });
  }

  toggleFilterOrg(orgId: string): void {
    const current = this.filterOrgIds();
    this.filterOrgIds.set(current.includes(orgId) ? current.filter(id => id !== orgId) : [...current, orgId]);
  }

  clearFilterOrg(): void { this.filterOrgIds.set([]); }

  onOrgChange(orgId: string): void { this.selectedOrgId.set(orgId); }

  isExamSelected(id: number): boolean { return this.selectedExamIds().includes(id); }

  toggleExam(id: number): void {
    this.selectedExamIds.update(ids =>
      ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    );
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.excelFile.set(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault(); this.dragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.excelFile.set(file);
  }

  create(): void {
    if (!this.canCreate() || this.isCreating()) return;
    this.isCreating.set(true);
    this.createdExamId.set(null);

    if (this.method() === 'question_bank') {
      const body = {
        method: 'question_bank',
        title: this.title(),
        organization_id: this.selectedOrgId(),
        exam_type_id: this.examTypeId(),
        total_questions: this.totalQuestions(),
        duration: this.duration(),
        total_marks: this.totalMarks(),
        pass_mark: this.passMark(),
        negative_mark: this.negativeMark(),
        past_exam_ids: this.selectedExamIds(),
      };
      this.http.post<any>(`${this.base}/quiz/model-tests/create/`, body).subscribe({
        next: (res) => { this.isCreating.set(false); this.createdExamId.set(res.exam_id); this.showToast(res.message); this.loadRecentExams(); },
        error: (err) => { this.isCreating.set(false); this.showToast(err.error?.error || 'তৈরি করতে ব্যর্থ', 'err'); },
      });
    } else {
      const fd = new FormData();
      fd.append('method', 'excel');
      fd.append('title', this.title());
      fd.append('organization_id', this.selectedOrgId());
      fd.append('exam_type_id', this.examTypeId());
      fd.append('total_questions', String(this.totalQuestions()));
      fd.append('duration', String(this.duration()));
      fd.append('total_marks', String(this.totalMarks()));
      fd.append('pass_mark', String(this.passMark()));
      fd.append('negative_mark', String(this.negativeMark()));
      fd.append('file', this.excelFile()!);
      this.http.post<any>(`${this.base}/quiz/model-tests/create/`, fd).subscribe({
        next: (res) => { this.isCreating.set(false); this.createdExamId.set(res.exam_id); this.showToast(res.message); this.loadRecentExams(); },
        error: (err) => { this.isCreating.set(false); this.showToast(err.error?.error || 'তৈরি করতে ব্যর্থ', 'err'); },
      });
    }
  }

  private loadExamForEdit(examId: string): void {
    this.http.get<any>(`${this.base}/quiz/model-exams/${examId}/`).subscribe({
      next: (res) => {
        this.title.set(res.title || '');
        this.selectedOrgId.set(res.organization != null ? String(res.organization) : '');
        this.examTypeId.set(res.exam_type != null ? String(res.exam_type) : '');
        this.totalQuestions.set(res.total_questions || 50);
        this.totalMarks.set(res.total_mark || 100);
        this.passMark.set(res.pass_mark || 50);
        this.negativeMark.set(res.negative_mark ?? 0.25);
        this.duration.set(this.parseDurationToMinutes(res.duration));
        this.selectedExamIds.set(res.source_past_exam_ids || []);
      },
      error: () => this.showToast('মডেল টেস্ট লোড করতে ব্যর্থ হয়েছে', 'err'),
    });
  }

  private parseDurationToMinutes(duration: string | undefined): number {
    if (!duration) return 60;
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60);
    if (parts.length === 2) return parts[0] + Math.round(parts[1] / 60);
    return 60;
  }

  saveDetails(): void {
    const examId = this.editingExamId();
    if (!examId || !this.title().trim() || this.isSavingDetails()) return;
    this.isSavingDetails.set(true);
    const fd = new FormData();
    fd.append('title', this.title());
    fd.append('organization_id', this.selectedOrgId());
    fd.append('exam_type_id', this.examTypeId());
    fd.append('pass_mark', String(this.passMark()));
    fd.append('duration', String(this.duration()));
    fd.append('negative_mark', String(this.negativeMark()));
    fd.append('total_marks', String(this.totalMarks()));
    this.svcUpdateDetails(examId, fd);
  }

  private svcUpdateDetails(examId: string, fd: FormData): void {
    this.http.request<any>('PATCH', `${this.base}/quiz/model-exams/${examId}/update-details/`, { body: fd }).subscribe({
      next: (res) => { this.isSavingDetails.set(false); this.showToast(res.message); },
      error: (err) => { this.isSavingDetails.set(false); this.showToast(err.error?.error || 'সংরক্ষণ ব্যর্থ হয়েছে', 'err'); },
    });
  }

  regenerateQuestions(): void {
    const examId = this.editingExamId();
    if (!examId || this.selectedExamIds().length === 0 || this.isRegenerating()) return;
    if (!confirm('বর্তমান সকল প্রশ্ন মুছে নতুনভাবে এলোমেলোভাবে নির্বাচন করা হবে। আপনি কি নিশ্চিত?')) return;
    this.isRegenerating.set(true);
    const fd = new FormData();
    this.selectedExamIds().forEach(id => fd.append('past_exam_ids', String(id)));
    fd.append('total_questions', String(this.totalQuestions()));
    this.http.post<any>(`${this.base}/quiz/model-exams/${examId}/regenerate-questions/`, fd).subscribe({
      next: (res) => { this.isRegenerating.set(false); this.showToast(res.message); },
      error: (err) => { this.isRegenerating.set(false); this.showToast(err.error?.error || 'ব্যর্থ হয়েছে', 'err'); },
    });
  }
}
