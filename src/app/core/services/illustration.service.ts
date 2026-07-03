import { Injectable, signal } from '@angular/core';

export interface SentenceIllustration {
  sentenceId: number;
  svg: string;
  status: 'loading' | 'ready' | 'error';
}

@Injectable({ providedIn: 'root' })
export class IllustrationService {
  private readonly cache = new Map<string, string>();
  readonly illustrations = signal<Map<string, SentenceIllustration>>(new Map());

  async generateForSentence(
    sentence: string,
    word: string,
    meaning: string,
    sentenceKey: string,
  ): Promise<void> {
    // Return cached result immediately
    if (this.cache.has(sentenceKey)) {
      this.updateIllustration(sentenceKey, {
        sentenceId: 0,
        svg: this.cache.get(sentenceKey)!,
        status: 'ready',
      });
      return;
    }

    // Set loading state
    this.updateIllustration(sentenceKey, {
      sentenceId: 0,
      svg: '',
      status: 'loading',
    });

    const prompt = `Create a beautiful, minimalist SVG illustration that visually represents this English sentence:

"${sentence}"

Key word: "${word}" (meaning: "${meaning}")

Requirements:
- SVG viewBox="0 0 400 220", width="400" height="220"
- Clean, modern, flat design style (like a high-quality editorial illustration)
- Use a harmonious color palette of 3-4 colors — soft, professional tones
- Include simple but expressive figures, objects, or abstract shapes that convey the meaning
- Add a subtle CSS animation (e.g. gentle float, pulse, path draw, or fade) using <style> inside the SVG
- The animation should be smooth and loop continuously
- NO text labels inside the SVG
- Make it feel like a premium dictionary illustration
- The visual should directly and clearly represent the sentence meaning

Respond with ONLY the raw SVG code, starting with <svg and ending with </svg>. No explanation, no markdown, no backticks.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const raw: string = data?.content?.[0]?.text ?? '';

      // Extract SVG from response
      const svgMatch = raw.match(/<svg[\s\S]*<\/svg>/i);
      const svg = svgMatch ? svgMatch[0] : '';

      if (svg) {
        this.cache.set(sentenceKey, svg);
        this.updateIllustration(sentenceKey, { sentenceId: 0, svg, status: 'ready' });
      } else {
        this.updateIllustration(sentenceKey, { sentenceId: 0, svg: '', status: 'error' });
      }
    } catch {
      this.updateIllustration(sentenceKey, { sentenceId: 0, svg: '', status: 'error' });
    }
  }

  private updateIllustration(key: string, val: SentenceIllustration): void {
    const map = new Map(this.illustrations());
    map.set(key, val);
    this.illustrations.set(map);
  }

  getIllustration(key: string): SentenceIllustration | undefined {
    return this.illustrations().get(key);
  }

  clearCache(): void {
    this.cache.clear();
    this.illustrations.set(new Map());
  }
}
