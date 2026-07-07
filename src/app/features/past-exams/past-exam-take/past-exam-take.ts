import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ExamAnswer, Question } from '../../../core/models/exam.model';
import { MathRenderPipe } from '../../../core/pipes/math-render.pipe';
import { PastExamSubmitResponse } from '../../../core/models/past-exam.model';

const BENGALI_LABELS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];

interface QuestionRow {
  index: number; questionId: number; text: string | null; image: string | null;
  options: Array<{ id: number; label: string; text: string | null; image: string | null }>;
}

@Component({
  selector: 'app-past-exam-take',
  imports: [MathRenderPipe],
  templateUrl: './past-exam-take.html',
  styleUrl: './past-exam-take.scss',
})
export class PastExamTake implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);
  private examId = 0;
  private timerHandle?: ReturnType<typeof setInterval>;
  private answers = new Map<number, number | 'none'>();

  readonly isLoading = signal(true);
  readonly examTitle = signal('');
  readonly questions = signal<QuestionRow[]>([]);
  readonly timeRemainingSeconds = signal(0);
  readonly isSubmitting = signal(false);
  readonly result = signal<PastExamSubmitResponse | null>(null);

  readonly timeDisplay = computed(() => {
    const t = this.timeRemainingSeconds();
    return `${String(Math.floor(t / 60)).padStart(2,'0')}:${String(t % 60).padStart(2,'0')}`;
  });

  ngOnInit(): void {
    this.examId = Number(this.route.snapshot.paramMap.get('examId'));
    this.examService.getPastExamDetail(this.examId).subscribe({
      next: (exam) => {
        this.examTitle.set(exam.title);
        this.timeRemainingSeconds.set((exam.duration ?? 60) * 60);
        this.loadQuestions();
      },
      error: () => this.isLoading.set(false),
    });
  }

  ngOnDestroy(): void { if (this.timerHandle) clearInterval(this.timerHandle); }

  private loadQuestions(): void {
    this.examService.getPastExamQuestions(this.examId).subscribe({
      next: (res) => {
        this.questions.set(res.questions.map((q: Question, i: number) => ({
          index: i, questionId: q.id, text: q.text || null, image: q.image || null,
          options: q.options.map((o, oi) => ({ id: o.id, label: BENGALI_LABELS[oi] ?? '', text: o.text || null, image: o.image || null })),
        })));
        this.isLoading.set(false);
        this.startTimer();
      },
      error: () => this.isLoading.set(false),
    });
  }

  private startTimer(): void {
    this.timerHandle = setInterval(() => {
      const remaining = this.timeRemainingSeconds();
      if (remaining <= 0) { clearInterval(this.timerHandle); this.submit(); return; }
      this.timeRemainingSeconds.set(remaining - 1);
    }, 1000);
  }

  selectAnswer(questionId: number, optionId: number): void { this.answers.set(questionId, optionId); }
  isSelected(questionId: number, optionId: number): boolean { return this.answers.get(questionId) === optionId; }

  onSubmit(): void { if (this.timerHandle) clearInterval(this.timerHandle); this.submit(); }

  private submit(): void {
    if (this.isSubmitting()) return;
    this.isSubmitting.set(true);
    const payload: ExamAnswer[] = this.questions().map((q) => ({
      question_id: q.questionId, selected_option_id: this.answers.get(q.questionId) ?? 'none',
    }));
    this.examService.submitPastExam(this.examId, { answers: payload }).subscribe({
      next: (res) => { this.isSubmitting.set(false); this.result.set(res); },
      error: () => { this.isSubmitting.set(false); alert('জমা দিতে সমস্যা হয়েছে।'); },
    });
  }

  backToDetail(): void { this.router.navigate(['/past-exams', 'details', this.examId]); }
}
