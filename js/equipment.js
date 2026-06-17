'use strict';

/* ── Global game stats ── */
const gameStats = {
  zdenerwowanie: 0,    // 0 = spokojna (bar pełny), 100 = wróciła do domu
};

let _angerTriggered = false;

/* ── Apply zdenerwowanie change (call this from events/cards) ── */
function applyZdenerwowanie(delta) {
  gameStats.zdenerwowanie = Math.max(0, Math.min(100, gameStats.zdenerwowanie + delta));
  _updateStatBar();
  if (gameStats.zdenerwowanie >= 100 && !_angerTriggered) {
    _angerTriggered = true;
    setTimeout(triggerAnger, 80);
  }
}

/* ── Game-over: Agata wróciła do domu ── */
function triggerAnger() {
  document.getElementById('anger-overlay').classList.remove('hidden');
  // Freeze player movement while overlay is up
  _angerActive = true;
}

let _angerActive = false;

function isAngerActive() { return _angerActive; }

/* ── Card definitions ── */
const ALL_CARDS = [
  {
    id: 'first_date',
    name: 'Pierwsza Randka',
    type: 'Wspomnienie',
    rarity: 'gold',       // gold / silver / common / rare / legendary
    rarityColor: '#f5c842',
    effectLabel: 'Efekt: do odkrycia w grze',
    desc: 'Tamten wieczór kiedy baliśmy się co powiedzieć, a czas leciał za szybko.',
    drawArt(ctx, w, h) {
      // Romantic restaurant scene
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1a0a2e'); g.addColorStop(1, '#2d1040');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // candles
      for (const cx of [w * 0.3, w * 0.7]) {
        ctx.fillStyle = '#c8a060'; ctx.fillRect(cx - 3, h * 0.55, 6, h * 0.3);
        const flame = ctx.createRadialGradient(cx, h * 0.48, 0, cx, h * 0.5, 10);
        flame.addColorStop(0, '#fff8b0'); flame.addColorStop(0.5, '#ffaa00'); flame.addColorStop(1, 'transparent');
        ctx.fillStyle = flame; ctx.beginPath(); ctx.ellipse(cx, h * 0.5, 6, 10, 0, 0, Math.PI * 2); ctx.fill();
      }
      // table
      ctx.fillStyle = '#5a2d0c'; ctx.fillRect(w * 0.1, h * 0.7, w * 0.8, h * 0.06);
      // hearts
      ctx.fillStyle = '#ff6680'; ctx.font = `${h * 0.18}px serif`;
      ctx.textAlign = 'center'; ctx.fillText('♥', w / 2, h * 0.38);
      ctx.font = `${h * 0.1}px serif`;
      ctx.fillStyle = '#ff88aa';
      ctx.fillText('♥', w * 0.2, h * 0.28); ctx.fillText('♥', w * 0.82, h * 0.22);
    },
  },
  {
    id: 'gdansk_trip',
    name: 'Gdańsk o Świcie',
    type: 'Przygoda',
    rarity: 'rare',
    rarityColor: '#7b68ee',
    effectLabel: 'Efekt: do odkrycia w grze',
    desc: 'Morze, mewa i kawa która była za gorąca. Ale widok był idealny.',
    drawArt(ctx, w, h) {
      // Sunrise over sea
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
      sky.addColorStop(0, '#0d1a4a'); sky.addColorStop(0.6, '#f07030'); sky.addColorStop(1, '#ffd090');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h * 0.62);
      // sea
      const sea = ctx.createLinearGradient(0, h * 0.62, 0, h);
      sea.addColorStop(0, '#1a4a7a'); sea.addColorStop(1, '#0a2040');
      ctx.fillStyle = sea; ctx.fillRect(0, h * 0.62, w, h * 0.38);
      // sun
      const sun = ctx.createRadialGradient(w / 2, h * 0.6, 0, w / 2, h * 0.6, 22);
      sun.addColorStop(0, '#fff8b0'); sun.addColorStop(0.4, '#ffcc00'); sun.addColorStop(1, 'transparent');
      ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(w / 2, h * 0.6, 22, 0, Math.PI * 2); ctx.fill();
      // reflection
      ctx.fillStyle = 'rgba(255,200,80,0.25)';
      ctx.fillRect(w * 0.4, h * 0.62, w * 0.2, h * 0.38);
      // seagull
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(w * 0.25, h * 0.25);
      ctx.quadraticCurveTo(w * 0.3, h * 0.2, w * 0.35, h * 0.25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.6, h * 0.18);
      ctx.quadraticCurveTo(w * 0.65, h * 0.13, w * 0.7, h * 0.18); ctx.stroke();
    },
  },
  {
    id: 'cozy_evening',
    name: 'Wieczór w Domu',
    type: 'Spokój',
    rarity: 'silver',
    rarityColor: '#c0c0d8',
    effectLabel: 'Efekt: do odkrycia w grze',
    desc: 'Serial, kocyk i żadnych planów. Najlepsze wieczory to te bez ceremonii.',
    drawArt(ctx, w, h) {
      // Cozy room
      ctx.fillStyle = '#1a0a08'; ctx.fillRect(0, 0, w, h);
      // warm lamp glow
      const lamp = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, h * 0.6);
      lamp.addColorStop(0, 'rgba(255,200,100,0.5)'); lamp.addColorStop(1, 'transparent');
      ctx.fillStyle = lamp; ctx.fillRect(0, 0, w, h);
      // sofa
      ctx.fillStyle = '#5a2a18'; ctx.beginPath();
      ctx.roundRect(w * 0.05, h * 0.6, w * 0.9, h * 0.28, 6); ctx.fill();
      ctx.fillStyle = '#7a3a22'; ctx.fillRect(w * 0.06, h * 0.55, w * 0.18, h * 0.34);
      ctx.fillRect(w * 0.76, h * 0.55, w * 0.18, h * 0.34);
      // pillows
      ctx.fillStyle = '#c8608a';
      ctx.beginPath(); ctx.roundRect(w * 0.22, h * 0.58, w * 0.22, h * 0.18, 5); ctx.fill();
      ctx.fillStyle = '#e09050';
      ctx.beginPath(); ctx.roundRect(w * 0.56, h * 0.58, w * 0.18, h * 0.18, 5); ctx.fill();
      // TV glow
      ctx.fillStyle = 'rgba(80,140,200,0.3)';
      ctx.fillRect(0, 0, w, h * 0.45);
      ctx.strokeStyle = 'rgba(80,140,200,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.15, h * 0.08, w * 0.7, h * 0.35);
    },
  },
  {
    id: 'argument',
    name: 'Burza',
    type: 'Próba',
    rarity: 'common',
    rarityColor: '#a06030',
    effectLabel: 'Efekt: do odkrycia w grze',
    desc: 'Każdy związek ma burze. Ważne że razem wyszliśmy z niej silniejsi.',
    drawArt(ctx, w, h) {
      // stormy sky
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1a1a2e'); g.addColorStop(1, '#16213e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // clouds
      ctx.fillStyle = '#2a2a3e';
      for (const [cx, cy, r] of [[w*0.3,h*0.25,28],[w*0.5,h*0.2,35],[w*0.72,h*0.28,25],[w*0.15,h*0.32,20]]) {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      }
      // lightning
      ctx.strokeStyle = '#e8e870'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.55, h * 0.2); ctx.lineTo(w * 0.47, h * 0.52);
      ctx.lineTo(w * 0.54, h * 0.52); ctx.lineTo(w * 0.44, h * 0.82);
      ctx.stroke();
      ctx.fillStyle = 'rgba(230,230,100,0.15)'; ctx.fillRect(0, 0, w, h);
      // rain lines
      ctx.strokeStyle = 'rgba(150,200,255,0.4)'; ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const rx = (i / 12) * w + h * 0.1;
        ctx.beginPath(); ctx.moveTo(rx, h * 0.35 + (i % 3) * 8);
        ctx.lineTo(rx - 4, h * 0.5 + (i % 3) * 8); ctx.stroke();
      }
    },
  },
  {
    id: 'anniversary',
    name: 'Dwie Rocznice',
    type: 'Legenda',
    rarity: 'legendary',
    rarityColor: '#ff8c42',
    effectLabel: 'Efekt: do odkrycia w grze',
    desc: 'Dwa lata. Każdy dzień to nowy rozdział tej samej, wyjątkowej historii.',
    drawArt(ctx, w, h) {
      // galaxy background
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#0a0020'); g.addColorStop(0.5, '#1a0030'); g.addColorStop(1, '#000818');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // stars
      const rng = (s => () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; })(42);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const sx = rng() * w, sy = rng() * h, sr = rng() * 1.5 + 0.3;
        ctx.globalAlpha = rng() * 0.7 + 0.3;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // "2" big
      ctx.font = `bold ${h * 0.55}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const gTxt = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.7);
      gTxt.addColorStop(0, '#ffdd80'); gTxt.addColorStop(1, '#ff8040');
      ctx.fillStyle = gTxt;
      ctx.shadowColor = '#ffaa40'; ctx.shadowBlur = 20;
      ctx.fillText('2', w / 2, h / 2);
      ctx.shadowBlur = 0;
      // hearts orbit
      ctx.font = `${h * 0.14}px serif`;
      ctx.fillStyle = '#ff6090';
      ctx.fillText('♥', w * 0.18, h * 0.22);
      ctx.fillText('♥', w * 0.78, h * 0.74);
      ctx.fillStyle = '#ff90c0'; ctx.font = `${h * 0.09}px serif`;
      ctx.fillText('♥', w * 0.82, h * 0.2); ctx.fillText('♥', w * 0.14, h * 0.76);
    },
  },
];

/* ── Stat bar: 5 color levels & state names ── */
function _statColor(v) {
  if (v <= 20) return '#3fc76c';
  if (v <= 40) return '#a0c840';
  if (v <= 60) return '#f5c842';
  if (v <= 80) return '#f07030';
  return '#e82020';
}

function _statState(v) {
  if (v <= 20) return 'Mimi';
  if (v <= 40) return 'Agata podstawowa';
  if (v <= 60) return 'Smutna';
  if (v <= 80) return 'ZIS';
  return 'Yyyy';
}

/* ── Animated character portrait ── */
let _charAnimRaf = null;
let _charAnimT0  = null;

function _startCharAnim() {
  _stopCharAnim();
  _charAnimT0 = performance.now();
  function tick(now) {
    const t   = (now - _charAnimT0) / 1000;
    const bob = Math.sin(t * 1.5) * 1.5;
    const jc  = t % 9;
    const jmp = jc < 0.55 ? -Math.sin(jc / 0.55 * Math.PI) * 16 : 0;
    const bc  = t % 3.8;
    const bl  = bc < 0.14 ? Math.sin(bc / 0.14 * Math.PI) : 0;
    const tc  = t % 5;
    const td  = Math.floor(t / 5) % 2 === 0 ? 1 : -1;
    const tl  = tc < 1.2 ? Math.sin(tc / 1.2 * Math.PI) * 0.12 * td : 0;
    _drawCharAt(bob + jmp, tl, bl);
    _charAnimRaf = requestAnimationFrame(tick);
  }
  _charAnimRaf = requestAnimationFrame(tick);
}

function _stopCharAnim() {
  if (_charAnimRaf !== null) { cancelAnimationFrame(_charAnimRaf); _charAnimRaf = null; }
}

function _drawCharAt(dy, headTilt, blinkAmt) {
  const cv = document.getElementById('char-canvas');
  if (!cv) return;
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  c.clearRect(0, 0, W, H);

  const cx    = W / 2;
  const SKIN  = '#fde8d8';
  const SKIN2 = '#fad0b8';

  // bg glow (static)
  const bg = c.createRadialGradient(W/2, H*0.38, 0, W/2, H*0.38, W*0.65);
  bg.addColorStop(0, 'rgba(220,200,255,0.15)'); bg.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);

  // everything shifts vertically by dy (bob + jump)
  c.save();
  c.translate(0, dy);

  // ── jeans ──
  const jeans = c.createLinearGradient(cx, H*0.72, cx, H);
  jeans.addColorStop(0, '#7bb8e8'); jeans.addColorStop(1, '#4a90c8');
  c.fillStyle = jeans;
  c.beginPath(); c.moveTo(cx-14,H*0.72); c.lineTo(cx-22,H); c.lineTo(cx-2,H); c.lineTo(cx,H*0.72); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(cx,H*0.72); c.lineTo(cx+2,H); c.lineTo(cx+22,H); c.lineTo(cx+14,H*0.72); c.closePath(); c.fill();
  c.strokeStyle='rgba(255,255,255,0.25)'; c.lineWidth=1.2;
  c.beginPath(); c.moveTo(cx-8,H*0.74); c.lineTo(cx-12,H); c.stroke();
  c.beginPath(); c.moveTo(cx+8,H*0.74); c.lineTo(cx+12,H); c.stroke();

  // ── hoodie ──
  const hoodie = c.createLinearGradient(cx-32,H*0.48,cx+32,H*0.76);
  hoodie.addColorStop(0,'#f472b6'); hoodie.addColorStop(1,'#db2777');
  c.fillStyle=hoodie;
  c.beginPath(); c.moveTo(cx-14,H*0.48); c.lineTo(cx-32,H*0.52); c.lineTo(cx-30,H*0.75); c.lineTo(cx+30,H*0.75); c.lineTo(cx+32,H*0.52); c.lineTo(cx+14,H*0.48); c.closePath(); c.fill();
  c.fillStyle='rgba(0,0,0,0.15)'; c.beginPath(); c.roundRect(cx-14,H*0.62,28,H*0.1,4); c.fill();
  c.strokeStyle='rgba(255,255,255,0.18)'; c.lineWidth=1;
  for(let i=0;i<5;i++){const ly=H*0.73+i*1.8; c.beginPath(); c.moveTo(cx-30,ly); c.lineTo(cx+30,ly); c.stroke();}

  // ── sleeves ──
  c.strokeStyle='#f472b6'; c.lineWidth=14; c.lineCap='round';
  c.beginPath(); c.moveTo(cx-16,H*0.52); c.quadraticCurveTo(cx-36,H*0.6,cx-32,H*0.72); c.stroke();
  c.beginPath(); c.moveTo(cx+16,H*0.52); c.quadraticCurveTo(cx+36,H*0.6,cx+32,H*0.72); c.stroke();
  c.strokeStyle='#db2777'; c.lineWidth=5;
  c.beginPath(); c.moveTo(cx-34,H*0.7); c.lineTo(cx-30,H*0.74); c.stroke();
  c.beginPath(); c.moveTo(cx+34,H*0.7); c.lineTo(cx+30,H*0.74); c.stroke();
  c.fillStyle=SKIN2;
  c.beginPath(); c.ellipse(cx-30,H*0.75,6,5,-0.3,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(cx+30,H*0.75,6,5, 0.3,0,Math.PI*2); c.fill();

  // ── neck (hidden under head, no chin bleed) ──
  c.fillStyle=SKIN2; c.fillRect(cx-5, H*0.44, 10, 5);

  // ── HEAD (rotates around its centre) ──
  const hcy = H * 0.295;
  c.save();
  c.translate(cx, hcy); c.rotate(headTilt); c.translate(-cx, -hcy);

  // head
  c.fillStyle=SKIN; c.beginPath(); c.ellipse(cx,hcy,28,32,0,0,Math.PI*2); c.fill();

  // back hair
  c.fillStyle='#d4b830';
  c.beginPath(); c.moveTo(cx-26,H*0.16); c.bezierCurveTo(cx-40,H*0.3,cx-42,H*0.55,cx-36,H*0.78); c.lineTo(cx-28,H*0.78); c.bezierCurveTo(cx-32,H*0.54,cx-30,H*0.32,cx-22,H*0.18); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(cx+26,H*0.16); c.bezierCurveTo(cx+40,H*0.3,cx+42,H*0.55,cx+36,H*0.78); c.lineTo(cx+28,H*0.78); c.bezierCurveTo(cx+32,H*0.54,cx+30,H*0.32,cx+22,H*0.18); c.closePath(); c.fill();

  // top hair
  c.fillStyle='#f5e060';
  c.beginPath(); c.moveTo(cx-28,H*0.28); c.bezierCurveTo(cx-30,H*0.1,cx-14,H*0.03,cx,H*0.04); c.bezierCurveTo(cx+14,H*0.03,cx+30,H*0.1,cx+28,H*0.28); c.bezierCurveTo(cx+26,H*0.14,cx+8,H*0.1,cx,H*0.1); c.bezierCurveTo(cx-8,H*0.1,cx-26,H*0.14,cx-28,H*0.28); c.closePath(); c.fill();

  // front strands
  c.fillStyle='#f5e060';
  c.beginPath(); c.moveTo(cx-26,H*0.18); c.bezierCurveTo(cx-36,H*0.3,cx-36,H*0.48,cx-30,H*0.62); c.lineTo(cx-24,H*0.62); c.bezierCurveTo(cx-28,H*0.46,cx-26,H*0.3,cx-18,H*0.2); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(cx+26,H*0.18); c.bezierCurveTo(cx+36,H*0.3,cx+36,H*0.48,cx+30,H*0.62); c.lineTo(cx+24,H*0.62); c.bezierCurveTo(cx+28,H*0.46,cx+26,H*0.3,cx+18,H*0.2); c.closePath(); c.fill();

  // highlights
  c.strokeStyle='#fffbe0'; c.lineWidth=2; c.lineCap='round';
  c.beginPath(); c.moveTo(cx-8,H*0.06); c.bezierCurveTo(cx-12,H*0.14,cx-10,H*0.22,cx-14,H*0.28); c.stroke();
  c.beginPath(); c.moveTo(cx+4,H*0.05); c.bezierCurveTo(cx+8,H*0.13,cx+6,H*0.2,cx+10,H*0.26); c.stroke();

  // hair clip
  c.fillStyle='#f472b6'; c.beginPath(); c.roundRect(cx+14,H*0.13,10,5,2); c.fill();
  c.fillStyle='#fff'; c.font='7px serif'; c.textAlign='center'; c.fillText('✿',cx+19,H*0.17);

  // ── eyes with blink ──
  const eyeSY = Math.max(0.02, 1 - blinkAmt);
  // whites
  c.fillStyle='#fff';
  c.beginPath(); c.ellipse(cx-11,H*0.28,5,5.5*eyeSY,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(cx+11,H*0.28,5,5.5*eyeSY,0,0,Math.PI*2); c.fill();
  // iris + pupil + shine (only when not fully closed)
  if (blinkAmt < 0.85) {
    c.fillStyle='#5a8aba';
    c.beginPath(); c.arc(cx-11,H*0.285,3.8,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(cx+11,H*0.285,3.8,0,Math.PI*2); c.fill();
    c.fillStyle='#1a2a3a';
    c.beginPath(); c.arc(cx-11,H*0.285,2.2,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(cx+11,H*0.285,2.2,0,Math.PI*2); c.fill();
    c.fillStyle='#fff';
    c.beginPath(); c.arc(cx-9.5,H*0.272,1.3,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(cx+12.5,H*0.272,1.3,0,Math.PI*2); c.fill();
  }
  // eyelid closes over everything
  if (blinkAmt > 0.05) {
    c.fillStyle=SKIN;
    c.beginPath(); c.ellipse(cx-11,H*0.28,6,6*blinkAmt,0,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(cx+11,H*0.28,6,6*blinkAmt,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#2a1a1a'; c.lineWidth=1.2; c.lineCap='round';
    c.beginPath(); c.moveTo(cx-17,H*0.28); c.quadraticCurveTo(cx-11,H*0.28-5*blinkAmt,cx-5,H*0.28); c.stroke();
    c.beginPath(); c.moveTo(cx+5,H*0.28); c.quadraticCurveTo(cx+11,H*0.28-5*blinkAmt,cx+17,H*0.28); c.stroke();
  }
  // lashes
  c.strokeStyle='#1a1a2a'; c.lineWidth=1.2; c.lineCap='round';
  for(const [ex,dir] of [[cx-11,-1],[cx+11,1]]) {
    for(let l=-2;l<=2;l++){ c.beginPath(); c.moveTo(ex+l*2,H*0.275); c.lineTo(ex+l*2+dir*0.5,H*0.255); c.stroke(); }
  }

  // ── blush ──
  c.fillStyle='rgba(255,160,160,0.28)';
  c.beginPath(); c.ellipse(cx-20,H*0.315,8,5,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(cx+20,H*0.315,8,5,0,0,Math.PI*2); c.fill();

  // ── smile ──
  c.strokeStyle='#d08080'; c.lineWidth=1.8; c.lineCap='round';
  c.beginPath(); c.arc(cx,H*0.35,8,0.25,Math.PI-0.25); c.stroke();

  c.restore(); // end head tilt
  c.restore(); // end body dy
}

/* ── Render stat bar (bar shows 100-v so 0=full/green, 100=empty) ── */
function _updateStatBar() {
  const v    = Math.max(0, Math.min(100, gameStats.zdenerwowanie));
  const fill = document.getElementById('zdenerw-fill');
  const num  = document.getElementById('zdenerw-num');
  const stan = document.getElementById('agata-stan');
  if (!fill || !num) return;
  fill.style.width = (100 - v) + '%';
  fill.style.backgroundColor = _statColor(v);
  num.textContent = v;
  if (stan) stan.textContent = _statState(v);
}

/* ── Build one card DOM element ── */
function _buildCard(card) {
  const wrap = document.createElement('div');
  wrap.className = 'card';

  const frame = document.createElement('div');
  frame.className = 'card-frame';
  frame.style.background = `linear-gradient(145deg, ${card.rarityColor}, rgba(0,0,0,0.6))`;

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  // header
  const hdr = document.createElement('div');
  hdr.className = 'card-header';
  hdr.style.background = `linear-gradient(90deg, rgba(0,0,0,0.6), ${card.rarityColor}22)`;
  const nameEl = document.createElement('span');
  nameEl.className = 'card-name'; nameEl.textContent = card.name;
  const dot = document.createElement('span');
  dot.className = 'card-rarity-dot'; dot.style.background = card.rarityColor;
  hdr.appendChild(nameEl); hdr.appendChild(dot);

  // art
  const artWrap = document.createElement('div');
  artWrap.className = 'card-art-wrap';
  const artCanvas = document.createElement('canvas');
  artCanvas.width = 112; artCanvas.height = 86;
  artWrap.appendChild(artCanvas);

  // type band
  const band = document.createElement('div');
  band.className = 'card-type-band';
  band.style.color = card.rarityColor;
  band.textContent = card.type;

  // description area
  const descArea = document.createElement('div');
  descArea.className = 'card-desc-area';
  const descEl = document.createElement('p');
  descEl.className = 'card-desc'; descEl.textContent = card.desc;
  const effectEl = document.createElement('p');
  effectEl.className = 'card-effect'; effectEl.textContent = card.effectLabel;
  descArea.appendChild(descEl); descArea.appendChild(effectEl);

  inner.appendChild(hdr);
  inner.appendChild(artWrap);
  inner.appendChild(band);
  inner.appendChild(descArea);
  frame.appendChild(inner);
  wrap.appendChild(frame);

  // draw art after inserted into DOM (canvas needs dimensions)
  requestAnimationFrame(() => {
    const ac = artCanvas.getContext('2d');
    card.drawArt(ac, artCanvas.width, artCanvas.height);
  });

  return wrap;
}

/* ── Populate the cards grid ── */
function _buildCardsGrid() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  grid.innerHTML = '';
  ALL_CARDS.forEach(card => grid.appendChild(_buildCard(card)));
}

/* ── Open / close ── */
function _openEquip() {
  document.getElementById('equip-overlay').classList.remove('hidden');
  _updateStatBar();
  _buildCardsGrid();
  _startCharAnim();
  document.addEventListener('keydown', _onEscClose);
}

function _closeEquip() {
  document.getElementById('equip-overlay').classList.add('hidden');
  _stopCharAnim();
  document.removeEventListener('keydown', _onEscClose);
}

function _onEscClose(e) {
  if (e.key === 'Escape') _closeEquip();
}

/* ── Init (called once DOM is ready) ── */
function initEquipment() {
  document.getElementById('equip-btn').addEventListener('click', _openEquip);
  document.getElementById('equip-close').addEventListener('click', _closeEquip);
  document.getElementById('equip-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('equip-overlay')) _closeEquip();
  });

  document.getElementById('anger-close').addEventListener('click', () => {
    // Teleport to Warlubie and reset anger
    player.x = CFG.SPAWN_X;
    player.y = CFG.SPAWN_Y;
    gameStats.zdenerwowanie = 0;
    _angerTriggered = false;
    _angerActive = false;
    _updateStatBar();
    document.getElementById('anger-overlay').classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', initEquipment);
