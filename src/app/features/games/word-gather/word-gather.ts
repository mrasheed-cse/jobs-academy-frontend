import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ContentService } from '../../../core/services/content.service';
import { WordPuzzle } from '../../../core/models/content.model';

@Component({ selector: 'app-word-gather', imports: [], templateUrl: './word-gather.html', styleUrl: './word-gather.scss' })
export class WordGather implements OnInit {
  private readonly contentService = inject(ContentService);
  readonly words = signal<WordPuzzle[]>([]);
  readonly currentIndex = signal(0);
  readonly selectedLetters = signal<string[]>([]);
  readonly shuffledLetters = signal<string[]>([]);
  readonly feedback = signal<'correct' | 'wrong' | null>(null);
  readonly score = signal(0);
  readonly isLoading = signal(true);
  readonly gameOver = signal(false);

  readonly currentWord = computed(() => this.words()[this.currentIndex()] ?? null);
  readonly assembled = computed(() => this.selectedLetters().join(''));

  ngOnInit(): void {
    this.contentService.getWordPuzzles().subscribe({
      next: (p) => { this.words.set(p); this.isLoading.set(false); this.shuffleLetters(); },
      error: () => this.isLoading.set(false),
    });
  }

  shuffleLetters(): void {
    const w = this.words()[this.currentIndex()];
    if (w) this.shuffledLetters.set(w.word.toUpperCase().split('').sort(() => Math.random() - 0.5));
    this.selectedLetters.set([]);
  }

  pickLetter(letter: string, idx: number): void {
    this.selectedLetters.update((prev) => [...prev, letter]);
    this.shuffledLetters.update((prev) => prev.filter((_, i) => i !== idx));
  }

  removeLetter(idx: number): void {
    const letter = this.selectedLetters()[idx];
    this.shuffledLetters.update((prev) => [...prev, letter]);
    this.selectedLetters.update((prev) => prev.filter((_, i) => i !== idx));
  }

  checkAnswer(): void {
    const correct = this.currentWord()?.word.toUpperCase();
    if (this.assembled() === correct) { this.feedback.set('correct'); this.score.update((s) => s + 1); }
    else { this.feedback.set('wrong'); }
    setTimeout(() => {
      this.feedback.set(null);
      const next = this.currentIndex() + 1;
      if (next >= this.words().length) { this.gameOver.set(true); } else { this.currentIndex.set(next); this.shuffleLetters(); }
    }, 1500);
  }

  restart(): void { this.currentIndex.set(0); this.score.set(0); this.feedback.set(null); this.gameOver.set(false); this.shuffleLetters(); }
}
