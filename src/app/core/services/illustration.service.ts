import { Injectable, signal } from '@angular/core';

export interface SentenceIllustration {
  svg: string;
  status: 'ready' | 'loading' | 'error';
}

/**
 * Generates contextual SVG illustrations client-side based on keyword
 * analysis of the sentence. Zero API calls, zero cost, works offline.
 *
 * Each illustration is a hand-crafted animated SVG that matches a
 * semantic category detected from the sentence keywords.
 */
@Injectable({ providedIn: 'root' })
export class IllustrationService {
  private readonly cache = new Map<string, string>();
  readonly illustrations = signal<Map<string, SentenceIllustration>>(new Map());

  generateForSentence(
    sentence: string,
    word: string,
    meaning: string,
    key: string,
  ): void {
    if (this.cache.has(key)) {
      this.set(key, { svg: this.cache.get(key)!, status: 'ready' });
      return;
    }
    const existing = this.illustrations().get(key);
    if (existing?.status === 'ready') return;

    const svg = this.buildSvg(sentence, word);
    this.cache.set(key, svg);
    this.set(key, { svg, status: 'ready' });
  }

  private set(key: string, val: SentenceIllustration): void {
    const next = new Map(this.illustrations());
    next.set(key, val);
    this.illustrations.set(next);
  }

  private buildSvg(sentence: string, word: string): string {
    const s = (sentence + ' ' + word).toLowerCase();
    const theme = this.detectTheme(s);
    return this.themes[theme](word);
  }

  private detectTheme(s: string): string {
    const map: [string[], string][] = [
      [['climb','reach','top','apex','peak','summit','highest','rise','achieve','success','career','goal'], 'achievement'],
      [['run','race','fast','speed','quick','athlete','sprint','win','competition'], 'running'],
      [['book','read','learn','study','knowledge','library','education','school'], 'reading'],
      [['grow','plant','tree','flower','garden','nature','seed','bloom'], 'growth'],
      [['travel','journey','road','path','walk','explore','adventure','trip'], 'journey'],
      [['money','wealth','rich','profit','economy','finance','invest','bank'], 'wealth'],
      [['love','heart','together','family','friend','care','kind','warm'], 'connection'],
      [['dark','night','shadow','hide','secret','silent','quiet','alone'], 'solitude'],
      [['light','bright','sun','shine','glow','dawn','hope','future'], 'light'],
      [['build','create','make','construct','work','effort','labour'], 'building'],
      [['think','idea','mind','thought','brain','smart','clever','wise'], 'thinking'],
      [['fly','bird','sky','cloud','air','free','wing','soar'], 'flight'],
      [['water','ocean','sea','river','wave','flow','swim','rain'], 'water'],
      [['fire','burn','passion','energy','power','force','strong'], 'energy'],
      [['time','clock','hour','wait','slow','fast','moment','past','future'], 'time'],
    ];
    for (const [words, theme] of map) {
      if (words.some(w => s.includes(w))) return theme;
    }
    return 'general';
  }

