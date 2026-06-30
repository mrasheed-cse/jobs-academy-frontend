import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { AuthService } from '../../../core/services/auth.service';
import { DictWord, DictWordAZEntry, DictWordSearchResult } from '../../../core/models/content.model';

@Component({
  selector: 'app-language-home',
  imports: [FormsModule, RouterLink],
  templateUrl: './language-home.html',
  styleUrl: './language-home.scss',
})
export class LanguageHome implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly authService = inject(AuthService);

  readonly wotd = signal<DictWord | null>(null);
  readonly wordsByLetter = signal<Record<string, DictWordAZEntry[]>>({});
  readonly selectedWord = signal<DictWord | null>(null);
  readonly searchQuery = signal('');
  readonly searchResults = signal<DictWordSearchResult[]>([]);
  readonly isSearching = signal(false);
  readonly letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Matches the real backend permission (IsTeacherOrAdmin: teacher, admin,
  // or Django staff) - gating the frontend more strictly than the backend
  // actually enforces would just be confusing, since a teacher would be
  // blocked by the UI while still able to call the API directly.
  readonly canManageDictionary = () => {
    const role = this.authService.currentUser()?.role;
    return role === 'admin' || role === 'teacher';
  };

  ngOnInit(): void {
    this.contentService.getWordOfTheDay().subscribe({
      next: (w) => this.wotd.set(w),
      error: () => {}, // 404 when no words exist yet - fine, just don't show the card
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
  wordsForLetter(letter: string): DictWordAZEntry[] { return this.wordsByLetter()[letter] ?? []; }

  // A word can have multiple senses, each with its own Bangla meanings -
  // flatten for a simple display in the search dropdown / modal.
  firstMeaning(word: DictWord): string | null {
    const meaning = word.senses?.[0]?.bangla_meanings?.[0]?.meaning;
    return meaning ?? null;
  }
}
