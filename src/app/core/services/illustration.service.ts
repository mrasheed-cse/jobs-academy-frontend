import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IllustrationService {
  private readonly cache = new Map<string, string>();

  getSvg(sentence: string, word: string, meaning: string, key: string): string {
    if (this.cache.has(key)) return this.cache.get(key)!;
    const svg = this.generate(sentence, word, meaning);
    this.cache.set(key, svg);
    return svg;
  }

  private hash(str: string): number[] {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const seed = 4294967296 * (2097151 & h2) + (h1 >>> 0);
    const out: number[] = [];
    let s = seed;
    for (let i = 0; i < 32; i++) {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      out.push((s >>> 0) / 0xffffffff);
    }
    return out;
  }

  private v(vals: number[], i: number, min: number, max: number): number {
    return min + vals[i % 32] * (max - min);
  }

  private hsl(h: number, s: number, l: number): string {
    return `hsl(${Math.round(h)},${Math.round(s)}%,${Math.round(l)}%)`;
  }

  private detectScene(sentence: string, word: string): string {
    // Search both the full sentence and the defined word itself
    const s = (sentence + ' ' + word).toLowerCase();

    // Word-level exact match first (highest priority — the word being defined IS the topic)
    const wordMap: Record<string, string> = {
      // Light / sparkle / glint family
      glint:'sparkle', sparkle:'sparkle', shimmer:'sparkle', glimmer:'sparkle',
      gleam:'sparkle', twinkle:'sparkle', flicker:'sparkle', flash:'sparkle',
      glitter:'sparkle', glow:'sparkle', luminous:'sparkle', radiant:'sparkle',
      dazzle:'sparkle', blaze:'sparkle', beam:'sparkle', ray:'sparkle',
      // Eye / face / emotion
      eye:'eye', eyes:'eye', gaze:'eye', stare:'eye', glance:'eye', blink:'eye',
      wink:'eye', sight:'eye', vision:'eye', look:'eye', peer:'eye', squint:'eye',
      smile:'love', laugh:'love', cry:'love', weep:'love', tears:'love',
      // Mountain / achievement
      apex:'mountain', peak:'mountain', summit:'mountain', climb:'mountain',
      ascend:'mountain', pinnacle:'mountain', zenith:'mountain', acme:'mountain',
      achieve:'mountain', triumph:'mountain', victory:'mountain', excel:'mountain',
      // Reading / study
      read:'reading', book:'reading', study:'reading', learn:'reading',
      knowledge:'reading', scholar:'reading', educate:'reading', library:'reading',
      chapter:'reading', page:'reading', author:'reading', write:'work',
      // Growth / nature
      grow:'growth', bloom:'growth', flourish:'growth', thrive:'growth',
      blossom:'growth', sprout:'growth', plant:'growth', seed:'growth',
      // Running / sport
      run:'running', sprint:'running', race:'running', dash:'running',
      jog:'running', gallop:'running', hustle:'running', swift:'running',
      // Sky / flight
      fly:'sky', soar:'sky', glide:'sky', bird:'sky', wing:'sky',
      flutter:'sky', hover:'sky', drift:'sky',
      // Water
      flow:'ocean', stream:'ocean', pour:'ocean', gush:'ocean', surge:'ocean',
      flood:'ocean', drown:'ocean', ripple:'ocean', splash:'ocean',
      // Love / connection
      love:'love', adore:'love', cherish:'love', embrace:'love',
      affection:'love', compassion:'love', warmth:'love', tender:'love',
      // Night
      night:'night', dark:'night', shadow:'night', dusk:'night',
      gloom:'night', obscure:'night', dim:'night', murky:'night',
      // Thinking
      think:'thinking', ponder:'thinking', contemplate:'thinking', reflect:'thinking',
      wonder:'thinking', imagine:'thinking', conceive:'thinking', deliberate:'thinking',
      // Music
      music:'music', melody:'music', rhythm:'music', harmony:'music',
      sing:'music', hum:'music', tune:'music', chord:'music',
      // Food
      eat:'food', taste:'food', flavor:'food', savor:'food',
      devour:'food', feast:'food', hunger:'food', appetite:'food',
      // Journey / travel
      travel:'journey', journey:'journey', wander:'journey', roam:'journey',
      voyage:'journey', trek:'journey', expedition:'journey', migrate:'journey',
      // Money
      money:'money', wealth:'money', rich:'money', profit:'money',
      prosper:'money', affluent:'money', luxurious:'money', opulent:'money',
      // Conflict
      anger:'conflict', rage:'conflict', fury:'conflict', wrath:'conflict',
      hostile:'conflict', aggressive:'conflict', belligerent:'conflict',
      // Peace
      calm:'peace', serene:'peace', tranquil:'peace', peaceful:'peace',
      placid:'peace', gentle:'peace', soothe:'peace', compose:'peace',
      // Change
      change:'transformation', transform:'transformation', evolve:'transformation',
      adapt:'transformation', alter:'transformation', shift:'transformation',
    };

    if (wordMap[word.toLowerCase()]) return wordMap[word.toLowerCase()];

    // Sentence-level keyword scan
    const scenes: [string[], string][] = [
      [['glint','shimmer','sparkle','glimmer','gleam','twinkle','flicker','flash','glitter',
        'dazzle','luminous','radiant','beam','ray','glow','shine','bright','light','sun',
        'dawn','morning','hope'], 'sparkle'],
      [['eye','eyes','gaze','stare','glance','blink','wink','sight','vision','look','peer',
        'pupil','iris','retina','blind','see','watch','observe','witness'], 'eye'],
      [['climb','apex','peak','summit','top','reach','achieve','success','career','mountain',
        'ascend','pinnacle','zenith','acme','triumph','victory','conquer','excel','attain',
        'accomplish','surpass','overcome'], 'mountain'],
      [['read','book','study','learn','library','knowledge','school','education','scholar',
        'educate','chapter','page','author','literature','academic','university','student',
        'lesson','lecture','curriculum','intellectual'], 'reading'],
      [['grow','plant','tree','flower','garden','seed','bloom','nature','flourish','thrive',
        'blossom','sprout','vegetation','forest','leaf','branch','root','organic'], 'growth'],
      [['run','race','sprint','fast','speed','athlete','marathon','dash','jog','gallop',
        'chase','hurry','swift','rapid','quick','brisk','agile','nimble','energetic'], 'running'],
      [['fly','bird','sky','air','cloud','soar','wing','eagle','flutter','hover','drift',
        'glide','aviation','pilot','altitude','ascend','kite','freedom','float'], 'sky'],
      [['water','ocean','sea','river','wave','swim','flow','rain','stream','pour','flood',
        'lake','pool','ripple','splash','current','tide','aquatic','marine','naval'], 'ocean'],
      [['love','heart','family','friend','together','embrace','care','adore','cherish',
        'affection','compassion','warmth','tender','bond','relationship','unity'], 'love'],
      [['night','dark','moon','star','sleep','dream','shadow','alone','dusk','gloom',
        'obscure','dim','murky','midnight','nocturnal','twilight','sunset','quiet'], 'night'],
      [['think','idea','mind','brain','clever','smart','thought','ponder','contemplate',
        'reflect','wonder','imagine','conceive','deliberate','analyze','reason'], 'thinking'],
      [['music','song','dance','art','paint','creative','concert','rhythm','melody',
        'harmony','sing','hum','tune','chord','instrument','beat','tempo'], 'music'],
      [['city','urban','street','building','town','crowd','traffic','metropolitan',
        'downtown','skyline','skyscraper','architecture','infrastructure'], 'city'],
      [['food','eat','cook','meal','restaurant','kitchen','taste','flavor','savor',
        'devour','feast','hunger','appetite','cuisine','delicious','nourish'], 'food'],
      [['travel','journey','adventure','explore','road','path','wander','roam',
        'voyage','trek','expedition','migrate','destination','trip','tour'], 'journey'],
      [['money','wealth','profit','rich','economy','finance','invest','prosper',
        'affluent','luxurious','opulent','fund','bank','coin','currency'], 'money'],
      [['anger','fight','conflict','war','battle','struggle','rage','fury','wrath',
        'hostile','aggressive','belligerent','dispute','clash','opposition'], 'conflict'],
      [['peace','calm','relax','meditate','quiet','serene','breath','tranquil',
        'placid','gentle','soothe','compose','harmony','still','restful'], 'peace'],
      [['build','create','construct','make','craft','design','engineer','develop',
        'fabricate','assemble','erect','form','produce','manufacture'], 'construction'],
      [['change','transform','evolve','new','revolution','different','adapt','alter',
        'shift','convert','modify','reform','innovate','metamorphose'], 'transformation'],
      [['work','office','job','business','desk','profession','employ','career',
        'occupation','vocation','task','labor','industry','productive','diligent'], 'work'],
    ];

    for (const [words, scene] of scenes) {
      if (words.some(w => s.includes(w))) return scene;
    }
    return 'sparkle'; // better fallback than abstract — most unknown words have some visual quality
  }

  private generate(sentence: string, word: string, meaning: string): string {
    const vals = this.hash(sentence + word + meaning);
    const scene = this.detectScene(sentence, word);
    switch (scene) {
      case 'mountain':       return this.mountain(vals);
      case 'reading':        return this.reading(vals);
      case 'growth':         return this.growth(vals);
      case 'running':        return this.running(vals);
      case 'sky':            return this.sky(vals);
      case 'ocean':          return this.ocean(vals);
      case 'love':           return this.love(vals);
      case 'night':          return this.night(vals);
      case 'sunrise':        return this.sunrise(vals);
      case 'work':           return this.work(vals);
      case 'thinking':       return this.thinking(vals);
      case 'music':          return this.music(vals);
      case 'city':           return this.city(vals);
      case 'food':           return this.food(vals);
      case 'journey':        return this.journey(vals);
      case 'money':          return this.money(vals);
      case 'conflict':       return this.conflict(vals);
      case 'peace':          return this.peace(vals);
      case 'construction':   return this.construction(vals);
      case 'transformation': return this.transformation(vals);
      case 'sparkle':        return this.sparkle(vals);
      case 'eye':            return this.eye(vals);
      default:               return this.sparkle(vals);
    }
  }

  private wrap(body: string, bg: string): string {
    return `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="${bg}"/>${body}</svg>`;
  }

  private mountain(n: number[]): string {
    const bg = this.hsl(200 + n[0]*40, 40 + n[1]*20, 88 + n[2]*8);
    const mc = this.hsl(220 + n[3]*30, 50 + n[4]*20, 40 + n[5]*15);
    const sc = this.hsl(220 + n[3]*30, 30 + n[4]*10, 62 + n[5]*10);
    const fc = this.hsl(35 + n[6]*20, 85, 60);
    const mx = 160 + n[9]*80, my = 50 + n[10]*30;
    const d = 2 + n[11]*2;
    const fd = 5 + n[12]*5;
    const stars = [0,1,2,3,4].map(i =>
      `<circle cx="${30 + n[14+i]*340}" cy="${20 + n[i]*60}" r="${2 + n[i]*3}" fill="${fc}" opacity="${0.4 + n[i]*0.5}"><animate attributeName="opacity" values="0.3;1;0.3" dur="${1.5 + n[i]}s" repeatCount="indefinite"/></circle>`
    ).join('');
    return this.wrap(`
<polygon points="${mx-80},185 ${mx},${my} ${mx+80},185" fill="${mc}"/>
<polygon points="${mx-110},185 ${mx-40},${my+50} ${mx+20},185" fill="${sc}" opacity=".7"/>
<polygon points="${mx+30},185 ${mx+60},${my+40} ${mx+110},185" fill="${sc}" opacity=".6"/>
<line x1="${mx}" y1="${my}" x2="${mx}" y2="${my-18}" stroke="${fc}" stroke-width="2"/>
<polygon points="${mx},${my-18} ${mx+14},${my-10} ${mx},${my-2}" fill="${fc}"/>
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-${fd};0,0" dur="${d}s" repeatCount="indefinite"/>
  <circle cx="${mx}" cy="${my+14}" r="7" fill="#1e293b"/>
  <line x1="${mx}" y1="${my+21}" x2="${mx}" y2="${my+38}" stroke="#1e293b" stroke-width="3" stroke-linecap="round"/>
  <line x1="${mx}" y1="${my+26}" x2="${mx-8}" y2="${my+34}" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="${mx}" y1="${my+26}" x2="${mx+8}" y2="${my+34}" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
</g>
${stars}
<rect x="${mx-85}" y="182" width="170" height="6" rx="3" fill="${mc}" opacity=".3"/>`, bg);
  }

  private reading(n: number[]): string {
    const bg = this.hsl(45 + n[0]*15, 55 + n[1]*20, 96);
    const bc = this.hsl(220 + n[3]*40, 50 + n[4]*20, 45 + n[5]*15);
    const pc = this.hsl(220 + n[3]*40, 30, 72);
    const bx = 130 + n[6]*40, by = 55 + n[7]*20;
    const d = 2.5 + n[8]*2;
    const fd = 5 + n[9]*5;
    const lines = [0,1,2,3,4].map(i =>
      `<line x1="${bx+10}" y1="${by+20+i*18}" x2="${bx+72}" y2="${by+20+i*18}" stroke="white" stroke-width="1.8" opacity=".6"/>
       <line x1="${bx+95}" y1="${by+20+i*18}" x2="${bx+157}" y2="${by+20+i*18}" stroke="white" stroke-width="1.8" opacity=".6"/>`
    ).join('');
    return this.wrap(`
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-${fd};0,0" dur="${d}s" repeatCount="indefinite"/>
  <rect x="${bx}" y="${by}" width="85" height="110" rx="4" fill="${bc}"/>
  <rect x="${bx+85}" y="${by}" width="85" height="110" rx="4" fill="${pc}"/>
  <rect x="${bx+81}" y="${by-2}" width="8" height="114" rx="2" fill="${this.hsl(220+n[3]*40, 60, 35)}"/>
  ${lines}
</g>
<g><animate attributeName="opacity" values=".5;1;.5" dur="${1.8+n[10]}s" repeatCount="indefinite"/>
  <circle cx="${bx+90}" cy="${by-18}" r="${13+n[11]*4}" fill="${this.hsl(45+n[12]*15, 85, 87)}" opacity=".9"/>
  <rect x="${bx+84}" y="${by-6}" width="12" height="8" rx="2" fill="#e5e7eb"/>
</g>`, bg);
  }

  private growth(n: number[]): string {
    const bg = this.hsl(110 + n[0]*30, 40, 94);
    const sc = this.hsl(120 + n[3]*20, 60, 38);
    const lc = this.hsl(110 + n[6]*20, 55, 48);
    const petalHues = [10, 25, 40, 120, 200, 280];
    const fc = this.hsl(petalHues[Math.floor(n[9]*6)] + n[10]*15, 78, 58);
    const sx = 165 + n[13]*70;
    const d = 2.5 + n[14]*2;
    const petals = [0,1,2,3,4,5].map(i => {
      const a = i * 60; const r = 12 + n[i]*5;
      return `<circle cx="${sx + Math.round(Math.cos(a*Math.PI/180)*r)}" cy="${58+n[17]*20 + Math.round(Math.sin(a*Math.PI/180)*r)}" r="${7+n[i]*4}" fill="${fc}"/>`;
    }).join('');
    return this.wrap(`
<circle cx="${300+n[19]*60}" cy="${32+n[20]*25}" r="${22+n[21]*10}" fill="${this.hsl(45+n[22]*10,85,72)}" opacity=".8">
  <animate attributeName="opacity" values=".6;1;.6" dur="${2.5+n[23]}s" repeatCount="indefinite"/>
</circle>
<ellipse cx="${sx}" cy="185" rx="${68+n[25]*18}" ry="${9+n[26]*4}" fill="${sc}" opacity=".2"/>
<g style="transform-origin:${sx}px 185px">
  <animateTransform attributeName="transform" type="rotate" values="-${3+n[15]*4};${3+n[15]*4};-${3+n[15]*4}" dur="${d}s" repeatCount="indefinite"/>
  <line x1="${sx}" y1="182" x2="${sx}" y2="${58+n[17]*20}" stroke="${sc}" stroke-width="${3+n[27]*2}" stroke-linecap="round"/>
  <ellipse cx="${sx-20}" cy="${118+n[28]*18}" rx="${20+n[29]*8}" ry="${9+n[30]*3}" fill="${lc}" transform="rotate(-30 ${sx-20} ${118+n[28]*18})"/>
  <ellipse cx="${sx+22}" cy="${94+n[28]*14}" rx="${20+n[29]*8}" ry="${9+n[30]*3}" fill="${sc}" transform="rotate(30 ${sx+22} ${94+n[28]*14})"/>
</g>
<g style="transform-origin:${sx}px ${58+n[17]*20}px">
  <animateTransform attributeName="transform" type="scale" values=".85;1.1;.85" dur="${1.8+n[16]}s" repeatCount="indefinite"/>
  ${petals}
  <circle cx="${sx}" cy="${58+n[17]*20}" r="${9+n[31]*4}" fill="${this.hsl(45+n[22]*12,85,65)}"/>
</g>`, bg);
  }

  private running(n: number[]): string {
    const bg = this.hsl(110 + n[0]*40, 30, 94);
    const tc = this.hsl(110 + n[3]*30, 48, 58);
    const fc = this.hsl(220 + n[6]*40, 55, 48);
    const dc = this.hsl(220 + n[6]*40, 65, 35);
    const rx = 185 + n[9]*30;
    const d = 0.45 + n[10]*0.3;
    const dashes = [0,1,2].map(i =>
      `<line x1="${rx-15}" y1="${104+i*13}" x2="${rx-42}" y2="${104+i*13}" stroke="${tc}" stroke-width="2" stroke-linecap="round" opacity=".8">
        <animateTransform attributeName="transform" type="translate" values="0,0;-${50+n[12]*25},0;-${50+n[12]*25},0" dur="${0.85+n[13]*0.4}s" repeatCount="indefinite" keyTimes="0;0.8;1"/>
       </line>`
    ).join('');
    return this.wrap(`
<rect x="0" y="172" width="400" height="12" rx="4" fill="${tc}" opacity=".4"/>
${dashes}
<g>
  <animateTransform attributeName="transform" type="translate" values="0,0;${5+n[11]*5},0;0,0" dur="${d}s" repeatCount="indefinite"/>
  <circle cx="${rx}" cy="100" r="11" fill="${fc}"/>
  <rect x="${rx-7}" y="111" width="14" height="27" rx="5" fill="${dc}"/>
  <line x1="${rx}" y1="115" x2="${rx-19}" y2="130" stroke="${dc}" stroke-width="4.5" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" values="-30;30;-30" dur="${d}s" repeatCount="indefinite" additive="sum"/>
  </line>
  <line x1="${rx}" y1="115" x2="${rx+19}" y2="128" stroke="${dc}" stroke-width="4.5" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" values="30;-30;30" dur="${d}s" repeatCount="indefinite" additive="sum"/>
  </line>
  <line x1="${rx}" y1="142" x2="${rx-14}" y2="165" stroke="${dc}" stroke-width="4.5" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" values="-38;10;-38" dur="${d}s" repeatCount="indefinite" additive="sum"/>
  </line>
  <line x1="${rx}" y1="142" x2="${rx+14}" y2="162" stroke="${dc}" stroke-width="4.5" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" values="10;-38;10" dur="${d}s" repeatCount="indefinite" additive="sum"/>
  </line>
</g>
<line x1="${rx+82}" y1="105" x2="${rx+82}" y2="172" stroke="#1e293b" stroke-width="2"/>
<rect x="${rx+82}" y="105" width="24" height="14" fill="#ef4444"/>`, bg);
  }

  private sky(n: number[]): string {
    const bg = this.hsl(200 + n[0]*30, 50, 82);
    const bc = this.hsl(205 + n[4]*20, 35, 25);
    const bx = 165 + n[7]*70, by = 80 + n[8]*40;
    const d = 3 + n[9]*2;
    return this.wrap(`
<ellipse cx="${80+n[18]*40}" cy="${48+n[19]*28}" rx="${35+n[20]*14}" ry="${15+n[21]*7}" fill="white" opacity=".9">
  <animateTransform attributeName="transform" type="translate" values="0,0;-${5+n[14]*5},0;0,0" dur="${5+n[16]*3}s" repeatCount="indefinite"/>
</ellipse>
<ellipse cx="${100+n[18]*40}" cy="${40+n[19]*28}" rx="${22+n[20]*9}" ry="${13+n[21]*5}" fill="white">
  <animateTransform attributeName="transform" type="translate" values="0,0;-${5+n[14]*5},0;0,0" dur="${5+n[16]*3}s" repeatCount="indefinite"/>
</ellipse>
<ellipse cx="${295+n[22]*35}" cy="${34+n[23]*22}" rx="${27+n[24]*10}" ry="${12+n[25]*5}" fill="white" opacity=".85">
  <animateTransform attributeName="transform" type="translate" values="0,0;-${4+n[15]*4},0;0,0" dur="${6+n[17]*3}s" repeatCount="indefinite"/>
</ellipse>
<g>
  <animateTransform attributeName="transform" type="translate" values="0,0;${5+n[10]*4},-${6+n[11]*5};0,0" dur="${d}s" repeatCount="indefinite"/>
  <ellipse cx="${bx}" cy="${by}" rx="17" ry="7" fill="${bc}"/>
  <circle cx="${bx+17}" cy="${by-3}" r="6.5" fill="${bc}"/>
  <polygon points="${bx+23},${by-3} ${bx+32},${by-2} ${bx+23},${by+1}" fill="${this.hsl(40+n[26]*18,80,62)}"/>
  <circle cx="${bx+20}" cy="${by-5}" r="1.8" fill="white"/>
  <ellipse cx="${bx-18}" cy="${by-7}" rx="${20+n[27]*5}" ry="${7+n[28]*3}" fill="${this.hsl(205+n[4]*20,30,33)}" transform="rotate(-15 ${bx-18} ${by-7})">
    <animateTransform attributeName="transform" type="scale" values="1,1;1,.55;1,1" dur="${0.9+n[15]*0.3}s" repeatCount="indefinite" additive="sum"/>
  </ellipse>
  <ellipse cx="${bx+10}" cy="${by-7}" rx="${18+n[27]*4}" ry="${7+n[28]*3}" fill="${this.hsl(205+n[4]*20,24,44)}" transform="rotate(10 ${bx+10} ${by-7})">
    <animateTransform attributeName="transform" type="scale" values="1,1;1,.55;1,1" dur="${0.9+n[15]*0.3}s" begin="0.12s" repeatCount="indefinite" additive="sum"/>
  </ellipse>
  <polygon points="${bx-17},${by} ${bx-30},${by-5} ${bx-30},${by+5}" fill="${bc}"/>
</g>
${[0,1,2].map(i => `<path d="M${60+n[i]*110},${130+i*14} Q${70+n[i]*110},${125+i*14} ${80+n[i]*110},${130+i*14}" fill="none" stroke="${bc}" stroke-width="1.8" stroke-linecap="round" opacity=".55"/>`).join('')}`, bg);
  }

  private ocean(n: number[]): string {
    const bg = this.hsl(200 + n[0]*20, 38, 90);
    const wc1 = this.hsl(205 + n[3]*22, 58, 52);
    const wc2 = this.hsl(212 + n[6]*18, 62, 36);
    const wy = 118 + n[11]*28;
    const d1 = 2.5 + n[9]*1.5, d2 = 3 + n[10]*1.5;
    return this.wrap(`
<ellipse cx="${155+n[15]*85}" cy="${68+n[16]*28}" rx="${48+n[17]*18}" ry="${18+n[18]*10}" fill="${this.hsl(200+n[0]*18,28,84)}" opacity=".5"/>
<path fill="${wc1}" opacity=".65">
  <animate attributeName="d"
    values="M0,${wy} Q50,${wy-18} 100,${wy} Q150,${wy+18} 200,${wy} Q250,${wy-18} 300,${wy} Q350,${wy+18} 400,${wy} L400,220 L0,220 Z;M0,${wy} Q50,${wy+18} 100,${wy} Q150,${wy-18} 200,${wy} Q250,${wy+18} 300,${wy} Q350,${wy-18} 400,${wy} L400,220 L0,220 Z;M0,${wy} Q50,${wy-18} 100,${wy} Q150,${wy+18} 200,${wy} Q250,${wy-18} 300,${wy} Q350,${wy+18} 400,${wy} L400,220 L0,220 Z"
    dur="${d1}s" repeatCount="indefinite"/>
</path>
<path fill="${wc2}" opacity=".55">
  <animate attributeName="d"
    values="M0,${wy+22} Q50,${wy+6} 100,${wy+22} Q150,${wy+38} 200,${wy+22} Q250,${wy+6} 300,${wy+22} Q350,${wy+38} 400,${wy+22} L400,220 L0,220 Z;M0,${wy+22} Q50,${wy+38} 100,${wy+22} Q150,${wy+6} 200,${wy+22} Q250,${wy+38} 300,${wy+22} Q350,${wy+6} 400,${wy+22} L400,220 L0,220 Z;M0,${wy+22} Q50,${wy+6} 100,${wy+22} Q150,${wy+38} 200,${wy+22} Q250,${wy+6} 300,${wy+22} Q350,${wy+38} 400,${wy+22} L400,220 L0,220 Z"
    dur="${d2}s" repeatCount="indefinite"/>
</path>
<ellipse cx="${130+n[28]*75}" cy="${wy+8}" rx="${17+n[29]*9}" ry="${4+n[30]*2}" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/>
<ellipse cx="${180+n[21]*60}" cy="${88+n[22]*18}" rx="${4+n[23]*3}" ry="${7+n[24]*4}" fill="${wc1}" opacity=".7">
  <animateTransform attributeName="transform" type="translate" values="0,-${15+n[12]*12};0,${30+n[13]*18}" dur="${1.8+n[14]}s" repeatCount="indefinite"/>
</ellipse>`, bg);
  }

  private love(n: number[]): string {
    const bg = this.hsl(345 + n[0]*25, 38, 96);
    const hc = this.hsl(345 + n[3]*25, 72, 58);
    const fhues = [0, 30, 200, 280, 120];
    const f1c = this.hsl(fhues[Math.floor(n[6]*5)] + n[7]*15, 52, 62);
    const f2c = this.hsl(fhues[(Math.floor(n[9]*5)+2)%5] + n[10]*15, 56, 57);
    const d = 1.7 + n[12]*0.8;
    const hd = 5 + n[13]*8;
    const f1x = 100 + n[20]*28, f1y = 88 + n[21]*18;
    const f2x = 278 + n[22]*22, f2y = 84 + n[23]*18;
    const orb1 = 48 + n[14]*12, orb2 = 48 + n[14]*12;
    return this.wrap(`
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-${4+n[15]*4};0,0" dur="${2+n[18]}s" repeatCount="indefinite"/>
  <circle cx="${f1x}" cy="${f1y}" r="18" fill="${f1c}"/>
  <rect x="${f1x-9}" y="${f1y+18}" width="18" height="48" rx="8" fill="${f1c}"/>
</g>
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-${4+n[15]*3};0,0" dur="${2.4+n[19]}s" begin=".5s" repeatCount="indefinite"/>
  <circle cx="${f2x}" cy="${f2y}" r="18" fill="${f2c}"/>
  <rect x="${f2x-9}" y="${f2y+18}" width="18" height="48" rx="8" fill="${f2c}"/>
</g>
<g style="transform-origin:200px 100px">
  <animateTransform attributeName="transform" type="scale" values="1;${1.08+n[13]*0.06};1" dur="${d}s" repeatCount="indefinite"/>
  <path d="M200,112 C200,112 ${168+n[24]*8},${92+n[25]*4} ${168+n[24]*8},${74+n[25]*7} C${168+n[24]*8},${60+n[25]*4} ${184+n[24]*4},${54+n[25]*4} 200,${68+n[25]*4} C${216-n[24]*4},${54+n[25]*4} ${232-n[24]*8},${60+n[25]*4} ${232-n[24]*8},${74+n[25]*7} C${232-n[24]*8},${92+n[25]*4} 200,112 200,112Z" fill="${hc}"/>
</g>
<circle cx="200" cy="100" r="${3+n[26]*2}" fill="${hc}" opacity=".7">
  <animateTransform attributeName="transform" type="rotate" values="0 200 100;360 200 100" dur="${3+n[16]*2}s" repeatCount="indefinite" additive="replace"/>
  <animateTransform attributeName="transform" type="translate" values="${orb1},0;${orb1},0" additive="sum"/>
</circle>
<circle cx="200" cy="100" r="${3+n[27]*2}" fill="${f1c}" opacity=".6">
  <animateTransform attributeName="transform" type="rotate" values="0 200 100;360 200 100" dur="${4+n[17]*2}s" begin="1s" repeatCount="indefinite" additive="replace"/>
  <animateTransform attributeName="transform" type="translate" values="${orb2},0;${orb2},0" additive="sum"/>
</circle>`, bg);
  }

  private night(n: number[]): string {
    const bg = this.hsl(225 + n[0]*18, 32, 10 + n[2]*7);
    const mc = this.hsl(48 + n[3]*18, 72, 87);
    const fx = 158 + n[11]*78, fy = 152 + n[12]*14;
    const stars = [0,1,2,3,4,5,6,7,8,9,10,11].map(i =>
      `<circle cx="${22+n[i]*355}" cy="${14+n[(i+3)%12]*115}" r="${1+n[(i+6)%12]*2}" fill="white" opacity="${0.3+n[(i+1)%12]*0.6}">
        <animate attributeName="opacity" values="${0.2+n[(i+2)%12]*0.3};1;${0.2+n[(i+2)%12]*0.3}" dur="${1.5+n[(i+1)%12]}s" begin="${n[(i+2)%12]*2}s" repeatCount="indefinite"/>
       </circle>`
    ).join('');
    return this.wrap(`
${stars}
<circle cx="${280+n[8]*55}" cy="${44+n[9]*28}" r="${24+n[10]*9}" fill="${mc}" opacity=".92"/>
<circle cx="${295+n[8]*55}" cy="${37+n[9]*28}" r="${20+n[10]*7}" fill="${bg}"/>
<ellipse cx="200" cy="195" rx="220" ry="28" fill="${this.hsl(225+n[0]*18,36,16+n[2]*6)}"/>
<ellipse cx="200" cy="185" rx="158" ry="20" fill="${this.hsl(225+n[0]*18,30,20+n[2]*5)}"/>
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-${3+n[7]*3};0,0" dur="${2.5+n[6]*2}s" repeatCount="indefinite"/>
  <circle cx="${fx}" cy="${fy}" r="8" fill="${this.hsl(225+n[0]*18,20,56+n[2]*14)}"/>
  <rect x="${fx-8}" y="${fy+8}" width="16" height="22" rx="5" fill="${this.hsl(225+n[0]*18,25,44+n[2]*10)}"/>
</g>`, bg);
  }

  private sunrise(n: number[]): string {
    const bg = this.hsl(32 + n[0]*18, 62, 92);
    const sc = this.hsl(44 + n[3]*13, 82, 64);
    const rc = this.hsl(44 + n[3]*13, 72, 56);
    const sx = 195 + n[6]*40, sy = 92 + n[7]*28;
    const sr = 32 + n[9]*10;
    const d = 2 + n[8]*1.5;
    const rays = [0,1,2,3,4,5,6,7].map(i => {
      const a = i * 45;
      const l = 12 + n[i]*8;
      const cos = Math.cos(a * Math.PI / 180);
      const sin = Math.sin(a * Math.PI / 180);
      return `<line x1="${sx + Math.round(cos*(sr+2))}" y1="${sy + Math.round(sin*(sr+2))}" x2="${sx + Math.round(cos*(sr+14+l))}" y2="${sy + Math.round(sin*(sr+14+l))}" stroke="${rc}" stroke-width="${2+n[i]*1.4}" stroke-linecap="round" opacity=".7">
        <animate attributeName="opacity" values=".3;.9;.3" dur="${d}s" begin="${i*0.18}s" repeatCount="indefinite"/>
      </line>`;
    }).join('');
    return this.wrap(`
<rect x="0" y="${sy+42}" width="400" height="220" fill="${this.hsl(32+n[0]*18,40,84)}" opacity=".4"/>
<g style="transform-origin:${sx}px ${sy}px">
  <animateTransform attributeName="transform" type="scale" values=".9;1.07;.9" dur="${d}s" repeatCount="indefinite"/>
  <circle cx="${sx}" cy="${sy}" r="${sr}" fill="${sc}"/>
  <circle cx="${sx}" cy="${sy}" r="${sr-10}" fill="${this.hsl(50+n[3]*8,86,74)}"/>
</g>
${rays}
<ellipse cx="${sx}" cy="${sy+sr+12}" rx="${98+n[11]*38}" ry="${17+n[12]*9}" fill="${sc}" opacity=".22"/>`, bg);
  }

  private work(n: number[]): string {
    const bg = this.hsl(212 + n[0]*18, 18, 94);
    const dc = this.hsl(212 + n[3]*18, 28, 86);
    const sc = this.hsl(222 + n[6]*28, 58, 48);
    const scrx = 108 + n[13]*36, scry = 58 + n[14]*18;
    const scrw = 178 + n[15]*38, scrh = 88 + n[16]*18;
    const d = 2 + n[9]*1.5;
    const codeLines = [0,1,2,3].map(i =>
      `<rect x="${scrx+10}" y="${scry+14+i*16}" width="${22+n[i+17]*72}" height="4" rx="2" fill="${sc}" opacity="${0.5+n[i+21]*0.4}"/>`
    ).join('');
    return this.wrap(`
<rect x="${scrx}" y="${scry}" width="${scrw}" height="${scrh+28}" rx="10" fill="${dc}"/>
<rect x="${scrx+10}" y="${scry+10}" width="${scrw-20}" height="${scrh}" rx="5" fill="${this.hsl(216+n[3]*14,24,20+n[5]*9)}"/>
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-${2+n[10]*2};0,0" dur="${d}s" repeatCount="indefinite"/>
  ${codeLines}
  <rect x="${scrx+10+n[17]*72}" y="${scry+14}" width="2" height="10" fill="${sc}">
    <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
  </rect>
</g>
<rect x="${scrx+10}" y="${scry+scrh+14}" width="${scrw-20}" height="5" rx="2.5" fill="${this.hsl(215+n[3]*14,20,30+n[5]*7)}"/>
<rect x="${scrx+10}" y="${scry+scrh+14}" height="5" rx="2.5" fill="${sc}">
  <animate attributeName="width" from="0" to="${scrw-20}" dur="${2+n[12]}s" fill="freeze"/>
</rect>
<rect x="${scrx}" y="${scry+scrh+28}" width="${scrw}" height="8" rx="4" fill="${this.hsl(210+n[3]*18,24,62+n[5]*10)}"/>`, bg);
  }

  private thinking(n: number[]): string {
    const bg = this.hsl(262 + n[0]*28, 28, 94);
    const fc = this.hsl(262 + n[3]*28, 58, 52);
    const d = 1.7 + n[6]*1;
    const hx = 128 + n[12]*38, hy = 128 + n[13]*18;
    const bubbles = [
      { cx: 188 + n[15]*18, cy: 122 + n[16]*10, r: 7 + n[17]*4, delay: '.0' },
      { cx: 215 + n[18]*18, cy: 103 + n[19]*13, r: 12 + n[20]*5, delay: '.3' },
      { cx: 252 + n[21]*22, cy: 83 + n[22]*18, r: 18 + n[23]*7, delay: '.6' },
      { cx: 296 + n[24]*18, cy: 66 + n[25]*13, r: 24 + n[26]*8, delay: '.9' },
    ];
    const bubbleSvg = bubbles.map((b, i) =>
      `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="${this.hsl(260+n[3]*26, 45+i*4-n[4]*5, 62+i*3)}">
        <animate attributeName="opacity" values=".2;1;.2" dur="${d}s" begin="${b.delay}s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="scale" values=".65;1;.65" dur="${d}s" begin="${b.delay}s" repeatCount="indefinite" additive="sum"/>
       </circle>`
    ).join('');
    const lastB = bubbles[3];
    return this.wrap(`
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-${4+n[7]*4};0,0" dur="${2+n[11]}s" repeatCount="indefinite"/>
  <circle cx="${hx}" cy="${hy}" r="${26+n[14]*5}" fill="${fc}"/>
  <circle cx="${hx-8}" cy="${hy-5}" r="4" fill="white"/>
  <circle cx="${hx+8}" cy="${hy-5}" r="4" fill="white"/>
  <path d="M${hx-6},${hy+10} Q${hx},${hy+16} ${hx+6},${hy+10}" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <rect x="${hx-13}" y="${hy+26}" width="26" height="38" rx="8" fill="${this.hsl(262+n[3]*28,66,40)}"/>
</g>
${bubbleSvg}
${[0,1,2].map(i => `<line x1="${lastB.cx-lastB.r+6}" y1="${lastB.cy-5+i*7}" x2="${lastB.cx+lastB.r-6}" y2="${lastB.cy-5+i*7}" stroke="white" stroke-width="1.8" opacity=".7"/>`).join('')}
<ellipse cx="${hx}" cy="${hy+68}" rx="${32+n[14]*5}" ry="5" fill="${fc}" opacity=".14"/>`, bg);
  }

  private music(n: number[]): string {
    const bg = this.hsl(282 + n[0]*38, 32, 94);
    const nc = this.hsl(282 + n[3]*38, 58, 50);
    const d = 0.42 + n[6]*0.28;
    const bars = [0,1,2,3,4,5].map(i => {
      const bh = 30 + n[i+10]*78;
      const bx = 82 + i*40 + n[i]*8;
      const bw = 18 + n[i]*8;
      return `<rect x="${bx}" y="${182-bh}" width="${bw}" height="${bh}" rx="5" fill="${nc}" opacity="${0.48+n[i]*0.38}">
        <animateTransform attributeName="transform" type="scale" values="1,1;1,${0.38+n[i+16]*0.28};1,1" dur="${d}s" begin="${i*n[6]*0.3}s" repeatCount="indefinite" additive="sum" style="transform-origin:${bx+bw/2}px 182px"/>
       </rect>`;
    }).join('');
    const notes = [0,1,2,3].map(i => {
      const nx = 100 + n[i+16]*195, ny = 62 + n[i+20]*55;
      const fs = 14 + n[i]*9;
      return `<text x="${nx}" y="${ny}" font-size="${fs}" fill="${nc}" opacity=".85" font-family="serif" style="animation-delay:${n[i+24]*1.5}s">&#9834;
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-${58+n[i+7]*38}" dur="${1.5+n[i+9]*1}s" begin="${n[i+24]*1.5}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0" dur="${1.5+n[i+9]*1}s" begin="${n[i+24]*1.5}s" repeatCount="indefinite"/>
      </text>`;
    }).join('');
    return this.wrap(`${bars}${notes}`, bg);
  }

  private city(n: number[]): string {
    const bg = this.hsl(212 + n[0]*18, 14, 86);
    const buildings = [0,1,2,3,4,5,6].map(i => {
      const bw = 40 + n[i]*18, bh = 62 + n[i+7]*95;
      const bx = i * 55 + n[i]*9 + 8, by = 200 - bh;
      const bc = this.hsl(212 + n[i+14]*18, 18 + n[i+21]*14, 36 + n[i+21]*23);
      const wc = this.hsl(46 + n[i]*9, 68 + n[i]*14, 82 + n[i]*9);
      const winRows = Math.floor(bh / 20);
      const winCols = Math.floor(bw / 15);
      const windows = Array.from({length: winRows}, (_, j) =>
        Array.from({length: winCols}, (_, k) => {
          const lit = n[(i * 7 + j * 3 + k * 2) % 32] > 0.42;
          return `<rect x="${bx+4+k*14}" y="${by+5+j*20}" width="${8+n[(i+j+k)%32]*3}" height="${8+n[(i+j)%32]*3}" rx="1" fill="${wc}" opacity="${lit ? 0.9 : 0.18}"/>`;
        }).join('')
      ).join('');
      return `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" fill="${bc}"/>${windows}`;
    }).join('');
    return this.wrap(`
${buildings}
<rect x="0" y="187" width="400" height="33" fill="${this.hsl(212+n[0]*18,20,26+n[2]*9)}"/>
<circle cx="${302+n[28]*55}" cy="${28+n[29]*18}" r="${8+n[30]*4}" fill="${this.hsl(46+n[3]*9,68,82)}" opacity=".6"/>`, bg);
  }

  private food(n: number[]): string {
    const bg = this.hsl(32 + n[0]*18, 48, 97);
    const phues = [0, 30, 60, 120, 200, 270];
    const pc = this.hsl(phues[Math.floor(n[3]*6)] + n[4]*18, 62, 57);
    const tc2hues = [0, 30, 60, 120, 200];
    const t2c = this.hsl(tc2hues[Math.floor(n[19]*5)] + n[20]*12, 62, 52);
    const t3c = this.hsl(tc2hues[(Math.floor(n[25]*5)+2)%5] + n[26]*12, 58, 56);
    const py = 148 + n[10]*18;
    const d = 2 + n[6]*1.5;
    const fd = 4 + n[8]*4;
    return this.wrap(`
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-${fd};0,0" dur="${d}s" repeatCount="indefinite"/>
  <ellipse cx="200" cy="${py+12}" rx="${80+n[11]*18}" ry="${14+n[12]*7}" fill="${this.hsl(32+n[0]*18,20,76+n[2]*9)}"/>
  <ellipse cx="200" cy="${py}" rx="${74+n[11]*16}" ry="${54+n[13]*14}" fill="white"/>
  <ellipse cx="200" cy="${py-10}" rx="${60+n[14]*13}" ry="${44+n[15]*11}" fill="${pc}" opacity=".9"/>
  <ellipse cx="${185+n[16]*9}" cy="${py-15}" rx="${22+n[17]*7}" ry="${15+n[18]*5}" fill="${t2c}"/>
  <ellipse cx="${216+n[22]*9}" cy="${py-8}" rx="${18+n[23]*6}" ry="${12+n[24]*4}" fill="${t3c}"/>
</g>
<path d="M${182+n[28]*18},${py-55} Q${178+n[28]*18},${py-68} ${183+n[28]*18},${py-80}" fill="none" stroke="${this.hsl(210+n[0]*18,20,76)}" stroke-width="3" stroke-linecap="round" opacity=".6">
  <animateTransform attributeName="transform" type="translate" values="0,0;0,-${22+n[7]*18}" dur="${1.5+n[9]}s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values=".8;0" dur="${1.5+n[9]}s" repeatCount="indefinite"/>
</path>
<path d="M${204+n[29]*14},${py-50} Q${200+n[29]*14},${py-62} ${205+n[29]*14},${py-74}" fill="none" stroke="${this.hsl(210+n[0]*18,20,76)}" stroke-width="3" stroke-linecap="round" opacity=".5">
  <animateTransform attributeName="transform" type="translate" values="0,0;0,-${22+n[7]*18}" dur="${1.5+n[9]}s" begin=".5s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values=".7;0" dur="${1.5+n[9]}s" begin=".5s" repeatCount="indefinite"/>
</path>`, bg);
  }

  private journey(n: number[]): string {
    const bg = this.hsl(197 + n[0]*28, 34, 89);
    const rc = this.hsl(212 + n[3]*18, 14, 56);
    const vc = this.hsl(222 + n[7]*28, 58, 50);
    const vdc = this.hsl(222 + n[7]*28, 68, 36);
    const d = 2.5 + n[10]*2;
    const wd = 0.8 + n[13]*0.5;
    const dashes = [0,1,2,3,4].map(i =>
      `<rect x="${30+i*80+n[i]*9}" y="178" width="${34+n[i+5]*14}" height="4" rx="2" fill="white" opacity=".5"/>`
    ).join('');
    return this.wrap(`
<rect x="0" y="168" width="400" height="34" fill="${rc}"/>
${dashes}
<ellipse cx="${78+n[16]*28}" cy="${52+n[17]*18}" rx="${32+n[18]*11}" ry="${14+n[19]*6}" fill="white" opacity=".9">
  <animateTransform attributeName="transform" type="translate" values="0,0;-${5+n[14]*5},0;0,0" dur="${5+n[14]*3}s" repeatCount="indefinite"/>
</ellipse>
<ellipse cx="${96+n[16]*28}" cy="${44+n[17]*18}" rx="${20+n[18]*7}" ry="${11+n[19]*4}" fill="white">
  <animateTransform attributeName="transform" type="translate" values="0,0;-${5+n[14]*5},0;0,0" dur="${5+n[14]*3}s" repeatCount="indefinite"/>
</ellipse>
<g><animateTransform attributeName="transform" type="translate" values="-${38+n[11]*28},0;${38+n[11]*28},0" dur="${d}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/>
  <rect x="152" y="133" width="100" height="34" rx="5" fill="${vc}"/>
  <rect x="164" y="118" width="68" height="22" rx="5" fill="${this.hsl(222+n[7]*28,62,62)}"/>
  <rect x="167" y="121" width="27" height="13" rx="2" fill="${this.hsl(202+n[7]*18,52,82)}" opacity=".9"/>
  <rect x="197" y="121" width="27" height="13" rx="2" fill="${this.hsl(202+n[7]*18,52,82)}" opacity=".9"/>
  <g style="transform-origin:177px 165px"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="${wd}s" repeatCount="indefinite"/>
    <circle cx="177" cy="165" r="11" fill="#1e293b"/><circle cx="177" cy="165" r="5" fill="${rc}"/>
  </g>
  <g style="transform-origin:225px 165px"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="${wd}s" repeatCount="indefinite"/>
    <circle cx="225" cy="165" r="11" fill="#1e293b"/><circle cx="225" cy="165" r="5" fill="${rc}"/>
  </g>
</g>`, bg);
  }

  private money(n: number[]): string {
    const bg = this.hsl(46 + n[0]*13, 48, 97);
    const gc = this.hsl(46 + n[3]*13, 78, 60);
    const bc = this.hsl(222 + n[6]*28, 52, 47);
    const d = 0.85 + n[9]*0.5;
    const barData = [0,1,2,3,4].map(i => ({ h: 30 + n[i+11]*88, x: 88 + i*47, w: 30 + n[i]*7 }));
    const bars = barData.map((b, i) =>
      `<rect x="${b.x}" y="${165-b.h}" width="${b.w}" height="${b.h}" rx="4" fill="${bc}" opacity="${0.45+i*0.1+n[i+16]*0.18}">
        <animateTransform attributeName="transform" type="scale" values="1,0;1,1" dur=".8s" begin="${i*.15}s" fill="freeze" additive="sum" style="transform-origin:${b.x+b.w/2}px 165px"/>
       </rect>`
    ).join('');
    const trendPts = barData.map((b, i) => `${b.x+b.w/2},${165-b.h-8}`).join(' ');
    return this.wrap(`
<line x1="72" y1="165" x2="330" y2="165" stroke="#e5e7eb" stroke-width="1.5"/>
<line x1="72" y1="165" x2="72" y2="62" stroke="#e5e7eb" stroke-width="1.5"/>
${bars}
<polyline points="${trendPts}" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="200" stroke-dashoffset="200">
  <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1.5s" fill="freeze"/>
</polyline>
<g style="transform-origin:${298+n[17]*18}px ${52+n[18]*18}px">
  <animateTransform attributeName="transform" type="translate" values="0,0;0,-${8+n[10]*7};0,0" dur="${d}s" repeatCount="indefinite"/>
  <circle cx="${298+n[17]*18}" cy="${52+n[18]*18}" r="${12+n[19]*4}" fill="${gc}" stroke="${this.hsl(46+n[3]*13,65,46)}" stroke-width="2"/>
  <text x="${298+n[17]*18}" y="${57+n[18]*18}" text-anchor="middle" font-size="${11+n[20]*3}" fill="${this.hsl(46+n[3]*13,65,36)}" font-weight="bold" font-family="serif">$</text>
</g>`, bg);
  }

  private conflict(n: number[]): string {
    const bg = this.hsl(215 + n[0]*20, 18, 90);
    const c1 = this.hsl(222 + n[3]*28, 58, 47);
    const c2 = this.hsl(4 + n[6]*22, 58, 47);
    const d = 1.6 + n[9];
    const f1x = 128 + n[13]*18, f1y = 93 + n[14]*13;
    const f2x = 268 - n[13]*18, f2y = 93 + n[15]*13;
    const sparks = [0,1,2,3,4].map(i => {
      const a = i * 72; const r = 14 + n[i+16]*9;
      return `<circle cx="${200 + Math.round(Math.cos(a*Math.PI/180)*r)}" cy="${114 + Math.round(Math.sin(a*Math.PI/180)*r)}" r="${2+n[i+21]*3}" fill="${this.hsl(46+n[i]*13,90,65)}">
        <animate attributeName="opacity" values="0;1;0" dur="${0.6+n[i+12]*0.4}s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="scale" values="0;1;0" dur="${0.6+n[i+12]*0.4}s" repeatCount="indefinite"/>
       </circle>`;
    }).join('');
    return this.wrap(`
<g><animateTransform attributeName="transform" type="translate" values="0,0;${8+n[10]*7},0;0,0" dur="${d}s" repeatCount="indefinite"/>
  <circle cx="${f1x}" cy="${f1y}" r="16" fill="${c1}"/>
  <rect x="${f1x-8}" y="${f1y+16}" width="16" height="44" rx="7" fill="${this.hsl(222+n[3]*28,66,36)}"/>
  <line x1="${f1x}" y1="${f1y+20}" x2="${f1x+22}" y2="${f1y+34}" stroke="${this.hsl(222+n[3]*28,66,36)}" stroke-width="5" stroke-linecap="round"/>
</g>
<g><animateTransform attributeName="transform" type="translate" values="0,0;-${8+n[11]*7},0;0,0" dur="${d}s" repeatCount="indefinite"/>
  <circle cx="${f2x}" cy="${f2y}" r="16" fill="${c2}"/>
  <rect x="${f2x-8}" y="${f2y+16}" width="16" height="44" rx="7" fill="${this.hsl(4+n[6]*22,66,36)}"/>
  <line x1="${f2x}" y1="${f2y+20}" x2="${f2x-22}" y2="${f2y+34}" stroke="${this.hsl(4+n[6]*22,66,36)}" stroke-width="5" stroke-linecap="round"/>
</g>
${sparks}`, bg);
  }

  private peace(n: number[]): string {
    const bg = this.hsl(172 + n[0]*38, 34, 93);
    const cc = this.hsl(172 + n[3]*38, 52, 52);
    const d = 3 + n[6]*2;
    const leaves = [0,1,2,3].map(i => {
      const lx = 82 + n[i+17]*234, ly = 48 + n[i+21]*78;
      return `<ellipse cx="${lx}" cy="${ly}" rx="${12+n[i+25]*7}" ry="${5+n[i+25]*3}" fill="${cc}" opacity="${0.3+n[i+17]*0.28}" transform="rotate(${-28+n[i]*55} ${lx} ${ly})">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-${5+n[i+9]*5};0,0" dur="${2.4+n[i+11]}s" begin="${n[i+17]*1.4}s" repeatCount="indefinite"/>
       </ellipse>`;
    }).join('');
    return this.wrap(`
<circle cx="200" cy="108" r="${44+n[12]*14}" fill="none" stroke="${cc}" stroke-width="2" opacity=".5">
  <animateTransform attributeName="transform" type="scale" values=".72;1.48;.72" dur="${2+n[10]}s" repeatCount="indefinite" additive="sum" style="transform-origin:200px 108px"/>
  <animate attributeName="opacity" values=".7;0" dur="${2+n[10]}s" repeatCount="indefinite"/>
</circle>
<circle cx="200" cy="108" r="${44+n[12]*14}" fill="none" stroke="${cc}" stroke-width="1.5" opacity=".4">
  <animateTransform attributeName="transform" type="scale" values=".72;1.48;.72" dur="${2+n[10]}s" begin=".7s" repeatCount="indefinite" additive="sum" style="transform-origin:200px 108px"/>
  <animate attributeName="opacity" values=".6;0" dur="${2+n[10]}s" begin=".7s" repeatCount="indefinite"/>
</circle>
<g style="transform-origin:200px 108px">
  <animateTransform attributeName="transform" type="scale" values="1;${1.05+n[7]*0.04};1" dur="${d}s" repeatCount="indefinite"/>
  <circle cx="200" cy="${88+n[13]*9}" r="${20+n[14]*5}" fill="${cc}" opacity=".85"/>
  <path d="M${186+n[15]*4},${112+n[13]*9} Q200,${136+n[13]*9} ${214-n[15]*4},${112+n[13]*9}" fill="${cc}" opacity=".6"/>
  <path d="M${179+n[15]*4},${122+n[13]*9} L${166+n[16]*4},${141+n[13]*9}" stroke="${cc}" stroke-width="4" stroke-linecap="round" opacity=".68"/>
  <path d="M${221-n[15]*4},${122+n[13]*9} L${234-n[16]*4},${141+n[13]*9}" stroke="${cc}" stroke-width="4" stroke-linecap="round" opacity=".68"/>
</g>
${leaves}`, bg);
  }

  private construction(n: number[]): string {
    const bg = this.hsl(212 + n[0]*18, 18, 92);
    const wc = this.hsl(222 + n[3]*18, 52, 42);
    const yc = this.hsl(46 + n[6]*9, 82, 60);
    const floors = [0,1,2,3].map(i => {
      const fy = 182 - i * 34;
      const windows = [0,1,2,3].map(j =>
        `<rect x="${108+j*36}" y="${fy-26}" width="${14+n[i+j]*4}" height="${17+n[j]*4}" rx="1" fill="${this.hsl(212+n[i+j]*18,28,66+n[j]*9)}" opacity="${n[(i*j+j+1)%32] > 0.38 ? 0.9 : 0.2}"/>`
      ).join('');
      return `<rect x="102" y="${fy-30}" width="162" height="30" rx="0" fill="${this.hsl(222+n[3]*18,48+i*4,38+i*8)}" opacity="${0.52+i*0.12}">
        <animateTransform attributeName="transform" type="translate" values="0,-${14+n[i+10]*9};0,0" dur=".5s" begin="${i*.2}s" fill="freeze"/>
        <animate attributeName="opacity" from="0" to="${0.52+i*0.12}" dur=".4s" begin="${i*.2}s" fill="freeze"/>
      </rect>${windows}`;
    }).join('');
    return this.wrap(`
${floors}
<rect x="102" y="182" width="162" height="18" rx="0" fill="${this.hsl(222+n[3]*18,52,32)}"/>
<g>
  <animateTransform attributeName="transform" type="rotate" values="-${3+n[11]*4};${3+n[11]*4}" dur="${2+n[13]}s" repeatCount="indefinite" style="transform-origin:244px 48px"/>
  <line x1="244" y1="48" x2="244" y2="180" stroke="${yc}" stroke-width="5"/>
  <line x1="204" y1="48" x2="312" y2="48" stroke="${yc}" stroke-width="5"/>
  <line x1="204" y1="48" x2="204" y2="63" stroke="${yc}" stroke-width="3"/>
  <circle cx="204" cy="66" r="4" fill="${yc}"/>
  <line x1="204" y1="70" x2="204" y2="96" stroke="${yc}" stroke-width="1.5" stroke-dasharray="4"/>
</g>`, bg);
  }

  private transformation(n: number[]): string {
    const bg = this.hsl(262 + n[0]*38, 28, 93);
    const c1 = this.hsl(262 + n[3]*38, 58, 52);
    const c2 = this.hsl(162 + n[6]*38, 52, 52);
    const d = 2.2 + n[9];
    const orbitDots = [0,1,2,3,4,5].map(i => {
      const a = i * 60; const r = 54 + n[i+12]*18;
      const cx = 200 + Math.round(Math.cos(a*Math.PI/180)*r);
      const cy = 108 + Math.round(Math.sin(a*Math.PI/180)*r);
      return `<circle cx="${cx}" cy="${cy}" r="${3+n[i+18]*3}" fill="${i%2===0 ? c1 : c2}">
        <animate attributeName="opacity" values="0;1;0" dur="${1+n[i+12]*0.5}s" begin="${n[i+12]*1}s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="scale" values="0;1;0" dur="${1+n[i+12]*0.5}s" begin="${n[i+12]*1}s" repeatCount="indefinite"/>
       </circle>`;
    }).join('');
    return this.wrap(`
<g style="transform-origin:200px 108px" opacity=".18">
  <animateTransform attributeName="transform" type="rotate" values="0;360" dur="${3+n[10]*2}s" repeatCount="indefinite"/>
  ${[0,1,2,3,4,5,6,7].map(i => {
    const a = i * 45;
    return `<line x1="200" y1="108" x2="${200+Math.round(Math.cos(a*Math.PI/180)*88)}" y2="${108+Math.round(Math.sin(a*Math.PI/180)*88)}" stroke="${c1}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  }).join('')}
</g>
<path fill="${c1}">
  <animate attributeName="d"
    values="M168,108 L192,72 L216,108 Z;M168,108 A32,32 0 1,1 232,108 A32,32 0 1,1 168,108;M168,108 L192,72 L216,108 Z"
    dur="${d}s" repeatCount="indefinite"/>
  <animate attributeName="fill" values="${c1};${c2};${c1}" dur="${d}s" repeatCount="indefinite"/>
</path>
${orbitDots}`, bg);
  }

  private abstract(n: number[]): string {
    const bg = this.hsl(242 + n[0]*58, 24, 93);
    const hues = [262, 182, 42, 322];
    const colors = hues.map((h, i) => this.hsl(h + n[i+3]*28, 52 + n[i+7]*18, 56 + n[i+11]*13));
    const d = 2 + n[15];
    const orbitR = 68 + n[23]*18;
    const dots = [0,1,2,3,4].map(i => {
      const a = i * 72 * Math.PI / 180;
      return `<circle cx="${50+n[i]*295}" cy="${28+n[i+5]*158}" r="${2+n[i+10]*4}" fill="${colors[i%4]}" opacity="${0.4+n[i+15]*0.4}">
        <animate attributeName="opacity" values="${0.3+n[i]*0.2};${0.7+n[i]*0.3};${0.3+n[i]*0.2}" dur="${1.8+n[i+22]}s" repeatCount="indefinite"/>
       </circle>`;
    }).join('');
    return this.wrap(`
<ellipse cx="200" cy="108" rx="${orbitR}" ry="${orbitR*0.36}" fill="none" stroke="${colors[0]}" stroke-width="1.5" stroke-dasharray="6,4" opacity=".6">
  <animateTransform attributeName="transform" type="rotate" values="0 200 108;360 200 108" dur="${4+n[20]*3}s" repeatCount="indefinite"/>
</ellipse>
<ellipse cx="200" cy="108" rx="${orbitR+20}" ry="${(orbitR+20)*0.36}" fill="none" stroke="${colors[1]}" stroke-width="1" stroke-dasharray="8,5" opacity=".44">
  <animateTransform attributeName="transform" type="rotate" values="360 200 108;0 200 108" dur="${5+n[21]*3}s" repeatCount="indefinite"/>
</ellipse>
<g style="transform-origin:200px 108px">
  <animateTransform attributeName="transform" type="translate" values="0,0;${5+n[16]*7},-${6+n[17]*7};0,0" dur="${d}s" repeatCount="indefinite"/>
  <circle cx="200" cy="108" r="${30+n[27]*11}" fill="${colors[2]}" opacity=".18"/>
  <circle cx="200" cy="108" r="${20+n[28]*7}" fill="${colors[2]}" opacity=".38"/>
  <circle cx="200" cy="108" r="${12+n[29]*5}" fill="${colors[2]}" opacity=".82"/>
  <circle cx="${195+n[30]*4}" cy="${104+n[31]*4}" r="${5+n[30]*3}" fill="white" opacity=".48"/>
</g>
${dots}`, bg);
  }
  private sparkle(n: number[]): string {
    // Represents: light, glint, shimmer, flash, shine, glow, dazzle, gleam
    const bg = this.hsl(220 + n[0]*30, 25 + n[1]*15, 10 + n[2]*8);
    const c1 = this.hsl(48 + n[3]*20, 90, 72);
    const c2 = this.hsl(190 + n[4]*40, 80, 68);
    const c3 = this.hsl(280 + n[5]*40, 70, 72);
    const cx = 160 + n[6]*80, cy = 90 + n[7]*40;
    const r1 = 18 + n[8]*12;

    // Central light burst
    const rays = [0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
      const a = i * 30 + n[i]*15;
      const len = 22 + n[i]*30;
      const rad = a * Math.PI / 180;
      const x2 = cx + Math.round(Math.cos(rad) * (r1 + len));
      const y2 = cy + Math.round(Math.sin(rad) * (r1 + len));
      const col = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3;
      return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${1+n[i]*1.5}" stroke-linecap="round" opacity=".8">
        <animate attributeName="opacity" values="0;.9;0" dur="${0.8+n[i]*0.6}s" begin="${n[(i+3)%12]*1.2}s" repeatCount="indefinite"/>
        <animate attributeName="stroke-width" values="${1+n[i]*1.5};${3+n[i]*2};${1+n[i]*1.5}" dur="${0.8+n[i]*0.6}s" begin="${n[(i+3)%12]*1.2}s" repeatCount="indefinite"/>
      </line>`;
    }).join('');

    // Floating sparkle particles
    const sparks = [0,1,2,3,4,5,6,7].map(i => {
      const sx = 30 + n[i+12]*340, sy = 20 + n[i+20]*180;
      const col = [c1,c2,c3][i%3];
      const d = 1.2 + n[i+12]*1.5;
      const size = 2 + n[i+20]*4;
      return `<g>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-${8+n[i]*10};0,0" dur="${d}s" begin="${n[i+4]*2}s" repeatCount="indefinite"/>
        <polygon points="${sx},${sy-size} ${sx+size*0.4},${sy-size*0.4} ${sx+size},${sy} ${sx+size*0.4},${sy+size*0.4} ${sx},${sy+size} ${sx-size*0.4},${sy+size*0.4} ${sx-size},${sy} ${sx-size*0.4},${sy-size*0.4}" fill="${col}">
          <animate attributeName="opacity" values="0;1;0" dur="${d}s" begin="${n[i+4]*2}s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="rotate" values="0 ${sx} ${sy};45 ${sx} ${sy};0 ${sx} ${sy}" dur="${d}s" begin="${n[i+4]*2}s" repeatCount="indefinite" additive="sum"/>
        </polygon>
      </g>`;
    }).join('');

    // Central glowing orb
    return this.wrap(`
<circle cx="${cx}" cy="${cy}" r="${r1+20}" fill="${c1}" opacity=".06"/>
<circle cx="${cx}" cy="${cy}" r="${r1+10}" fill="${c1}" opacity=".1"/>
<circle cx="${cx}" cy="${cy}" r="${r1}" fill="${c1}" opacity=".18">
  <animate attributeName="r" values="${r1};${r1+6};${r1}" dur="${1.5+n[9]}s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values=".12;.25;.12" dur="${1.5+n[9]}s" repeatCount="indefinite"/>
</circle>
${rays}
<circle cx="${cx}" cy="${cy}" r="${6+n[10]*5}" fill="${c1}">
  <animate attributeName="r" values="${6+n[10]*5};${10+n[10]*7};${6+n[10]*5}" dur="${1.2+n[11]}s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values=".8;1;.8" dur="${1.2+n[11]}s" repeatCount="indefinite"/>
</circle>
<circle cx="${cx+2}" cy="${cy-3}" r="${3+n[10]*2}" fill="white" opacity=".7"/>
${sparks}`, bg);
  }

  private eye(n: number[]): string {
    // Represents: eye, gaze, stare, glance, vision, look, sight, glint-in-eye
    const bg = this.hsl(210 + n[0]*20, 20 + n[1]*15, 92 + n[2]*5);
    const ec = this.hsl(210 + n[3]*30, 55 + n[4]*20, 45 + n[5]*15); // eye color
    const pc = this.hsl(n[6]*30, 0, 15 + n[7]*10); // pupil
    const sc = this.hsl(48 + n[8]*20, 90, 65); // sparkle / glint color
    const cx = 200, cy = 108;
    const ew = 110 + n[9]*40; // eye width
    const eh = 50 + n[10]*20; // eye height
    const iris = 28 + n[11]*10;
    const pupil = 14 + n[11]*5;
    const d = 3 + n[12]*2;

    // Iris detail lines
    const irisLines = [0,1,2,3,4,5,6,7].map(i => {
      const a = i * 45 * Math.PI / 180;
      return `<line x1="${cx}" y1="${cy}" x2="${cx + Math.round(Math.cos(a)*iris)}" y2="${cy + Math.round(Math.sin(a)*iris)}" stroke="${this.hsl(210+n[3]*30,45+n[4]*15,55+n[5]*10)}" stroke-width="1.2" opacity=".5"/>`;
    }).join('');

    return this.wrap(`
<!-- Eye white / sclera -->
<ellipse cx="${cx}" cy="${cy}" rx="${ew}" ry="${eh}" fill="white" stroke="${this.hsl(210+n[3]*20,20,70)}" stroke-width="1.5"/>

<!-- Upper and lower lashes curve -->
<path d="M${cx-ew},${cy} Q${cx},${cy-eh*1.6} ${cx+ew},${cy}" fill="none" stroke="${this.hsl(n[6]*30,10,22)}" stroke-width="3" stroke-linecap="round"/>
<path d="M${cx-ew},${cy} Q${cx},${cy+eh*1.6} ${cx+ew},${cy}" fill="none" stroke="${this.hsl(n[6]*30,10,22)}" stroke-width="3" stroke-linecap="round"/>

<!-- Iris -->
<circle cx="${cx}" cy="${cy}" r="${iris}" fill="${ec}"/>
${irisLines}
<circle cx="${cx}" cy="${cy}" r="${iris}" fill="none" stroke="${this.hsl(210+n[3]*30,60+n[4]*15,35+n[5]*10)}" stroke-width="1.5"/>

<!-- Pupil -->
<circle cx="${cx}" cy="${cy}" r="${pupil}" fill="${pc}">
  <animate attributeName="r" values="${pupil};${pupil*0.7};${pupil}" dur="${d}s" repeatCount="indefinite"/>
</circle>

<!-- Glint / light reflection (the key visual element) -->
<circle cx="${cx - iris*0.3}" cy="${cy - iris*0.35}" r="${5+n[13]*4}" fill="white" opacity=".9">
  <animate attributeName="opacity" values=".6;1;.6" dur="${1.5+n[14]}s" repeatCount="indefinite"/>
  <animate attributeName="r" values="${5+n[13]*4};${7+n[13]*5};${5+n[13]*4}" dur="${1.5+n[14]}s" repeatCount="indefinite"/>
</circle>
<circle cx="${cx - iris*0.3 + 4}" cy="${cy - iris*0.35 + 3}" r="${2+n[15]*2}" fill="white" opacity=".6"/>

<!-- Sparkle star on glint -->
<g>
  <animateTransform attributeName="transform" type="rotate" values="0 ${cx-iris*0.3} ${cy-iris*0.35};360 ${cx-iris*0.3} ${cy-iris*0.35}" dur="${2+n[16]}s" repeatCount="indefinite"/>
  <line x1="${cx-iris*0.3-8}" y1="${cy-iris*0.35}" x2="${cx-iris*0.3+8}" y2="${cy-iris*0.35}" stroke="${sc}" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
  <line x1="${cx-iris*0.3}" y1="${cy-iris*0.35-8}" x2="${cx-iris*0.3}" y2="${cy-iris*0.35+8}" stroke="${sc}" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
  <line x1="${cx-iris*0.3-5}" y1="${cy-iris*0.35-5}" x2="${cx-iris*0.3+5}" y2="${cy-iris*0.35+5}" stroke="${sc}" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  <line x1="${cx-iris*0.3+5}" y1="${cy-iris*0.35-5}" x2="${cx-iris*0.3-5}" y2="${cy-iris*0.35+5}" stroke="${sc}" stroke-width="1" stroke-linecap="round" opacity=".6"/>
</g>

<!-- Eyelashes top -->
${[0,1,2,3,4].map(i => {
  const lx = cx - ew*0.7 + i*(ew*0.35);
  const angle = -70 + i*15;
  const llen = 14 + n[i+17]*8;
  const rad = angle * Math.PI / 180;
  return `<line x1="${lx}" y1="${cy-eh}" x2="${lx+Math.round(Math.cos(rad)*llen)}" y2="${cy-eh+Math.round(Math.sin(rad)*llen)}" stroke="${this.hsl(n[6]*30,10,18)}" stroke-width="2" stroke-linecap="round"/>`;
}).join('')}`, bg);
  }

}
