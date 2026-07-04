import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface IllustrationResult {
  url: string;
  status: 'loading' | 'ready' | 'error';
}

@Injectable({ providedIn: 'root' })
export class IllustrationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly inFlight = new Set<string>();

  readonly results = new Map<string, IllustrationResult>();
  private readonly listeners = new Map<string, (() => void)[]>();

  fetch(
    sentence: string,
    word: string,
    meaning: string,
    key: string,
    notify: () => void,
  ): IllustrationResult {
    const existing = this.results.get(key);
    if (existing) return existing;

    if (!this.listeners.has(key)) this.listeners.set(key, []);
    this.listeners.get(key)!.push(notify);

    if (this.inFlight.has(key)) return { url: '', status: 'loading' };

    this.inFlight.add(key);
    this.results.set(key, { url: '', status: 'loading' });

    const query = this.buildQuery(sentence, word, meaning);
    const page  = (Math.abs(this.hash(sentence)) % 3) + 1;

    this.http
      .get<{ hits?: { webformatURL: string }[] }>(
        `${this.baseUrl}/api/pixabay/?q=${encodeURIComponent(query)}&page=${page}`,
      )
      .subscribe({
        next: (res) => {
          const hits = res.hits ?? [];
          // Pick the most relevant hit (first 3 are most popular on Pixabay)
          const url = hits.length > 0
            ? hits[Math.floor(Math.random() * Math.min(hits.length, 3))].webformatURL
            : '';
          const result: IllustrationResult = url
            ? { url, status: 'ready' }
            : { url: '', status: 'error' };
          this.results.set(key, result);
          this.inFlight.delete(key);
          this.listeners.get(key)?.forEach(fn => fn());
        },
        error: () => {
          this.results.set(key, { url: '', status: 'error' });
          this.inFlight.delete(key);
          this.listeners.get(key)?.forEach(fn => fn());
        },
      });

    return { url: '', status: 'loading' };
  }

  /**
   * Builds a precise Pixabay search query from the example sentence.
   *
   * Strategy:
   * 1. The defined word is always the primary search term
   * 2. Extract 1-2 concrete nouns/verbs from the sentence as context
   * 3. Map abstract words to visual concepts so Pixabay can find photos
   * 4. Keep query to 2-3 words max — shorter = more focused results
   */
  private buildQuery(sentence: string, word: string, meaning: string): string {
    const w = word.toLowerCase().trim();

    // Abstract-to-visual concept mapping
    // Maps words that Pixabay can't photograph to a visual equivalent
    const visualMap: Record<string, string> = {
      // Speed / movement
      haste: 'running hurry', hasty: 'running hurry', hasten: 'running hurry',
      hurry: 'running hurry', rush: 'rushing crowd', swift: 'running athlete',
      rapid: 'speed motion', quick: 'sprint running', fast: 'running athlete',
      dash: 'sprinting runner', flee: 'running escape', scurry: 'running hurry',
      scramble: 'rushing crowd', bolt: 'sprint running',
      // Achievement
      apex: 'mountain top success', peak: 'mountain summit', summit: 'mountain peak',
      pinnacle: 'mountain top', zenith: 'success achievement', triumph: 'victory celebration',
      excel: 'success achievement', accomplish: 'achievement success',
      // Knowledge
      ponder: 'thinking contemplation', contemplate: 'deep thought',
      reflect: 'thinking meditation', deliberate: 'thoughtful discussion',
      wisdom: 'wise elder book', scholar: 'student reading books',
      // Emotions
      glint: 'eye sparkle light', shimmer: 'light reflection water',
      gleam: 'light beam shining', sparkle: 'sparkle light shine',
      dazzle: 'bright light shine', radiant: 'glowing light',
      // Character traits
      diligent: 'hard work study', persistent: 'determination effort',
      tenacious: 'determination perseverance', resilient: 'strength recovery',
      frugal: 'saving money budget', thrifty: 'saving coins money',
      generous: 'sharing giving charity', benevolent: 'helping charity',
      // Abstract concepts
      freedom: 'open sky freedom', liberty: 'freedom flying sky',
      hope: 'sunrise golden light', despair: 'sad lonely dark',
      courage: 'brave hero strength', fear: 'scared anxious',
      justice: 'scales law court', chaos: 'crowd disorder',
      harmony: 'peaceful nature', conflict: 'argument dispute',
      // Nature words
      flourish: 'garden growing flowers', wither: 'dry dead plant',
      blossom: 'cherry blossom flowers', decay: 'rotten deteriorate',
      // Time / change
      obsolete: 'old broken machine', ancient: 'old ruins history',
      modern: 'city technology', evolve: 'growth transformation',
      // Social
      solitude: 'alone person nature', isolation: 'alone lonely',
      camaraderie: 'friends together laughing', rivalry: 'competition sport',
      envy: 'jealous desire', compassion: 'helping caring people',
    };

    // If we have a direct visual mapping, use it
    if (visualMap[w]) return visualMap[w];

    // Otherwise build from sentence keywords
    const stopWords = new Set([
      'a','an','the','is','are','was','were','be','been','being','have','has','had',
      'do','does','did','will','would','could','should','may','might','must','shall',
      'can','to','of','in','on','at','by','for','with','about','as','into','through',
      'during','before','after','above','below','between','out','off','over','under',
      'again','then','once','and','but','or','so','yet','not','very','too','also',
      'just','that','this','these','those','it','its','he','she','they','we','you',
      'i','my','your','his','her','their','our','what','which','who','when','where',
      'how','all','each','every','more','most','other','some','such','no','up','if',
      'there','here','than','s','t','don','didn','wasn','isn','hasn','hadn','won',
      'from','onto','upon','within','him','them','us','me','been','got','get',
    ]);

    // Extract meaningful words from sentence (longer = more specific = better)
    const sentenceWords = sentence
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(sw => sw.length > 3 && !stopWords.has(sw));

    // Check if any sentence word has a visual mapping
    for (const sw of sentenceWords) {
      if (visualMap[sw]) return `${w} ${visualMap[sw]}`.trim();
    }

    // Build query: defined word + top 1-2 concrete sentence words
    const extras = sentenceWords
      .filter(sw => sw !== w)
      .slice(0, 2);

    const parts = [w, ...extras].slice(0, 3);
    return parts.join(' ');
  }

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return h;
  }
}