  private themes: Record<string, (word: string) => string> = {

    achievement: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes rise { from{transform:translateY(0)} to{transform:translateY(-8px)} }
@keyframes star { 0%,100%{opacity:.4;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }
@keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }
.fig{animation:rise 2s ease-in-out infinite alternate}
.s1{animation:star 1.8s ease-in-out infinite}
.s2{animation:star 2.1s ease-in-out .4s infinite}
.s3{animation:star 1.6s ease-in-out .8s infinite}
.beam{animation:shimmer 2s ease-in-out infinite}
</style>
<rect width="400" height="200" fill="#f0f4ff"/>
<!-- Mountain -->
<polygon points="200,40 120,160 280,160" fill="#6366f1" opacity=".9"/>
<polygon points="200,40 170,100 230,100" fill="#818cf8"/>
<polygon points="120,160 160,90 200,120" fill="#4338ca"/>
<!-- Flag -->
<line x1="200" y1="40" x2="200" y2="22" stroke="#f59e0b" stroke-width="2"/>
<polygon points="200,22 215,29 200,36" fill="#f59e0b"/>
<!-- Stars -->
<circle class="s1" cx="60" cy="50" r="5" fill="#f59e0b"/>
<circle class="s2" cx="340" cy="40" r="4" fill="#f59e0b"/>
<circle class="s3" cx="310" cy="80" r="3" fill="#f59e0b"/>
<circle class="s1" cx="80" cy="90" r="3" fill="#a5b4fc"/>
<!-- Figure climbing -->
<g class="fig" transform-origin="200 130">
  <circle cx="200" cy="118" r="7" fill="#1e293b"/>
  <line x1="200" y1="125" x2="200" y2="145" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
  <line x1="200" y1="130" x2="190" y2="140" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="200" y1="130" x2="210" y2="138" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="200" y1="145" x2="192" y2="157" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="200" y1="145" x2="208" y2="157" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
</g>
<!-- Ground -->
<rect x="100" y="160" width="200" height="6" rx="3" fill="#4338ca" opacity=".4"/>
</svg>`,

    reading: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes idea{0%,100%{opacity:.3;r:4px}50%{opacity:1;r:7px}}
@keyframes page{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.96)}}
.book{animation:float 3s ease-in-out infinite}
.bulb{animation:idea 2s ease-in-out infinite}
.pg{animation:page 2.5s ease-in-out infinite;transform-origin:220px 100px}
</style>
<rect width="400" height="200" fill="#fefce8"/>
<g class="book">
  <!-- Book -->
  <rect x="130" y="70" width="90" height="110" rx="4" fill="#6366f1"/>
  <rect x="220" y="70" width="90" height="110" rx="4" fill="#818cf8"/>
  <rect x="216" y="68" width="8" height="114" rx="2" fill="#4338ca"/>
  <!-- Pages left -->
  <line x1="145" y1="88" x2="205" y2="88" stroke="white" stroke-width="2" opacity=".6"/>
  <line x1="145" y1="100" x2="205" y2="100" stroke="white" stroke-width="2" opacity=".6"/>
  <line x1="145" y1="112" x2="205" y2="112" stroke="white" stroke-width="2" opacity=".6"/>
  <line x1="145" y1="124" x2="205" y2="124" stroke="white" stroke-width="2" opacity=".6"/>
  <line x1="145" y1="136" x2="185" y2="136" stroke="white" stroke-width="2" opacity=".6"/>
  <!-- Pages right -->
  <line x1="228" y1="88" x2="298" y2="88" stroke="white" stroke-width="2" opacity=".6"/>
  <line x1="228" y1="100" x2="298" y2="100" stroke="white" stroke-width="2" opacity=".6"/>
  <line x1="228" y1="112" x2="298" y2="112" stroke="white" stroke-width="2" opacity=".6"/>
  <line x1="228" y1="124" x2="298" y2="124" stroke="white" stroke-width="2" opacity=".6"/>
  <line x1="228" y1="136" x2="268" y2="136" stroke="white" stroke-width="2" opacity=".6"/>
</g>
<!-- Light bulb idea -->
<circle class="bulb" cx="320" cy="60" r="4" fill="#f59e0b"/>
<circle cx="320" cy="55" r="14" fill="#fef08a" opacity=".8"/>
<path d="M313,55 Q320,42 327,55" fill="none" stroke="#f59e0b" stroke-width="2"/>
<rect x="315" y="63" width="10" height="6" rx="2" fill="#e5e7eb"/>
<!-- Sparkles -->
<circle cx="75" cy="90" r="3" fill="#6366f1" opacity=".5"/>
<circle cx="90" cy="65" r="2" fill="#6366f1" opacity=".4"/>
<circle cx="62" cy="70" r="2" fill="#f59e0b" opacity=".5"/>
</svg>`,

    growth: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@keyframes bloom{0%,100%{transform:scale(.8);opacity:.7}50%{transform:scale(1.1);opacity:1}}
.stem{animation:grow 1.5s ease-out forwards;transform-origin:200px 170px}
.leaf{animation:sway 3s ease-in-out infinite;transform-origin:200px 120px}
.flower{animation:bloom 2s ease-in-out infinite}
</style>
<rect width="400" height="200" fill="#f0fdf4"/>
<!-- Soil -->
<ellipse cx="200" cy="175" rx="80" ry="12" fill="#92400e" opacity=".3"/>
<!-- Stem -->
<g class="stem">
  <line x1="200" y1="170" x2="200" y2="80" stroke="#16a34a" stroke-width="4" stroke-linecap="round"/>
  <!-- Leaves -->
  <g class="leaf">
    <ellipse cx="175" cy="130" rx="22" ry="10" fill="#22c55e" transform="rotate(-30,175,130)"/>
    <ellipse cx="225" cy="110" rx="22" ry="10" fill="#16a34a" transform="rotate(30,225,110)"/>
  </g>
  <!-- Flower -->
  <g class="flower" transform-origin="200 80">
    <circle cx="200" cy="80" r="14" fill="#fde047"/>
    <circle cx="200" cy="60" r="8" fill="#f97316" opacity=".9"/>
    <circle cx="200" cy="100" r="8" fill="#f97316" opacity=".9"/>
    <circle cx="180" cy="80" r="8" fill="#f97316" opacity=".9"/>
    <circle cx="220" cy="80" r="8" fill="#f97316" opacity=".9"/>
    <circle cx="200" cy="80" r="10" fill="#fbbf24"/>
  </g>
</g>
<!-- Sun -->
<circle cx="320" cy="45" r="22" fill="#fde047" opacity=".7"/>
<line x1="320" y1="18" x2="320" y2="12" stroke="#fde047" stroke-width="2"/>
<line x1="343" y1="22" x2="347" y2="17" stroke="#fde047" stroke-width="2"/>
<line x1="347" y1="45" x2="353" y2="45" stroke="#fde047" stroke-width="2"/>
<!-- Small sprouts -->
<line x1="130" y1="170" x2="130" y2="150" stroke="#16a34a" stroke-width="2"/>
<ellipse cx="122" cy="155" rx="10" ry="5" fill="#22c55e" transform="rotate(-20,122,155)"/>
<line x1="270" y1="170" x2="270" y2="155" stroke="#16a34a" stroke-width="2"/>
<ellipse cx="278" cy="160" rx="10" ry="5" fill="#22c55e" transform="rotate(20,278,160)"/>
</svg>`,

    journey: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes move{0%{transform:translateX(-60px)}100%{transform:translateX(60px)}}
@keyframes wheel{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes cloud{0%,100%{transform:translateX(0)}50%{transform:translateX(8px)}}
.car{animation:move 3s ease-in-out infinite alternate}
.w1{animation:wheel 1s linear infinite;transform-origin:152px 155px}
.w2{animation:wheel 1s linear infinite;transform-origin:188px 155px}
.cl1{animation:cloud 4s ease-in-out infinite}
.cl2{animation:cloud 5s ease-in-out .5s infinite}
</style>
<rect width="400" height="200" fill="#eff6ff"/>
<!-- Road -->
<rect x="0" y="160" width="400" height="40" fill="#94a3b8"/>
<rect x="0" y="178" width="400" height="4" fill="#64748b"/>
<!-- Dashes -->
<rect x="30" y="178" width="40" height="4" fill="white" opacity=".6"/>
<rect x="120" y="178" width="40" height="4" fill="white" opacity=".6"/>
<rect x="210" y="178" width="40" height="4" fill="white" opacity=".6"/>
<rect x="300" y="178" width="40" height="4" fill="white" opacity=".6"/>
<!-- Mountains bg -->
<polygon points="60,160 120,90 180,160" fill="#cbd5e1" opacity=".5"/>
<polygon points="200,160 280,70 360,160" fill="#94a3b8" opacity=".4"/>
<!-- Clouds -->
<g class="cl1"><ellipse cx="100" cy="50" rx="35" ry="18" fill="white" opacity=".9"/>
<ellipse cx="125" cy="44" rx="22" ry="15" fill="white"/></g>
<g class="cl2"><ellipse cx="290" cy="35" rx="28" ry="14" fill="white" opacity=".8"/>
<ellipse cx="310" cy="30" rx="18" ry="12" fill="white"/></g>
<!-- Car -->
<g class="car">
  <rect x="130" y="130" width="80" height="30" rx="5" fill="#6366f1"/>
  <rect x="140" y="115" width="55" height="22" rx="4" fill="#818cf8"/>
  <rect x="143" y="118" width="22" height="14" rx="2" fill="#bfdbfe" opacity=".9"/>
  <rect x="168" y="118" width="22" height="14" rx="2" fill="#bfdbfe" opacity=".9"/>
  <g class="w1"><circle cx="152" cy="155" r="10" fill="#1e293b"/>
  <circle cx="152" cy="155" r="5" fill="#94a3b8"/></g>
  <g class="w2"><circle cx="188" cy="155" r="10" fill="#1e293b"/>
  <circle cx="188" cy="155" r="5" fill="#94a3b8"/></g>
</g>
</svg>`,

    connection: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes pulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.12);opacity:1}}
