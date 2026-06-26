import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { WordPuzzle } from '../../../core/models/content.model';

@Component({ selector: 'app-word-games', imports: [], templateUrl: './word-games.html', styleUrl: './word-games.scss' })
export class WordGames implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);
  readonly puzzles = signal<WordPuzzle[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.contentService.getWordPuzzles().subscribe({
      next: (p) => { this.puzzles.set(p); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  goToSpelling(): void { this.router.navigate(['/quiz-games', 'spelling']); }
  goToWordGather(): void { this.router.navigate(['/quiz-games', 'word-gather']); }
  goToWordMixer(): void { this.router.navigate(['/quiz-games', 'word-mixer']); }
}
