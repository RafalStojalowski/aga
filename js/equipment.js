'use strict';

/* ── Global game stats ── */
const gameStats = {
  zdenerwowanie: 0,    // 0 = spokojna (bar pełny), 100 = wróciła do domu
  zlote: 0,
};

function addZlote(amount) {
  gameStats.zlote += amount;
  const el = document.getElementById('money-amount');
  if (el) el.textContent = gameStats.zlote;
}

let _angerTriggered = false;

/* ── Zdenerwowanie bar above player head ── */
let _zdBarTimer = 0;

function triggerZdBar()    { _zdBarTimer = 10; }
function tickZdBar(dt)     { _zdBarTimer = Math.max(0, _zdBarTimer - dt / 1000); }

function drawPlayerZdBarOverlay(ctx, px, py) {
  if (_zdBarTimer <= 0) return;
  const alpha = Math.min(1, _zdBarTimer / 1.5);
  const v  = gameStats.zdenerwowanie;
  const bw = 30, bh = 4;
  const bx = px - bw / 2, by = py - 41;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = _statColor(v);
  ctx.fillRect(bx, by, bw * (1 - v / 100), bh);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.restore();
}

/* ══════════════════════════════════════════════════════
   Efekty trafienia — rysowane w world-space przez każdą submapę
   ══════════════════════════════════════════════════════ */
const _hitFX = [];
let   _pAttFX = null; /* { t0, px, py } */

function spawnHitEffect(enX, enY, dmg) {
  _hitFX.push({ x: enX, y: enY, t0: performance.now(), dmg });
  _pAttFX = { t0: performance.now(), px: player.x, py: player.y };
}

