import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContentService } from '../../../core/services/content.service';
import { AuthService } from '../../../core/services/auth.service';
import { IllustrationService } from '../../../core/services/illustration.service';
import { DictWord, DictWordAZEntry, DictWordSearchResult, DictSense } from '../../../core/models/content.model';

@Component({
  selector: 'app-language-home',
  imports: [FormsModule, RouterLink],
  templateUrl: './language-home.html',
  styleUrl: './language-home.scss',
})
export class LanguageHome implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly authService = inject(AuthService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly illustrationService = inject(IllustrationService);

  readonly wotd = signal<DictWord | null>(null);
  readonly wordsByLetter = signal<Record<string, DictWordAZEntry[]>>({});
  readonly selectedWord = signal<DictWord | null>(null);
  readonly searchQuery = signal('');
  readonly searchResults = signal<DictWordSearchResult[]>([]);
  readonly isSearching = signal(false);
  readonly isSpeaking = signal<'uk' | 'us' | null>(null);
  readonly activeSenseIndex = signal(0);
  readonly letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  readonly canManageDictionary = () => {
    const role = this.authService.currentUser()?.role;
    return role === 'admin' || role === 'teacher';
  };

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
    this.activeSenseIndex.set(0);
    this.isSpeaking.set(null);
    this.contentService.getWordDetail(id).subscribe({ next: (w) => this.selectedWord.set(w) });
  }

  getImageUrl(exId: number, sentence: string, word: string, meaning: string): string {
    return this.illustrationService.getUrl(sentence, word, meaning, `ex-${exId}`);
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.closest('.illus-placeholder')?.classList.add('loaded');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.closest('.illus-placeholder')?.classList.add('errored');
  }

  safeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  closeWord(): void { this.selectedWord.set(null); this.stopSpeech(); }
  wordsForLetter(letter: string): DictWordAZEntry[] { return this.wordsByLetter()[letter] ?? []; }

  firstMeaning(word: DictWord): string | null {
    return word.senses?.[0]?.bangla_meanings?.[0]?.meaning ?? null;
  }

  // ── Text-to-Speech ──────────────────────────────────────────
  speak(text: string, accent: 'uk' | 'us'): void {
    if (!('speechSynthesis' in window)) return;
    this.stopSpeech();
    this.isSpeaking.set(accent);
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = accent === 'uk' ? 'en-GB' : 'en-US';
    utt.rate = 0.85;
    utt.onend = () => this.isSpeaking.set(null);
    utt.onerror = () => this.isSpeaking.set(null);
    window.speechSynthesis.speak(utt);
  }

  stopSpeech(): void {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    this.isSpeaking.set(null);
  }

  speakExample(sentence: string): void {
    this.stopSpeech();
    const utt = new SpeechSynthesisUtterance(sentence);
    utt.lang = 'en-US'; utt.rate = 0.8;
    window.speechSynthesis.speak(utt);
  }

  // ── Sense tabs ───────────────────────────────────────────────
  setActiveSense(i: number): void { this.activeSenseIndex.set(i); }

  activeSense(): DictSense | null {
    const w = this.selectedWord();
    if (!w?.senses.length) return null;
    return w.senses[this.activeSenseIndex()] ?? w.senses[0];
  }

  // ── Highlight word in example sentence ──────────────────────
  highlight(sentence: string, word: string): string {
    if (!sentence || !word) return sentence;
    const rx = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return sentence.replace(rx, '<mark class="hl">$1</mark>');
  }
}
