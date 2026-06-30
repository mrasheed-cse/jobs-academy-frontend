import { Component, OnInit, OnDestroy, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { PuzzleWord, FALLBACK_WORDS, scrambleWord, shuffleArray, difficultyLabel, difficultyColor } from '../game-utils';

const TIME = 30;

@Component({ selector: 'app-spelling-game', imports: [FormsModule], templateUrl: './spelling-game.html', styleUrl: './spelling-game.scss' })
export class SpellingGame implements OnInit, OnDestroy {
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);
  @ViewChild('inp') inp?: ElementRef<HTMLInputElement>;
  private h?: ReturnType<typeof setInterval>;
  words: PuzzleWord[] = [];

  readonly loading    = signal(true);
  readonly started    = signal(false);
  readonly over       = signal(false);
  readonly idx        = signal(0);
  readonly answer     = signal('');
  readonly feedback   = signal<'ok'|'bad'|null>(null);
  readonly score      = signal(0);
  readonly streak     = signal(0);
  readonly best       = signal(0);
  readonly timeLeft   = signal(TIME);
  readonly hintShown  = signal(false);
  readonly hintUsed   = signal(false);
  readonly wrong      = signal<PuzzleWord[]>([]);

  readonly word    = computed(() => this.words[this.idx()] ?? null);
  readonly mixed   = computed(() => { const w = this.word(); return w ? scrambleWord(w.word) : ''; });
  readonly pct     = computed(() => this.words.length ? Math.round((this.idx() / this.words.length) * 100) : 0);
  readonly tColor  = computed(() => this.timeLeft() > 15 ? 'success' : this.timeLeft() > 7 ? 'warning' : 'danger');
  readonly dLabel  = difficultyLabel;
  readonly dColor  = difficultyColor;

  ngOnInit() {
    this.contentService.getWordPuzzles().subscribe({
      next: (p) => {
        const m = p.map(x => ({ id: x.id, word: (x.word || '').toUpperCase(), meaning: (x as any).bengali_meaning ?? (x as any).meaning, hint: x.hint, category: x.category, difficulty: x.difficulty as PuzzleWord['difficulty'] })).filter(x => x.word.length >= 3);
        this.words = shuffleArray(m.length ? m : FALLBACK_WORDS);
        this.loading.set(false);
      },
      error: () => { this.words = shuffleArray([...FALLBACK_WORDS]); this.loading.set(false); },
    });
  }
  ngOnDestroy() { this.stop(); }

  start() { this.started.set(true); this.tick(); setTimeout(() => this.inp?.nativeElement.focus(), 100); }

  private tick() {
    this.timeLeft.set(TIME); this.stop();
    this.h = setInterval(() => {
      const t = this.timeLeft() - 1; this.timeLeft.set(t);
      if (t <= 0) { this.stop(); this.fb('bad'); }
    }, 1000);
  }
  private stop() { if (this.h) { clearInterval(this.h); this.h = undefined; } }

  private fb(result: 'ok'|'bad') {
    this.stop(); this.feedback.set(result);
    if (result === 'ok') {
      this.score.update(s => s + (this.hintUsed() ? 1 : 2));
      this.streak.update(s => s + 1);
      if (this.streak() > this.best()) this.best.set(this.streak());
    } else {
      this.streak.set(0);
      const w = this.word(); if (w) this.wrong.update(a => [...a, w]);
    }
    setTimeout(() => this.next(), 1700);
  }

  check() {
    if (this.feedback() || !this.answer().trim()) return;
    const ans = this.answer().trim().toUpperCase();
    this.fb(ans === this.word()?.word ? 'ok' : 'bad');
  }

  private next() {
    this.feedback.set(null); this.answer.set(''); this.hintShown.set(false); this.hintUsed.set(false);
    const n = this.idx() + 1;
    if (n >= this.words.length) { this.over.set(true); } else { this.idx.set(n); this.tick(); setTimeout(() => this.inp?.nativeElement.focus(), 50); }
  }

  hint() { this.hintShown.set(true); this.hintUsed.set(true); }
  skip() { this.stop(); this.streak.set(0); const w = this.word(); if (w) this.wrong.update(a => [...a, w]); this.next(); }

  restart() {
    this.words = shuffleArray([...this.words]);
    this.idx.set(0); this.score.set(0); this.streak.set(0); this.best.set(0);
    this.answer.set(''); this.feedback.set(null); this.hintShown.set(false); this.hintUsed.set(false);
    this.wrong.set([]); this.over.set(false); this.tick();
    setTimeout(() => this.inp?.nativeElement.focus(), 50);
  }

  back() { this.stop(); this.router.navigate(['/quiz-games']); }
  accuracy() { const t = this.idx(); return t ? Math.round(((t - this.wrong().length) / t) * 100) : 0; }
}
