import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { ExamDetail, ExamAnswer, ExamSubmitResponse, Question } from '../../../core/models/exam.model';

const FREE_QUESTION_LIMIT = 10;
const BENGALI_OPTION_LABELS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];

interface QuestionRow {
  index: number;
  questionId: number;
  text: string | null;
  image: string | null;
  options: Array<{ id: number; label: string; text: string | null; image: string | null }>;
  isLocked: boolean;
}

@Component({
  selector: 'app-exam-take',
  imports: [],
  templateUrl: './exam-take.html',
  styleUrl: './exam-take.scss',
})
export class ExamTake implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);

  private examId = '';
  private timerHandle?: ReturnType<typeof setInterval>;
  private answers = new Map<number, number | 'none'>();

  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);
  readonly hasFullAccess = signal(false);
  readonly exam = signal<ExamDetail | null>(null);
  readonly timeRemainingSeconds = signal(0);
  readonly isSubmitting = signal(false);
  readonly result = signal<ExamSubmitResponse | null>(null);

  readonly timeDisplay = computed(() => {
    const total = this.timeRemainingSeconds();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  readonly questionRows = computed<QuestionRow[]>(() => {
    const e = this.exam();
    if (!e) return [];
    return e.questions.map((q, index) => ({
      index,
      questionId: q.question.id,
      text: q.question.text || null,
      image: q.question.image || null,
      isLocked: !this.hasFullAccess() && index >= FREE_QUESTION_LIMIT,
      options: q.question.options.map((opt, optIndex) => ({
        id: opt.id,
        label: BENGALI_OPTION_LABELS[optIndex] ?? '',
        text: opt.text || null,
        image: opt.image || null,
      })),
    }));
  });

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('examId') ?? '';
    if (!this.examId) {
      this.isLoading.set(false);
      this.loadFailed.set(true);
      return;
    }

    this.examService.checkExamPermission(this.examId).subscribe({
      next: (res) => this.loadExam(res.has_access === true),
      error: () => this.loadExam(false),
    });
  }

  ngOnDestroy(): void {
    if (this.timerHandle) clearInterval(this.timerHandle);
  }

  private loadExam(hasFullAccess: boolean): void {
    this.hasFullAccess.set(hasFullAccess);

    this.examService.getModelExamDetail(this.examId).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.isLoading.set(false);
        this.startTimer(exam.duration);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  private startTimer(duration: string): void {
    const [hours = 0, minutes = 0, seconds = 0] = duration.split(':').map(Number);
    this.timeRemainingSeconds.set(hours * 3600 + minutes * 60 + seconds);

    this.timerHandle = setInterval(() => {
      const remaining = this.timeRemainingSeconds();
      if (remaining <= 0) {
        clearInterval(this.timerHandle);
        this.submitExam();
        return;
      }
      this.timeRemainingSeconds.set(remaining - 1);
    }, 1000);
  }

  selectAnswer(questionId: number, optionId: number): void {
    this.answers.set(questionId, optionId);
  }

  isSelected(questionId: number, optionId: number): boolean {
    return this.answers.get(questionId) === optionId;
  }

  onSubmitClick(): void {
    if (this.timerHandle) clearInterval(this.timerHandle);
    this.submitExam();
  }

  private submitExam(): void {
    const exam = this.exam();
    if (!exam || this.isSubmitting()) return;

    const payload: ExamAnswer[] = exam.questions.map((q) => ({
      question_id: q.question.id,
      selected_option_id: this.answers.get(q.question.id) ?? 'none',
    }));

    this.isSubmitting.set(true);

    this.examService.submitExam(this.examId, { answers: payload }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.result.set(res);
      },
      error: () => {
        this.isSubmitting.set(false);
        alert('পরীক্ষা জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      },
    });
  }

  retryExam(): void {
    window.location.reload();
  }

  backToDetails(): void {
    this.router.navigate(['/model-tests', 'details', this.examId]);
  }

  goToSubscription(): void {
    this.router.navigate(['/subscription']);
  }
}
