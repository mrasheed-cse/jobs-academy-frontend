import { Component, OnInit, inject, signal, computed, Pipe, PipeTransform } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  readonly method         = signal<'question_bank' | 'excel'>('question_bank');
  readonly title          = signal('');
  readonly selectedOrgId  = signal('');
  readonly examTypeId     = signal('');
  readonly totalQuestions = signal(50);
  readonly duration       = signal(60);
  readonly totalMarks     = signal(100);
  readonly passMark       = signal(50);
  readonly negativeMark   = signal(0.25);

  readonly organizations  = signal<any[]>([]);
  readonly examTypes      = signal<any[]>([]);
  readonly pastExams      = signal<any[]>([]);
  readonly selectedExamIds = signal<number[]>([]);
  readonly recentExams    = signal<any[]>([]);

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

  loadRecentExams(): void {
    this.http.get<any>(`${this.base}/quiz/user_exams_list/`).subscribe({
      next: (res) => this.recentExams.set((res.results || res).slice(0, 5)),
      error: () => {},
    });
  }

  onOrgChange(orgId: string): void {
    this.selectedOrgId.set(orgId);
    this.selectedExamIds.set([]);
    this.pastExams.set([]);
    if (orgId) this.loadPastExams(orgId);
  }

  loadPastExams(orgId: string): void {
    this.isLoadingExams.set(true);
    this.http.get<any>(`${this.base}/quiz/model-tests/past-exams/?organization_id=${orgId}`).subscribe({
      next: (res) => { this.pastExams.set(res.past_exams || []); this.isLoadingExams.set(false); },
      error: () => this.isLoadingExams.set(false),
    });
  }

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
        next: (res) => {
          this.isCreating.set(false);
          this.createdExamId.set(res.exam_id);
          this.showToast(res.message);
          this.loadRecentExams();
        },
        error: (err) => {
          this.isCreating.set(false);
          this.showToast(err.error?.error || 'তৈরি করতে ব্যর্থ হয়েছে', 'err');
        },
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
        next: (res) => {
          this.isCreating.set(false);
          this.createdExamId.set(res.exam_id);
          this.showToast(res.message);
          this.loadRecentExams();
        },
        error: (err) => {
          this.isCreating.set(false);
          this.showToast(err.error?.error || 'তৈরি করতে ব্যর্থ হয়েছে', 'err');
        },
      });
    }
  }
}
