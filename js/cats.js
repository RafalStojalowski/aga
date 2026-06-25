'use strict';

/* ══════════════════════════════════════════════════════
   Cat Enclosure — typy, wygląd, rysowanie, menu, MARO
   ══════════════════════════════════════════════════════ */

const CAT_TYPES = [
  { id:'szary',   name:'Szary Puszek',      rarity:'Zwykły',     mult:1,   weight:30,  body:'#b4b4be', accent:'#888898', belly:'#e8e8f2', eye:'#7ec850', rc:'#a8a8b8' },
  { id:'rudy',    name:'Rudy Ogień',         rarity:'Zwykły',     mult:1,   weight:25,  body:'#df7130', accent:'#b84a14', belly:'#f5dec8', eye:'#f0b020', rc:'#c87030' },
  { id:'laciaty', name:'Łaciaty Kacperek',  rarity:'Niezwykły',  mult:2,   weight:15,  body:'#f0d8a0', accent:'#904020', belly:'#f8f0e8', eye:'#68b048', rc:'#40c840' },
  { id:'frak',    name:'Smurf w Fraku',     rarity:'Niezwykły',  mult:2,   weight:12,  body:'#1e1e1e', accent:'#000',    belly:'#f0f0f0', eye:'#38c878', rc:'#50c050' },
  { id:'perski',  name:'Perski Puffy',      rarity:'Rzadki',     mult:5,   weight:8,   body:'#f0e0c8', accent:'#d0b888', belly:'#fffaf0', eye:'#6090d0', rc:'#4870e0' },
  { id:'syjam',   name:'Syjamczyk Zen',     rarity:'Rzadki',     mult:5,   weight:5,   body:'#ece0cc', accent:'#5a3018', belly:'#f8f0e8', eye:'#2890e0', rc:'#3878d0' },
  { id:'coon',    name:'Maine Coon Magnus',  rarity:'Epicki',    mult:12,  weight:3,   body:'#8a6040', accent:'#604020', belly:'#c8a878', eye:'#dfa020', rc:'#c040e0' },
  { id:'fold',    name:'Folduś Zwisłouchy', rarity:'Epicki',    mult:12,  weight:1.5, body:'#d0c8b8', accent:'#a09080', belly:'#f0e8e0', eye:'#e08030', rc:'#b030d8' },
  { id:'zloty',   name:'Złoty Midas',       rarity:'LEGENDARNY', mult:30,  weight:0.4, body:'#f0c820', accent:'#c09010', belly:'#fffae0', eye:'#ff6020', rc:'#ff8c42' },
  { id:'teczowy', name:'Tęczowy Cud',       rarity:'LEGENDARNY', mult:30,  weight:0.1, body:'#ff80a0', accent:'#8040ff', belly:'#fff8ff', eye:'#ff40ff', rc:'#ff8c42' },
];

const CAT_COSTS = [100, 200, 500, 800, 1200];
const CAT_ENC   = { x: 350, y: 810, w: 700, h: 320 };

const _ACC_COLORS  = ['#ff5090','#40c8ff','#ffd030','#80e060','#c050ff','#ff8030','#30d8c0','#ff70b0','#70a0ff','#ff5060'];
const _ACCESSORIES = [null, null, null, 'collar','collar','bow','bow','flower','flower','hat','star'];
const _EXTRAS      = [null, null, 'speckles','speckles','blaze','blaze','hearts','hearts'];

const catState = {
  cats:         [],
  maroPoints:   0,
  menuCooldown: 0,
};

/* ── MARO ── */
function addMaro(amount) {
  catState.maroPoints = Math.max(0, catState.maroPoints + amount);
  const el = document.getElementById('maro-amount');
  if (el) el.textContent = catState.maroPoints;
}

/* ── appearance generator ── */
function _genAppearance() {
  return {
    acc:        _ACCESSORIES[Math.floor(Math.random() * _ACCESSORIES.length)],
    accColor:   _ACC_COLORS [Math.floor(Math.random() * _ACC_COLORS.length)],
    extra:      _EXTRAS     [Math.floor(Math.random() * _EXTRAS.length)],
    extraColor: _ACC_COLORS [Math.floor(Math.random() * _ACC_COLORS.length)],
  };
}

/* ── helpers ── */
function _catNextCost() {
  const n = catState.cats.length;
  return n < CAT_COSTS.length ? CAT_COSTS[n] : null;
}

