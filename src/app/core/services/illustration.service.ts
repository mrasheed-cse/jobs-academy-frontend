import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface SentenceIllustration {
  svg: string;
  status: 'loading' | 'ready' | 'error';
}

@Injectable({ providedIn: 'root' })
export class IllustrationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly cache = new Map<string, string>();

  // Single signal map — Angular tracks reads reactively in templates
  readonly illustrations = signal<Map<string, SentenceIllustration>>(new Map());

  async generateForSentence(
    sentence: string,
    word: string,
    meaning: string,
    key: string,
  ): Promise<void> {
    // Already cached
    if (this.cache.has(key)) {
      this.set(key, { svg: this.cache.get(key)!, status: 'ready' });
      return;
    }

    // Already in flight or done
    const current = this.illustrations().get(key);
    if (current && current.status !== 'error') return;

    this.set(key, { svg: '', status: 'loading' });

    try {
      const res = await firstValueFrom(
        this.http.post<{ svg?: string; detail?: string }>(
          `${this.baseUrl}/api/illustration/`,
          { sentence, word, meaning },
        )
      );

      if (res.svg) {
        this.cache.set(key, res.svg);
        this.set(key, { svg: res.svg, status: 'ready' });
      } else {
        this.set(key, { svg: '', status: 'error' });
      }
    } catch {
      this.set(key, { svg: '', status: 'error' });
    }
  }

  private set(key: string, val: SentenceIllustration): void {
    const next = new Map(this.illustrations());
    next.set(key, val);
    this.illustrations.set(next);
  }
}
