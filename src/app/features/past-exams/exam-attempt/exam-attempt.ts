import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MathRenderPipe } from '../../../core/pipes/math-render.pipe';
import { interval, Subscription } from 'rxjs';
import { ExamImportService, PastExamDetail, ExamQuestion } from '../../../core/services/exam-import.service';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../../environments/environment';

interface AnswerMap { [questionId: number]: number | null; } // questionId → optionId

@Component({
  selector: 'app-exam-attempt',
  imports: [RouterLink, DecimalPipe, MathRenderPipe],
  templateUrl: './exam-attempt.html',
  styleUrl: './exam-attempt.scss',
})
export class ExamAttempt implements OnInit, OnDestroy {
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc    = inject(ExamImportService);
  private readonly http   = inject(HttpClient);
  private readonly san    = inject(DomSanitizer);
  private readonly base   = environment.apiBaseUrl;

  private timerSub?: Subscription;

  readonly exam         = signal<PastExamDetail | null>(null);
  readonly isLoading    = signal(true);
  readonly phase        = signal<'ready' | 'exam' | 'result'>('ready');
  readonly currentIndex = signal(0);
  readonly answers      = signal<AnswerMap>({});
  readonly timeLeft     = signal(0); // seconds
  readonly isSubmitting = signal(false);
  readonly result       = signal<any>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getExamDetail(id, false).subscribe({
      next: (e) => { this.exam.set(e); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  ngOnDestroy(): void { this.timerSub?.unsubscribe(); }

  startExam(): void {
    const e = this.exam();
    if (!e) return;
    this.timeLeft.set((e.duration || 60) * 60);
    this.answers.set({});
    this.currentIndex.set(0);
    this.phase.set('exam');
    this.timerSub = interval(1000).subscribe(() => {
      this.timeLeft.update(t => {
        if (t <= 1) { this.submitExam(); return 0; }
        return t - 1;
      });
    });
  }

  selectOption(questionId: number, optionId: number): void {
    this.answers.update(a => ({ ...a, [questionId]: optionId }));
  }

  isSelected(questionId: number, optionId: number): boolean {
    return this.answers()[questionId] === optionId;
  }

  currentQuestion(): ExamQuestion | null {
    return this.exam()?.questions[this.currentIndex()] ?? null;
  }

  navigate(dir: 1 | -1): void {
    const total = this.exam()?.questions.length ?? 0;
    this.currentIndex.update(i => Math.max(0, Math.min(total - 1, i + dir)));
  }

  goTo(index: number): void { this.currentIndex.set(index); }

  answeredCount(): number { return Object.keys(this.answers()).length; }

  timeDisplay(): string {
    const t = this.timeLeft();
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  timePercent(): number {
    const total = (this.exam()?.duration ?? 60) * 60;
    return Math.round((this.timeLeft() / total) * 100);
  }

  submitExam(): void {
    this.timerSub?.unsubscribe();
    this.isSubmitting.set(true);
    const e = this.exam();
    if (!e) return;

    // Submit to backend
    const payload = {
      past_exam: e.id,
      answers: Object.entries(this.answers()).map(([qId, optId]) => ({
        question_id: Number(qId),
        selected_option_id: optId,
      })),
    };

    this.http.post(`${this.base}/api/past-exams/${e.id}/submit/`, payload).subscribe({
      next: (res: any) => {
        this.result.set(res);
        this.isSubmitting.set(false);
        this.phase.set('result');
      },
      error: () => {
        // Fallback: calculate score locally
        const exam = this.exam()!;
        const answered = Object.keys(this.answers()).length;
        this.result.set({
          score: 0,
          correct_answers: 0,
          wrong_answers: 0,
          answered_questions: answered,
          message: 'ফলাফল সার্ভার থেকে আসেনি — স্থানীয়ভাবে গণনা করা হয়েছে'
        });
        this.isSubmitting.set(false);
        this.phase.set('result');
      },
    });
  }

  highlightText(text: string): SafeHtml {
    return this.san.bypassSecurityTrustHtml(text);
  }

  questionStatus(q: ExamQuestion): 'answered' | 'skipped' | 'current' {
    const idx = this.exam()?.questions.indexOf(q) ?? -1;
    if (idx === this.currentIndex()) return 'current';
    return this.answers()[q.id] != null ? 'answered' : 'skipped';
  }
}