function _rollCatType() {
  const total = CAT_TYPES.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of CAT_TYPES) { r -= t.weight; if (r <= 0) return t; }
  return CAT_TYPES[0];
}

function _addCatToEnclosure(type, appearance) {
  const app    = appearance || _genAppearance();
  const margin = 48;
  const row    = catState.cats.length;
  const px = CAT_ENC.x + margin + Math.random() * (CAT_ENC.w - margin * 2);
  const py = Math.min(
    CAT_ENC.y + 60 + (row % 3) * 72 + Math.random() * 24,
    CAT_ENC.y + CAT_ENC.h - 55
  );
  catState.cats.push({
    typeId:     type.id,
    appearance: app,
    _x: px, _y: py,
    _dir:      Math.random() < 0.5 ? 1 : -1,
    _mewTimer: Math.random() * 10 + 5,
    _mewAlpha: 0,
    patrolMin: CAT_ENC.x + margin,
    patrolMax: CAT_ENC.x + CAT_ENC.w - margin,
    speed:     28 + Math.random() * 28,
    stepAnim:  Math.random() * Math.PI * 2,
  });
  return app;
}

/* ── Buy / Feed ── */
function buyRollCat() {
  if (catState.cats.length >= 5) return;
  const cost = _catNextCost();
  if (!cost || gameStats.zlote < cost) { _showCatResult('Za mało złotych! 😿','#e06060'); return; }
  addZlote(-cost);
  const type = _rollCatType();
  const app  = _addCatToEnclosure(type);
  _updateCatMenu();
  showCatReveal(type, app);
}

function feedCats() {
  if (catState.cats.length === 0) { _showCatResult('Brak kotów do nakarmienia! 🍣','#a09080'); return; }
  if (gameStats.zlote < 100) { _showCatResult('Za mało złotych na karmę! 😿','#e06060'); return; }
  addZlote(-100);
  const earned = catState.cats.reduce((s, c) => {
    const t = CAT_TYPES.find(x => x.id === c.typeId) || CAT_TYPES[0];
    return s + t.mult * 10;
  }, 0);
  addMaro(earned);
  _showCatResult(`🐾 Koty najedzone i szczęśliwe!<br>+<b>${earned} MARO</b>`, '#f0c020');
  _updateCatMenu();
}

/* ── Cat reveal animation ── */
let _crRaf = null;

const _CR_HEADINGS = {
  'Zwykły':     'Wylosowano Kota!',
  'Niezwykły':  'Niezwykłe odkrycie!',
  'Rzadki':     '✨ Rzadki Okaz!',
  'Epicki':     '⚡ Epicki Łup!',
  'LEGENDARNY': '🌟 LEGENDARNY! 🌟',
};

