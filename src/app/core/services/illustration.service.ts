import { Injectable, signal } from '@angular/core';

export interface SentenceIllustration {
  imageUrl: string;
  status: 'loading' | 'ready' | 'error';
}

/**
 * Generates unique contextual illustrations for dictionary example
 * sentences using Pollinations.ai — a completely free image generation
 * API that requires no API key, no signup, and no credits.
 *
 * API: https://image.pollinations.ai/prompt/{prompt}?width=400&height=220&nologo=true
 * Each unique prompt generates a unique image matching the sentence meaning.
 */
@Injectable({ providedIn: 'root' })
export class IllustrationService {
  private readonly cache = new Map<string, string>();
  readonly illustrations = signal<Map<string, SentenceIllustration>>(new Map());

  generate(sentence: string, word: string, meaning: string, key: string): string {
    // Return cached URL immediately
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const url = this.buildUrl(sentence, word, meaning);
    this.cache.set(key, url);
    return url;
  }

  private buildUrl(sentence: string, word: string, meaning: string): string {
    // Build a rich, descriptive prompt that matches the sentence meaning
    // so every sentence gets a unique, relevant illustration
    const prompt = this.buildPrompt(sentence, word, meaning);
    const encoded = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encoded}?width=400&height=220&nologo=true&model=flux`;
  }

  private buildPrompt(sentence: string, word: string, meaning: string): string {
    // Clean the sentence of punctuation for the prompt
    const cleanSentence = sentence.replace(/['"]/g, '').trim();

    // Build a visual description prompt
    // The sentence itself IS the prompt context — making every illustration unique
    return (
      `editorial illustration, flat design, soft colors, ` +
      `visually depicting: "${cleanSentence}", ` +
      `key concept: ${word}, ` +
      `minimal style, no text, professional, warm colors, ` +
      `simple shapes, clear meaning`
    );
  }
}
