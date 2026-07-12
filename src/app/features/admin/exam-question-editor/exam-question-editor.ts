import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private readonly svc   = inject(ExamEditorService);

  readonly exam        = signal<ExamManageDetail | null>(null);
  readonly questions   = signal<EditorQuestion[]>([]);
  readonly isLoading   = signal(true);
  readonly isPublishing = signal(false);
  readonly toast       = signal<string | null>(null);
  readonly toastType   = signal<'success' | 'error'>('success');

  readonly approvedCount = computed(() =>
    this.questions().filter(q => q.status === 'approved').length
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('examId'));
    this.svc.getExamQuestions(id).subscribe({
      next: (data) => {
        this.exam.set(data);
        this.questions.set(data.questions);
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
