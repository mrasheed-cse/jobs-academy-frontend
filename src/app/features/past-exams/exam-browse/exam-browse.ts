import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ExamImportService, PastExamDetail, ExamQuestion } from '../../../core/services/exam-import.service';

@Component({
  selector: 'app-exam-browse',
  imports: [RouterLink],
  templateUrl: './exam-browse.html',
  styleUrl: './exam-browse.scss',
})
export class ExamBrowse implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly svc   = inject(ExamImportService);
  private readonly san   = inject(DomSanitizer);

  readonly exam      = signal<PastExamDetail | null>(null);
  readonly isLoading = signal(true);
  readonly revealed  = signal<Set<number>>(new Set());

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getExamDetail(id, true).subscribe({
      next: (e) => { this.exam.set(e); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  toggleReveal(qId: number): void {
    this.revealed.update(s => {
      const next = new Set(s);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  }

  revealAll(): void {
    const ids = new Set(this.exam()?.questions.map(q => q.id) ?? []);
    this.revealed.set(ids);
  }

  hideAll(): void { this.revealed.set(new Set()); }

  isRevealed(qId: number): boolean { return this.revealed().has(qId); }

  highlightText(text: string): SafeHtml {
    return this.san.bypassSecurityTrustHtml(text);
  }

  correctOption(q: ExamQuestion): string {
    return q.options.find(o => o.is_correct)?.text ?? '—';
  }

  correctLetter(q: ExamQuestion): string {
    const letters = ['A', 'B', 'C', 'D'];
    const idx = q.options.findIndex(o => o.is_correct);
    return idx >= 0 ? letters[idx] : '—';
  }
}