function showCatReveal(type, app) {
  const overlay  = document.getElementById('cat-reveal-overlay');
  const cvs      = document.getElementById('cat-reveal-cvs');
  const glow     = document.getElementById('cat-reveal-glow');
  const heading  = document.getElementById('cat-reveal-heading');
  const nameEl   = document.getElementById('cat-reveal-name');
  const rarEl    = document.getElementById('cat-reveal-rarity');
  const multEl   = document.getElementById('cat-reveal-mult');
  const closeBtn = document.getElementById('cat-reveal-close');
  const ctx      = cvs.getContext('2d');

  /* reset */
  glow.classList.remove('visible');
  nameEl.classList.remove('visible');
  rarEl.classList.remove('visible');
  multEl.classList.remove('visible');
  closeBtn.classList.remove('visible');
  heading.textContent  = _CR_HEADINGS[type.rarity] || 'Wylosowano Kota!';
  heading.style.color  = type.rc;
  glow.style.background = `radial-gradient(circle, ${type.rc}70 0%, transparent 68%)`;
  nameEl.style.color   = type.rc;
  rarEl.style.color    = type.rc;
  if (_crRaf) { cancelAnimationFrame(_crRaf); _crRaf = null; }

  overlay.classList.remove('hidden');

  const spinStart  = performance.now();
  let lastChange   = spinStart;
  let curType      = CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)];
  let curApp       = _genAppearance();
  const SPIN_DUR   = 1400;

  function getInterval(elapsed) {
    if (elapsed < 800)  return 72;
    if (elapsed < 1100) return 140;
    if (elapsed < 1300) return 280;
    return Infinity;
  }

  function drawOnCvs(t, drawType, drawApp, scl) {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.save();
    ctx.translate(cvs.width / 2, cvs.height * 0.54);
    ctx.scale(scl, scl);
    drawCat(ctx, 0, 0, drawType, t / 500, 1, drawApp, true);
    ctx.restore();
  }

  function spin(now) {
    const elapsed = now - spinStart;
    if (elapsed < SPIN_DUR) {
      if (now - lastChange >= getInterval(elapsed)) {
        lastChange = now;
        curType = CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)];
        curApp  = _genAppearance();
      }
      drawOnCvs(now, curType, curApp, 2.5);
      _crRaf = requestAnimationFrame(spin);
    } else {
      /* ── reveal ── */
      let revStart = now;
      function revAnimate(t) {
        const rEl  = t - revStart;
        const scl  = 2.5 * (rEl < 280 ? 0.72 + 0.28 * Math.min(1, rEl / 280) : 1);
        drawOnCvs(t, type, app, scl);
        _crRaf = requestAnimationFrame(revAnimate);
      }
      _crRaf = requestAnimationFrame(revAnimate);
      glow.classList.add('visible');
      setTimeout(() => {
        nameEl.textContent = type.name;
        rarEl.textContent  = type.rarity;
        multEl.textContent = `Mnożnik MARO ×${type.mult} · karmienie +${type.mult * 10} MARO`;
        nameEl.classList.add('visible');
        rarEl.classList.add('visible');
        multEl.classList.add('visible');
        closeBtn.classList.add('visible');
      }, 280);
    }
  }
  _crRaf = requestAnimationFrame(spin);

  function onClose() {
    if (_crRaf) { cancelAnimationFrame(_crRaf); _crRaf = null; }
    overlay.classList.add('hidden');
    closeBtn.removeEventListener('click', onClose);
    _updateCatMenu();
  }
  closeBtn.addEventListener('click', onClose);
}

/* ════════════════════════════════════════════════════
   drawCat — rysuje kota na dowolnym canvas kontekście
   ════════════════════════════════════════════════════ */
