import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MathRenderPipe } from '../../../core/pipes/math-render.pipe';
import {
  ExamEditorService, ExamManageDetail, EditorQuestion, EditorOption
} from '../../../core/services/exam-editor.service';

@Component({
  selector: 'app-exam-question-editor',
  imports: [RouterLink, MathRenderPipe],
  templateUrl: './exam-question-editor.html',
  styleUrl: './exam-question-editor.scss',
})
export class ExamQuestionEditor implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly svc   = inject(ExamEditorService);

  readonly exam        = signal<ExamManageDetail | null>(null);
  readonly questions   = signal<EditorQuestion[]>([]);
  readonly isLoading   = signal(true);
  readonly isPublishing = signal(false);
  readonly insertingAfter   = signal<number | null>(null);
  readonly insertForm       = signal({ text: '', optA: '', optB: '', optC: '', optD: '', correct: 'A', subject: 'General Knowledge' });
  readonly isSavingInsert   = signal(false);
  readonly missingQuestions = signal<number[]>([]);
  readonly missingCount     = signal(0);
  readonly toast       = signal<string | null>(null);
  readonly toastType   = signal<'success' | 'error'>('success');

  readonly approvedCount = computed(() =>
    this.questions().filter(q => q.status === 'approved').length
  );

  loadMissingQuestions(examId: number): void {
    this.http.get<any>(`${this.svc['base']}/api/exam-import/exams/${examId}/missing-questions/`).subscribe({
      next: (res) => {
        this.missingQuestions.set(res.missing || []);
        this.missingCount.set(res.missing_count || 0);
      },
      error: () => {}
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('examId'));
    this.svc.getExamQuestions(id).subscribe({
      next: (data) => {
        this.exam.set(data);
        this.questions.set(data.questions);
        this.loadMissingQuestions(id);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toast.set(null), 3000);
  }

  saveQuestionText(q: EditorQuestion, event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value.trim();
    if (text === q.text) return;
    const fd = new FormData();
    fd.append('text', text);
    this.svc.updateQuestion(q.id, fd).subscribe({
      next: (res) => {
        q.text = res.text;
        this.showToast('প্রশ্ন সংরক্ষিত হয়েছে');
      },
      error: () => this.showToast('সংরক্ষণ ব্যর্থ', 'error'),
    });
  }

  updateStatus(q: EditorQuestion, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    const fd = new FormData();
    fd.append('status', status);
    this.svc.updateQuestion(q.id, fd).subscribe({
      next: () => {
        q.status = status;
        this.questions.update(qs => [...qs]);
        this.showToast('স্ট্যাটাস আপডেট হয়েছে');
      },
      error: () => this.showToast('আপডেট ব্যর্থ', 'error'),
    });
  }

  uploadQuestionImage(q: EditorQuestion, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    this.svc.updateQuestion(q.id, fd).subscribe({
      next: (res) => {
        q.image = res.image;
        this.questions.update(qs => [...qs]);
        this.showToast('ছবি আপলোড হয়েছে');
      },
      error: () => this.showToast('ছবি আপলোড ব্যর্থ', 'error'),
    });
  }

  removeQuestionImage(q: EditorQuestion): void {
    const fd = new FormData();
    fd.append('remove_image', 'true');
    this.svc.updateQuestion(q.id, fd).subscribe({
      next: () => {
        q.image = null;
        this.questions.update(qs => [...qs]);
        this.showToast('ছবি সরানো হয়েছে');
      },
      error: () => this.showToast('সরানো ব্যর্থ', 'error'),
    });
  }

  deleteQuestion(q: EditorQuestion): void {
    if (!confirm('এই প্রশ্নটি মুছে দিতে চান?')) return;
    this.svc.deleteQuestion(q.id).subscribe({
      next: () => {
        this.questions.update(qs => qs.filter(x => x.id !== q.id));
        this.exam.update(e => e ? { ...e, total_questions: e.total_questions - 1 } : e);
        this.showToast('প্রশ্ন মুছে দেওয়া হয়েছে');
      },
      error: () => this.showToast('মুছে দেওয়া ব্যর্থ', 'error'),
    });
  }

  uploadExplanationImage(q: EditorQuestion, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('explanation_image', file);
    this.svc.updateQuestion(q.peq_id, fd).subscribe({
      next: (res: any) => {
        q.explanation_image = res.explanation_image;
        this.showToast('ব্যাখ্যার ছবি আপলোড হয়েছে', 'success');
      },
      error: () => this.showToast('আপলোড ব্যর্থ হয়েছে', 'error'),
    });
  }

  removeExplanationImage(q: EditorQuestion): void {
    const fd = new FormData();
    fd.append('remove_explanation_image', 'true');
    this.svc.updateQuestion(q.peq_id, fd).subscribe({
      next: () => {
        q.explanation_image = null;
        this.showToast('ব্যাখ্যার ছবি মুছে গেছে', 'success');
      },
      error: () => this.showToast('মুছতে ব্যর্থ হয়েছে', 'error'),
    });
  }

  scrollToInsertAfter(order: number): void {
    this.openInsertForm(order);
    setTimeout(() => {
      const el = document.querySelector('.insert-form-card');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  openInsertForm(afterOrder: number): void {
    this.insertingAfter.set(afterOrder);
    this.insertForm.set({ text: '', optA: '', optB: '', optC: '', optD: '', correct: 'A', subject: 'General Knowledge' });
  }

  closeInsertForm(): void { this.insertingAfter.set(null); }

  updateInsertForm(field: string, value: string): void {
    this.insertForm.update(f => ({ ...f, [field]: value }));
  }

  saveInsertQuestion(): void {
    const f = this.insertForm();
    // text is optional
    this.isSavingInsert.set(true);
    const examId = this.route.snapshot.paramMap.get('examId')!;
    const fd = new FormData();
    fd.append('insert_after', String(this.insertingAfter()!));
    fd.append('text', f.text);
    fd.append('option_a', f.optA);
    fd.append('option_b', f.optB);
    fd.append('option_c', f.optC);
    fd.append('option_d', f.optD);
    fd.append('correct_option', f.correct);
    fd.append('subject', f.subject);
    this.http.post<any>(`${this.svc['base']}/api/exam-import/exams/${examId}/insert-question/`, fd).subscribe({
      next: (_newQ: any) => {
        this.isSavingInsert.set(false);
        this.insertingAfter.set(null);
        // Reload questions to get updated ordering
        // Reload questions after insert
        this.svc.getExamQuestions(+examId).subscribe({
          next: (data) => {
            this.exam.set(data);
            this.questions.set(data.questions ?? []);
          },
          error: () => {}
        });
        this.showToast('প্রশ্ন যোগ হয়েছে', 'success');
      },
      error: (_e: unknown) => { this.isSavingInsert.set(false); this.showToast('যোগ করতে ব্যর্থ', 'error'); },
    });
  }

  saveSubject(q: EditorQuestion, value: string): void {
    if (!value || value === q.subject) return;
    q.subject = value;
    const fd = new FormData();
    fd.append('subject', value);
    this.svc.updateQuestion(q.peq_id, fd).subscribe({
      next: () => this.showToast('বিষয় সংরক্ষিত হয়েছে', 'success'),
      error: () => this.showToast('সংরক্ষণ ব্যর্থ হয়েছে', 'error'),
    });
  }

  saveExplanation(q: EditorQuestion, event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value.trim();
    if (val === (q.explanation || '')) return;
    q.explanation = val;
    const fd = new FormData();
    fd.append('explanation', val);
    this.svc.updateQuestion(q.peq_id, fd).subscribe({
      next: () => this.showToast('ব্যাখ্যা সংরক্ষিত হয়েছে', 'success'),
      error: () => this.showToast('সংরক্ষণ ব্যর্থ হয়েছে', 'error'),
    });
  }

  // Saves whichever field the toolbar action targeted - the question's
  // own text, or its explanation.
  private saveToolbarField(textarea: HTMLTextAreaElement, q: EditorQuestion, field: 'text' | 'explanation'): void {
    if (field === 'text') {
      this.saveQuestionText(q, { target: textarea } as unknown as Event);
    } else {
      this.saveExplanation(q, { target: textarea } as unknown as Event);
    }
  }

  // Wraps the current selection (or a placeholder if nothing is selected)
  // with the given before/after snippet, e.g. superscript, subscript, sqrt.
  wrapSelection(textarea: HTMLTextAreaElement, q: EditorQuestion, field: 'text' | 'explanation', before: string, after: string): void {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const selected = textarea.value.slice(start, end) || 'x';
    const insertText = before + selected + after;
    textarea.value = textarea.value.slice(0, start) + insertText + textarea.value.slice(end);
    const cursorPos = start + insertText.length;
    textarea.focus();
    textarea.setSelectionRange(cursorPos, cursorPos);
    this.saveToolbarField(textarea, q, field);
  }

  // Inserts a literal snippet (symbol, table template) at the cursor.
  insertAtCursor(textarea: HTMLTextAreaElement, q: EditorQuestion, field: 'text' | 'explanation', snippet: string): void {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    textarea.value = textarea.value.slice(0, start) + snippet + textarea.value.slice(end);
    const cursorPos = start + snippet.length;
    textarea.focus();
    textarea.setSelectionRange(cursorPos, cursorPos);
    this.saveToolbarField(textarea, q, field);
  }

  saveOptionText(opt: EditorOption, event: Event): void {
    const text = (event.target as HTMLInputElement).value.trim();
    if (text === opt.text) return;
    const fd = new FormData();
    fd.append('text', text);
    this.svc.updateOption(opt.id, fd).subscribe({
      next: (res) => {
        opt.text = res.text;
        this.showToast('অপশন সংরক্ষিত');
      },
      error: () => this.showToast('সংরক্ষণ ব্যর্থ', 'error'),
    });
  }

  toggleCorrect(q: EditorQuestion, opt: EditorOption): void {
    const fd = new FormData();
    fd.append('is_correct', 'true');
    this.svc.updateOption(opt.id, fd).subscribe({
      next: () => {
        q.options.forEach(o => o.is_correct = (o.id === opt.id));
        this.questions.update(qs => [...qs]);
        this.showToast('সঠিক উত্তর চিহ্নিত হয়েছে');
      },
      error: () => this.showToast('আপডেট ব্যর্থ', 'error'),
    });
  }

  uploadOptionImage(opt: EditorOption, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    this.svc.updateOption(opt.id, fd).subscribe({
      next: (res) => {
        opt.image = res.image;
        this.questions.update(qs => [...qs]);
        this.showToast('ছবি আপলোড হয়েছে');
      },
      error: () => this.showToast('ছবি আপলোড ব্যর্থ', 'error'),
    });
  }

  removeOptionImage(opt: EditorOption): void {
    const fd = new FormData();
    fd.append('remove_image', 'true');
    this.svc.updateOption(opt.id, fd).subscribe({
      next: () => {
        opt.image = null;
        this.questions.update(qs => [...qs]);
        this.showToast('ছবি সরানো হয়েছে');
      },
      error: () => this.showToast('সরানো ব্যর্থ', 'error'),
    });
  }

  publish(): void {
    const id = this.exam()?.id;
    if (!id) return;
    this.isPublishing.set(true);
    this.svc.publishExam(id, 'publish').subscribe({
      next: () => {
        this.exam.update(e => e ? { ...e, is_published: true } : e);
        this.isPublishing.set(false);
        this.showToast('পরীক্ষা সফলভাবে প্রকাশিত হয়েছে! শিক্ষার্থীরা এখন দেখতে পারবে।');
      },
      error: () => { this.isPublishing.set(false); this.showToast('প্রকাশ ব্যর্থ', 'error'); },
    });
  }

  unpublish(): void {
    const id = this.exam()?.id;
    if (!id) return;
    if (!confirm('পরীক্ষাটি অপ্রকাশিত করতে চান? শিক্ষার্থীরা আর দেখতে পারবে না।')) return;
    this.isPublishing.set(true);
    this.svc.publishExam(id, 'unpublish').subscribe({
      next: () => {
        this.exam.update(e => e ? { ...e, is_published: false } : e);
        this.isPublishing.set(false);
        this.showToast('পরীক্ষা অপ্রকাশিত হয়েছে');
      },
      error: () => { this.isPublishing.set(false); this.showToast('আপডেট ব্যর্থ', 'error'); },
    });
  }
}
