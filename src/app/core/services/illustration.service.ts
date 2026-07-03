import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface IllustrationResult {
  url: string;
  status: 'loading' | 'ready' | 'error';
}

/**
 * Fetches contextually relevant images from Pixabay (free API, no credit card).
 * API key from: https://pixabay.com/api/docs/ → Get API Key (free signup)
 *
 * Each example sentence generates a unique search query from the sentence
 * meaning so every word gets a different, relevant photograph.
 *
 * Proxied through Django backend to keep the API key server-side.
 */
@Injectable({ providedIn: 'root' })
export class IllustrationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly urlCache = new Map<string, string>();
  private readonly inFlight = new Set<string>();

  readonly results = new Map<string, IllustrationResult>();
  private readonly listeners = new Map<string, (() => void)[]>();

  fetch(sentence: string, word: string, meaning: string, key: string, notify: () => void): IllustrationResult {
    const existing = this.results.get(key);
    if (existing) return existing;

    // Register listener for reactivity
    if (!this.listeners.has(key)) this.listeners.set(key, []);
    this.listeners.get(key)!.push(notify);

    if (this.inFlight.has(key)) return { url: '', status: 'loading' };

    this.inFlight.add(key);
    const loading: IllustrationResult = { url: '', status: 'loading' };
    this.results.set(key, loading);

    const query = this.buildQuery(sentence, word, meaning);

    this.http.get<{ hits?: { webformatURL: string }[] }>(
      `${this.baseUrl}/api/pixabay/?q=${encodeURIComponent(query)}&page=${1 + (Math.abs(this.simpleHash(sentence)) % 3)}`
    ).subscribe({
      next: (res) => {
        const hits = res.hits ?? [];
        const url = hits.length > 0 ? hits[Math.floor(Math.random() * Math.min(hits.length, 5))].webformatURL : '';
        const result: IllustrationResult = url ? { url, status: 'ready' } : { url: '', status: 'error' };
        this.results.set(key, result);
        this.inFlight.delete(key);
        this.listeners.get(key)?.forEach(fn => fn());
      },
      error: () => {
        this.results.set(key, { url: '', status: 'error' });
        this.inFlight.delete(key);
        this.listeners.get(key)?.forEach(fn => fn());
      }
    });

    return loading;
  }

  private buildQuery(sentence: string, word: string, meaning: string): string {
    // Extract the most meaningful 2-3 words from the sentence for the search query
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
      'his','her','its','him','them','us','me','from','into','onto','upon','within',
    ]);

    // Always include the defined word itself
    const words = [word.toLowerCase()];

    // Extract key nouns/verbs from sentence
    const sentenceWords = sentence
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w) && w !== word.toLowerCase());

    words.push(...sentenceWords.slice(0, 2));

    // Add Bengali meaning as context hint (transliterate common words)
    return words.slice(0, 3).join(' ');
  }

  private simpleHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return h;
  }
}
