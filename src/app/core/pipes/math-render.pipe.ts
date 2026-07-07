import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Converts math notation in exam questions to proper HTML with superscripts.
 * Handles both:
 * - Unicode superscripts already in text: a³b² → displayed correctly
 * - Caret notation from older imports: a^3 → a<sup>3</sup>
 * - Subscripts: H₂O already fine, H_2O → H<sub>2</sub>O
 * - Square root: √ → displayed correctly
 * - Fractions: ½ → displayed correctly
 */
@Pipe({ name: 'mathRender', standalone: true })
export class MathRenderPipe implements PipeTransform {
  constructor(private san: DomSanitizer) {}

  transform(text: string | null | undefined): SafeHtml {
    if (!text) return this.san.bypassSecurityTrustHtml('');

    let html = this.escapeHtml(text);

    // Convert caret notation to superscript: a^3 → a<sup>3</sup>
    // Handles: a^3, a^{3}, a^(3), a^10, a^-1, a^+2
    html = html.replace(/\^(\{[^}]+\}|\([^)]+\)|[-+]?\d+)/g, (_, exp) => {
      const inner = exp.replace(/[{}()]/g, '');
      return `<sup>${inner}</sup>`;
    });

    // Convert underscore subscript notation: H_2 → H<sub>2</sub>
    html = html.replace(/_(\{[^}]+\}|\([^)]+\)|[-+]?\d+)/g, (_, sub) => {
      const inner = sub.replace(/[{}()]/g, '');
      return `<sub>${inner}</sub>`;
    });

    // Convert sqrt() notation: sqrt(x) → √x
    html = html.replace(/sqrt\(([^)]+)\)/g, '√$1');

    // Convert Unicode superscript digits to <sup> for consistent styling
    const supMap: Record<string, string> = {
      '²': '<sup>2</sup>', '³': '<sup>3</sup>', '¹': '<sup>1</sup>',
      '⁴': '<sup>4</sup>', '⁵': '<sup>5</sup>', '⁶': '<sup>6</sup>',
      '⁷': '<sup>7</sup>', '⁸': '<sup>8</sup>', '⁹': '<sup>9</sup>',
      '⁰': '<sup>0</sup>',
    };
    for (const [char, tag] of Object.entries(supMap)) {
      html = html.split(char).join(tag);
    }

    // Convert Unicode subscript digits to <sub> for consistent styling
    const subMap: Record<string, string> = {
      '₀': '<sub>0</sub>', '₁': '<sub>1</sub>', '₂': '<sub>2</sub>',
      '₃': '<sub>3</sub>', '₄': '<sub>4</sub>', '₅': '<sub>5</sub>',
      '₆': '<sub>6</sub>', '₇': '<sub>7</sub>', '₈': '<sub>8</sub>',
      '₉': '<sub>9</sub>',
    };
    for (const [char, tag] of Object.entries(subMap)) {
      html = html.split(char).join(tag);
    }

    return this.san.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
