import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';
import { WordPuzzle } from '../../../core/models/content.model';

@Component({ selector: 'app-word-mixer', imports: [FormsModule], templateUrl: './word-mixer.html', styleUrl: './word-mixer.scss' })
export class WordMixer implements OnInit {
  private readonly contentService = inject(ContentService);
  readonly words = signal<WordPuzzle[]>([]);
  readonly currentIndex = signal(0);
  readonly userAnswer = signal('');
  readonly feedback = signal<'correct' | 'wrong' | null>(null);
  readonly score = signal(0);
  readonly isLoading = signal(true);
  readonly gameOver = signal(false);
  readonly showHint = signal(false);

  readonly currentWord = computed(() => this.words()[this.currentIndex()] ?? null);
  readonly mixed = computed(() => {
    const w = this.currentWord();
    if (!w) return '';
    return (w.scrambled ?? w.word.split('').sort(() => Math.random() - 0.5).join('')).toUpperCase();
  });

  ngOnInit(): void {
    this.contentService.getWordPuzzles().subscribe({
      next: (p) => { this.words.set(p); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  checkAnswer(): void {
    if (this.userAnswer().trim().toLowerCase() === this.currentWord()?.word.toLowerCase()) {
      this.feedback.set('correct'); this.score.update((s) => s + 1);
    } else { this.feedback.set('wrong'); }
    setTimeout(() => {
      this.feedback.set(null); this.userAnswer.set(''); this.showHint.set(false);
      const next = this.currentIndex() + 1;
      if (next >= this.words().length) this.gameOver.set(true); else this.currentIndex.set(next);
    }, 1500);
  }

  skip(): void {
    const next = this.currentIndex() + 1;
    this.userAnswer.set(''); this.showHint.set(false); this.feedback.set(null);
    if (next >= this.words().length) this.gameOver.set(true); else this.currentIndex.set(next);
  }

  restart(): void { this.currentIndex.set(0); this.score.set(0); this.userAnswer.set(''); this.feedback.set(null); this.gameOver.set(false); }
}
