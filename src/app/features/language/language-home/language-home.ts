import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';
import { Word } from '../../../core/models/content.model';

@Component({
  selector: 'app-language-home',
  imports: [FormsModule],
  templateUrl: './language-home.html',
  styleUrl: './language-home.scss',
})
export class LanguageHome implements OnInit {
  private readonly contentService = inject(ContentService);
  readonly wotd = signal<Word | null>(null);
  readonly wordsByLetter = signal<Record<string, Word[]>>({});
  readonly selectedWord = signal<Word | null>(null);
  readonly searchQuery = signal('');
  readonly searchResults = signal<Word[]>([]);
  readonly isSearching = signal(false);
  readonly letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  ngOnInit(): void {
    this.contentService.getWordOfTheDay().subscribe({
      next: (w) => this.wotd.set(w),
      error: () => {},
    });
    this.contentService.getWordsAZ().subscribe({
      next: (data) => this.wordsByLetter.set(data),
      error: () => {},
    });
  }

  search(): void {
    const q = this.searchQuery().trim();
    if (!q) return;
    this.isSearching.set(true);
    this.contentService.searchWords(q).subscribe({
      next: (results) => { this.searchResults.set(results); this.isSearching.set(false); },
      error: () => this.isSearching.set(false),
    });
  }

  openWord(id: number): void {
    this.contentService.getWordDetail(id).subscribe({ next: (w) => this.selectedWord.set(w) });
  }

  closeWord(): void { this.selectedWord.set(null); }
  wordsForLetter(letter: string): Word[] { return this.wordsByLetter()[letter] ?? []; }
}