@keyframes orbit{from{transform:rotate(0deg) translateX(50px) rotate(0deg)}to{transform:rotate(360deg) translateX(50px) rotate(-360deg)}}
@keyframes glow{0%,100%{opacity:.4}50%{opacity:.9}}
.heart{animation:pulse 1.8s ease-in-out infinite;transform-origin:200px 90px}
.dot1{animation:orbit 4s linear infinite;transform-origin:200px 90px}
.dot2{animation:orbit 4s linear 1s infinite;transform-origin:200px 90px}
.dot3{animation:orbit 4s linear 2s infinite;transform-origin:200px 90px}
.link{animation:glow 2s ease-in-out infinite}
</style>
<rect width="400" height="200" fill="#fff1f2"/>
<!-- Figures -->
<circle cx="110" cy="80" r="18" fill="#fda4af"/>
<rect x="95" y="100" width="30" height="50" rx="8" fill="#fb7185"/>
<!-- Figure 2 -->
<circle cx="290" cy="80" r="18" fill="#86efac"/>
<rect x="275" y="100" width="30" height="50" rx="8" fill="#4ade80"/>
<!-- Heart -->
<g class="heart">
  <path d="M200,105 C200,105 170,85 170,70 C170,58 185,52 200,65 C215,52 230,58 230,70 C230,85 200,105 200,105Z" fill="#f43f5e"/>
