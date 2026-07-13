import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'mathRender', standalone: true, pure: true })
export class MathRenderPipe implements PipeTransform {
  private static readonly cache = new Map<string, string>();
  constructor(private san: DomSanitizer) {}

  transform(text: string | null | undefined): SafeHtml {
    if (!text) return this.san.bypassSecurityTrustHtml('');
    const cached = MathRenderPipe.cache.get(text);
    if (cached) return this.san.bypassSecurityTrustHtml(cached);
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    MathRenderPipe.cache.set(text, html);
    return this.san.bypassSecurityTrustHtml(html);
  }
}
