import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';
import { WordPuzzle } from '../../../core/models/content.model';

@Component({ selector: 'app-spelling-game', imports: [FormsModule], templateUrl: './spelling-game.html', styleUrl: './spelling-game.scss' })
export class SpellingGame implements OnInit {
  private readonly contentService = inject(ContentService);
  readonly words = signal<WordPuzzle[]>([]);
  readonly currentIndex = signal(0);
  readonly userAnswer = signal('');
  readonly feedback = signal<'correct' | 'wrong' | null>(null);
  readonly score = signal(0);
  readonly isLoading = signal(true);
  readonly gameOver = signal(false);

  readonly currentWord = computed(() => this.words()[this.currentIndex()] ?? null);
  readonly scrambled = computed(() => {
    const w = this.currentWord();
    if (!w) return '';
    return w.scrambled ?? w.word.split('').sort(() => Math.random() - 0.5).join('');
  });

  ngOnInit(): void {
    this.contentService.getWordPuzzles().subscribe({
      next: (p) => { this.words.set(p); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  checkAnswer(): void {
    const correct = this.currentWord()?.word.toLowerCase();
    if (this.userAnswer().trim().toLowerCase() === correct) {
      this.feedback.set('correct');
      this.score.update((s) => s + 1);
    } else {
      this.feedback.set('wrong');
    }
    setTimeout(() => this.nextWord(), 1500);
  }

  nextWord(): void {
    this.feedback.set(null);
    this.userAnswer.set('');
    const next = this.currentIndex() + 1;
    if (next >= this.words().length) { this.gameOver.set(true); } else { this.currentIndex.set(next); }
  }

  restart(): void { this.currentIndex.set(0); this.score.set(0); this.userAnswer.set(''); this.feedback.set(null); this.gameOver.set(false); }
}
