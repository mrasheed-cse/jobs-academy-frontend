import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Renders the app's lightweight plain-text math/table syntax as HTML.
 * Supported syntax (all typed as plain text, no HTML needed):
 *   x^2, x^(2n)        -> superscript
 *   x_1, x_(n+1)       -> subscript
 *   sqrt(x)            -> square root
 *   frac(a,b)          -> stacked fraction a/b
 *   bold(text)         -> bold
 *   italic(text)       -> italic
 *   underline(text)    -> underline
 *   log2(x)            -> log with subscript base
 *   30 degree          -> 30 degree symbol
 *   unicode super/subscripts -> normalized to <sup>/<sub>
 *   | a | b |          -> table row (consecutive such lines become a table;
 *                         a row of only dashes, e.g. |---|---|, is treated
 *                         as a header separator and skipped)
 */
@Pipe({ name: 'mathRender', standalone: true, pure: true })
export class MathRenderPipe implements PipeTransform {
  private static readonly cache = new Map<string, string>();
  constructor(private san: DomSanitizer) {}

  transform(text: string | null | undefined): SafeHtml {
    if (!text) return this.san.bypassSecurityTrustHtml('');
    const cached = MathRenderPipe.cache.get(text);
    if (cached !== undefined) return this.san.bypassSecurityTrustHtml(cached);

    const html = this.render(text);
    MathRenderPipe.cache.set(text, html);
    return this.san.bypassSecurityTrustHtml(html);
  }

  private render(text: string): string {
    const lines = text.split('\n');
    const isTableLine = (line: string) => /^\s*\|.+\|\s*$/.test(line);
    const parts: string[] = [];
    let plain: string[] = [];

    const flushPlain = () => {
      if (plain.length) {
        parts.push(this.renderInline(plain.join('\n')));
        plain = [];
      }
    };

    let i = 0;
    while (i < lines.length) {
      if (isTableLine(lines[i])) {
        const tableLines: string[] = [];
        while (i < lines.length && isTableLine(lines[i])) {
          tableLines.push(lines[i]);
          i++;
        }
        flushPlain();
        parts.push(this.renderTable(tableLines));
      } else {
        plain.push(lines[i]);
        i++;
      }
    }
    flushPlain();
    return parts.join('');
  }

  private renderTable(tableLines: string[]): string {
    const isSeparatorRow = (cells: string[]) => cells.every((c) => /^:?-{1,}:?$/.test(c));
    const rows = tableLines
      .map((l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()))
      .filter((row) => !isSeparatorRow(row));

    if (rows.length === 0) return '';
    const [header, ...body] = rows;
    const thead = header.map((c) => `<th>${this.renderInline(c)}</th>`).join('');
    const tbody = body
      .map((row) => `<tr>${row.map((c) => `<td>${this.renderInline(c)}</td>`).join('')}</tr>`)
      .join('');
    return `<table class="mr-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
  }

  private renderInline(text: string): string {
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    html = html.replace(/bold\(([^()]+)\)/g, '<strong>$1</strong>');
    html = html.replace(/italic\(([^()]+)\)/g, '<em>$1</em>');
    html = html.replace(/underline\(([^()]+)\)/g, '<u>$1</u>');
    html = html.replace(/frac\(([^,()]+),([^()]+)\)/g,
      (_, n, d) => `<span class="mr-frac"><span class="mr-num">${n}</span><span class="mr-den">${d}</span></span>`);
    html = html.replace(/\^(\{[^}]+\}|\([^)]+\)|[-+]?\d+)/g,
      (_, e) => `<sup>${e.replace(/[{}()]/g,'')}</sup>`);
    html = html.replace(/_(\{[^}]+\}|\([^)]+\)|[-+]?\d+)/g,
      (_, s) => `<sub>${s.replace(/[{}()]/g,'')}</sub>`);
    html = html.replace(/sqrt\(([^)]+)\)/g, '√$1');
    html = html.replace(/log([0-9])\s*\(/g, 'log<sub>$1</sub>(');
    html = html.replace(/log([0-9])\s*([^(<\s])/g, 'log<sub>$1</sub>$2');
    html = html.replace(/([0-9০-৯]+)\s*degree/gi, '$1°');
    for (const [c,t] of Object.entries({'²':'2','³':'3','¹':'1','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁰':'0'}))
      html = html.split(c).join(`<sup>${t}</sup>`);
    for (const [c,t] of Object.entries({'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'}))
      html = html.split(c).join(`<sub>${t}</sub>`);
    // Preserve line breaks the author typed - browsers collapse a plain
    // newline character by default when rendering HTML, so without this
    // multi-line explanations/questions all appeared as one run-on line.
    html = html.replace(/\n/g, '<br>');
    return html;
  }
}