function drawHitFX(ctx) {
  const now = performance.now();

  /* łuk ataku przy graczu */
  if (_pAttFX) {
    const t = (now - _pAttFX.t0) / 360;
    if (t < 1) {
      const a = 1 - t;
      ctx.save();
      ctx.lineCap = 'round';
      /* zewnętrzny łuk żółty */
      ctx.strokeStyle = `rgba(255,220,50,${a * 0.88})`;
      ctx.lineWidth = 4 - t * 2.5;
      ctx.beginPath();
      ctx.arc(_pAttFX.px, _pAttFX.py, 20 + t * 14, -Math.PI * 0.75, Math.PI * 0.35);
      ctx.stroke();
      /* wewnętrzny łuk biały */
      ctx.strokeStyle = `rgba(255,255,200,${a * 0.45})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(_pAttFX.px, _pAttFX.py, 14 + t * 10, -Math.PI * 0.55, Math.PI * 0.2);
      ctx.stroke();
      ctx.restore();
    } else {
      _pAttFX = null;
    }
  }

  /* efekty przy wrogu */
  for (let i = _hitFX.length - 1; i >= 0; i--) {
    const h = _hitFX[i];
    const t = (now - h.t0) / 850;
    if (t >= 1) { _hitFX.splice(i, 1); continue; }
    const alpha = 1 - t;
    const ey = h.y - 8;

    ctx.save();

    /* pierścień uderzenia */
    ctx.strokeStyle = `rgba(255,215,40,${alpha * 0.9})`;
    ctx.lineWidth = Math.max(0.5, 3.5 * (1 - t));
    ctx.beginPath(); ctx.arc(h.x, ey, 10 + t * 28, 0, Math.PI * 2); ctx.stroke();

    /* rozbłysk w centrum (pierwsze 0.28s) */
    if (t < 0.28) {
      const fi = 1 - t / 0.28;
      ctx.fillStyle = `rgba(255,255,200,${fi * 0.5})`;
      ctx.beginPath(); ctx.arc(h.x, ey, fi * 16, 0, Math.PI * 2); ctx.fill();
    }

    /* iskry radialne */
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2 + t * 4.5;
      const r2 = t * 24;
      ctx.fillStyle = `rgba(255,${185 + k * 8},40,${alpha * 0.92})`;
      ctx.beginPath();
      ctx.arc(h.x + Math.cos(ang) * r2, ey + Math.sin(ang) * r2, Math.max(0.5, 3 * (1 - t)), 0, Math.PI * 2);
      ctx.fill();
    }

    /* unosząca się liczba obrażeń */
    const floatY = ey - 12 - t * 36;
    ctx.font = `bold 13px "Segoe UI",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 5;
    ctx.fillStyle = `rgba(255,215,30,${alpha})`;
    ctx.fillText(`-${h.dmg}`, h.x, floatY);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

/* ── Apply zdenerwowanie change (call this from events/cards) ── */
function applyZdenerwowanie(delta) {
  const minZd = typeof aceMinZd === 'function' ? aceMinZd() : 0;
  const maxZd = typeof aceMaxZd === 'function' ? aceMaxZd() : 100;
  gameStats.zdenerwowanie = Math.max(minZd, Math.min(maxZd, gameStats.zdenerwowanie + delta));
  _updateStatBar();
  if (delta !== 0) triggerZdBar();
  if (gameStats.zdenerwowanie >= maxZd && !_angerTriggered) {
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

  /* ── Karty Wspomnień z Torunia (Quest 2) ── */
  {
    id: 'torun_domki',
    name: 'Domki z wyjazdu kkisowego',
    type: 'Wspomnienie',
    rarity: 'gold',
    rarityColor: '#f5c842',
    effectLabel: 'Wspomnienie z Torunia',
    desc: 'Rafał za dużo wypił i położył się na Agacie.',
    drawArt(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#050614'); g.addColorStop(1, '#12102a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // gwiazdy
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (const [sx, sy, sr] of [[22,12,1],[60,22,1.2],[102,8,0.9],[138,30,1.1],[28,42,0.8],[84,52,1],[118,18,0.9]]) {
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI*2); ctx.fill();
      }
      // sylwetki domków
      ctx.fillStyle = '#1e1218';
      for (let i = 0; i < 4; i++) {
        const hx = 8 + i*42, hW = 34, hH = 52;
        ctx.fillRect(hx, h*0.5 - hH, hW, hH);
        ctx.beginPath(); ctx.moveTo(hx-4, h*0.5-hH); ctx.lineTo(hx+hW/2, h*0.5-hH-24); ctx.lineTo(hx+hW+4, h*0.5-hH); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,200,80,0.22)'; ctx.fillRect(hx+8, h*0.5-hH+14, 12, 14); // okno ze światłem
        ctx.fillStyle = '#1e1218';
      }
      // trawa
      ctx.fillStyle = '#1e2a16'; ctx.fillRect(0, h*0.5, w, h*0.5);
      // Agata siedzi (lewa)
      const ax = w*0.38, ay = h*0.72;
      ctx.fillStyle = '#cc2244'; ctx.beginPath(); ctx.ellipse(ax, ay, 12, 15, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.arc(ax, ay-20, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#5a1808'; ctx.beginPath(); ctx.arc(ax, ay-22, 8.5, Math.PI, Math.PI*2); ctx.fill();
      // Rafał leży na Agacie
      const rx = w*0.5, ry = h*0.66;
      ctx.fillStyle = '#1e3a5a';
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(0.45);
      ctx.beginPath(); ctx.ellipse(0, 0, 24, 11, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.arc(rx+20, ry-6, 9, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(rx+20, ry-8, 9.5, Math.PI, Math.PI*2); ctx.fill();
      // butelka
      ctx.fillStyle = '#3a7830'; ctx.fillRect(ax-30, ry+10, 7, 20);
      ctx.beginPath(); ctx.arc(ax-26, ry+9, 3.5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(ax-29, ry+12, 2, 10);
      // serduszka
      ctx.font = '14px serif'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,100,140,0.7)'; ctx.fillText('♥', ax-5, ay-50);
      ctx.fillStyle = 'rgba(255,100,140,0.4)'; ctx.font = '10px serif'; ctx.fillText('♥', ax+18, ay-60);
    },
  },
  {
    id: 'torun_kfc',
    name: 'Pierwsze KFC razem',
    type: 'Wspomnienie',
    rarity: 'silver',
    rarityColor: '#c0c0d8',
    effectLabel: 'Wspomnienie z Torunia',
    desc: 'Agata była pierwszy raz zirytowana i dostała loda od Rafała.',
    drawArt(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#7a0606'); g.addColorStop(1, '#280606');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // logo KFC
      ctx.fillStyle = '#f5c000';
      ctx.beginPath(); ctx.moveTo(w/2-18, h*0.12); ctx.lineTo(w/2+18, h*0.12); ctx.lineTo(w/2+14, h*0.28); ctx.lineTo(w/2-14, h*0.28); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#cc1008'; ctx.font = 'bold 11px "Segoe UI",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('KFC', w/2, h*0.19);
      // stół
      ctx.fillStyle = '#4a2808'; ctx.fillRect(w*0.08, h*0.68, w*0.84, 7);
      // Agata zirytowana (lewa)
      const ax = w*0.28, ay = h*0.66;
      ctx.fillStyle = '#cc2244'; ctx.beginPath(); ctx.ellipse(ax, ay, 10, 13, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.arc(ax, ay-19, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#5a1808'; ctx.beginPath(); ctx.arc(ax, ay-21, 8.5, Math.PI, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#4a2800'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax-6, ay-25); ctx.lineTo(ax-2, ay-22); ctx.stroke(); // brew lewa
      ctx.beginPath(); ctx.moveTo(ax+6, ay-25); ctx.lineTo(ax+2, ay-22); ctx.stroke(); // brew prawa
      ctx.beginPath(); ctx.arc(ax, ay-15, 3, Math.PI*0.15, Math.PI*0.85, true); ctx.stroke(); // usta grymasy
      // Rafał (prawa) wyciąga loda
      const rx = w*0.72, ry = h*0.66;
      ctx.fillStyle = '#1e3a5a'; ctx.beginPath(); ctx.ellipse(rx, ry, 10, 13, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.arc(rx, ry-19, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(rx, ry-21, 8.5, Math.PI, Math.PI*2); ctx.fill();
      // ramię i lód
      ctx.strokeStyle = '#f0c8a0'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(rx-10, ry-10); ctx.quadraticCurveTo(rx-20, ry-24, ax+14, ry-28); ctx.stroke();
      // rożek
      ctx.fillStyle = '#c49050';
      ctx.beginPath(); ctx.moveTo(ax+9, ry-24); ctx.lineTo(ax+18, ry-24); ctx.lineTo(ax+13, ry-13); ctx.closePath(); ctx.fill();
      // gałka
      ctx.fillStyle = '#ff88bb'; ctx.beginPath(); ctx.arc(ax+13, ry-30, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff60aa'; ctx.beginPath(); ctx.arc(ax+10, ry-34, 4.5, 0, Math.PI*2); ctx.fill();
    },
  },
  {
    id: 'torun_schodki',
    name: 'Schodki nad Wisłą',
    type: 'Wspomnienie',
    rarity: 'rare',
    rarityColor: '#7b68ee',
    effectLabel: 'Wspomnienie z Torunia',
    desc: 'To w tym miejscu była puszczana playlista do słuchania na głośniku z głośnika.',
    drawArt(ctx, w, h) {
      // zachód słońca nad Wisłą
      const sky = ctx.createLinearGradient(0, 0, 0, h*0.52);
      sky.addColorStop(0, '#18083a'); sky.addColorStop(0.45, '#c03808'); sky.addColorStop(1, '#f07828');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h*0.52);
      // słońce
      const sg = ctx.createRadialGradient(w/2, h*0.5, 0, w/2, h*0.5, 20);
      sg.addColorStop(0, '#fff8b0'); sg.addColorStop(0.4, '#ffcc00'); sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(w/2, h*0.5, 20, 0, Math.PI*2); ctx.fill();
      // rzeka
      const rv = ctx.createLinearGradient(0, h*0.52, 0, h*0.7);
      rv.addColorStop(0, '#0e3870'); rv.addColorStop(1, '#08204a');
      ctx.fillStyle = rv; ctx.fillRect(0, h*0.52, w, h*0.18);
      // odbicie
      ctx.fillStyle = 'rgba(240,120,40,0.22)'; ctx.fillRect(w*0.37, h*0.52, w*0.26, h*0.18);
      // schodki
      for (let i = 0; i < 4; i++) {
        const sw = w*0.88 - i*14, sx = w*0.06 + i*7, sy = h*0.7 + i*11;
        const lv = 165 - i*14;
        ctx.fillStyle = `rgb(${lv},${lv+4},${lv-4})`; ctx.fillRect(sx, sy, sw, 11);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.8; ctx.strokeRect(sx, sy, sw, 11);
      }
      ctx.fillStyle = '#5a6865'; ctx.fillRect(0, h*0.7+44, w, h*0.3-44);
      // głośnik
      const spx = w*0.56, spy = h*0.76;
      ctx.fillStyle = '#222'; ctx.fillRect(spx-15, spy-22, 30, 28);
      ctx.fillStyle = '#3a3a3a'; ctx.beginPath(); ctx.arc(spx, spy-9, 9, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(spx, spy-9, 5.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#484848'; ctx.fillRect(spx-13, spy+4, 26, 4);
      // nuty
      ctx.fillStyle = '#ffcc70'; ctx.font = '15px serif'; ctx.textAlign = 'center';
      ctx.fillText('♪', spx+22, spy-30);
      ctx.fillStyle = 'rgba(255,200,90,0.65)'; ctx.font = '10px serif';
      ctx.fillText('♫', spx+34, spy-18);
      ctx.fillText('♩', spx+14, spy-44);
    },
  },
];

/* ── Player card collection ── */
let playerCards = [];

function hasCard(id)         { return playerCards.includes(id); }
function collectCard(id)     { if (!hasCard(id)) playerCards.push(id); }
function getAvailableCards() { return ALL_CARDS.filter(c => !hasCard(c.id)); }

const _RARITY_W = { legendary: 5, gold: 20, rare: 25, silver: 35, common: 50 };

function rollCard() {
  const avail = getAvailableCards();
  if (!avail.length) return null;
  const total = avail.reduce((s, c) => s + (_RARITY_W[c.rarity] ?? 20), 0);
  let r = Math.random() * total;
  for (const card of avail) {
    r -= _RARITY_W[card.rarity] ?? 20;
    if (r <= 0) return card;
  }
  return avail[avail.length - 1];
}

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
  num.textContent = Math.round(v);
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

/* ── Mystery card placeholder ── */
function _buildMysteryCard() {
  const wrap = document.createElement('div');
  wrap.className = 'card card-mystery';
  const frame = document.createElement('div');
  frame.className = 'card-frame';
  frame.style.background = 'linear-gradient(145deg,#0a1030,#060c20)';
  const inner = document.createElement('div');
  inner.className = 'card-inner';
  inner.innerHTML = '<div class="mystery-q">?</div><div class="mystery-label">Nieodkryta</div>';
  frame.appendChild(inner); wrap.appendChild(frame);
  return wrap;
}

/* ── Populate the cards grid ── */
function _buildCardsGrid() {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  grid.innerHTML = '';
  ALL_CARDS.forEach(card => grid.appendChild(hasCard(card.id) ? _buildCard(card) : _buildMysteryCard()));
}

/* ── Card back canvas (ocean / compass design) ── */
function _drawCardBack(cv) {
  const c = cv.getContext('2d'), w = cv.width, h = cv.height;
  const bg = c.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#020916'); bg.addColorStop(0.5, '#061428'); bg.addColorStop(1, '#04081c');
  c.fillStyle = bg; c.fillRect(0, 0, w, h);
  const gl = c.createRadialGradient(w/2, h/2, 0, w/2, h/2, h*0.48);
  gl.addColorStop(0, 'rgba(15,70,180,0.4)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = gl; c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(20,100,200,0.2)'; c.lineWidth = 1; c.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const wy = h * 0.1 + i * h * 0.082;
    c.beginPath(); c.moveTo(6, wy);
    for (let x = 0; x <= w - 12; x += 5) c.lineTo(6 + x, wy + Math.sin(x / 11 + i * 0.9) * 4);
    c.stroke();
  }
  c.save(); c.translate(w / 2, h / 2);
  c.strokeStyle = 'rgba(50,130,240,0.5)'; c.lineWidth = 1.3;
  c.beginPath(); c.arc(0, 0, 34, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.arc(0, 0, 28, 0, Math.PI * 2); c.stroke();
  c.fillStyle = 'rgba(90,170,255,0.82)';
  for (const [dx, dy] of [[0,-34],[34,0],[0,34],[-34,0]]) {
    const a = Math.atan2(dy, dx) + Math.PI / 2;
    c.save(); c.translate(dx, dy); c.rotate(a);
    c.beginPath(); c.moveTo(0,-7); c.lineTo(-5,0); c.lineTo(0,4); c.lineTo(5,0); c.closePath(); c.fill();
    c.restore();
  }
  const cg = c.createRadialGradient(0, 0, 0, 0, 0, 8);
  cg.addColorStop(0, 'rgba(200,230,255,0.95)'); cg.addColorStop(1, 'rgba(20,70,200,0.05)');
  c.fillStyle = cg; c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fill();
  c.restore();
  c.strokeStyle = 'rgba(25,80,170,0.45)'; c.lineWidth = 1.5;
  c.strokeRect(5, 5, w - 10, h - 10);
  c.strokeStyle = 'rgba(25,80,170,0.18)'; c.lineWidth = 0.7;
  c.strokeRect(9, 9, w - 18, h - 18);
  c.font = 'bold 7px "Segoe UI",sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'bottom';
  c.fillStyle = 'rgba(50,130,220,0.55)'; c.fillText('2 LATA RAZEM', w / 2, h - 10);
}

/* ── Card reveal animation ── */
function showCardReveal(card, onCollect) {
  const overlay  = document.getElementById('card-reveal-overlay');
  const flipper  = document.getElementById('card-reveal-flipper');
  const backCv   = document.getElementById('card-back-cvs');
  const content  = document.getElementById('card-reveal-content');
  const label    = document.getElementById('card-reveal-label');
  const closeBtn = document.getElementById('card-reveal-close');

  flipper.classList.remove('appeared', 'flipped');
  label.classList.remove('visible');
  closeBtn.classList.remove('visible');
  label.textContent = card.name;

  _drawCardBack(backCv);
  content.innerHTML = '';
  content.appendChild(_buildCard(card));
  overlay.classList.remove('hidden');

  setTimeout(() => flipper.classList.add('appeared'), 80);
  setTimeout(() => flipper.classList.add('flipped'), 1300);
  setTimeout(() => {
    label.classList.add('visible');
    closeBtn.classList.add('visible');
  }, 2350);

  function onClose() {
    collectCard(card.id);
    if (typeof onCollect === 'function') onCollect();
    overlay.classList.add('hidden');
    closeBtn.removeEventListener('click', onClose);
    const eq = document.getElementById('equip-overlay');
    if (eq && !eq.classList.contains('hidden')) _buildCardsGrid();
  }
  closeBtn.addEventListener('click', onClose);
}

/* callback set by Q8 in hel.js — called once after a successful card draw */
let _cypelDrawHook = null;

/* ── Cypel Helski draw menu ── */
function openCypelMenu() {
  const overlay  = document.getElementById('cypel-overlay');
  const maroDsp  = document.getElementById('cypel-maro-disp');
  const cardsCnt = document.getElementById('cypel-cards-cnt');
  const drawBtn  = document.getElementById('cypel-draw-btn');
  const result   = document.getElementById('cypel-result');

  maroDsp.textContent  = catState.maroPoints;
  cardsCnt.textContent = playerCards.length;
  result.textContent   = '';

  const avail = getAvailableCards();
  if (!avail.length) {
    drawBtn.disabled = true;
    result.textContent = '🎴 Masz już wszystkie Karty Wspomnień!';
  } else if (catState.maroPoints < 200) {
    drawBtn.disabled = true;
    result.textContent = `Potrzebujesz 200 MARO (masz ${catState.maroPoints})`;
  } else {
    drawBtn.disabled = false;
  }

  overlay.classList.remove('hidden');
}

/* ── Open / close ── */
function _openEquip() {
  document.getElementById('equip-overlay').classList.remove('hidden');
  _updateStatBar();
  _buildCardsGrid();
  if (typeof _acRefreshEquipPanel === 'function') _acRefreshEquipPanel();
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
    forceExitToWorld(CFG.SPAWN_X, CFG.SPAWN_Y);
    gameStats.zdenerwowanie = 90;
    _angerTriggered = false;
    _angerActive = false;
    _updateStatBar();
    document.getElementById('anger-overlay').classList.add('hidden');
  });

  /* cypel card draw menu */
  document.getElementById('cypel-close').addEventListener('click', () => {
    document.getElementById('cypel-overlay').classList.add('hidden');
  });
  document.getElementById('cypel-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('cypel-overlay'))
      document.getElementById('cypel-overlay').classList.add('hidden');
  });
  document.getElementById('cypel-draw-btn').addEventListener('click', () => {
    const avail = getAvailableCards();
    if (!avail.length || catState.maroPoints < 200) return;
    const card = rollCard();
    if (!card) return;
    addMaro(-200);
    document.getElementById('cypel-overlay').classList.add('hidden');
    const hook = typeof _cypelDrawHook === 'function' ? _cypelDrawHook : null;
    _cypelDrawHook = null;
    setTimeout(() => showCardReveal(card, hook), 80);
  });
}

document.addEventListener('DOMContentLoaded', initEquipment);