</g>
<!-- Connection line -->
<line class="link" x1="130" y1="90" x2="170" y2="90" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4"/>
<line class="link" x1="230" y1="90" x2="270" y2="90" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4"/>
<!-- Orbiting dots -->
<circle class="dot1" cx="200" cy="90" r="4" fill="#f43f5e" opacity=".8"/>
<circle class="dot2" cx="200" cy="90" r="4" fill="#fb7185" opacity=".8"/>
<circle class="dot3" cx="200" cy="90" r="4" fill="#fda4af" opacity=".8"/>
<!-- Ground -->
<rect x="80" y="150" width="60" height="5" rx="2" fill="#fda4af" opacity=".3"/>
<rect x="260" y="150" width="60" height="5" rx="2" fill="#86efac" opacity=".3"/>
</svg>`,

    light: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes shine{0%,100%{opacity:.5;transform:scale(.9)}50%{opacity:1;transform:scale(1.1)}}
@keyframes ray{0%,100%{opacity:.3}50%{opacity:.8}}
@keyframes rise{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
.sun{animation:shine 2s ease-in-out infinite;transform-origin:200px 80px}
.ray{animation:ray 2s ease-in-out infinite}
.r2{animation-delay:.3s}.r3{animation-delay:.6s}.r4{animation-delay:.9s}
</style>
<rect width="400" height="200" fill="#fff7ed"/>
<rect x="0" y="130" width="400" height="70" fill="#fed7aa" opacity=".4"/>
<!-- Sun -->
<g class="sun">
  <circle cx="200" cy="80" r="35" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="24" fill="#fde047"/>
</g>
<!-- Rays -->
<line class="ray" x1="200" y1="30" x2="200" y2="16" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
<line class="ray r2" x1="230" y1="40" x2="242" y2="29" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
<line class="ray r3" x1="248" y1="68" x2="264" y2="63" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
<line class="ray r4" x1="240" y1="100" x2="254" y2="110" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
<line class="ray" x1="200" y1="118" x2="200" y2="130" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
<line class="ray r2" x1="170" y1="108" x2="157" y2="118" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
<line class="ray r3" x1="153" y1="80" x2="138" y2="76" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
<line class="ray r4" x1="162" y1="50" x2="150" y2="40" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
<!-- Horizon glow -->
<ellipse cx="200" cy="135" rx="120" ry="20" fill="#fde047" opacity=".2"/>
</svg>`,

    time: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes tick{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes tock{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes swing{0%,100%{transform:rotate(-20deg)}50%{transform:rotate(20deg)}}
.min{animation:tick 10s linear infinite;transform-origin:200px 100px}
.hr{animation:tock 120s linear infinite;transform-origin:200px 100px}
.pend{animation:swing 1.2s ease-in-out infinite;transform-origin:200px 95px}
</style>
<rect width="400" height="200" fill="#f8fafc"/>
<!-- Clock face -->
<circle cx="200" cy="100" r="70" fill="white" stroke="#e2e8f0" stroke-width="3"/>
<circle cx="200" cy="100" r="65" fill="#f8fafc" opacity=".5"/>
<!-- Hour marks -->
<line x1="200" y1="40" x2="200" y2="50" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
<line x1="200" y1="150" x2="200" y2="160" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
<line x1="140" y1="100" x2="150" y2="100" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
<line x1="250" y1="100" x2="260" y2="100" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
<line x1="155" y1="55" x2="162" y2="62" stroke="#94a3b8" stroke-width="2"/>
<line x1="238" y1="62" x2="245" y2="55" stroke="#94a3b8" stroke-width="2"/>
<line x1="155" y1="145" x2="162" y2="138" stroke="#94a3b8" stroke-width="2"/>
<line x1="238" y1="138" x2="245" y2="145" stroke="#94a3b8" stroke-width="2"/>
<!-- Hands -->
<line class="hr" x1="200" y1="100" x2="200" y2="68" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
<line class="min" x1="200" y1="100" x2="200" y2="52" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>
<circle cx="200" cy="100" r="4" fill="#1e293b"/>
</svg>`,

    thinking: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes think{0%,100%{opacity:.3;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.b1{animation:think 2s ease-in-out infinite}
.b2{animation:think 2s ease-in-out .4s infinite}
.b3{animation:think 2s ease-in-out .8s infinite}
.b4{animation:think 2s ease-in-out 1.2s infinite}
.head{animation:bob 3s ease-in-out infinite}
</style>
<rect width="400" height="200" fill="#f5f3ff"/>
<!-- Figure head -->
<g class="head">
  <circle cx="150" cy="110" r="28" fill="#6366f1"/>
  <circle cx="142" cy="105" r="4" fill="white"/>
  <circle cx="158" cy="105" r="4" fill="white"/>
  <path d="M143,118 Q150,124 157,118" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <!-- Body -->
  <rect x="133" y="138" width="34" height="40" rx="8" fill="#4338ca"/>
</g>
<!-- Thought bubbles -->
<circle class="b1" cx="195" cy="105" r="8" fill="#8b5cf6"/>
<circle class="b2" cx="220" cy="88" r="13" fill="#7c3aed"/>
<circle class="b3" cx="255" cy="72" r="18" fill="#6d28d9"/>
<circle class="b4" cx="300" cy="58" r="24" fill="#5b21b6"/>
<!-- Ideas inside bubble -->
<line x1="290" y1="52" x2="310" y2="52" stroke="white" stroke-width="2" opacity=".7"/>
<line x1="285" y1="60" x2="315" y2="60" stroke="white" stroke-width="2" opacity=".7"/>
<line x1="290" y1="68" x2="310" y2="68" stroke="white" stroke-width="2" opacity=".7"/>
<!-- Ground shadow -->
<ellipse cx="153" cy="178" rx="40" ry="6" fill="#4338ca" opacity=".15"/>
</svg>`,

    water: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes wave1{0%,100%{d:path("M0,130 Q50,110 100,130 Q150,150 200,130 Q250,110 300,130 Q350,150 400,130 L400,200 L0,200 Z")}
50%{d:path("M0,130 Q50,150 100,130 Q150,110 200,130 Q250,150 300,130 Q350,110 400,130 L400,200 L0,200 Z")}}
@keyframes wave2{0%,100%{d:path("M0,145 Q50,125 100,145 Q150,165 200,145 Q250,125 300,145 Q350,165 400,145 L400,200 L0,200 Z")}
50%{d:path("M0,145 Q50,165 100,145 Q150,125 200,145 Q250,165 300,145 Q350,125 400,145 L400,200 L0,200 Z")}}
@keyframes drop{0%{transform:translateY(-20px);opacity:0}80%{opacity:1}100%{transform:translateY(40px);opacity:0}}
.w1{animation:wave1 3s ease-in-out infinite}
.w2{animation:wave2 3.5s ease-in-out infinite}
.dr{animation:drop 2s ease-in infinite}
.dr2{animation:drop 2s ease-in .7s infinite}
</style>
<rect width="400" height="200" fill="#eff6ff"/>
<!-- Sky/background -->
<ellipse cx="200" cy="60" rx="60" ry="40" fill="#bfdbfe" opacity=".4"/>
<!-- Drops -->
<ellipse class="dr" cx="170" cy="80" rx="5" ry="8" fill="#3b82f6" opacity=".7"/>
<ellipse class="dr2" cx="230" cy="70" rx="5" ry="8" fill="#60a5fa" opacity=".7"/>
<!-- Waves -->
<path class="w1" d="M0,130 Q50,110 100,130 Q150,150 200,130 Q250,110 300,130 Q350,150 400,130 L400,200 L0,200 Z" fill="#3b82f6" opacity=".6"/>
<path class="w2" d="M0,145 Q50,125 100,145 Q150,165 200,145 Q250,125 300,145 Q350,165 400,145 L400,200 L0,200 Z" fill="#1d4ed8" opacity=".5"/>
<!-- Ripples -->
<ellipse cx="150" cy="135" rx="20" ry="5" fill="none" stroke="#93c5fd" stroke-width="1.5" opacity=".7"/>
<ellipse cx="250" cy="140" rx="15" ry="4" fill="none" stroke="#93c5fd" stroke-width="1.5" opacity=".6"/>
</svg>`,

    running: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes run{0%,100%{transform:translateX(0) scaleX(1)}50%{transform:translateX(8px) scaleX(1)}}
@keyframes arm1{0%,100%{transform:rotate(-30deg)}50%{transform:rotate(30deg)}}
@keyframes arm2{0%,100%{transform:rotate(30deg)}50%{transform:rotate(-30deg)}}
@keyframes leg1{0%,100%{transform:rotate(-40deg)}50%{transform:rotate(10deg)}}
@keyframes leg2{0%,100%{transform:rotate(10deg)}50%{transform:rotate(-40deg)}}
@keyframes dash{0%{transform:translateX(0);opacity:1}100%{transform:translateX(-60px);opacity:0}}
.runner{animation:run .5s ease-in-out infinite}
.a1{animation:arm1 .5s ease-in-out infinite;transform-origin:200px 115px}
.a2{animation:arm2 .5s ease-in-out infinite;transform-origin:200px 115px}
.l1{animation:leg1 .5s ease-in-out infinite;transform-origin:200px 145px}
.l2{animation:leg2 .5s ease-in-out infinite;transform-origin:200px 145px}
.d1{animation:dash 1s linear infinite}
.d2{animation:dash 1s linear .33s infinite}
.d3{animation:dash 1s linear .66s infinite}
</style>
<rect width="400" height="200" fill="#f0fdf4"/>
<!-- Track -->
<rect x="0" y="165" width="400" height="8" rx="4" fill="#bbf7d0"/>
<rect x="0" y="170" width="400" height="3" fill="#4ade80" opacity=".4"/>
<!-- Speed lines -->
<line class="d1" x1="155" y1="120" x2="130" y2="120" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/>
<line class="d2" x1="155" y1="130" x2="125" y2="130" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/>
<line class="d3" x1="155" y1="140" x2="130" y2="140" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/>
<!-- Runner -->
<g class="runner">
  <circle cx="200" cy="100" r="12" fill="#6366f1"/>
  <rect x="193" y="112" width="14" height="30" rx="5" fill="#4338ca"/>
  <line class="a1" x1="200" y1="115" x2="178" y2="130" stroke="#4338ca" stroke-width="5" stroke-linecap="round"/>
  <line class="a2" x1="200" y1="115" x2="222" y2="128" stroke="#4338ca" stroke-width="5" stroke-linecap="round"/>
  <line class="l1" x1="200" y1="142" x2="185" y2="165" stroke="#4338ca" stroke-width="5" stroke-linecap="round"/>
  <line class="l2" x1="200" y1="142" x2="215" y2="162" stroke="#4338ca" stroke-width="5" stroke-linecap="round"/>
</g>
<!-- Finish flag -->
<line x1="300" y1="100" x2="300" y2="165" stroke="#1e293b" stroke-width="2"/>
<rect x="300" y="100" width="28" height="16" fill="#ef4444"/>
<line x1="307" y1="104" x2="307" y2="112" stroke="white" stroke-width="1.5"/>
<line x1="314" y1="104" x2="314" y2="112" stroke="white" stroke-width="1.5"/>
<line x1="321" y1="104" x2="321" y2="112" stroke="white" stroke-width="1.5"/>
<line x1="300" y1="108" x2="328" y2="108" stroke="white" stroke-width="1.5"/>
</svg>`,

    energy: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes bolt{0%,100%{opacity:.4;transform:scale(.9)}50%{opacity:1;transform:scale(1.05)}}
@keyframes ring{0%{transform:scale(.8);opacity:.8}100%{transform:scale(1.4);opacity:0}}
.bolt{animation:bolt 1s ease-in-out infinite;transform-origin:200px 95px}
.r1{animation:ring 2s ease-out infinite;transform-origin:200px 95px}
.r2{animation:ring 2s ease-out .5s infinite;transform-origin:200px 95px}
.r3{animation:ring 2s ease-out 1s infinite;transform-origin:200px 95px}
</style>
<rect width="400" height="200" fill="#fffbeb"/>
<!-- Rings -->
<circle class="r1" cx="200" cy="95" r="40" fill="none" stroke="#f59e0b" stroke-width="3" opacity=".6"/>
<circle class="r2" cx="200" cy="95" r="40" fill="none" stroke="#ef4444" stroke-width="2" opacity=".5"/>
<circle class="r3" cx="200" cy="95" r="40" fill="none" stroke="#f97316" stroke-width="1.5" opacity=".4"/>
<!-- Lightning bolt -->
<g class="bolt">
  <polygon points="210,40 190,95 205,95 185,155 225,88 205,88" fill="#f59e0b"/>
  <polygon points="212,42 192,95 207,95 187,152 222,90 207,90" fill="#fde047" opacity=".6"/>
</g>
<!-- Sparks -->
<circle cx="120" cy="80" r="4" fill="#f59e0b" opacity=".6"/>
<circle cx="280" cy="70" r="5" fill="#ef4444" opacity=".5"/>
<circle cx="300" cy="130" r="3" fill="#f97316" opacity=".6"/>
<circle cx="100" cy="130" r="4" fill="#fbbf24" opacity=".5"/>
<circle cx="150" cy="50" r="3" fill="#f59e0b" opacity=".4"/>
<circle cx="260" cy="160" r="3" fill="#ef4444" opacity=".4"/>
</svg>`,

    flight: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes soar{0%,100%{transform:translateY(0) translateX(0)}25%{transform:translateY(-8px) translateX(5px)}75%{transform:translateY(3px) translateX(-3px)}}
@keyframes wing{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.6)}}
@keyframes cloud{0%,100%{transform:translateX(0)}50%{transform:translateX(-6px)}}
.bird{animation:soar 4s ease-in-out infinite;transform-origin:200px 90px}
.wl{animation:wing 1s ease-in-out infinite;transform-origin:200px 90px}
.wr{animation:wing 1s ease-in-out .15s infinite;transform-origin:200px 90px}
.c1{animation:cloud 6s ease-in-out infinite}
.c2{animation:cloud 8s ease-in-out .5s infinite}
</style>
<rect width="400" height="200" fill="#e0f2fe"/>
<!-- Sky gradient effect -->
<rect x="0" y="0" width="400" height="100" fill="#bae6fd" opacity=".3"/>
<!-- Clouds -->
<g class="c1"><ellipse cx="90" cy="60" rx="40" ry="18" fill="white" opacity=".9"/>
<ellipse cx="110" cy="52" rx="25" ry="16" fill="white"/></g>
<g class="c2"><ellipse cx="310" cy="40" rx="35" ry="15" fill="white" opacity=".8"/>
<ellipse cx="330" cy="34" rx="22" ry="13" fill="white"/></g>
<!-- Bird -->
<g class="bird">
  <!-- Body -->
  <ellipse cx="200" cy="90" rx="18" ry="8" fill="#1e293b"/>
  <!-- Head -->
  <circle cx="218" cy="87" r="7" fill="#1e293b"/>
  <circle cx="222" cy="85" r="2" fill="white"/>
  <!-- Beak -->
  <polygon points="225,87 233,86 225,90" fill="#f59e0b"/>
  <!-- Wings -->
  <g class="wl"><ellipse cx="188" cy="82" rx="22" ry="8" fill="#334155" transform="rotate(-15,188,82)"/></g>
  <g class="wr"><ellipse cx="212" cy="82" rx="22" ry="8" fill="#475569" transform="rotate(10,212,82)"/></g>
  <!-- Tail -->
  <polygon points="182,88 168,82 168,96" fill="#1e293b"/>
</g>
<!-- Small birds distance -->
<path d="M80,110 Q85,105 90,110" fill="none" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
<path d="M320,80 Q325,75 330,80" fill="none" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
<path d="M340,110 Q344,106 348,110" fill="none" stroke="#475569" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,

    wealth: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes rise{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes coin{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(180deg)}}
@keyframes bar1{animation-delay:0s}
.b1{animation:rise 1s ease-out .1s both;transform-origin:130px 155px}
.b2{animation:rise 1s ease-out .3s both;transform-origin:180px 155px}
.b3{animation:rise 1s ease-out .5s both;transform-origin:230px 155px}
.b4{animation:rise 1s ease-out .7s both;transform-origin:280px 155px}
.coin{animation:coin 2s ease-in-out infinite}
</style>
<rect width="400" height="200" fill="#fffbeb"/>
<!-- Chart baseline -->
<line x1="90" y1="155" x2="320" y2="155" stroke="#e5e7eb" stroke-width="2"/>
<line x1="90" y1="155" x2="90" y2="60" stroke="#e5e7eb" stroke-width="2"/>
<!-- Bars -->
<rect class="b1" x="110" y="125" width="40" height="30" rx="4" fill="#fbbf24" opacity=".8"/>
<rect class="b2" x="160" y="105" width="40" height="50" rx="4" fill="#f59e0b" opacity=".85"/>
<rect class="b3" x="210" y="85" width="40" height="70" rx="4" fill="#d97706"/>
<rect class="b4" x="260" y="65" width="40" height="90" rx="4" fill="#b45309"/>
<!-- Trend line -->
<polyline points="130,122 180,102 230,82 280,62" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4" stroke-linecap="round"/>
<!-- Coins -->
<g class="coin">
  <circle cx="308" cy="55" r="12" fill="#fde047" stroke="#f59e0b" stroke-width="2"/>
  <text x="308" y="60" text-anchor="middle" font-size="12" fill="#92400e" font-weight="bold">$</text>
</g>
<circle cx="75" cy="90" r="9" fill="#fde047" stroke="#f59e0b" stroke-width="1.5" opacity=".6"/>
<circle cx="335" cy="120" r="7" fill="#fde047" stroke="#f59e0b" stroke-width="1.5" opacity=".5"/>
</svg>`,

    building: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes build{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes sparkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}
.fl1{animation:build .6s ease-out .1s both}
.fl2{animation:build .6s ease-out .4s both}
.fl3{animation:build .6s ease-out .7s both}
.fl4{animation:build .6s ease-out 1s both}
.sp{animation:sparkle 2s ease-in-out 1.5s infinite}
</style>
<rect width="400" height="200" fill="#f8fafc"/>
<!-- Ground -->
<rect x="0" y="168" width="400" height="32" fill="#e2e8f0"/>
<!-- Building -->
<rect x="155" y="168" width="90" height="0" fill="#6366f1"/>
<g class="fl1"><rect x="155" y="148" width="90" height="22" rx="0" fill="#818cf8"/>
<rect x="162" y="152" width="14" height="14" rx="1" fill="#c7d2fe"/>
<rect x="183" y="152" width="14" height="14" rx="1" fill="#c7d2fe"/>
<rect x="204" y="152" width="14" height="14" rx="1" fill="#c7d2fe"/>
<rect x="225" y="152" width="14" height="14" rx="1" fill="#fde047"/></g>
<g class="fl2"><rect x="155" y="126" width="90" height="22" rx="0" fill="#6366f1"/>
<rect x="162" y="130" width="14" height="14" rx="1" fill="#a5b4fc"/>
<rect x="183" y="130" width="14" height="14" rx="1" fill="#fde047"/>
<rect x="204" y="130" width="14" height="14" rx="1" fill="#a5b4fc"/>
<rect x="225" y="130" width="14" height="14" rx="1" fill="#a5b4fc"/></g>
<g class="fl3"><rect x="155" y="104" width="90" height="22" rx="0" fill="#4f46e5"/>
<rect x="162" y="108" width="14" height="14" rx="1" fill="#818cf8"/>
<rect x="183" y="108" width="14" height="14" rx="1" fill="#818cf8"/>
<rect x="204" y="108" width="14" height="14" rx="1" fill="#fde047"/>
<rect x="225" y="108" width="14" height="14" rx="1" fill="#818cf8"/></g>
<g class="fl4"><rect x="165" y="82" width="70" height="22" rx="0" fill="#4338ca"/>
<rect x="173" y="86" width="14" height="14" rx="1" fill="#6366f1"/>
<rect x="194" y="86" width="14" height="14" rx="1" fill="#6366f1"/>
<rect x="215" y="86" width="14" height="14" rx="1" fill="#6366f1"/>
<polygon points="190,82 210,82 200,68" fill="#4338ca"/>
<circle cx="200" cy="65" r="3" fill="#fde047"/></g>
<!-- Sparkles -->
<g class="sp">
  <circle cx="130" cy="100" r="4" fill="#f59e0b"/>
  <circle cx="280" cy="90" r="3" fill="#f59e0b"/>
  <circle cx="300" cy="130" r="3" fill="#6366f1"/>
</g>
</svg>`,

    solitude: () => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes glow{0%,100%{opacity:.4}50%{opacity:.9}}
@keyframes twinkle{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(1.4);opacity:1}}
@keyframes drift{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.moon{animation:glow 3s ease-in-out infinite}
.s1{animation:twinkle 2s ease-in-out infinite}
.s2{animation:twinkle 2.5s ease-in-out .5s infinite}
.s3{animation:twinkle 1.8s ease-in-out 1s infinite}
.fig{animation:drift 4s ease-in-out infinite}
</style>
<rect width="400" height="200" fill="#0f172a"/>
<!-- Stars -->
<circle class="s1" cx="60" cy="30" r="2" fill="white"/>
<circle class="s2" cx="120" cy="50" r="1.5" fill="white"/>
<circle class="s3" cx="280" cy="25" r="2" fill="white"/>
<circle class="s1" cx="340" cy="55" r="1.5" fill="white"/>
<circle class="s2" cx="200" cy="20" r="2" fill="white"/>
<circle class="s3" cx="90" cy="70" r="1.5" fill="#a5b4fc"/>
<circle class="s1" cx="310" cy="80" r="1.5" fill="white"/>
<!-- Moon -->
<g class="moon">
  <circle cx="310" cy="55" r="28" fill="#fef9c3"/>
  <circle cx="322" cy="48" r="22" fill="#0f172a"/>
</g>
<!-- Ground/hill -->
<ellipse cx="200" cy="185" rx="220" ry="35" fill="#1e293b"/>
<ellipse cx="200" cy="170" rx="160" ry="25" fill="#334155"/>
<!-- Figure -->
<g class="fig">
  <circle cx="200" cy="143" r="9" fill="#94a3b8"/>
  <rect x="193" y="152" width="14" height="22" rx="5" fill="#64748b"/>
</g>
<!-- Reflection on ground -->
<ellipse cx="200" cy="175" rx="12" ry="3" fill="#475569" opacity=".5"/>
</svg>`,

    general: (word: string) => `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
<style>
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.1);opacity:1}}
.orb{animation:float 3s ease-in-out infinite;transform-origin:200px 100px}
.ring1{animation:spin 8s linear infinite;transform-origin:200px 100px}
.ring2{animation:spin 12s linear reverse infinite;transform-origin:200px 100px}
.dot{animation:pulse 2s ease-in-out infinite}
</style>
<rect width="400" height="200" fill="#f5f3ff"/>
<!-- Outer rings -->
<ellipse class="ring1" cx="200" cy="100" rx="80" ry="30" fill="none" stroke="#c4b5fd" stroke-width="1.5" stroke-dasharray="6,4"/>
<ellipse class="ring2" cx="200" cy="100" rx="110" ry="42" fill="none" stroke="#a78bfa" stroke-width="1" stroke-dasharray="8,6" opacity=".6"/>
<!-- Center orb -->
<g class="orb">
  <circle cx="200" cy="100" r="36" fill="#7c3aed" opacity=".15"/>
  <circle cx="200" cy="100" r="26" fill="#6d28d9" opacity=".3"/>
  <circle cx="200" cy="100" r="18" fill="#5b21b6"/>
  <circle cx="193" cy="93" r="6" fill="#8b5cf6" opacity=".6"/>
</g>
<!-- Orbiting dots -->
<circle class="dot" cx="120" cy="100" r="6" fill="#8b5cf6"/>
<circle class="dot" cx="280" cy="100" r="6" fill="#7c3aed"/>
<circle class="dot" cx="200" cy="58" r="5" fill="#a78bfa"/>
<circle class="dot" cx="200" cy="142" r="5" fill="#6d28d9"/>
<!-- Sparkles -->
<circle cx="145" cy="65" r="3" fill="#ddd6fe" opacity=".8"/>
<circle cx="255" cy="65" r="3" fill="#ddd6fe" opacity=".8"/>
<circle cx="145" cy="135" r="3" fill="#ddd6fe" opacity=".6"/>
<circle cx="255" cy="135" r="3" fill="#ddd6fe" opacity=".6"/>
</svg>`,
  };
}
