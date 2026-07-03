import { Injectable } from '@angular/core';

/**
 * Generates contextually relevant illustration URLs for dictionary
 * example sentences using Unsplash Source API.
 *
 * Why Unsplash:
 * - Completely free, no API key, no signup
 * - Images served from CDN → loads in ~100-200ms (feels instant)
 * - Each sentence produces different keywords → unique relevant image
 * - High quality professional photography
 *
 * URL format: https://source.unsplash.com/400x220/?keyword1,keyword2
 */
@Injectable({ providedIn: 'root' })
export class IllustrationService {
  private readonly cache = new Map<string, string>();

  getUrl(sentence: string, word: string, meaning: string, key: string): string {
    if (this.cache.has(key)) return this.cache.get(key)!;
    const url = this.buildUrl(sentence, word, meaning);
    this.cache.set(key, url);
    return url;
  }

  private buildUrl(sentence: string, word: string, meaning: string): string {
    const keywords = this.extractKeywords(sentence, word);
    const query = keywords.slice(0, 3).join(',');
    // Add a seed based on the sentence so same sentence always gets same image
    const seed = this.hash(sentence);
    return `https://source.unsplash.com/400x220/?${encodeURIComponent(query)}&sig=${seed}`;
  }

  private extractKeywords(sentence: string, word: string): string[] {
    const s = sentence.toLowerCase();
    const keywords: string[] = [];

    // Always include the main word itself as a keyword
    keywords.push(word.toLowerCase());

    // Domain-specific keyword mapping
    const domainMap: [RegExp, string[]][] = [
      [/climb|reach|top|apex|peak|summit|highest|rise|achieve|success|goal|career/, ['success', 'mountain', 'achievement']],
      [/book|read|learn|study|knowledge|library|education|school|university/, ['reading', 'book', 'study']],
      [/grow|plant|tree|flower|garden|nature|seed|bloom|forest/, ['nature', 'plant', 'growth']],
      [/travel|journey|road|walk|explore|adventure|trip|voyage/, ['travel', 'journey', 'road']],
      [/money|wealth|rich|profit|economy|finance|invest|bank|business/, ['business', 'finance', 'wealth']],
      [/love|heart|together|family|friend|care|kind|warm|embrace/, ['love', 'family', 'together']],
      [/dark|night|shadow|alone|silent|quiet|lonely|solitude/, ['night', 'dark', 'solitude']],
      [/light|bright|sun|shine|dawn|hope|morning|glow/, ['sunrise', 'light', 'hope']],
      [/run|race|fast|speed|athlete|sprint|marathon|sport/, ['running', 'athlete', 'sport']],
      [/water|ocean|sea|river|wave|flow|swim|rain|lake/, ['water', 'ocean', 'nature']],
      [/fire|burn|flame|passion|energy|power|blaze/, ['fire', 'energy', 'passion']],
      [/sky|cloud|fly|bird|air|wing|soar|eagle/, ['sky', 'bird', 'freedom']],
      [/city|urban|street|building|architecture|town/, ['city', 'architecture', 'urban']],
      [/food|eat|cook|meal|restaurant|kitchen|taste/, ['food', 'cooking', 'meal']],
      [/music|song|dance|art|paint|creative|concert/, ['music', 'art', 'creative']],
      [/work|office|job|career|professional|employ|labor/, ['work', 'office', 'professional']],
      [/technology|computer|digital|internet|phone|device/, ['technology', 'digital', 'computer']],
      [/health|doctor|medicine|hospital|disease|cure/, ['health', 'medical', 'wellness']],
      [/war|fight|battle|conflict|army|soldier|struggle/, ['conflict', 'soldier', 'struggle']],
      [/peace|calm|relax|serene|quiet|meditate/, ['peace', 'calm', 'meditation']],
      [/child|baby|young|youth|kid|school|play/, ['child', 'youth', 'play']],
      [/old|age|wise|elder|senior|experience/, ['elderly', 'wisdom', 'experience']],
      [/think|idea|mind|thought|brain|smart|clever|genius/, ['thinking', 'idea', 'mind']],
      [/speak|talk|communicate|voice|speech|debate/, ['communication', 'speech', 'conversation']],
      [/write|author|pen|letter|text|newspaper|journal/, ['writing', 'journalism', 'pen']],
      [/smile|happy|joy|laugh|celebrate|party/, ['happiness', 'smile', 'joy']],
      [/sad|cry|tear|grief|loss|mourn|sorrow/, ['sadness', 'grief', 'emotion']],
      [/angry|rage|frustrat|conflict|argue|shout/, ['anger', 'conflict', 'emotion']],
      [/fear|scared|anxiety|worry|danger|threat/, ['fear', 'anxiety', 'danger']],
      [/brave|courage|hero|strong|defend|protect/, ['courage', 'hero', 'strength']],
      [/time|clock|hour|wait|moment|history|past/, ['time', 'clock', 'moment']],
      [/change|transform|evolve|grow|become|develop/, ['change', 'transformation', 'evolution']],
      [/law|court|judge|justice|legal|crime|prison/, ['justice', 'law', 'court']],
      [/government|politics|president|election|vote|leader/, ['politics', 'government', 'leadership']],
      [/religion|pray|faith|god|church|temple|mosque/, ['prayer', 'faith', 'spirituality']],
      [/science|experiment|research|discover|lab|biology/, ['science', 'research', 'laboratory']],
      [/space|star|planet|moon|galaxy|universe/, ['space', 'stars', 'universe']],
      [/animal|dog|cat|horse|wild|zoo|pet/, ['animals', 'wildlife', 'nature']],
      [/house|home|room|door|window|family|live/, ['home', 'house', 'family']],
    ];

    for (const [pattern, kws] of domainMap) {
      if (pattern.test(s)) {
        keywords.push(...kws);
        break;
      }
    }

    // If no domain matched, extract meaningful words from the sentence
    if (keywords.length < 2) {
      const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'may', 'might', 'must', 'shall', 'can', 'to', 'of', 'in', 'on', 'at', 'by', 'for',
        'with', 'about', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
        'between', 'out', 'off', 'over', 'under', 'again', 'then', 'once', 'and', 'but', 'or',
        'so', 'yet', 'both', 'either', 'neither', 'not', 'very', 'too', 'also', 'just', 'that',
        'this', 'these', 'those', 'it', 'its', 'he', 'she', 'they', 'we', 'you', 'i', 'my',
        'your', 'his', 'her', 'their', 'our', 'what', 'which', 'who', 'when', 'where', 'how',
        'all', 'each', 'every', 'more', 'most', 'other', 'some', 'such', 'no', 'up', 'if']);

      const words = sentence.replace(/[^a-zA-Z\s]/g, '').split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()))
        .slice(0, 3);
      keywords.push(...words);
    }

    return [...new Set(keywords)]; // deduplicate
  }

  // Simple hash for consistent image selection per sentence
  private hash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return Math.abs(h);
  }
}
