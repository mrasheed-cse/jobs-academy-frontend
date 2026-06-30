import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { PuzzleWord, FALLBACK_WORDS, shuffleArray, difficultyLabel, difficultyColor } from '../game-utils';

@Component({ selector: 'app-word-gather', imports: [], templateUrl: './word-gather.html', styleUrl: './word-gather.scss' })
export class WordGather implements OnInit, OnDestroy {
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);
  private h?: ReturnType<typeof setInterval>;
  private readonly T = 45;
  words: PuzzleWord[] = [];

  readonly loading  = signal(true);
  readonly started  = signal(false);
  readonly over     = signal(false);
  readonly idx      = signal(0);
  readonly pool     = signal<{l:string; id:string; used:boolean}[]>([]);
  readonly built    = signal<{l:string; tid:string}[]>([]);
  readonly feedback = signal<'ok'|'bad'|null>(null);
  readonly score    = signal(0);
  readonly streak   = signal(0);
  readonly best     = signal(0);
  readonly timeLeft = signal(this.T);
  readonly wrong    = signal<PuzzleWord[]>([]);

  readonly word   = computed(() => this.words[this.idx()] ?? null);
  readonly made   = computed(() => this.built().map(t => t.l).join(''));
  readonly pct    = computed(() => this.words.length ? Math.round((this.idx() / this.words.length) * 100) : 0);
  readonly tColor = computed(() => this.timeLeft() > 20 ? 'success' : this.timeLeft() > 10 ? 'warning' : 'danger');
  readonly dLabel = difficultyLabel;
  readonly dColor = difficultyColor;

  ngOnInit() {
    this.contentService.getWordPuzzles().subscribe({
      next: (p) => {
        const m = p.map(x => ({ id: x.id, word: (x.word||'').toUpperCase(), meaning: (x as any).bengali_meaning ?? (x as any).meaning, hint: x.hint, category: x.category, difficulty: x.difficulty as PuzzleWord['difficulty'] })).filter(x => x.word.length >= 3);
        this.words = shuffleArray(m.length ? m : FALLBACK_WORDS);
        this.loading.set(false);
      },
      error: () => { this.words = shuffleArray([...FALLBACK_WORDS]); this.loading.set(false); },
    });
  }
  ngOnDestroy() { this.stop(); }

  start() { this.started.set(true); this.setup(); this.tick(); }

  private setup() {
    const w = this.word(); if (!w) return;
    const wl = w.word.split('');
    const decoys = 'AEIOURSTLNMDBCFGHKPQVWXYZ'.split('').filter(c => !wl.includes(c)).sort(() => Math.random()-.5).slice(0, Math.max(0, Math.min(3, 10-wl.length)));
    const all = shuffleArray([...wl, ...decoys]);
    this.pool.set(all.map((l, i) => ({ l, id: `t${i}-${Math.random()}`, used: false })));
    this.built.set([]);
  }

  private tick() {
    this.timeLeft.set(this.T); this.stop();
    this.h = setInterval(() => { const t = this.timeLeft()-1; this.timeLeft.set(t); if (t <= 0) { this.stop(); this.fb('bad'); } }, 1000);
  }
  private stop() { if (this.h) { clearInterval(this.h); this.h = undefined; } }

  private fb(r: 'ok'|'bad') {
    this.stop(); this.feedback.set(r);
    if (r === 'ok') {
      this.score.update(s => s+1); this.streak.update(s => s+1);
      if (this.streak() > this.best()) this.best.set(this.streak());
    } else {
      this.streak.set(0);
      const w = this.word(); if (w) this.wrong.update(a => [...a, w]);
    }
    setTimeout(() => this.next(), 1700);
  }

  pick(id: string) {
    if (this.feedback()) return;
    const tile = this.pool().find(t => t.id === id && !t.used); if (!tile) return;
    this.pool.update(p => p.map(t => t.id === id ? {...t, used:true} : t));
    this.built.update(b => [...b, { l: tile.l, tid: id }]);
  }

  removeLast() {
    if (this.feedback() || !this.built().length) return;
    const last = this.built()[this.built().length-1];
    this.built.update(b => b.slice(0,-1));
    this.pool.update(p => p.map(t => t.id === last.tid ? {...t, used:false} : t));
  }

  clear() {
    if (this.feedback()) return;
    this.built.set([]); this.pool.update(p => p.map(t => ({...t, used:false})));
  }

  check() {
    if (this.feedback() || !this.made()) return;
    this.fb(this.made() === this.word()?.word ? 'ok' : 'bad');
  }

  private next() {
    this.feedback.set(null);
    const n = this.idx()+1;
    if (n >= this.words.length) { this.over.set(true); }
    else { this.idx.set(n); this.setup(); this.tick(); }
  }

  skip() { this.stop(); this.streak.set(0); const w = this.word(); if (w) this.wrong.update(a => [...a, w]); this.next(); }

  restart() {
    this.words = shuffleArray([...this.words]);
    this.idx.set(0); this.score.set(0); this.streak.set(0); this.best.set(0);
    this.feedback.set(null); this.wrong.set([]); this.over.set(false);
    this.setup(); this.tick();
  }

  back() { this.stop(); this.router.navigate(['/quiz-games']); }
  accuracy() { const t = this.idx(); return t ? Math.round(((t-this.wrong().length)/t)*100) : 0; }
}