function drawCat(ctx, cx, cy, type, stepAnim, dir, app, noLabel) {
  app = app || {};
  const bob = Math.sin(stepAnim) * 1.6;
  const r   = 11;
  const hr  = type.id === 'perski' ? r * 0.92 : r * 0.82;
  const br  = type.id === 'perski' ? r * 1.12 : r;
  const hx  = cx + (dir||1) * r * 0.28;
  const hy  = cy - r * 0.72 + bob;
  const td  = -(dir||1);
  const acc = app.acc || null;
  const ac  = app.accColor || '#ff6090';
  const ext = app.extra || null;
  const ec  = app.extraColor || '#a0a0a0';

  ctx.save();

  /* ── tail ── */
  ctx.strokeStyle = type.accent; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + td*r*0.75, cy+2+bob);
  ctx.bezierCurveTo(cx+td*r*2.2, cy+12+bob, cx+td*r*2.8, cy-7+bob, cx+td*r*1.2, cy-16+bob);
  ctx.stroke();

  /* ── shadow ── */
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(cx+2, cy+r+1, r*0.82, r*0.33, 0,0,Math.PI*2); ctx.fill();

  /* ── body ── */
  let bf = type.body;
  if (type.id === 'teczowy') {
    const rg = ctx.createLinearGradient(cx-br,cy,cx+br,cy);
    rg.addColorStop(0,'#ff7090'); rg.addColorStop(0.33,'#80e870');
    rg.addColorStop(0.66,'#7090ff'); rg.addColorStop(1,'#ff80ff');
    bf = rg;
  } else if (type.id === 'zloty') {
    const gg = ctx.createRadialGradient(cx-r*0.3,cy-r*0.3,0,cx,cy,br*1.1);
    gg.addColorStop(0,'#fffac0'); gg.addColorStop(0.5,'#f0c820'); gg.addColorStop(1,'#c09010');
    bf = gg;
  }
  ctx.fillStyle = bf;
  ctx.beginPath(); ctx.ellipse(cx, cy+bob, br, br*0.8, 0,0,Math.PI*2); ctx.fill();

  /* rudy tabby stripes */
  if (type.id === 'rudy') {
    ctx.strokeStyle = type.accent; ctx.lineWidth=1.5; ctx.globalAlpha=0.28;
    for (const sy of [-3,2,7]) {
      ctx.beginPath(); ctx.moveTo(cx-br+3,cy+sy+bob); ctx.lineTo(cx+br-3,cy+sy+bob); ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  /* laciaty spots */
  if (type.id === 'laciaty') {
    ctx.fillStyle = type.accent; ctx.globalAlpha=0.5;
    ctx.beginPath(); ctx.ellipse(cx-4,cy-2+bob,4,3,0.3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+5,cy+4+bob,3,2.5,-0.2,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }

  /* extra: speckles (on body) */
  if (ext === 'speckles') {
    ctx.fillStyle = ec; ctx.globalAlpha = 0.48;
    for (const [sx,sy] of [[-5,-4],[-1,1],[4,-3],[2,5],[-4,2],[3,-5],[-2,3],[5,3]])
      { ctx.beginPath(); ctx.arc(cx+sx,cy+sy+bob,1.5,0,Math.PI*2); ctx.fill(); }
    ctx.globalAlpha=1;
  }

  /* ── belly ── */
  ctx.fillStyle = type.belly;
  ctx.beginPath(); ctx.ellipse(cx,cy+2+bob,br*0.48,br*0.42,0,0,Math.PI*2); ctx.fill();

  /* ── head ── */
  ctx.fillStyle = bf;
  ctx.beginPath(); ctx.arc(hx,hy,hr,0,Math.PI*2); ctx.fill();

  /* syjam face mask */
  if (type.id === 'syjam') {
    ctx.fillStyle = type.accent; ctx.globalAlpha=0.42;
    ctx.beginPath(); ctx.ellipse(hx,hy+hr*0.12,hr*0.5,hr*0.38,0,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }

  /* ── ears ── */
  if (type.id === 'fold') {
    /* Scottish fold: low/bent ears */
    ctx.fillStyle = type.body;
    for (const sx of [-1,1]) {
      ctx.beginPath();
      ctx.moveTo(hx+sx*hr*0.5, hy-hr*0.44);
      ctx.lineTo(hx+sx*hr*0.68,hy-hr*0.56);
      ctx.lineTo(hx+sx*hr*0.16,hy-hr*0.48);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha=0.5; ctx.fillStyle=type.accent;
    for (const sx of [-1,1]) {
      ctx.beginPath();
      ctx.moveTo(hx+sx*hr*0.44,hy-hr*0.45);
      ctx.lineTo(hx+sx*hr*0.62,hy-hr*0.54);
      ctx.lineTo(hx+sx*hr*0.18,hy-hr*0.47);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha=1;
  } else {
    /* normal pointy ears */
    ctx.fillStyle = type.body;
    for (const sx of [-1,1]) {
      ctx.beginPath();
      ctx.moveTo(hx+sx*hr*0.44, hy-hr*0.5);
      ctx.lineTo(hx+sx*hr*0.88, hy-hr*1.28);
      ctx.lineTo(hx+sx*hr*0.08, hy-hr*0.9);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha=0.55; ctx.fillStyle=type.accent;
    for (const sx of [-1,1]) {
      ctx.beginPath();
      ctx.moveTo(hx+sx*hr*0.4, hy-hr*0.55);
      ctx.lineTo(hx+sx*hr*0.7, hy-hr*1.08);
      ctx.lineTo(hx+sx*hr*0.12,hy-hr*0.85);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  /* extra: blaze (white stripe on forehead) */
  if (ext === 'blaze') {
    ctx.fillStyle = 'rgba(255,255,255,0.52)';
    ctx.beginPath(); ctx.ellipse(hx,hy-hr*0.15,hr*0.18,hr*0.55,0,0,Math.PI*2); ctx.fill();
  }

  /* ── eyes ── */
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.ellipse(hx-hr*0.3,hy-hr*0.06,hr*0.27,hr*0.3,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx+hr*0.3,hy-hr*0.06,hr*0.27,hr*0.3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=type.eye;
  ctx.beginPath(); ctx.arc(hx-hr*0.3,hy-hr*0.06,hr*0.19,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx+hr*0.3,hy-hr*0.06,hr*0.19,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#111';
  ctx.beginPath(); ctx.arc(hx-hr*0.3,hy-hr*0.06,hr*0.11,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx+hr*0.3,hy-hr*0.06,hr*0.11,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(hx-hr*0.23,hy-hr*0.14,hr*0.07,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx+hr*0.36,hy-hr*0.14,hr*0.07,0,Math.PI*2); ctx.fill();

  /* ── nose ── */
  ctx.fillStyle='#e88898';
  ctx.beginPath();
  ctx.moveTo(hx,hy+hr*0.15); ctx.lineTo(hx-hr*0.1,hy+hr*0.27); ctx.lineTo(hx+hr*0.1,hy+hr*0.27);
  ctx.closePath(); ctx.fill();

  /* ── whiskers ── */
  ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=0.7; ctx.lineCap='round';
  for (const [x1,y1,x2,y2] of [
    [hx-hr*0.1,hy+hr*0.18,hx-hr*0.95,hy+hr*0.1],
    [hx-hr*0.1,hy+hr*0.24,hx-hr*0.95,hy+hr*0.3],
    [hx+hr*0.1,hy+hr*0.18,hx+hr*0.95,hy+hr*0.1],
    [hx+hr*0.1,hy+hr*0.24,hx+hr*0.95,hy+hr*0.3],
  ]) { ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }

  /* ── cheek blush ── */
  ctx.fillStyle='rgba(255,140,140,0.27)';
  ctx.beginPath(); ctx.ellipse(hx-hr*0.6,hy+hr*0.2,hr*0.22,hr*0.14,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx+hr*0.6,hy+hr*0.2,hr*0.22,hr*0.14,0,0,Math.PI*2); ctx.fill();

  /* extra: hearts on cheeks */
  if (ext === 'hearts') {
    ctx.fillStyle=ec; ctx.globalAlpha=0.62;
    ctx.font=`${hr*0.55}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('♥',hx-hr*0.64,hy+hr*0.22);
    ctx.fillText('♥',hx+hr*0.64,hy+hr*0.22);
    ctx.globalAlpha=1;
  }

  /* ══ ACCESSORIES ══ */
  if (acc === 'collar') {
    ctx.strokeStyle=ac; ctx.lineWidth=3.5; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(hx-hr*0.68,hy+hr*0.58);
    ctx.quadraticCurveTo(hx,hy+hr*0.76,hx+hr*0.68,hy+hr*0.58);
    ctx.stroke();
    /* tiny bell */
    ctx.fillStyle='#ffd700';
    ctx.beginPath(); ctx.arc(hx,hy+hr*0.86,2.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#c0a000'; ctx.lineWidth=0.6;
    ctx.beginPath(); ctx.arc(hx,hy+hr*0.86,2.5,0,Math.PI*2); ctx.stroke();
  } else if (acc === 'bow') {
    ctx.fillStyle=ac;
    /* left wing */
    ctx.beginPath();
    ctx.moveTo(hx,hy-hr*1.05);
    ctx.bezierCurveTo(hx-hr*0.88,hy-hr*1.22,hx-hr*0.62,hy-hr*1.7,hx,hy-hr*1.38);
    ctx.closePath(); ctx.fill();
    /* right wing */
    ctx.beginPath();
    ctx.moveTo(hx,hy-hr*1.05);
    ctx.bezierCurveTo(hx+hr*0.88,hy-hr*1.22,hx+hr*0.62,hy-hr*1.7,hx,hy-hr*1.38);
    ctx.closePath(); ctx.fill();
    /* knot */
    ctx.fillStyle='rgba(255,255,255,0.62)';
    ctx.beginPath(); ctx.ellipse(hx,hy-hr*1.22,hr*0.17,hr*0.14,0,0,Math.PI*2); ctx.fill();
  } else if (acc === 'flower') {
    const fx=hx+hr*0.82, fy=hy-hr*1.18;
    ctx.fillStyle=ac;
    for (let i=0;i<5;i++) {
      const a=(i/5)*Math.PI*2;
      ctx.beginPath();
      ctx.ellipse(fx+Math.cos(a)*hr*0.2,fy+Math.sin(a)*hr*0.2,hr*0.17,hr*0.1,a,0,Math.PI*2);
      ctx.fill();
    }
    ctx.fillStyle='#fff8a0';
    ctx.beginPath(); ctx.arc(fx,fy,hr*0.12,0,Math.PI*2); ctx.fill();
  } else if (acc === 'hat') {
    ctx.fillStyle=ac;
    /* brim */
    ctx.beginPath(); ctx.ellipse(hx,hy-hr*1.08,hr*0.68,hr*0.17,0,0,Math.PI*2); ctx.fill();
    /* crown */
    ctx.fillRect(hx-hr*0.42, hy-hr*1.92, hr*0.84, hr*0.84);
    /* highlight */
    ctx.fillStyle='rgba(255,255,255,0.18)';
    ctx.fillRect(hx-hr*0.3, hy-hr*1.85, hr*0.18, hr*0.62);
  } else if (acc === 'star') {
    const sx=hx, sy=hy-hr*0.35;
    ctx.fillStyle=ac;
    ctx.beginPath();
    for (let i=0;i<10;i++) {
      const a=(i*Math.PI/5)-Math.PI/2;
      const rv=i%2===0?hr*0.22:hr*0.1;
      if(i===0) ctx.moveTo(sx+Math.cos(a)*rv,sy+Math.sin(a)*rv);
      else ctx.lineTo(sx+Math.cos(a)*rv,sy+Math.sin(a)*rv);
    }
    ctx.closePath(); ctx.fill();
  }

  /* golden sparkles */
  if (type.id === 'zloty') {
    ctx.fillStyle='rgba(255,245,80,0.72)'; ctx.font='9px serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('✦',hx-r*1.0,hy-r*1.6);
    ctx.fillText('✦',hx+r*0.8, hy-r*1.3);
  }

  /* name label (disabled in portrait mode) */
  if (!noLabel) {
    ctx.font='bold 7px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillStyle=type.rc; ctx.shadowColor='#000'; ctx.shadowBlur=3;
    ctx.fillText(type.name, cx, cy+r+5+bob);
    ctx.shadowBlur=0;
  }

  ctx.restore();
}

/* ══════════════════════════════════════════════════════
   Portrait rendering (for menu)
   ══════════════════════════════════════════════════════ */
function _drawCatPortrait(ctx, w, h, catEntry) {
  const type = CAT_TYPES.find(t => t.id === catEntry.typeId) || CAT_TYPES[0];
  ctx.clearRect(0,0,w,h);
  /* subtle glow background */
  const bg = ctx.createRadialGradient(w/2,h*0.44,0,w/2,h*0.44,w*0.68);
  bg.addColorStop(0, type.body+'38'); bg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
  /* cat (pose: stepAnim=PI/5 gives slight bob, noLabel=true) */
  drawCat(ctx, w/2, h*0.52, type, Math.PI/5, 1, catEntry.appearance, true);
}

function _openCatDetail(cat) {
  let ov = document.getElementById('cat-detail-ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'cat-detail-ov';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:200;display:flex;align-items:center;justify-content:center';
    document.body.appendChild(ov);
  }
  ov.classList.remove('hidden');
  const type = CAT_TYPES.find(t => t.id === cat.typeId) || CAT_TYPES[0];

  const card = document.createElement('div');
  card.style.cssText = `background:#0d1015;border:2px solid ${type.rc};border-radius:18px;padding:26px 30px 22px;display:flex;flex-direction:column;align-items:center;gap:10px;max-width:240px;width:86%`;

  const cvs = document.createElement('canvas');
  cvs.width = 120; cvs.height = 150;
  cvs.style.cssText = `border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid ${type.rc}44`;

  const nameEl = document.createElement('div');
  nameEl.style.cssText = `font-size:16px;font-weight:700;color:${type.rc};text-align:center;margin-top:4px`;
  nameEl.textContent = type.name;

  const rarEl = document.createElement('div');
  rarEl.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.45);text-align:center';
  rarEl.textContent = `${type.rarity}  •  ×${type.mult} MARO`;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Zamknij';
  closeBtn.style.cssText = 'margin-top:8px;padding:9px 28px;background:#1a2040;border:1px solid rgba(255,255,255,0.14);border-radius:10px;color:#fff;font-size:13px;cursor:pointer;font-family:inherit';
  closeBtn.onclick = () => ov.classList.add('hidden');

  ov.innerHTML = '';
  card.append(cvs, nameEl, rarEl, closeBtn);
  ov.appendChild(card);
  ov.onclick = e => { if (e.target === ov) ov.classList.add('hidden'); };

  _drawCatPortrait(cvs.getContext('2d'), cvs.width, cvs.height, cat);
}

function _buildCatRoster(container) {
  container.innerHTML = '';
  if (catState.cats.length === 0) {
    container.style.cssText = 'padding:10px 18px 6px;min-height:36px;display:flex;align-items:center';
    container.innerHTML = '<span style="color:rgba(200,230,200,0.4);font-size:12px">Brak kotów • zbliż się do zagrody!</span>';
    return;
  }
  container.style.cssText = 'padding:10px 14px 8px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center';
  catState.cats.forEach((c, idx) => {
    const type = CAT_TYPES.find(t => t.id === c.typeId) || CAT_TYPES[0];
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;position:relative';

    const cvs = document.createElement('canvas');
    cvs.width=54; cvs.height=68;
    cvs.style.cssText = `border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid ${type.rc}55;cursor:pointer`;
    cvs.title = 'Kliknij aby zobaczyć z bliska';
    cvs.onclick = () => _openCatDetail(c);

    const nameEl = document.createElement('div');
    nameEl.style.cssText = `font-size:7.5px;color:${type.rc};font-weight:700;text-align:center;max-width:54px;line-height:1.2;cursor:pointer`;
    nameEl.textContent = type.name;
    nameEl.onclick = () => _openCatDetail(c);

    const rarEl = document.createElement('div');
    rarEl.style.cssText = 'font-size:6.5px;color:rgba(255,255,255,0.3);text-align:center';
    rarEl.textContent = type.rarity;

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.title = 'Usuń kota';
    delBtn.style.cssText = 'position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:rgba(200,40,40,0.85);border:none;color:#fff;font-size:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;line-height:1';
    delBtn.onclick = e => {
      e.stopPropagation();
      if (!confirm(`Usunąć kota ${type.name}?`)) return;
      catState.cats.splice(idx, 1);
      _updateCatMenu();
    };

    wrap.appendChild(cvs); wrap.appendChild(nameEl); wrap.appendChild(rarEl); wrap.appendChild(delBtn);
    container.appendChild(wrap);

    _drawCatPortrait(cvs.getContext('2d'), cvs.width, cvs.height, c);
  });
}

/* ══════════════════════════════════════════════════════
   Menu UI
   ══════════════════════════════════════════════════════ */
let _catMenuOpen = false;

function isCatMenuOpen() { return _catMenuOpen; }

function openCatMenu() {
  if (_catMenuOpen) return;
  _catMenuOpen = true;
  document.getElementById('cat-result').innerHTML = '';
  _updateCatMenu();
  document.getElementById('cat-overlay').classList.remove('hidden');
  document.addEventListener('keydown', _catEscClose);
}

function closeCatMenu() {
  _catMenuOpen = false;
  catState.menuCooldown = 10;
  document.getElementById('cat-overlay').classList.add('hidden');
  document.removeEventListener('keydown', _catEscClose);
}

function _catEscClose(e) { if (e.key === 'Escape') closeCatMenu(); }

function _showCatResult(html, color) {
  const el = document.getElementById('cat-result');
  if (!el) return;
  el.innerHTML = html; el.style.color = color || '#fff';
}

function _updateCatMenu() {
  const n    = catState.cats.length;
  const cost = _catNextCost();

  const statusEl = document.getElementById('cat-status');
  if (statusEl) _buildCatRoster(statusEl);

  const maroEl = document.getElementById('cat-maro-disp');
  if (maroEl) maroEl.textContent = catState.maroPoints;
  const moneyEl = document.getElementById('cat-money-disp');
  if (moneyEl) moneyEl.textContent = gameStats.zlote;

  const rollBtn = document.getElementById('cat-roll-btn');
  if (rollBtn) {
    rollBtn.disabled = n >= 5 || gameStats.zlote < (cost || Infinity);
    rollBtn.textContent = n >= 5 ? '🐱 Zagroda pełna!' : `🎲 Losuj Kota — ${cost} zł`;
  }

  const feedBtn = document.getElementById('cat-feed-btn');
  if (feedBtn) {
    const maroPer = catState.cats.reduce((s,c) => {
      const t = CAT_TYPES.find(x=>x.id===c.typeId)||CAT_TYPES[0];
      return s + t.mult*10;
    }, 0);
    feedBtn.disabled = n === 0 || gameStats.zlote < 100;
    feedBtn.textContent = n > 0
      ? `🍣 Nakarm Koty — 100 zł  (+${maroPer} MARO)`
      : '🍣 Nakarm Koty — 100 zł';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cat-close').addEventListener('click', closeCatMenu);
  document.getElementById('cat-roll-btn').addEventListener('click', buyRollCat);
  document.getElementById('cat-feed-btn').addEventListener('click', feedCats);
  document.getElementById('cat-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('cat-overlay')) closeCatMenu();
  });
  const el = document.getElementById('maro-amount');
  if (el) el.textContent = catState.maroPoints;
});
