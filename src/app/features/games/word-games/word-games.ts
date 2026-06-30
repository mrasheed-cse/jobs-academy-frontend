import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { FALLBACK_WORDS } from '../game-utils';

@Component({
  selector: 'app-word-games',
  imports: [],
  templateUrl: './word-games.html',
  styleUrl: './word-games.scss',
})
export class WordGames implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);
  readonly puzzleCount = signal(0);
  readonly isLoading = signal(true);

  readonly games = [
    { id: 'spelling', title: 'বানান গেম', titleEn: 'Spelling Game', icon: 'fas fa-spell-check', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', desc: 'এলোমেলো অক্ষর থেকে সঠিক শব্দটি টাইপ করুন। প্রতিটি সঠিক উত্তরে পয়েন্ট পাবেন।', route: '/quiz-games/spelling' },
    { id: 'gather',   title: 'ওয়ার্ড গ্যাদার', titleEn: 'Word Gather', icon: 'fas fa-puzzle-piece', color: '#10b981', bg: 'rgba(16,185,129,0.08)', desc: 'ছড়িয়ে থাকা অক্ষরগুলো ট্যাপ করে সঠিক ক্রমে সাজান।', route: '/quiz-games/word-gather' },
    { id: 'mixer',    title: 'ওয়ার্ড মিক্সার', titleEn: 'Word Mixer', icon: 'fas fa-random', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', desc: 'মিশ্রিত শব্দ দেখে মূল শব্দটি খুঁজে বের করুন।', route: '/quiz-games/word-mixer' },
  ];

  ngOnInit(): void {
    this.contentService.getWordPuzzles().subscribe({
      next: (p) => { this.puzzleCount.set(p.length > 0 ? p.length : FALLBACK_WORDS.length); this.isLoading.set(false); },
      error: () => { this.puzzleCount.set(FALLBACK_WORDS.length); this.isLoading.set(false); },
    });
  }

  go(route: string): void { this.router.navigate([route]); }
}
