'use strict';

/* ══════════════════════════════════════════════════════
   Gdańsk — submap 4000 × 1900
   Zaspa/Przymorze przesunięte w lewo, reszta +600
   ══════════════════════════════════════════════════════ */

const _GDN_COAST = [
  {x:1480,y:0},   {x:1560,y:72},  {x:1662,y:148},
  {x:1802,y:232}, {x:1962,y:305}, {x:2122,y:368},
  {x:2302,y:402}, {x:2472,y:415}, {x:2642,y:402},
  {x:2802,y:358}, {x:2962,y:288}, {x:3122,y:208},
  {x:3302,y:138}, {x:3482,y:83},  {x:3682,y:44},
  {x:3882,y:18},  {x:4000,y:0},
];

const _GDN_PARK = [
  {x:0,y:0},{x:420,y:0},{x:500,y:175},{x:502,y:442},
  {x:502,y:742},{x:498,y:1042},{x:482,y:1342},
  {x:448,y:1642},{x:358,y:1900},{x:0,y:1900},
];

const _GDN = {
  ergo:0, molo:0, pge:0, wiadukt:0, galBalt:0,
  polit:0, collegia:0, forum:0, akademia:0, armata:0, przymorze:0,
};

/* ═══════════════════════════════════════════════════════════
   Gdańsk Quest System — Q4 (Beer Race), Q5 (Dark Nav), Q6 (Race)
   ═══════════════════════════════════════════════════════════ */
let _GDN_Q11_ENTRY = false; // one-time trigger per submap visit for Q11

/* Rafał companion in Gdańsk (Q10 follow) */
const _GDN_RAFAL = { x: 1200, y: 960, active: false };

/* Q13 — Molo w Brzeźnie / Giga Turbo Agnieszka */
const _GDN_Q13 = { state: 'inactive', trigCD: 0 };

const _GDN_QUEST = {
  state: 'inactive',
  // inactive → q4_ready → q4_intro → q4_play → q4_done
  // → q5_intro → q5_play → q5_sleep → q5_sleeping → q6_ready
  // → q6_intro → q6_run → q6_win / q6_retry → q6_done
  // → q7_ready → q7_intro → q7_play → q7_won → q7_shopping → q7_done
  // (after Q8 in hel) → q9_ready → q9_scene → q9_done
  nextState: null,
  q6Timer: 0,
  sleepTimer: 0,
};

/* ── Przymorzanie (very strong enemies in Przymorze) ── */
const _PRZYM_SPAWNS = [
  {x:545, y:620},{x:650, y:740},{x:720, y:580},{x:580, y:890},{x:700, y:960},
  {x:480, y:830},{x:610, y:680},{x:740, y:820},
];
const _PRZYM_ST = { enemies: [], spawned: false, playerAttTimer: 0, playerHitFlash: 0 };

function _spawnPrzymorzanie() {
  _PRZYM_ST.enemies = _PRZYM_SPAWNS.map((pos, i) => ({
    id: i, _x: pos.x, _y: pos.y, hp: 200, maxHp: 200,
    alive: true, speed: 60, stepAnim: 0, _dir: 1,
    aiState: 'patrol', attackTimer: 0, hitFlash: 0,
    patrolTimer: i * 0.5,
    patrolDX: Math.cos(i * 1.4), patrolDY: Math.sin(i * 1.4),
    respawnTimer: 0,
  }));
}

/* ── helpers ── */
function _gqNext(s) { _GDN_QUEST.nextState = s; }

function _showBlackout(on) {
  const el = document.getElementById('gdn-blackout');
  if (!el) return;
  el.style.opacity      = on ? '1' : '0';
  el.style.pointerEvents = on ? 'all' : 'none';
}

/* ══════════════════════════════════════════════════════
   Q4 — Beer Race minigame
   ══════════════════════════════════════════════════════ */
const _BEER = {
  active: false, pFill: 100, opFill: 100, timer: 0,
  state: 'playing', prevTs: 0, onWin: null, onLose: null,
};

function _openBeerRace(onWin, onLose) {
  Object.assign(_BEER, {
    active: true, pFill: 100, opFill: 100, timer: 14,
    state: 'playing', prevTs: performance.now(), onWin, onLose,
  });
  document.getElementById('beer-race-overlay').classList.remove('hidden');
  document.getElementById('beer-race-result').classList.add('hidden');
  document.getElementById('beer-race-close').classList.add('hidden');
  requestAnimationFrame(_beerLoop);
}

function _closeBeerRace() {
  _BEER.active = false;
  document.getElementById('beer-race-overlay').classList.add('hidden');
}

function _beerTap() {
  if (_BEER.state !== 'playing') return;
  _BEER.pFill = Math.max(0, _BEER.pFill - 1);
  if (_BEER.pFill <= 0) _beerEnd('won');
}

function _beerEnd(r) {
  _BEER.state = r;
  const res = document.getElementById('beer-race-result');
  const btn = document.getElementById('beer-race-close');
  res.textContent = r === 'won' ? '🏆 WYGRAŁAŚ! 🍺' : '😢 PRZEGRAŁAŚ...';
  res.style.color = r === 'won' ? '#ffe060' : '#ff6060';
  res.classList.remove('hidden');
  btn.classList.remove('hidden');
  btn.onclick = () => {
    _closeBeerRace();
    if (r === 'won' && _BEER.onWin)  _BEER.onWin();
    if (r !== 'won' && _BEER.onLose) _BEER.onLose();
  };
}

function _beerLoop(ts) {
  if (!_BEER.active) return;
  const dt = Math.min((ts - _BEER.prevTs) / 1000, 0.05);
  _BEER.prevTs = ts;
  if (_BEER.state === 'playing') {
    _BEER.timer  -= dt;
    _BEER.opFill  = Math.max(0, _BEER.opFill - 6.5 * dt);
    if (_BEER.opFill <= 0)                          _beerEnd('lost');
    else if (_BEER.timer <= 0) _beerEnd(_BEER.pFill <= _BEER.opFill ? 'won' : 'lost');
  }
  _beerDraw();
  if (_BEER.active) requestAnimationFrame(_beerLoop);
}

function _beerDraw() {
  const cv = document.getElementById('beer-race-cvs');
  if (!cv) return;
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  // Bar background
  c.fillStyle = '#120a02'; c.fillRect(0, 0, W, H);
  c.fillStyle = '#1e1006'; c.fillRect(0, 0, W, H * 0.62);
  c.fillStyle = '#3a2008'; c.fillRect(0, H * 0.12, W, 6);
  for (let bx = 24; bx < W - 16; bx += 30) {
    const bc = ['#162808','#101828','#2a1008','#2a2808'][Math.floor(bx / 30) % 4];
    c.fillStyle = bc; c.fillRect(bx, H * 0.04, 8, H * 0.1);
    c.fillRect(bx + 1, H * 0.02, 6, H * 0.04);
  }
  // bar counter
  c.fillStyle = '#2e1a06'; c.fillRect(40, H * 0.64, W - 80, 26);
  c.fillStyle = '#4a2e10'; c.fillRect(40, H * 0.64, W - 80, 5);

  const mugLX = W * 0.27, mugRX = W * 0.73, mugY = H * 0.58;

  const drawMug = (cx, fill, label, isP) => {
    const mW = 44, mH = 68;
    const mx = cx - mW / 2, my = mugY - mH;
    // empty glass
    c.fillStyle = 'rgba(160,215,245,0.1)'; c.fillRect(mx, my, mW, mH);
    // beer fill
    const fH = (fill / 100) * mH;
    if (fH > 1) {
      const fg = c.createLinearGradient(mx, my + mH - fH, mx, my + mH);
      fg.addColorStop(0, '#f0d850'); fg.addColorStop(1, '#a05810');
      c.fillStyle = fg; c.fillRect(mx + 2, my + mH - fH + 2, mW - 4, fH - 2);
    }
    // foam
    if (fill > 3) {
      c.fillStyle = 'rgba(255,255,255,0.88)';
      c.beginPath(); c.ellipse(cx, my + mH - fH + 2, mW / 2 - 3, 6, 0, 0, Math.PI * 2); c.fill();
    }
    // glass outline
    c.strokeStyle = 'rgba(190,230,255,0.6)'; c.lineWidth = 2;
    c.strokeRect(mx, my, mW, mH);
    // handle
    c.beginPath(); c.arc(mx + mW + 7, my + mH * 0.55, 9, -Math.PI * 0.45, Math.PI * 0.45); c.stroke();
    // label
    c.font = 'bold 12px "Segoe UI",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom';
    c.fillStyle = isP ? '#ffe060' : '#ff9090'; c.shadowColor = '#000'; c.shadowBlur = 4;
    c.fillText(label, cx, my - 6); c.shadowBlur = 0;
    // percent
    c.font = 'bold 10px "Segoe UI",sans-serif'; c.fillStyle = 'rgba(255,255,255,0.75)';
    c.textBaseline = 'top'; c.fillText(Math.round(fill) + '%', cx, my + mH + 4);
  };

  drawMug(mugLX, _BEER.pFill,  'Agata',       true);
  drawMug(mugRX, _BEER.opFill, 'Nieznajomy',  false);

  // VS
  c.font = 'bold 22px "Segoe UI",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = '#ff8060'; c.shadowColor = '#000'; c.shadowBlur = 8;
  c.fillText('VS', W / 2, mugY - 26); c.shadowBlur = 0;

  // Timer & hint
  if (_BEER.state === 'playing') {
    c.font = 'bold 15px "Segoe UI",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillStyle = _BEER.timer < 5 ? '#ff4444' : '#ffe060';
    c.shadowColor = '#000'; c.shadowBlur = 5;
    c.fillText('⏱ ' + Math.max(0, Math.ceil(_BEER.timer)) + 's', W / 2, 8);
    const p = 0.6 + Math.sin(performance.now() / 240) * 0.4;
    c.font = 'bold ' + (14 + (p * 5 | 0)) + 'px "Segoe UI",sans-serif';
    c.fillStyle = 'rgba(255,225,60,' + p + ')';
    c.fillText('🍺 KLIKAJ / TAP!', W / 2, H - 26); c.shadowBlur = 0;
  }

  // simple characters
  const drawPerson = (cx, cy, body, hair) => {
    c.fillStyle = hair; c.beginPath(); c.arc(cx, cy - 21, 10, Math.PI, Math.PI * 2); c.fill();
    c.fillStyle = '#f0c8a0'; c.beginPath(); c.arc(cx, cy - 20, 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = body; c.beginPath(); c.ellipse(cx, cy, 12, 17, 0, 0, Math.PI * 2); c.fill();
  };
  drawPerson(mugLX - 42, mugY - 13, '#c02040', '#5a1808');
  drawPerson(mugRX + 42, mugY - 13, '#204060', '#2a1010');
}

/* ══════════════════════════════════════════════════════
   Q5 — Dark Navigation minigame
   ══════════════════════════════════════════════════════ */
const DNAV_W = 580, DNAV_H = 340;
const _DNAV = {
  active: false, ax: 48, ay: 190, state: 'playing',
  speed: 130, prevTs: 0, hitFlash: 0, onWin: null,
  keys: { up: 0, down: 0, left: 0, right: 0 },
  hitObjects: new Set(),
  jumpTimer: 2,
  obstacles: [
    { x: 165, y: 112, r: 24, label: 'Krzesło' },
    { x: 280, y: 208, r: 32, label: 'Stół' },
    { x: 358, y: 292, r: 17, label: 'Buty' },
    { x: 210, y: 305, r: 21, label: 'Torba' },
    { x: 432, y: 130, r: 26, label: 'Szafka' },
  ],
  bed: { x: 514, y: 185, r: 36 },
};

function _openDarkNav(onWin) {
  Object.assign(_DNAV, {
    active: true, ax: 48, ay: 190, state: 'playing',
    hitFlash: 0, prevTs: performance.now(), onWin,
  });
  _DNAV.hitObjects.clear();
  _DNAV.keys = { up: 0, down: 0, left: 0, right: 0 };
  document.getElementById('dark-nav-overlay').classList.remove('hidden');
  document.getElementById('dark-nav-result').classList.add('hidden');
  document.getElementById('dark-nav-close').classList.add('hidden');
  requestAnimationFrame(_dnavLoop);
}

function _closeDarkNav() {
  _DNAV.active = false;
  _DNAV.keys = { up: 0, down: 0, left: 0, right: 0 };
  document.getElementById('dark-nav-overlay').classList.add('hidden');
}

function _dnavLoop(ts) {
  if (!_DNAV.active) return;
  const dt = Math.min((ts - _DNAV.prevTs) / 1000, 0.05);
  _DNAV.prevTs = ts;
  if (_DNAV.state === 'playing') { _dnavUpdate(dt); _dnavCheckBed(); }
  _dnavDraw();
  if (_DNAV.active) requestAnimationFrame(_dnavLoop);
}

function _dnavUpdate(dt) {
  const k = _DNAV.keys;
  let dx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
  let dy = (k.down  ? 1 : 0) - (k.up   ? 1 : 0);
  /* also read joystick for mobile */
  if (typeof getInput === 'function') {
    const joy = getInput();
    if (Math.abs(joy.x) > 0.15) dx += joy.x;
    if (Math.abs(joy.y) > 0.15) dy += joy.y;
  }
  const len = Math.hypot(dx, dy);
  if (len > 0.01) { dx /= len; dy /= len; }
  const spd = _DNAV.speed * dt;
  let nx = Math.max(14, Math.min(DNAV_W - 14, _DNAV.ax + dx * spd));
  let ny = Math.max(14, Math.min(DNAV_H - 14, _DNAV.ay + dy * spd));

  for (let i = 0; i < _DNAV.obstacles.length; i++) {
    const ob = _DNAV.obstacles[i];
    const d  = Math.hypot(nx - ob.x, ny - ob.y);
    if (d < ob.r + 12) {
      if (!_DNAV.hitObjects.has(i)) {
        _DNAV.hitObjects.add(i);
        _DNAV.hitFlash = 0.65;
        if (typeof applyZdenerwowanie === 'function') applyZdenerwowanie(5);
      }
      const ang = Math.atan2(ny - ob.y, nx - ob.x);
      nx = ob.x + Math.cos(ang) * (ob.r + 13);
      ny = ob.y + Math.sin(ang) * (ob.r + 13);
    } else {
      _DNAV.hitObjects.delete(i);
    }
  }
  _DNAV.ax = nx; _DNAV.ay = ny;
  if (_DNAV.hitFlash > 0) _DNAV.hitFlash -= dt * 1.4;

  _DNAV.jumpTimer -= dt;
  if (_DNAV.jumpTimer <= 0) {
    _DNAV.jumpTimer = 0.7 + Math.random() * 1.0;
    // randomly move 1-2 obstacles to new positions
    const count = Math.random() < 0.35 ? 2 : 1;
    for (let ji = 0; ji < count; ji++) {
      const idx = Math.floor(Math.random() * _DNAV.obstacles.length);
      const ob = _DNAV.obstacles[idx];
      ob.x = 80 + Math.random() * (DNAV_W - 160);
      ob.y = 40 + Math.random() * (DNAV_H - 80);
    }
    _DNAV.hitObjects.clear();
  }
}

function _dnavCheckBed() {
  if (Math.hypot(_DNAV.ax - _DNAV.bed.x, _DNAV.ay - _DNAV.bed.y) < _DNAV.bed.r + 12) {
    _DNAV.state = 'won';
    document.getElementById('dark-nav-result').classList.remove('hidden');
    const btn = document.getElementById('dark-nav-close');
    btn.classList.remove('hidden');
    btn.onclick = () => { _closeDarkNav(); if (_DNAV.onWin) _DNAV.onWin(); };
  }
}

function _dnavDraw() {
  const cv = document.getElementById('dark-nav-cvs');
  if (!cv) return;
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  // dark room
  c.fillStyle = '#040609'; c.fillRect(0, 0, W, H);
  // faint floor grid
  c.strokeStyle = 'rgba(40,55,80,0.35)'; c.lineWidth = 1;
  for (let lx = 0; lx < W; lx += 38) { c.beginPath(); c.moveTo(lx, 0); c.lineTo(lx, H); c.stroke(); }

  // obstacles
  for (let i = 0; i < _DNAV.obstacles.length; i++) {
    const ob = _DNAV.obstacles[i];
    const hit = _DNAV.hitObjects.has(i);
    c.fillStyle = hit ? 'rgba(255,70,70,0.55)' : 'rgba(55,45,35,0.75)';
    c.beginPath(); c.arc(ob.x, ob.y, ob.r, 0, Math.PI * 2); c.fill();
    c.font = '10px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = hit ? '#fff' : 'rgba(110,95,75,0.55)';
    c.fillText(ob.label, ob.x, ob.y);
    if (hit) {
      c.font = 'bold 11px sans-serif'; c.textBaseline = 'bottom';
      c.fillStyle = '#ffaaaa'; c.fillText('Auć!', ob.x, ob.y - ob.r - 2);
    }
  }

  // bed (dim glow)
  const b = _DNAV.bed;
  const bg = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r + 14);
  bg.addColorStop(0, 'rgba(60,90,150,0.22)'); bg.addColorStop(1, 'transparent');
  c.fillStyle = bg; c.beginPath(); c.arc(b.x, b.y, b.r + 14, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(50,65,110,0.5)';
  c.fillRect(b.x - b.r, b.y - b.r * 0.55, b.r * 2, b.r * 1.1);
  c.fillStyle = 'rgba(70,55,100,0.45)';
  c.fillRect(b.x - b.r, b.y - b.r * 0.55, b.r * 2, b.r * 0.35);
  c.font = '11px "Segoe UI",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom';
  c.fillStyle = 'rgba(130,170,240,0.65)'; c.fillText('🛏️ Łóżko', b.x, b.y - b.r - 2);

  // door indicator
  c.fillStyle = 'rgba(70,50,30,0.55)'; c.fillRect(0, H / 2 - 26, 6, 52);
  c.font = '10px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
  c.fillStyle = 'rgba(140,110,80,0.5)'; c.fillText('Drzwi →', 10, H / 2);

  // Agata
  if (_DNAV.hitFlash > 0) { c.shadowColor = 'rgba(255,80,80,0.9)'; c.shadowBlur = 14; }
  c.fillStyle = _DNAV.hitFlash > 0 ? '#ff6060' : '#d8a080';
  c.beginPath(); c.arc(_DNAV.ax, _DNAV.ay, 10, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#5a1808'; c.beginPath(); c.arc(_DNAV.ax, _DNAV.ay - 8, 6, Math.PI, Math.PI * 2); c.fill();
  c.shadowBlur = 0;

  // hint
  c.font = '11px "Segoe UI",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top';
  c.fillStyle = 'rgba(110,125,160,0.75)';
  c.fillText('Strzałki / WASD — dojdź do łóżka nie waląc w meble', W / 2, 4);

  // hit flash overlay
  if (_DNAV.hitFlash > 0) {
    c.fillStyle = 'rgba(255,55,55,' + (_DNAV.hitFlash * 0.22) + ')';
    c.fillRect(0, 0, W, H);
  }

  // win overlay
  if (_DNAV.state === 'won') {
    c.fillStyle = 'rgba(0,0,0,0.72)'; c.fillRect(0, 0, W, H);
    c.font = 'bold 22px "Segoe UI",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#ffe060'; c.shadowColor = '#000'; c.shadowBlur = 10;
    c.fillText('🛏️ Dotarłaś! 🎉', W / 2, H / 2 - 16); c.shadowBlur = 0;
  }
}

/* ══════════════════════════════════════════════════════
   Q7 — Kayak Race minigame
   ══════════════════════════════════════════════════════ */
const _KAYAK = {
  active: false, agataP: 0, ratP: 0, agataV: 0,
  state: 'playing', prevTs: 0, onWin: null, onLose: null,
  pushbackTimer: 5,
};

function _openKayakRace(onWin, onLose) {
  Object.assign(_KAYAK, {
    active: true, agataP: 0, ratP: 0, agataV: 0,
    state: 'playing', prevTs: performance.now(), onWin, onLose,
    pushbackTimer: 5 + Math.random() * 3,
  });
  document.getElementById('kayak-race-overlay').classList.remove('hidden');
  document.getElementById('kayak-race-result').classList.add('hidden');
  document.getElementById('kayak-race-close').classList.add('hidden');
  requestAnimationFrame(_kayakLoop);
}

function _closeKayakRace() {
  _KAYAK.active = false;
  document.getElementById('kayak-race-overlay').classList.add('hidden');
}

function _kayakTap() {
  if (_KAYAK.state !== 'playing') return;
  _KAYAK.agataV = Math.min(_KAYAK.agataV + 0.14, 0.5);
}

function _kayakEnd(r) {
  _KAYAK.state = r;
  const res = document.getElementById('kayak-race-result');
  const btn = document.getElementById('kayak-race-close');
  res.textContent = r === 'won' ? '🏆 WYGRAŁAŚ! Ratajski gratuluje! 🛶' : '😢 Ratajski wygrał... spróbuj jeszcze raz!';
  res.style.color = r === 'won' ? '#60e8ff' : '#ff6060';
  res.classList.remove('hidden');
  document.getElementById('kayak-race-hint').style.display = 'none';
  btn.classList.remove('hidden');
  btn.onclick = () => {
    _closeKayakRace();
    document.getElementById('kayak-race-hint').style.display = '';
    if (r === 'won' && _KAYAK.onWin)  _KAYAK.onWin();
    if (r !== 'won' && _KAYAK.onLose) _KAYAK.onLose();
  };
}

function _kayakLoop(ts) {
  if (!_KAYAK.active) return;
  const dt = Math.min((ts - _KAYAK.prevTs) / 1000, 0.05);
  _KAYAK.prevTs = ts;
  if (_KAYAK.state === 'playing') {
    _KAYAK.agataV *= Math.max(0, 1 - 1.8 * dt);
    _KAYAK.agataP += _KAYAK.agataV * dt;
    _KAYAK.ratP   += 0.065 * dt;
    /* random pushback — wave or log knocking Agata back */
    _KAYAK.pushbackTimer -= dt;
    if (_KAYAK.pushbackTimer <= 0) {
      _KAYAK.pushbackTimer = 3.5 + Math.random() * 5;
      _KAYAK.agataP = Math.max(0, _KAYAK.agataP - 0.07 - Math.random() * 0.06);
      _KAYAK.agataV = Math.min(_KAYAK.agataV, -0.05);
    }
    if (_KAYAK.agataP >= 1) _kayakEnd('won');
    else if (_KAYAK.ratP >= 1) _kayakEnd('lost');
  }
  _kayakDraw(ts);
  if (_KAYAK.active) requestAnimationFrame(_kayakLoop);
}

function _kayakDraw(ts) {
  const cv = document.getElementById('kayak-race-cvs');
  if (!cv) return;
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const trackL = 52, trackR = W - 20, trackW = trackR - trackL;

  // Water background (indoor canal)
  const wg = c.createLinearGradient(0, 0, 0, H);
  wg.addColorStop(0, '#0a3058'); wg.addColorStop(1, '#0a2040');
  c.fillStyle = wg; c.fillRect(0, 0, W, H);

  // canal walls
  c.fillStyle = '#8a7860'; c.fillRect(0, 0, 20, H); c.fillRect(W - 8, 0, 8, H);
  c.fillStyle = '#a09078'; c.fillRect(0, 0, 20, 6); c.fillRect(W - 8, 0, 8, 6);

  // lane divider
  c.setLineDash([14, 10]);
  c.strokeStyle = 'rgba(180,220,255,0.2)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(trackL, H / 2); c.lineTo(trackR, H / 2); c.stroke();
  c.setLineDash([]);

  // water ripples
  const rOff = (ts / 900) % 80;
  c.strokeStyle = 'rgba(80,160,220,0.1)'; c.lineWidth = 1.5;
  for (let rx = trackL + rOff - 80; rx < trackR + 80; rx += 80)
    for (let ry2 = 15; ry2 < H - 10; ry2 += 40) {
      c.beginPath(); c.moveTo(rx, ry2);
      c.quadraticCurveTo(rx + 20, ry2 - 4, rx + 40, ry2);
      c.quadraticCurveTo(rx + 52, ry2 + 4, rx + 80, ry2); c.stroke();
    }

  // finish line
  const drawChecker = (x, y, h) => {
    for (let cy2 = 0; cy2 < h; cy2 += 8) {
      c.fillStyle = (Math.floor(cy2 / 8) % 2 === 0) ? '#fff' : '#222';
      c.fillRect(x, y + cy2, 10, 8);
      c.fillStyle = (Math.floor(cy2 / 8) % 2 === 0) ? '#222' : '#fff';
      c.fillRect(x + 10, y + cy2, 10, 8);
    }
  };
  drawChecker(trackR - 8, 0, H);

  // draw kayak helper
  const drawKayak = (progress, laneY, color, label) => {
    const kx = trackL + progress * trackW;
    const ky = laneY;
    const bob = Math.sin(ts / 220 + laneY) * 2.2;
    c.save();
    c.translate(kx, ky + bob);
    // kayak body
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.15)';
    c.beginPath();
    c.ellipse(-4, -3, 18, 5, -0.15, 0, Math.PI * 2); c.fill();
    // paddle
    const pSwing = Math.sin(ts / 160 + laneY * 0.3) * 0.55;
    c.strokeStyle = '#d0b878'; c.lineWidth = 3; c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-22, -9 + Math.cos(pSwing) * 5);
    c.lineTo(22,   9 - Math.cos(pSwing) * 5); c.stroke();
    // paddler head
    c.fillStyle = '#f0c8a0';
    c.beginPath(); c.arc(2, -10, 7, 0, Math.PI * 2); c.fill();
    c.restore();
    // label
    c.font = 'bold 11px "Segoe UI",sans-serif';
    c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillStyle = '#fff'; c.shadowColor = '#000'; c.shadowBlur = 4;
    c.fillText(label, trackL + 2, laneY); c.shadowBlur = 0;
  };

  drawKayak(_KAYAK.agataP, H * 0.7, '#e03060', 'Agata');
  drawKayak(_KAYAK.ratP,   H * 0.3, '#204888', 'Ratajski');

  // VS
  c.font = 'bold 18px "Segoe UI",sans-serif';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = '#60d8ff'; c.shadowColor = '#000'; c.shadowBlur = 8;
  c.fillText('VS', trackL / 2 + 4, H / 2); c.shadowBlur = 0;

  // progress bars
  const barY = H - 18, barH = 8;
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(trackL, barY, trackW, barH);
  c.fillStyle = '#e03060'; c.fillRect(trackL, barY, trackW * _KAYAK.agataP, barH);
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(trackL, barY - barH - 2, trackW, barH);
  c.fillStyle = '#3060b8'; c.fillRect(trackL, barY - barH - 2, trackW * _KAYAK.ratP, barH);

  // result overlay
  if (_KAYAK.state !== 'playing') {
    c.fillStyle = 'rgba(0,0,0,0.65)'; c.fillRect(0, 0, W, H);
    c.font = 'bold 24px "Segoe UI",sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = _KAYAK.state === 'won' ? '#60e8ff' : '#ff6060';
    c.shadowColor = '#000'; c.shadowBlur = 12;
    c.fillText(_KAYAK.state === 'won' ? '🛶 WYGRAŁAŚ! 🏆' : '😢 Ratajski wygrał!', W / 2, H / 2);
    c.shadowBlur = 0;
  }
}

/* ══════════════════════════════════════════════════════
   Q9 — MARO scene at Wiadukt
   ══════════════════════════════════════════════════════ */
const _MARO = {
  active: false, phase: 'idle',
  y: -120, targetY: 0, vy: 0,
  rafId: 0, prevTs: 0, onDone: null,
};

function _openMaroScene(onDone) {
  const ov = document.getElementById('maro-scene-overlay');
  const cv = document.getElementById('maro-scene-cvs');
  const dlg = document.getElementById('maro-scene-dialog');
  if (!ov || !cv) return;
  ov.classList.remove('hidden');
  dlg.classList.add('hidden');
  cv.width  = ov.clientWidth  || window.innerWidth;
  cv.height = ov.clientHeight || window.innerHeight;
  Object.assign(_MARO, {
    active: true, phase: 'fly_in',
    y: -120, targetY: cv.height * 0.45, vy: 0,
    prevTs: performance.now(), onDone,
  });
  document.getElementById('maro-scene-next').onclick = () => {
    dlg.classList.add('hidden');
    _MARO.phase = 'fly_out';
  };
  _MARO.rafId = requestAnimationFrame(_maroLoop);
}

function _closeMaroScene() {
  _MARO.active = false;
  cancelAnimationFrame(_MARO.rafId);
  document.getElementById('maro-scene-overlay').classList.add('hidden');
  document.getElementById('maro-scene-dialog').classList.add('hidden');
  if (_MARO.onDone) _MARO.onDone();
}

function _maroLoop(ts) {
  if (!_MARO.active) return;
  const cv = document.getElementById('maro-scene-cvs');
  const dt = Math.min((ts - _MARO.prevTs) / 1000, 0.05);
  _MARO.prevTs = ts;

  if (_MARO.phase === 'fly_in') {
    _MARO.y += (cv.height * 0.08) * dt;
    if (_MARO.y >= _MARO.targetY) {
      _MARO.y = _MARO.targetY;
      _MARO.phase = 'landed';
      // show dialog after short pause
      setTimeout(() => {
        if (!_MARO.active) return;
        document.getElementById('maro-scene-text').textContent =
          'Rafał na pewno teraz jest w Krynicy Morskiej, najlepiej poszukać go w domu Igiego!';
        document.getElementById('maro-scene-dialog').classList.remove('hidden');
      }, 600);
    }
  } else if (_MARO.phase === 'fly_out') {
    _MARO.y -= (cv.height * 0.09) * dt;
    if (_MARO.y < -150) _closeMaroScene();
  }

  _maroDraw(ts, cv);
  if (_MARO.active) _MARO.rafId = requestAnimationFrame(_maroLoop);
}

function _maroDraw(ts, cv) {
  if (!cv) return;
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  // Sky gradient
  const sg = c.createLinearGradient(0, 0, 0, H);
  sg.addColorStop(0, '#3a7abf'); sg.addColorStop(0.6, '#87ceeb'); sg.addColorStop(1, '#b8e8f8');
  c.fillStyle = sg; c.fillRect(0, 0, W, H);

  // Clouds
  const cloudDraw = (cx, cy, r) => {
    c.fillStyle = 'rgba(255,255,255,0.82)';
    for (const [dx, dy, dr] of [[-r*0.6,0,r*0.7],[0,-r*0.3,r],[r*0.6,0,r*0.7],[0,r*0.1,r*0.55]])
      { c.beginPath(); c.arc(cx+dx, cy+dy, dr, 0, Math.PI*2); c.fill(); }
  };
  cloudDraw(W*0.18, H*0.12, 30); cloudDraw(W*0.72, H*0.08, 22); cloudDraw(W*0.5, H*0.15, 26);

  // Wiadukt (concrete overpass) at bottom portion of screen
  const wBase = H * 0.78;
  // ground
  c.fillStyle = '#5a7a38'; c.fillRect(0, wBase + 20, W, H - wBase - 20);
  // road deck
  c.fillStyle = '#7a7068'; c.fillRect(0, wBase, W, 24);
  c.fillStyle = '#686058'; c.fillRect(0, wBase, W, 4);
  // road markings
  c.setLineDash([30, 20]);
  c.strokeStyle = 'rgba(220,200,80,0.4)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(0, wBase + 12); c.lineTo(W, wBase + 12); c.stroke();
  c.setLineDash([]);
  // pillars
  const pilW = 28, pilH = H * 0.22;
  for (let px = W * 0.1; px < W - pilW; px += W * 0.22) {
    const pg = c.createLinearGradient(px, wBase, px + pilW, wBase + pilH);
    pg.addColorStop(0, '#9a9088'); pg.addColorStop(1, '#6a6058');
    c.fillStyle = pg; c.fillRect(px, wBase + 24, pilW, pilH);
    c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1;
    c.strokeRect(px, wBase + 24, pilW, pilH);
    // shadow
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(px + pilW, wBase + 24, 6, pilH);
  }

  // MARO character
  const mx = W / 2, my = _MARO.y;
  const flying = _MARO.phase !== 'landed';
  const bob = flying ? 0 : Math.sin(ts / 400) * 3;
  c.save();
  c.translate(mx, my + bob);

  // shadow (only when near ground)
  if (!flying) {
    const shadowA = Math.max(0, 0.25 - Math.abs(my - _MARO.targetY) / 300);
    c.fillStyle = `rgba(0,0,0,${shadowA})`;
    c.beginPath(); c.ellipse(0, (wBase - my - bob) + 14, 32, 8, 0, 0, Math.PI * 2); c.fill();
  }

  // legs / pants
  c.fillStyle = '#2040c0';
  c.fillRect(-14, 22, 12, 44); c.fillRect(3, 22, 12, 44);
  // shoes
  c.fillStyle = '#181830';
  c.fillRect(-16, 60, 14, 8); c.fillRect(2, 60, 14, 8);

  // torso (muscular, no shirt — skin)
  c.fillStyle = '#f0c880';
  // wide body
  c.beginPath(); c.roundRect(-22, -6, 44, 30, 6); c.fill();
  // chest muscle lines
  c.strokeStyle = 'rgba(180,130,60,0.5)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(-3, -4); c.lineTo(-3, 18); c.stroke();
  c.beginPath(); c.arc(-11, 6, 9, 0.2, Math.PI - 0.2); c.stroke();
  c.beginPath(); c.arc(11, 6, 9, 0.2, Math.PI - 0.2); c.stroke();
  // abs
  for (let ai = 0; ai < 3; ai++) {
    c.beginPath(); c.ellipse(-7, 14 + ai * 7, 5, 3, 0, 0, Math.PI * 2);
    c.beginPath(); c.ellipse(7,  14 + ai * 7, 5, 3, 0, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(170,120,50,0.35)'; c.stroke();
  }

  // arms (outstretched when flying, down when landed)
  const armAngle = flying ? -0.9 : 0.2;
  c.strokeStyle = '#f0c880'; c.lineWidth = 12; c.lineCap = 'round';
  // left arm
  c.beginPath();
  c.moveTo(-20, 4);
  c.lineTo(-20 + Math.cos(Math.PI + armAngle) * 32, 4 + Math.sin(Math.PI + armAngle) * 32);
  c.stroke();
  // right arm
  c.beginPath();
  c.moveTo(20, 4);
  c.lineTo(20 + Math.cos(armAngle) * 32, 4 + Math.sin(armAngle) * 32);
  c.stroke();

  // head
  c.fillStyle = '#f0c880';
  c.beginPath(); c.arc(0, -22, 18, 0, Math.PI * 2); c.fill();
  // light blond short hair
  c.fillStyle = '#e8d060';
  c.beginPath(); c.arc(0, -32, 18, Math.PI, 0); c.fill();
  c.beginPath(); c.arc(-14, -26, 9, Math.PI * 0.9, Math.PI * 1.8); c.fill();
  c.beginPath(); c.arc(14, -26, 9, 0, Math.PI * 0.9); c.fill();
  // hair strands
  c.strokeStyle = '#c8b040'; c.lineWidth = 2; c.lineCap = 'round';
  for (let hi = -3; hi <= 3; hi++) {
    c.beginPath(); c.moveTo(hi * 4, -39); c.lineTo(hi * 3, -32); c.stroke();
  }
  // face
  c.fillStyle = '#3a2408';
  c.beginPath(); c.ellipse(-6, -21, 3, 3.5, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(6,  -21, 3, 3.5, 0, 0, Math.PI * 2); c.fill();
  // smile
  c.strokeStyle = '#5a3010'; c.lineWidth = 1.8;
  c.beginPath(); c.arc(0, -17, 6, 0.2, Math.PI - 0.2); c.stroke();
  // strong jaw / chin
  c.fillStyle = '#e8bc70';
  c.beginPath(); c.ellipse(0, -8, 10, 6, 0, 0, Math.PI); c.fill();

  c.restore();

  // name label above MARO when landed
  if (_MARO.phase === 'landed') {
    c.font = 'bold 14px "Segoe UI",sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'bottom';
    c.fillStyle = '#fff'; c.shadowColor = '#000'; c.shadowBlur = 6;
    c.fillText('MARO', mx, my + bob - 52); c.shadowBlur = 0;
  }
}

/* ══════════════════════════════════════════════════════
   Keyboard & touch wiring (runs after DOM ready)
   ══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Beer race — click/tap panel
  const bPanel = document.getElementById('beer-race-panel');
  if (bPanel) {
    bPanel.addEventListener('click', e => {
      if (e.target.id === 'beer-race-close') return;
      _beerTap();
    });
  }

  // Kayak race — click/tap panel
  const kPanel = document.getElementById('kayak-race-panel');
  if (kPanel) {
    kPanel.addEventListener('click', e => {
      if (e.target.id === 'kayak-race-close') return;
      _kayakTap();
    });
  }

  // Dark nav — keyboard
  document.addEventListener('keydown', e => {
    if (!_DNAV.active || _DNAV.state !== 'playing') return;
    const MAP = {
      ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
      KeyW:'up',    KeyS:'down',      KeyA:'left',      KeyD:'right',
    };
    if (MAP[e.code]) { _DNAV.keys[MAP[e.code]] = 1; e.preventDefault(); e.stopPropagation(); }
  });
  document.addEventListener('keyup', e => {
    if (!_DNAV.active) return;
    const MAP = {
      ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
      KeyW:'up',    KeyS:'down',      KeyA:'left',      KeyD:'right',
    };
    if (MAP[e.code]) { _DNAV.keys[MAP[e.code]] = 0; e.preventDefault(); }
  });

  // Dark nav — touch/pointer buttons
  const setup = (id, key) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); _DNAV.keys[key] = 1; btn.classList.add('pressed'); });
    btn.addEventListener('pointerup',   e => { e.preventDefault(); _DNAV.keys[key] = 0; btn.classList.remove('pressed'); });
    btn.addEventListener('pointerout',  e => { _DNAV.keys[key] = 0; btn.classList.remove('pressed'); });
  };
  setup('dna-up',    'up');
  setup('dna-down',  'down');
  setup('dna-left',  'left');
  setup('dna-right', 'right');
});

/* ══════════════════════════════════════════════════════
   Main quest update / draw / HUD
   ══════════════════════════════════════════════════════ */
function updateGdanskQuests(dt, sp) {
  const dtS = dt / 1000;
  for (const k of Object.keys(_GDN)) _GDN[k] = Math.max(0, _GDN[k] - dtS);

  /* ── Przymorzanie enemy system (only active inside Przymorze zone) ── */
  const _inPrzym = sp.x < 960 && sp.y > 510;
  if (!_PRZYM_ST.spawned) { _PRZYM_ST.spawned = true; _spawnPrzymorzanie(); }
  _PRZYM_ST.playerHitFlash = Math.max(0, _PRZYM_ST.playerHitFlash - dtS * 3);
  if (_inPrzym) {
    _PRZYM_ST.playerAttTimer += dtS;
    const przymPlayerAttacks = _PRZYM_ST.playerAttTimer >= 1;
    if (przymPlayerAttacks) _PRZYM_ST.playerAttTimer = 0;
    for (const en of _PRZYM_ST.enemies) {
      if (!en.alive) {
        en.respawnTimer -= dtS;
        if (en.respawnTimer <= 0) {
          const spawn = _PRZYM_SPAWNS[en.id];
          en._x = spawn.x; en._y = spawn.y; en.hp = en.maxHp;
          en.alive = true; en.aiState = 'patrol'; en.attackTimer = 0; en.hitFlash = 0;
        }
        continue;
      }
      const dx = sp.x - en._x, dy = sp.y - en._y;
      const dist = Math.hypot(dx, dy);
      en.hitFlash = Math.max(0, en.hitFlash - dtS * 4);
      if (dist < 180) { en.aiState = 'chase'; }
      else if (en.aiState === 'chase' && dist > 280) { en.aiState = 'patrol'; en.attackTimer = 0; }
      if (en.aiState === 'chase') {
        const spd = en.speed * dtS;
        const nx = dx / dist, ny = dy / dist;
        en._x += nx * spd; en._y += ny * spd;
        en._dir = nx >= 0 ? 1 : -1; en.stepAnim += spd * 0.08;
        en._x = Math.max(505, Math.min(900, en._x));
        en._y = Math.max(560, Math.min(1128, en._y));
        if (dist < 55) {
          en.attackTimer += dtS;
          if (en.attackTimer >= 1) {
            en.attackTimer = 0;
            applyZdenerwowanie(15);
            _PRZYM_ST.playerHitFlash = 1;
          }
        } else { en.attackTimer = 0; }
      } else {
        en.patrolTimer += dtS;
        if (en.patrolTimer > 2.5) {
          en.patrolTimer = 0;
          const angle = Math.random() * Math.PI * 2;
          en.patrolDX = Math.cos(angle); en.patrolDY = Math.sin(angle);
        }
        const spd = en.speed * 0.35 * dtS;
        en._x += en.patrolDX * spd; en._y += en.patrolDY * spd;
        en._x = Math.max(505, Math.min(900, en._x));
        en._y = Math.max(560, Math.min(1128, en._y));
        en._dir = en.patrolDX >= 0 ? 1 : -1; en.stepAnim += spd * 0.08; en.attackTimer = 0;
      }
      if (przymPlayerAttacks && dist < 55) {
        const atkMult = typeof getAtakMult === 'function' ? getAtakMult() : 1;
        en.hp -= 15 * atkMult; en.hitFlash = 1;
        if (typeof spawnHitEffect === 'function') spawnHitEffect(en._x, en._y, Math.round(15 * atkMult));
        if (en.hp <= 0) {
          en.alive = false; en.respawnTimer = 20;
          if (typeof addZlote === 'function') addZlote(80);
        }
      }
    }
  }

  /* ── Q10: Rafał follows player in Gdańsk → ends at Collegii ── */
  if (typeof _KM_QUEST !== 'undefined' && _KM_QUEST.state === 'q10_follow' && _GDN_RAFAL.active) {
    const rdx = sp.x - _GDN_RAFAL.x, rdy = sp.y - _GDN_RAFAL.y;
    const rdist = Math.hypot(rdx, rdy) || 1;
    if (rdist > 70) {
      const rspd = 130 * dtS;
      _GDN_RAFAL.x += (rdx / rdist) * rspd;
      _GDN_RAFAL.y += (rdy / rdist) * rspd;
    }
    /* Collegii zone: center (2080, 1622), r=68 */
    if (!isDialogOpen() && Math.hypot(sp.x - 2080, sp.y - 1622) < 68) {
      _GDN_RAFAL.active = false;
      if (typeof _RAFAL_WORLD !== 'undefined') _RAFAL_WORLD.active = false;
      _KM_QUEST.state = 'q10_done';
      showDialog('😴', 'Idziemy spać, teraz, i nie ma żadnego rozmawiania, nawet mnie nie denerwuj');
    }
  }

  const Q = _GDN_QUEST;

  // Timer-based transitions (run even when dialog is open)
  if (Q.state === 'q6_run')      Q.q6Timer    -= dtS;
  if (Q.state === 'q5_sleeping') Q.sleepTimer -= dtS;

  // Advance nextState once dialog closes
  if (Q.nextState && !isDialogOpen()) {
    Q.state = Q.nextState;
    Q.nextState = null;
  }

  if (isDialogOpen()) return;

  // Q11: entry trigger — Rafał missing, Agata must find him in Krynica
  if (typeof _KM_QUEST !== 'undefined' && _KM_QUEST.state === 'q11_ready' && !_GDN_Q11_ENTRY) {
    _GDN_Q11_ENTRY = true;
    _KM_QUEST.state = 'q11_search';
    showDialog('😤', 'Ja nie wytrzymam, Rafał znowu gdzieś zniknął i znowu muszę go szukać');
  }

  // Forum shop — gated behind Q7 quest
  if (!isDialogOpen() && _GDN.forum <= 0 && Math.hypot(sp.x - 3098, sp.y - 1805) < 76) {
    const qs = Q.state;
    const forumOpen = ['q7_shopping','q7_done','q9_ready','q9_scene','q9_done'].includes(qs);
    const forumQuest = qs === 'q7_ready';
    if (forumOpen) {
      openShop(); _GDN.forum = 10;
    } else if (!forumQuest) {
      // Before Q7: info dialog only
      showDialog('🏪', 'Galeria Handlowa Forum Gdańsk!\nCentrum zakupowe na wybrzeżu Motławy.\nCiekawe miejsca, ale Ratajski tu teraz nie handluje... 🤔');
      _GDN.forum = 10;
    }
  }

  // Flavour info dialogs (always available for non-quest landmarks)
  const ch = (key, x, y, r, portrait, text) => {
    if (_GDN[key] <= 0 && Math.hypot(sp.x - x, sp.y - y) < r) { showDialog(portrait, text); _GDN[key] = 10; }
  };
  ch('ergo',     1093,  144,  72, '🏟️', 'Ergo Arena!\nHala widowiskowo-sportowa na granicy Gdańska i Sopotu.\nKoncerty, hokej, boxing — tu zawsze coś się dzieje! 🎸');
  /* Q13 Molo trigger (replaces flavour info) */
  _GDN_Q13.trigCD = Math.max(0, _GDN_Q13.trigCD - dtS);
  if (_GDN_Q13.state === 'inactive' && _GDN_Q13.trigCD <= 0 && Math.hypot(sp.x - 2552, sp.y - 360) < 72) {
    _GDN_Q13.state = 'q13_waiting'; _GDN_Q13.trigCD = 30;
    showDialog('🌊', 'Fajne Molo, szkoda że nie ma takiego w Warlubiu, czemu Rafał mi takiego nie zrobił :(');
  } else if (_GDN_Q13.state === 'inactive') {
    ch('molo', 2552, 360, 72, '🌊', 'Molo w Brzeźnie!\nPonad 650 metrów drewnianego pomostu nad Zatoką Gdańską.\nWidok na morze o wschodzie słońca — bezcenny! ☀️');
  }
  if (_GDN_Q13.state === 'q13_waiting' && !isDialogOpen()) {
    _GDN_Q13.state = 'q13_scene';
    _openGTAScene(() => {
      showDialog('😡', 'Głupia Agnieszka, po co ona jest >:');
      _GDN_Q13.state = 'q13_done';
    });
  }
  ch('pge',      3698,  232,  92, '⚽', 'PGE Arena Gdańsk!\nStadion wybudowany na Euro 2012.\nZaprojektowany z inspiracji bursztynem — złoty klejnot Gdańska! 🏆');
  ch('polit',    2080, 1525,  76, '🎓', 'Politechnika Gdańska!\nZałożona w 1904 roku, jedna z najlepszych uczelni technicznych PL.\nAlbert Einstein wykładał tu fizykę w 1923! 📐');
  ch('przymorze', 703,  840, 262, '😱', 'Przymorze...\n\nNajstraszniejsza dzielnica Gdańska.\nMieszkańcy dawno stąd uciekli...\nPolicja tu nie zagląda. Nawet psy nie szczekają.\n\nCzujesz że coś cię obserwuje... 👁️');

  // Wiadukt: during Q9 show MARO scene instead of flavour info
  if (Q.state === 'q9_ready' && _GDN.wiadukt <= 0 && Math.hypot(sp.x - 1088, sp.y - 776) < 68) {
    _GDN.wiadukt = 99; Q.state = 'q9_scene';
    _openMaroScene(() => {
      showDialog('🌉', 'MARO zniknął za chmurami...\nCzas szukać Rafała w Krynicy Morskiej!');
      _gqNext('q9_done');
    });
  } else if (!['q9_ready','q9_scene'].includes(Q.state)) {
    ch('wiadukt', 1088, 776, 68, '🌉', 'To jest wiadukt, wiadukt na Zaspie, serce zaspy i serce mieszkańców zaspy 🌉');
  }

  // Landmark info dialogs shown when no active quest occupies those spots
  const noQuest = !['q4_ready','q4_intro','q4_play','q4_done',
                    'q5_intro','q5_play','q5_sleep','q5_sleeping',
                    'q6_ready','q6_intro','q6_run','q6_fail','q6_retry','q6_win',
                    'q7_ready','q7_intro','q7_play','q7_won'].includes(Q.state);
  if (noQuest) {
    ch('galBalt',  1656, 1278,  78, '🛍️', 'Galeria Bałtycka!\nNajpopularniejsze centrum handlowe tej części Gdańska.\nCentrum Wrzeszcza jak magnes przyciąga mieszkańców 🧲');
    ch('collegia', 2080, 1622,  68, '🏠', 'Collegia — dom studenta Politechniki Gdańskiej!\nTysiące studentów tu mieszkało przez dekady.\nLegendarne imprezy i równie legendarna stołówka 🍜');
    ch('armata',   1883, 1568,  58, '💣', 'Armata!\nKultowy pub w sercu Wrzeszcza.\nNajlepsza pizza i piwo na trasie Politechnika→Collegia 🍺');
    ch('akademia', 3300, 1650,  72, '🎵', 'Akademia Muzyczna im. Stanisława Moniuszki!\nMuzycy ćwiczą tu dzień i noc —\ngamy słyszalne nawet znad Martwej Wisły! 🎹');
  }

  // ── Quest state machine ──
  switch (Q.state) {

    // Q4 — Beer Race
    case 'q4_ready':
      if (_GDN.armata <= 0 && Math.hypot(sp.x - 1883, sp.y - 1568) < 58) {
        showDialog('💣', 'Kto mógł się spodziewać, że będziemy się ścigać...\nJedyna szansa to wypić piwo szybciej od Nieznajomego! 🍺');
        _GDN.armata = 99; Q.state = 'q4_intro';
      }
      break;

    case 'q4_intro':
      Q.state = 'q4_play';
      _openBeerRace(
        () => { // win
          showDialog('💣', 'Nikt nie wie jak to się stało, ale Agata wypiła piwo szybko i wygrała zaspiański wyścig! 🏆\nNiestety jedyne co można teraz zrobić to wrócić do Collegii...');
          _gqNext('q4_done');
        },
        () => { // lose — reset so player can retry
          Q.state = 'q4_ready'; _GDN.armata = 0;
        }
      );
      break;

    case 'q4_play': break;

    // Q5 — Dark Navigation
    case 'q4_done':
      if (_GDN.collegia <= 0 && Math.hypot(sp.x - 2080, sp.y - 1622) < 68) {
        showDialog('🏠', 'Ale ciemno...\nTrzeba jakoś trafić do łóżka nie waląc w nic!');
        _GDN.collegia = 99; Q.state = 'q5_intro';
      }
      break;

    case 'q5_intro':
      Q.state = 'q5_play';
      _openDarkNav(() => {
        showDialog('🏠', 'Jakoś udało się w nic nie uderzyć, teraz można iść spać... 💤');
        _gqNext('q5_sleep');
      });
      break;

    case 'q5_play': break;

    case 'q5_sleep':
      Q.state = 'q5_sleeping';
      Q.sleepTimer = 1.6;
      _showBlackout(true);
      break;

    case 'q5_sleeping':
      if (Q.sleepTimer <= 0) {
        _showBlackout(false);
        showDialog('🏠', 'O czymś chyba zapomniałam...\nMoże mi się przypomni jak pójdę do GB 🛍️');
        _gqNext('q6_ready');
      }
      break;

    // Q6 — Race to Akademia Muzyczna
    case 'q6_ready':
      if (_GDN.galBalt <= 0 && Math.hypot(sp.x - 1656, sp.y - 1278) < 78) {
        showDialog('🛍️', 'Już wiem o czym zapomniałam.\nO KONCERCIE ZE ŚWIECZKAMI!!! 🕯️🎵\nTrzeba jak najszybciej biec do Akademii Muzycznej!');
        _GDN.galBalt = 99; Q.state = 'q6_intro';
      }
      break;

    case 'q6_intro':
      Q.state = 'q6_run';
      Q.q6Timer = 9;
      break;

    case 'q6_run':
      if (Math.hypot(sp.x - 3300, sp.y - 1650) < 72) {
        Q.state = 'q6_win';
        showDialog('🎵', 'Znowu to samo, znowu za późno na koncert... Dobrze że tym razem nie było tego jebanego tramwaju 9 Głęboka 🚋\nAle tym razem udało się zdążyć na koncert! 🎉');
        _gqNext('q6_done');
      } else if (Q.q6Timer <= 0) {
        Q.state = 'q6_fail';
        showDialog('😭', 'Za późno! Spóźniłaś się na koncert...\nWróć do Galerii Bałtyckiej i spróbuj jeszcze raz!');
        _gqNext('q6_retry');
      }
      break;

    case 'q6_retry':
      Q.state = 'q6_ready'; _GDN.galBalt = 0;
      break;

    case 'q6_win': break;

    case 'q6_done':
      // Auto-advance to Q7 immediately
      Q.state = 'q7_ready'; _GDN.forum = 0;
      break;

    // Q7 — Kayak Race at Galeria Forum
    case 'q7_ready':
      if (_GDN.forum <= 0 && Math.hypot(sp.x - 3098, sp.y - 1805) < 76) {
        showDialog('🏪', 'Jakim cudem w forum znowu płynie Rataj!\nKrzysztof Ratajski stoi przy rzece i zaprasza na wyścig kajakowy! 🛶');
        _GDN.forum = 99; Q.state = 'q7_intro';
      }
      break;

    case 'q7_intro':
      Q.state = 'q7_play';
      _openKayakRace(
        () => { // win
          showDialog('🏪', 'Krzysztof Ratajski gratuluje wygranej! 🏆\nWitaj w moim sklepie! Znajdziesz tu najlepszy sprzęt na trasie od Pucka do Ustki!');
          _gqNext('q7_won');
        },
        () => { // lose — reset so player can retry
          Q.state = 'q7_ready'; _GDN.forum = 0;
        }
      );
      break;

    case 'q7_play': break;

    case 'q7_won':
      Q.state = 'q7_shopping';
      _forumBuyCount = 0;   // reset for fresh count from this point
      _GDN.forum = 0;       // allow approaching forum again to shop
      break;

    case 'q7_shopping':
      if (_forumBuyCount >= 2) {
        showDialog('🛍️', 'Agata jest teraz uzbrojona, właśnie dlatego warto wybrać się na Hel! ⚔️🏖️');
        _gqNext('q7_done');
      }
      break;

    case 'q7_done': break;

    // Q9 — MARO scene at Wiadukt (activated after Q8 in hel.js)
    case 'q9_ready': break;
    case 'q9_scene': break;
    case 'q9_done': break;
  }
}

function _drawPrzymorzanin(ctx, en, ts) {
  const x = en._x, y = en._y;
  const bob = Math.sin(en.stepAnim) * 2;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(x+2, y+12, 12, 5, 0, 0, Math.PI*2); ctx.fill();
  // legs
  ctx.fillStyle = '#1a0028';
  ctx.beginPath(); ctx.ellipse(x-5, y+8+Math.sin(en.stepAnim)*3, 4, 7, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+5, y+8-Math.sin(en.stepAnim)*3, 4, 7, -0.1, 0, Math.PI*2); ctx.fill();
  // body — dark robe
  const bodyG = ctx.createLinearGradient(x-11, y-8, x+11, y+10);
  bodyG.addColorStop(0, '#2a0040'); bodyG.addColorStop(1, '#0a0018');
  ctx.fillStyle = bodyG;
  ctx.beginPath(); ctx.ellipse(x, y-2+bob, 11, 13, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#4a0068'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(x, y-2+bob, 11, 13, 0, 0, Math.PI*2); ctx.stroke();
  // arms when chasing
  if (en.aiState === 'chase') {
    const sw = Math.sin(en.stepAnim * 2) * 5;
    ctx.fillStyle = '#2a0040';
    ctx.beginPath(); ctx.ellipse(x-15, y-2+bob+sw, 4.5, 4, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+15, y-2+bob-sw, 4.5, 4, 0, 0, Math.PI*2); ctx.fill();
  }
  // head
  ctx.fillStyle = '#1e0030';
  ctx.beginPath(); ctx.arc(x, y-18+bob, 10, 0, Math.PI*2); ctx.fill();
  // hood
  ctx.fillStyle = '#2a0040';
  ctx.beginPath(); ctx.arc(x, y-21+bob, 10, Math.PI, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x-10, y-16+bob, 3, 7, -0.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+10, y-16+bob, 3, 7, 0.3, 0, Math.PI*2); ctx.fill();
  // glowing red eyes
  const eyeGlow = 0.6 + Math.sin(ts/300)*0.4;
  ctx.fillStyle = `rgba(255,0,0,${eyeGlow})`;
  ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.ellipse(x-3.5, y-18+bob, 2.5, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+3.5, y-18+bob, 2.5, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // hit flash
  if (en.hitFlash > 0) {
    ctx.save(); ctx.globalAlpha = en.hitFlash * 0.65;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x, y-10+bob, 14, 22, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  // HP bar
  const bw = 38, bh = 4, bx = x - bw/2, by = y-42+bob;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = en.hp > 100 ? '#aa22ff' : '#660099';
  ctx.fillRect(bx, by, bw*(en.hp/en.maxHp), bh);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth=0.5; ctx.strokeRect(bx, by, bw, bh);
  // name
  ctx.font = 'bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
  ctx.fillStyle = '#cc44ff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('Przymorzanin', x, by); ctx.shadowBlur=0;
}

function drawGdanskQuests(ctx, ts) {
  const Q = _GDN_QUEST;
  const excl = (x, y) => {
    const bob = Math.sin(ts / 400) * 5;
    ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#ffe060'; ctx.shadowColor = '#000'; ctx.shadowBlur = 7;
    ctx.fillText('!', x, y - 8 + bob); ctx.shadowBlur = 0;
  };
  if (Q.state === 'q4_ready')                            excl(1883, 1538);
  if (Q.state === 'q4_done')                             excl(2080, 1582);
  if (Q.state === 'q6_ready' || Q.state === 'q6_intro') excl(1656, 1224);
  if (Q.state === 'q6_run')                              excl(3224, 1602);
  if (Q.state === 'q7_ready')                            excl(3098, 1760);
  if (Q.state === 'q7_shopping')                         excl(3098, 1760);
  if (Q.state === 'q9_ready')                            excl(1088, 736);

  // Draw Przymorzanie enemies
  for (const en of _PRZYM_ST.enemies) {
    if (en.alive) _drawPrzymorzanin(ctx, en, ts);
  }
  /* Q10: Rafał following in Gdańsk */
  if (typeof _KM_QUEST !== 'undefined' && _KM_QUEST.state === 'q10_follow' && _GDN_RAFAL.active) {
    if (typeof _drawRafalKrynica === 'function')
      _drawRafalKrynica(ctx, _GDN_RAFAL.x, _GDN_RAFAL.y, false, ts);
  }
}

function drawGdanskQuestsHUD(ctx, cw, ch) {
  if (_PRZYM_ST.playerHitFlash > 0) {
    ctx.fillStyle = 'rgba(150,0,200,' + _PRZYM_ST.playerHitFlash * 0.3 + ')';
    ctx.fillRect(0, 0, cw, ch);
  }
  if (_GDN_QUEST.state === 'q7_shopping') {
    const bought = Math.min(typeof _forumBuyCount !== 'undefined' ? _forumBuyCount : 0, 2);
    ctx.save();
    ctx.font = 'bold 15px "Segoe UI",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = bought >= 2 ? '#60ff80' : '#ffe060';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
    ctx.fillText(`🛍️ Kup przedmioty u Ratajskiego (${bought}/2)`, cw / 2, 14);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  if (_GDN_QUEST.state !== 'q6_run') return;
  const t = Math.max(0, _GDN_QUEST.q6Timer);
  const urgent = t < 7;
  ctx.save();
  ctx.font = 'bold ' + (urgent ? 27 : 21) + 'px "Segoe UI",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = urgent ? '#ff3333' : '#ffe060';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
  ctx.fillText('⏱ ' + Math.ceil(t) + 's — biegnij do Akademii Muzycznej!', cw / 2, 50);
  if (urgent) {
    const p = 0.5 + Math.sin(performance.now() / 90) * 0.5;
    ctx.strokeStyle = 'rgba(255,50,50,' + p + ')';
    ctx.lineWidth = 2;
    ctx.strokeRect(cw / 2 - 210, 32, 420, 36);
  }
  ctx.restore();
}

/* ── Przymorze (przerażająca dzielnica) ── */
function _drawGdnPrzymorze(ctx, ts) {
  const DX=505, DY=560, DW=396, DH=568;
  const bg=ctx.createLinearGradient(DX,DY,DX+DW,DY+DH);
  bg.addColorStop(0,'#280e0e'); bg.addColorStop(1,'#3a1414');
  ctx.fillStyle=bg; ctx.fillRect(DX,DY,DW,DH);
  ctx.fillStyle=`rgba(190,20,20,${0.055+Math.sin(ts/820)*0.04})`; ctx.fillRect(DX,DY,DW,DH);

  ctx.strokeStyle='rgba(90,20,20,0.8)'; ctx.lineWidth=1.5;
  const cracks=[[[DX+55,DY+195],[DX+115,DY+275],[DX+98,DY+348]],
                [[DX+218,DY+145],[DX+178,DY+235],[DX+242,DY+318]],
                [[DX+302,DY+398],[DX+342,DY+478],[DX+282,DY+522]]];
  for (const c of cracks) {
    ctx.beginPath(); ctx.moveTo(c[0][0],c[0][1]);
    for (const p of c.slice(1)) ctx.lineTo(p[0],p[1]); ctx.stroke();
  }

  const blds=[
    {x:DX+12,y:DY+38,w:84,h:118},{x:DX+108,y:DY+28,w:88,h:128},
    {x:DX+210,y:DY+38,w:82,h:120},{x:DX+304,y:DY+32,w:86,h:124},
    {x:DX+22,y:DY+254,w:78,h:108},{x:DX+116,y:DY+260,w:82,h:112},
    {x:DX+214,y:DY+254,w:80,h:110},{x:DX+306,y:DY+258,w:76,h:108},
  ];
  for (const b of blds) {
    const wg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
    wg.addColorStop(0,'#4a2222'); wg.addColorStop(1,'#2a1010');
    ctx.fillStyle=wg; ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.strokeStyle='rgba(140,50,50,0.55)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(b.x+b.w*.3,b.y); ctx.lineTo(b.x+b.w*.18,b.y+b.h*.42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x+b.w*.72,b.y+b.h*.18); ctx.lineTo(b.x+b.w*.82,b.y+b.h); ctx.stroke();
    for (let wy=b.y+14;wy<b.y+b.h-14;wy+=30)
      for (let wx=b.x+9;wx<b.x+b.w-9;wx+=28) {
        ctx.fillStyle='rgba(0,0,0,0.96)'; ctx.fillRect(wx,wy,17,17);
        ctx.strokeStyle='rgba(100,35,35,0.5)'; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(wx,wy); ctx.lineTo(wx+17,wy+17); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(wx+17,wy); ctx.lineTo(wx,wy+17); ctx.stroke();
      }
    const bx=b.x+b.w/2-10, bt=b.y+b.h-36;
    ctx.strokeStyle='rgba(55,25,25,0.75)'; ctx.lineWidth=1.5;
    for (let bar=bx;bar<bx+22;bar+=7) { ctx.beginPath(); ctx.moveTo(bar,bt); ctx.lineTo(bar,bt+30); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(bx,bt+10); ctx.lineTo(bx+22,bt+10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx,bt+20); ctx.lineTo(bx+22,bt+20); ctx.stroke();
  }

  ctx.strokeStyle='#3a1c1c'; ctx.lineCap='round';
  for (const [tx,ty] of [[DX+72,DY+418],[DX+182,DY+438],[DX+292,DY+460],[DX+360,DY+392]]) {
    ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx,ty-80); ctx.stroke();
    ctx.lineWidth=2.5;
    for (const [dx,dy] of [[-28,-90],[24,-88]]) { ctx.beginPath(); ctx.moveTo(tx,ty-55); ctx.lineTo(tx+dx,ty+dy); ctx.stroke(); }
    for (const [dx,dy] of [[-18,-58],[20,-56]]) { ctx.beginPath(); ctx.moveTo(tx,ty-32); ctx.lineTo(tx+dx,ty+dy); ctx.stroke(); }
  }

  ctx.shadowColor='rgba(255,0,0,0.55)'; ctx.shadowBlur=10;
  ctx.font='bold 13px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(185,30,30,0.78)'; ctx.fillText('UCIEEEKAJ!',DX+198,DY+182);
  ctx.font='bold 9px monospace'; ctx.fillStyle='rgba(140,20,20,0.82)';
  ctx.fillText('nie chodź tu po ciemku',DX+198,DY+470); ctx.shadowBlur=0;

  const skA=0.6+Math.sin(ts/610)*0.4;
  ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle=`rgba(200,55,55,${skA})`;
  ctx.fillText('💀',DX+68,DY+512); ctx.fillText('💀',DX+328,DY+518);

  const sf=0.68+Math.sin(ts/182)*0.32;
  ctx.font='bold 21px "Segoe UI",sans-serif';
  ctx.fillStyle=`rgba(225,28,28,${sf})`; ctx.shadowColor='#ff0000'; ctx.shadowBlur=18;
  ctx.fillText('PRZYMORZE',DX+DW/2,DY+22); ctx.shadowBlur=0;

  ctx.fillStyle=`rgba(255,35,0,${(0.38+Math.sin(ts/225+1)*0.62)*0.3})`;
  ctx.beginPath(); ctx.arc(DX+98,DY+232,32,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=`rgba(255,35,0,${(0.38+Math.sin(ts/188+3)*0.62)*0.3})`;
  ctx.beginPath(); ctx.arc(DX+298,DY+472,32,0,Math.PI*2); ctx.fill();

  const ea=0.5+Math.sin(ts/402)*0.5;
  ctx.fillStyle=`rgba(255,100,0,${ea})`;
  for (const [ex,ey] of [[DX+DW-30,DY+DH*0.38],[DX+DW-18,DY+DH*0.38],[DX+42,DY+DH*0.68],[DX+54,DY+DH*0.68]])
    { ctx.beginPath(); ctx.arc(ex,ey,4,0,Math.PI*2); ctx.fill(); }

  ctx.strokeStyle='rgba(168,18,18,0.65)'; ctx.lineWidth=3;
  ctx.setLineDash([10,6]); ctx.strokeRect(DX,DY,DW,DH); ctx.setLineDash([]);
}

/* ── Główna funkcja rysowania ── */
function _drawGdansk(ctx, sub, ts) {
  const {w, h} = sub; // 4000 × 1900

  ctx.fillStyle='#868178'; ctx.fillRect(0,0,w,h);

  /* Park Oliwski */
  ctx.beginPath();
  for (const p of _GDN_PARK) ctx.lineTo(p.x,p.y);
  ctx.closePath(); ctx.fillStyle='#2d5918'; ctx.fill();
  ctx.fillStyle='#387020';
  ctx.beginPath(); ctx.ellipse(295,920,112,275,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(365,472,72,132,0,0,Math.PI*2); ctx.fill();

  /* port / przemysł */
  ctx.fillStyle='#696258'; ctx.fillRect(2800,600,1200,1300);
  ctx.fillStyle='#5e5852'; ctx.fillRect(3020,800,880,1100);

  /* Zatoka Gdańska */
  ctx.beginPath();
  ctx.moveTo(_GDN_COAST[0].x,_GDN_COAST[0].y);
  for (const p of _GDN_COAST) ctx.lineTo(p.x,p.y);
  ctx.closePath(); ctx.fillStyle='#0d6098'; ctx.fill();

  /* fale */
  const wo=(ts/1150)%90;
  ctx.strokeStyle='rgba(255,255,255,0.055)'; ctx.lineWidth=2.5;
  for (let wy=wo-90;wy<480;wy+=90)
    for (let wx=1440;wx<w+92;wx+=110) {
      ctx.beginPath(); ctx.moveTo(wx,wy);
      ctx.quadraticCurveTo(wx+37,wy-10,wx+74,wy);
      ctx.quadraticCurveTo(wx+92,wy+8,wx+110,wy); ctx.stroke();
    }

  /* plaża */
  ctx.beginPath();
  ctx.moveTo(_GDN_COAST[0].x,_GDN_COAST[0].y);
  for (const p of _GDN_COAST) ctx.lineTo(p.x,p.y);
  for (let i=_GDN_COAST.length-1;i>=0;i--) ctx.lineTo(_GDN_COAST[i].x,_GDN_COAST[i].y+65);
  ctx.closePath(); ctx.fillStyle='#c3b456'; ctx.fill();

  /* Martwa Wisła */
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle='#104ea0'; ctx.lineWidth=56;
  ctx.beginPath();
  ctx.moveTo(3125,875); ctx.bezierCurveTo(3192,1108,3252,1370,3318,1565);
  ctx.bezierCurveTo(3352,1668,3400,1765,3462,1900); ctx.stroke();
  ctx.strokeStyle='#0a3c80'; ctx.lineWidth=36;
  ctx.beginPath();
  ctx.moveTo(3125,875); ctx.bezierCurveTo(3192,1108,3252,1370,3318,1565);
  ctx.bezierCurveTo(3352,1668,3400,1765,3462,1900); ctx.stroke();

  /* drogi */
  ctx.lineWidth=26; ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle='#6d6860';
  /* Al. Grunwaldzka */
  ctx.beginPath(); ctx.moveTo(0,1398); ctx.bezierCurveTo(1300,1385,2000,1408,2700,1420); ctx.stroke();
  /* Droga Spacerowa (wzdłuż parku) */
  ctx.beginPath(); ctx.moveTo(540,175); ctx.bezierCurveTo(550,598,545,1008,522,1415); ctx.stroke();
  /* Al. Zjednoczenia (przez Zaspę) */
  ctx.beginPath(); ctx.moveTo(1058,262); ctx.bezierCurveTo(1068,558,1135,832,1208,1132); ctx.stroke();
  /* Kołobrzeska (diagonal) */
  ctx.beginPath(); ctx.moveTo(648,622); ctx.bezierCurveTo(728,732,808,832,935,868); ctx.stroke();
  /* Trasa Sucharskiego → PGE Arena */
  ctx.beginPath(); ctx.moveTo(1208,1132);
  ctx.bezierCurveTo(1820,1100,2600,950,3050,820);
  ctx.bezierCurveTo(3320,720,3520,545,3740,395); ctx.stroke();
  /* ul. Gdańska (N-S) */
  ctx.beginPath(); ctx.moveTo(2382,422); ctx.lineTo(2472,1055); ctx.lineTo(2548,1425); ctx.stroke();

  /* żółte linie środkowe */
  ctx.setLineDash([25,15]); ctx.strokeStyle='rgba(222,208,92,0.28)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(0,1398); ctx.bezierCurveTo(1300,1385,2000,1408,2700,1420); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1058,262); ctx.bezierCurveTo(1068,558,1135,832,1208,1132); ctx.stroke();
  ctx.setLineDash([]);

  /* PRZYMORZE */
  _drawGdnPrzymorze(ctx, ts);

  /* Zaspa — bloki (przesunięte w lewo, start x=905) */
  const zaspaBlocks=[
    {x:905,y:595,w:108,h:162},{x:1024,y:582,w:108,h:162},{x:1142,y:595,w:108,h:162},
    {x:1262,y:588,w:108,h:162},{x:1382,y:595,w:108,h:162},
    {x:962,y:782,w:108,h:162},{x:1080,y:782,w:108,h:162},
    {x:1198,y:782,w:108,h:162},{x:1318,y:782,w:108,h:162},
    {x:1020,y:968,w:108,h:142},{x:1138,y:968,w:108,h:142},{x:1255,y:968,w:108,h:142},
  ];
  for (const b of zaspaBlocks) {
    const bg2=ctx.createLinearGradient(b.x,b.y,b.x+b.w,b.y+b.h);
    bg2.addColorStop(0,'#7e7870'); bg2.addColorStop(1,'#6d6860');
    ctx.fillStyle=bg2; ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.strokeStyle='#5d5850'; ctx.lineWidth=1; ctx.strokeRect(b.x,b.y,b.w,b.h);
    ctx.fillStyle='rgba(172,208,240,0.32)';
    for (let wy=b.y+12;wy<b.y+b.h-8;wy+=22)
      for (let wx=b.x+9;wx<b.x+b.w-8;wx+=25) ctx.fillRect(wx,wy,17,14);
  }

  /* Wrzeszcz — bloki (+600) */
  const wrzBlocks=[
    {x:1542,y:1305,w:80,h:58},{x:1632,y:1298,w:72,h:62},{x:1715,y:1308,w:80,h:58},
    {x:1825,y:1302,w:86,h:62},{x:1922,y:1296,w:74,h:64},{x:2008,y:1308,w:80,h:58},
    {x:2102,y:1302,w:72,h:62},{x:2188,y:1300,w:82,h:60},
    {x:1550,y:1685,w:78,h:58},{x:1642,y:1678,w:88,h:62},{x:1742,y:1686,w:78,h:58},
    {x:1852,y:1682,w:82,h:60},{x:1948,y:1686,w:78,h:58},{x:2042,y:1680,w:82,h:60},
  ];
  for (const b of wrzBlocks) {
    ctx.fillStyle='#7d7870'; ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.strokeStyle='#6d6860'; ctx.lineWidth=0.8; ctx.strokeRect(b.x,b.y,b.w,b.h);
  }

  /* drzewa przy granicy parku */
  {
    let s=71; const rand=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/0xffffffff;};
    for (let i=0;i<90;i++) {
      const tx=380+rand()*118, ty=rand()*1900, tr=8+rand()*11;
      const tg=ctx.createRadialGradient(tx,ty,0,tx,ty,tr);
      tg.addColorStop(0,'#5ac030'); tg.addColorStop(1,'#205012');
      ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(tx,ty,tr,0,Math.PI*2); ctx.fill();
    }
  }

  /* budynki */
  _drawGdnErgoArena   (ctx,{x:1035,y:98,  w:118,h:96});
  _drawGdnMolo        (ctx,{x:2512,y:218, w:80, h:228},ts);
  _drawGdnPGEArena    (ctx,{x:3580,y:148, w:238,h:168});
  _drawGdnWiadukt     (ctx,{x:918, y:746, w:340,h:60});
  _drawGdnGalBalt     (ctx,{x:1580,y:1224,w:152,h:108});
  _drawGdnPolitechnika(ctx,{x:1992,y:1475,w:178,h:100});
  _drawGdnCollegia    (ctx,{x:2015,y:1582,w:130,h:80});
  _drawGdnForum       (ctx,{x:3020,y:1760,w:155,h:90});
  _drawGdnAkademia    (ctx,{x:3224,y:1602,w:152,h:96});
  _drawGdnArmata      (ctx,{x:1846,y:1538,w:76, h:60});

  /* strefy wyjścia */
  for (const ez of SUBMAP_GDANSK.exitZones) {
    const pulse=0.55+Math.sin(ts/500)*0.45;
    ctx.fillStyle=`rgba(255,215,60,${pulse*0.12})`;
    ctx.beginPath(); ctx.arc(ez.x,ez.y,ez.r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=`rgba(255,215,60,${pulse*0.9})`; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(ez.x,ez.y,ez.r,0,Math.PI*2); ctx.stroke();
    ctx.font='bold 11px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillStyle=`rgba(255,215,60,${pulse})`;
    ctx.fillText('← Wyjście',ez.x,ez.y+ez.r+6);
  }

  /* etykiety wody */
  ctx.font='italic 16px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(178,225,255,0.44)'; ctx.shadowColor='#000'; ctx.shadowBlur=7;
  ctx.fillText('Zatoka Gdańska',2380,170);
  ctx.fillStyle='rgba(138,198,255,0.38)';
  ctx.fillText('Martwa Wisła',3320,1350); ctx.shadowBlur=0;

  ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=4;
  ctx.strokeRect(2,2,w-4,h-4);
}

/* ── Ergo Arena ── */
function _drawGdnErgoArena(ctx,b) {
  const cx=b.x+b.w/2, cy=b.y+b.h/2;
  const eg=ctx.createRadialGradient(cx,cy,0,cx,cy,b.w/2);
  eg.addColorStop(0,'#5888c0'); eg.addColorStop(1,'#2858a0');
  ctx.fillStyle=eg;
  ctx.beginPath(); ctx.ellipse(cx,cy,b.w/2,b.h/2,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#1848a0'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.ellipse(cx,cy,b.w/2,b.h/2,0,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='rgba(200,230,255,0.38)';
  ctx.beginPath(); ctx.ellipse(cx,cy,b.w/2-18,b.h/2-14,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.28)'; ctx.lineWidth=1.5;
  for (let a=0;a<Math.PI*2;a+=Math.PI/5) {
    ctx.beginPath(); ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(a)*(b.w/2-4),cy+Math.sin(a)*(b.h/2-4)); ctx.stroke();
  }
  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('ERGO ARENA',cx,cy); ctx.shadowBlur=0;
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,200,100,0.88)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',cx,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Molo w Brzeźnie ── */
function _drawGdnMolo(ctx,b,ts) {
  const mx=b.x+b.w/2;
  ctx.fillStyle='#8a6838'; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.strokeStyle='#6a4820'; ctx.lineWidth=2;
  for (let py=b.y+8;py<b.y+b.h;py+=16) {
    ctx.beginPath(); ctx.moveTo(b.x,py); ctx.lineTo(b.x+b.w,py); ctx.stroke();
  }
  ctx.strokeStyle='#5a3810'; ctx.lineWidth=4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(b.x+4,b.y); ctx.lineTo(b.x+4,b.y+b.h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(b.x+b.w-4,b.y); ctx.lineTo(b.x+b.w-4,b.y+b.h); ctx.stroke();
  for (let ly=b.y+32;ly<b.y+b.h;ly+=72) {
    ctx.strokeStyle='#5a4828'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(b.x+6,ly); ctx.lineTo(b.x+6,ly-22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x+b.w-6,ly); ctx.lineTo(b.x+b.w-6,ly-22); ctx.stroke();
    const glow=0.5+Math.sin(ts/800+ly)*0.5;
    ctx.fillStyle=`rgba(255,240,180,${glow*0.7})`;
    ctx.beginPath(); ctx.arc(b.x+6,ly-24,5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(b.x+b.w-6,ly-24,5,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#7a5828';
  ctx.beginPath(); ctx.arc(mx,b.y+20,22,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#5a3810';
  ctx.beginPath(); ctx.arc(mx,b.y+20,22,Math.PI,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f0e8d0'; ctx.fillRect(mx-14,b.y+8,28,14);
  ctx.font='bold 8px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('Molo w Brzeźnie',mx,b.y+b.h+5); ctx.shadowBlur=0;
  ctx.font='italic 9px "Segoe UI",sans-serif';
  ctx.fillStyle='rgba(255,200,100,0.88)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',mx,b.y+b.h+18); ctx.shadowBlur=0;
}

/* ── PGE Arena (prawy górny róg) ── */
function _drawGdnPGEArena(ctx,b) {
  const cx=b.x+b.w/2, cy=b.y+b.h/2;
  const sg=ctx.createRadialGradient(cx,cy,0,cx,cy,b.w/2);
  sg.addColorStop(0,'#e8b020'); sg.addColorStop(0.6,'#c88010'); sg.addColorStop(1,'#985808');
  ctx.fillStyle=sg;
  ctx.beginPath(); ctx.ellipse(cx,cy,b.w/2,b.h/2,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#784000'; ctx.lineWidth=4;
  ctx.beginPath(); ctx.ellipse(cx,cy,b.w/2,b.h/2,0,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='#2a7820';
  ctx.beginPath(); ctx.ellipse(cx,cy,b.w/2-30,b.h/2-24,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.ellipse(cx,cy,32,22,0,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy-b.h/2+26); ctx.lineTo(cx,cy+b.h/2-26); ctx.stroke();
  ctx.strokeStyle='rgba(230,180,20,0.38)'; ctx.lineWidth=9;
  for (let a=0;a<Math.PI*2;a+=Math.PI/6) {
    const r1=b.w/2-32, r2=b.w/2-14, rH=b.h/b.w;
    ctx.beginPath();
    ctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1*rH);
    ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2*rH); ctx.stroke();
  }
  ctx.font='bold 11px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('PGE Arena',cx,cy-8); ctx.fillText('Gdańsk',cx,cy+10); ctx.shadowBlur=0;
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,200,100,0.88)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',cx,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Wiadukt na Zaspie ── */
function _drawGdnWiadukt(ctx,b) {
  ctx.fillStyle='#4a4438'; ctx.fillRect(b.x,b.y+b.h/2-14,b.w,28);
  ctx.strokeStyle='#585048'; ctx.lineWidth=1;
  for (let rx=b.x+8;rx<b.x+b.w;rx+=18) ctx.strokeRect(rx,b.y+b.h/2-14,12,28);
  ctx.strokeStyle='#888078'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(b.x,b.y+b.h/2-6); ctx.lineTo(b.x+b.w,b.y+b.h/2-6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(b.x,b.y+b.h/2+6); ctx.lineTo(b.x+b.w,b.y+b.h/2+6); ctx.stroke();
  ctx.fillStyle='#686058';
  ctx.fillRect(b.x,b.y,b.w,b.h/2-14);
  ctx.fillRect(b.x,b.y+b.h/2+14,b.w,b.h/2-14);
  ctx.fillStyle='#505048';
  for (let px=b.x+18;px<b.x+b.w-10;px+=58) {
    ctx.fillRect(px,b.y,14,b.h/2-14);
    ctx.fillRect(px,b.y+b.h/2+14,14,b.h/2-14);
  }
  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('Wiadukt na Zaspie',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
  ctx.font='italic 9px "Segoe UI",sans-serif';
  ctx.fillStyle='rgba(255,200,100,0.88)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+18); ctx.shadowBlur=0;
}

/* ── Galeria Bałtycka ── */
function _drawGdnGalBalt(ctx,b) {
  const gg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
  gg.addColorStop(0,'#d0d8e0'); gg.addColorStop(1,'#a8b8c4');
  ctx.fillStyle=gg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#1858a0'; ctx.fillRect(b.x,b.y,b.w,10);
  ctx.fillStyle='rgba(178,220,255,0.65)';
  for (let wx=b.x+12;wx<b.x+b.w-18;wx+=28) ctx.fillRect(wx,b.y+16,20,b.h-22);
  ctx.strokeStyle='#4888c0'; ctx.lineWidth=1;
  for (let wx=b.x+12;wx<b.x+b.w-18;wx+=28) ctx.strokeRect(wx,b.y+16,20,b.h-22);
  ctx.fillStyle='#1a1a28'; ctx.fillRect(b.x+b.w/2-14,b.y+b.h-28,28,28);
  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('Galeria Bałtycka',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
  ctx.font='italic 9px "Segoe UI",sans-serif';
  ctx.fillStyle='rgba(255,200,100,0.88)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+18); ctx.shadowBlur=0;
}

/* ── Politechnika Gdańska ── */
function _drawGdnPolitechnika(ctx,b) {
  const pg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
  pg.addColorStop(0,'#c87858'); pg.addColorStop(1,'#a05838');
  ctx.fillStyle=pg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#b86848'; ctx.fillRect(b.x+b.w/2-26,b.y-18,52,b.h+18);
  ctx.fillStyle='#985028';
  ctx.beginPath(); ctx.moveTo(b.x+b.w/2-30,b.y-18);
  ctx.lineTo(b.x+b.w/2,b.y-50); ctx.lineTo(b.x+b.w/2+30,b.y-18); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(200,228,255,0.65)';
  for (let wx=b.x+12;wx<b.x+b.w-10;wx+=26) {
    ctx.fillRect(wx,b.y+14,14,18);
    ctx.beginPath(); ctx.arc(wx+7,b.y+14,7,Math.PI,0); ctx.fill();
  }
  ctx.fillRect(b.x+b.w/2-16,b.y-8,12,14); ctx.fillRect(b.x+b.w/2+4,b.y-8,12,14);
  ctx.fillStyle='#f0e8d8'; ctx.fillRect(b.x+b.w/2-38,b.y+44,76,20);
  ctx.font='bold 7px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#8a3010'; ctx.fillText('POLITECHNIKA GDAŃSKA',b.x+b.w/2,b.y+54);
  ctx.fillStyle='#1a0808'; ctx.fillRect(b.x+b.w/2-12,b.y+b.h-26,24,26);
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,200,100,0.88)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Collegia ── */
function _drawGdnCollegia(ctx,b) {
  const cg=ctx.createLinearGradient(b.x,b.y,b.x+b.w,b.y);
  cg.addColorStop(0,'#c8c0b0'); cg.addColorStop(1,'#a8a098');
  ctx.fillStyle=cg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#807868'; ctx.fillRect(b.x,b.y,b.w,7);
  ctx.fillStyle='rgba(180,215,255,0.55)';
  for (let wy=b.y+12;wy<b.y+b.h-8;wy+=20)
    for (let wx=b.x+8;wx<b.x+b.w-8;wx+=22) ctx.fillRect(wx,wy,14,14);
  ctx.fillStyle='#f8f8f0'; ctx.fillRect(b.x+b.w/2-28,b.y+30,56,18);
  ctx.font='bold 8px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#504838'; ctx.fillText('COLLEGIA',b.x+b.w/2,b.y+39);
  ctx.fillStyle='#1a1808'; ctx.fillRect(b.x+b.w/2-11,b.y+b.h-26,22,26);
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,200,100,0.88)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Galeria Forum ── */
function _drawGdnForum(ctx,b) {
  const fg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
  fg.addColorStop(0,'#d8e0e8'); fg.addColorStop(1,'#b0b8c8');
  ctx.fillStyle=fg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#384878'; ctx.fillRect(b.x,b.y,b.w,10);
  ctx.fillStyle='rgba(168,215,255,0.7)'; ctx.fillRect(b.x+5,b.y+15,b.w-10,b.h-20);
  ctx.strokeStyle='#5878a0'; ctx.lineWidth=1.5;
  for (let wx=b.x+10;wx<b.x+b.w-10;wx+=24) ctx.strokeRect(wx,b.y+15,20,b.h-20);
  ctx.font='bold 8px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#384878';
  ctx.fillText('FORUM',b.x+b.w/2,b.y+b.h/2-6); ctx.fillText('GDAŃSK',b.x+b.w/2,b.y+b.h/2+8);
  ctx.fillStyle='#1a1828'; ctx.fillRect(b.x+b.w/2-13,b.y+b.h-28,26,28);
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,200,100,0.88)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Akademia Muzyczna (prawy dolny, przy Martwej Wiśle) ── */
function _drawGdnAkademia(ctx,b) {
  const ag=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
  ag.addColorStop(0,'#e0d8c8'); ag.addColorStop(1,'#c0b8a4');
  ctx.fillStyle=ag; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#504028'; ctx.fillRect(b.x,b.y,b.w,8);
  ctx.fillStyle='#d0c8b8';
  for (let px=b.x+12;px<b.x+b.w-10;px+=28) ctx.fillRect(px,b.y,10,b.h);
  ctx.fillStyle='rgba(200,228,255,0.65)';
  for (let wx=b.x+14;wx<b.x+b.w-14;wx+=28) {
    ctx.fillRect(wx,b.y+18,16,22);
    ctx.beginPath(); ctx.arc(wx+8,b.y+18,8,Math.PI,0); ctx.fill();
  }
  ctx.fillStyle='rgba(80,60,30,0.5)'; ctx.font='bold 14px serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('𝄞',b.x+18,b.y+b.h-18); ctx.fillText('𝄞',b.x+b.w-18,b.y+b.h-18);
  ctx.fillStyle='rgba(15,80,160,0.22)'; ctx.fillRect(b.x,b.y+b.h+2,b.w,10);
  ctx.fillStyle='#1a1808'; ctx.fillRect(b.x+b.w/2-11,b.y+b.h-26,22,26);
  ctx.font='bold 8px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('Akademia Muzyczna',b.x+b.w/2,b.y+b.h+15);
  ctx.fillText('(przy Martwej Wiśle)',b.x+b.w/2,b.y+b.h+27); ctx.shadowBlur=0;
  ctx.font='italic 9px "Segoe UI",sans-serif';
  ctx.fillStyle='rgba(255,200,100,0.88)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+40); ctx.shadowBlur=0;
}

/* ── Armata ── */
function _drawGdnArmata(ctx,b) {
  ctx.fillStyle='#5a4828'; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#3a2c14'; ctx.fillRect(b.x,b.y,b.w,7);
  ctx.strokeStyle='rgba(0,0,0,0.2)'; ctx.lineWidth=0.8;
  for (let wy=b.y+10;wy<b.y+b.h-5;wy+=10) {
    const off=(Math.floor((wy-b.y)/10)%2)*18;
    for (let wx=b.x+off;wx<b.x+b.w;wx+=36) ctx.strokeRect(wx,wy,32,8);
  }
  ctx.fillStyle='rgba(255,200,80,0.65)';
  ctx.fillRect(b.x+8,b.y+12,16,18); ctx.fillRect(b.x+b.w-24,b.y+12,16,18);
  ctx.fillStyle='#303028'; ctx.fillRect(b.x+b.w/2-20,b.y+32,40,14);
  ctx.beginPath(); ctx.arc(b.x+b.w/2+20,b.y+39,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#484038'; ctx.beginPath(); ctx.arc(b.x+b.w/2+20,b.y+39,6,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#202018'; ctx.beginPath(); ctx.arc(b.x+b.w/2-24,b.y+36,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f0e0a0'; ctx.fillRect(b.x+b.w/2-22,b.y+48,44,16);
  ctx.font='bold 8px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#3a1808'; ctx.fillText('💣 ARMATA',b.x+b.w/2,b.y+56);
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,200,100,0.88)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ══════════════════════════════════════════════════════
   SUBMAP_GDANSK
   ══════════════════════════════════════════════════════ */
const SUBMAP_GDANSK = {
  id:   'gdansk',
  name: 'Gdańsk',
  w: 4000, h: 1900,
  bgColor: '#868178',

  spawn:         {x: 1200, y: 920},
  mainMapReturn: {x: 1600, y: 480},

  seaCoast: _GDN_COAST,
  bridges:  [{x1:2510, x2:2594, y1:210, y2:455}],

  exitZones: [
    {x: 52, y: 950, r: 65},
  ],

  npcs: [
    {id:'gd1', x:1080,y:172, _x:1080,_y:172, patrolAxis:'x',patrolMin:972, patrolMax:1218,speed:46,_dir: 1,stepAnim:0,bodyColor:'#607878',hairColor:'#281808'},
    {id:'gd2', x:2300,y:492, _x:2300,_y:492, patrolAxis:'x',patrolMin:1980,patrolMax:2500,speed:50,_dir: 1,stepAnim:0,bodyColor:'#4a7048',hairColor:'#201010'},
    {id:'gd3', x:1040,y:832, _x:1040,_y:832, patrolAxis:'x',patrolMin:905, patrolMax:1480,speed:44,_dir:-1,stepAnim:0,bodyColor:'#705848',hairColor:'#1a1010'},
    {id:'gd4', x:1980,y:1025,_x:1980,_y:1025,patrolAxis:'x',patrolMin:1700,patrolMax:2280,speed:48,_dir: 1,stepAnim:0,bodyColor:'#4a6878',hairColor:'#2a1818'},
    {id:'gd5', x:3700,y:320, _x:3700,_y:320, patrolAxis:'x',patrolMin:3560,patrolMax:3940,speed:46,_dir:-1,stepAnim:0,bodyColor:'#687050',hairColor:'#1e1010'},
    {id:'gd6', x:1600,y:1262,_x:1600,_y:1262,patrolAxis:'x',patrolMin:1415,patrolMax:1880,speed:52,_dir: 1,stepAnim:0,bodyColor:'#507068',hairColor:'#281808'},
    {id:'gd7', x:1900,y:1418,_x:1900,_y:1418,patrolAxis:'x',patrolMin:1658,patrolMax:2282,speed:44,_dir: 1,stepAnim:0,bodyColor:'#486858',hairColor:'#201808'},
    {id:'gd8', x:2055,y:1568,_x:2055,_y:1568,patrolAxis:'x',patrolMin:1755,patrolMax:2318,speed:48,_dir:-1,stepAnim:0,bodyColor:'#605848',hairColor:'#1a1010'},
    {id:'gd9', x:2300,y:1762,_x:2300,_y:1762,patrolAxis:'x',patrolMin:2008,patrolMax:2750,speed:46,_dir: 1,stepAnim:0,bodyColor:'#487060',hairColor:'#281808'},
    {id:'gd10',x:295, y:958, _x:295, _y:958,  patrolAxis:'y',patrolMin:742, patrolMax:1338,speed:40,_dir: 1,stepAnim:0,bodyColor:'#486038',hairColor:'#1a2010'},
    {id:'gd11',x:615, y:845, _x:615, _y:845,  patrolAxis:'x',patrolMin:515, patrolMax:895, speed:85,_dir: 1,stepAnim:0,bodyColor:'#a01818',hairColor:'#380808'},
  ],

  onEnter() {
    _GDN_Q11_ENTRY = false;
    _PRZYM_ST.spawned = false;
    /* Q10: Rafał enters Gdańsk with player */
    if (typeof _KM_QUEST !== 'undefined' && _KM_QUEST.state === 'q10_follow') {
      _GDN_RAFAL.x = 1250; _GDN_RAFAL.y = 960;
      _GDN_RAFAL.active = true;
    } else {
      _GDN_RAFAL.active = false;
    }
  },

  draw(ctx, ts)               { _drawGdansk(ctx, this, ts); },
  updateQuests(dt, subPlayer) { updateGdanskQuests(dt, subPlayer); },
  drawQuests(ctx, ts)         { drawGdanskQuests(ctx, ts); },
  drawQuestsHUD(ctx, cw, ch)  { drawGdanskQuestsHUD(ctx, cw, ch); },
};

/* ══════════════════════════════════════════════════════
   Q13 — Giga Turbo Agnieszka Cutscene
   ══════════════════════════════════════════════════════ */
const _GTA_SCENE = {
  active: false, phase: 0, riseAmt: 0, flyAmt: 0,
  dlgStep: -1, waitBtn: false, onDone: null,
};

function _openGTAScene(onDone) {
  const ov  = document.getElementById('gta-scene-overlay');
  const cv  = document.getElementById('gta-scene-cvs');
  const dlg = document.getElementById('gta-dialog-box');
  const txt = document.getElementById('gta-dialog-text');
  const btn = document.getElementById('gta-dialog-next');
  const por = document.getElementById('gta-portrait');

  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
  ov.classList.remove('hidden');
  dlg.classList.add('hidden');

  Object.assign(_GTA_SCENE, { active: true, phase: 0, riseAmt: 0, flyAmt: 0, dlgStep: -1, waitBtn: false, onDone });

  const DIALOGS = [
    { p: '👾', t: 'Giga Turbo Agnieszka:\nJestem Giga Turbo Agnieszką i to ja jestem prawdziwą Agą' },
    { p: '😡', t: 'Agata:\nYyyy Agnieszka, głupia jesteś i nie fajna' },
    { p: '🤣', t: 'Giga Turbo Agnieszka:\nHA HA HA HA HA!' },
    { p: '👾', t: 'Giga Turbo Agnieszka:\nRafał gdy mówi Aga zawsze myśli o mnie a nie o tobie' },
    { p: '🤬', t: 'Agata:\nNo i chuj, muszę cię zabić!' },
  ];

  function showDlg(step) {
    por.textContent = DIALOGS[step].p;
    txt.textContent = DIALOGS[step].t;
    dlg.classList.remove('hidden');
    _GTA_SCENE.waitBtn = true;
    _GTA_SCENE.dlgStep = step;
  }

  btn.onclick = () => {
    if (!_GTA_SCENE.waitBtn) return;
    const next = _GTA_SCENE.dlgStep + 1;
    if (next < DIALOGS.length) {
      showDlg(next);
    } else {
      dlg.classList.add('hidden');
      _GTA_SCENE.waitBtn = false;
      _GTA_SCENE.phase = 2; // fly away
    }
  };

  let lastTs = null;
  function tick(ts) {
    if (!_GTA_SCENE.active) return;
    const dt = lastTs === null ? 16 : Math.min(ts - lastTs, 80);
    lastTs = ts;
    const dtS = dt / 1000;
    const W = cv.width, H = cv.height;
    const c = cv.getContext('2d');

    if (_GTA_SCENE.phase === 0) {
      _GTA_SCENE.riseAmt = Math.min(1, _GTA_SCENE.riseAmt + dtS / 2.8);
      if (_GTA_SCENE.riseAmt >= 1 && !_GTA_SCENE.waitBtn) {
        _GTA_SCENE.phase = 1; showDlg(0);
      }
    } else if (_GTA_SCENE.phase === 2) {
      _GTA_SCENE.flyAmt = Math.min(1, _GTA_SCENE.flyAmt + dtS / 2.2);
      if (_GTA_SCENE.flyAmt >= 1) {
        _GTA_SCENE.active = false;
        ov.classList.add('hidden');
        if (_GTA_SCENE.onDone) _GTA_SCENE.onDone();
        return;
      }
    }
    _gtaSceneDraw(c, W, H, ts);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function _gtaSceneDraw(c, W, H, ts) {
  /* ── Night sky ── */
  const skyG = c.createLinearGradient(0, 0, 0, H * 0.5);
  skyG.addColorStop(0, '#050818'); skyG.addColorStop(1, '#0d1a40');
  c.fillStyle = skyG; c.fillRect(0, 0, W, H * 0.5);

  /* Stars */
  const rng = (s) => { let x = Math.sin(s)*43758; return x - Math.floor(x); };
  for (let i = 0; i < 60; i++) {
    const sx = rng(i*3.1) * W, sy = rng(i*7.3) * H * 0.44;
    const a = 0.4 + rng(i*13) * 0.6 + Math.sin(ts/800+i) * 0.15;
    c.fillStyle = `rgba(255,255,255,${a})`;
    c.fillRect(sx - 1, sy - 1, 1.5, 1.5);
  }

  /* Sea */
  const seaG = c.createLinearGradient(0, H*0.44, 0, H);
  seaG.addColorStop(0, '#061840'); seaG.addColorStop(1, '#020810');
  c.fillStyle = seaG; c.fillRect(0, H * 0.44, W, H * 0.56);

  /* Waves */
  c.strokeStyle = 'rgba(80,140,255,0.28)'; c.lineWidth = 2;
  for (let wi = 0; wi < 5; wi++) {
    const wy = H * (0.46 + wi * 0.03) + Math.sin(ts/900+wi*1.4)*4;
    c.beginPath(); c.moveTo(0, wy);
    for (let x = 0; x < W; x += 55) c.quadraticCurveTo(x+27, wy-5, x+55, wy);
    c.stroke();
  }

  /* Pier (perspective) */
  const cx = W * 0.5, ph = H * 0.44, pw0 = 70, pw1 = 300;
  c.fillStyle = '#5a3a20';
  c.beginPath();
  c.moveTo(cx-pw0/2,ph); c.lineTo(cx+pw0/2,ph);
  c.lineTo(cx+pw1/2,H); c.lineTo(cx-pw1/2,H);
  c.closePath(); c.fill();
  c.strokeStyle = '#3a2010'; c.lineWidth = 1.5;
  for (let t = 0; t <= 1; t += 0.09) {
    const by = ph + (H-ph)*t, bw = pw0 + (pw1-pw0)*t;
    c.beginPath(); c.moveTo(cx-bw/2,by); c.lineTo(cx+bw/2,by); c.stroke();
  }
  c.lineWidth = 3;
  c.beginPath(); c.moveTo(cx-pw0/2,ph); c.lineTo(cx-pw1/2,H); c.stroke();
  c.beginPath(); c.moveTo(cx+pw0/2,ph); c.lineTo(cx+pw1/2,H); c.stroke();

  /* Agata at pier end (small, angry) */
  _gtaDrawAgata(c, cx, H * 0.39, ts);

  /* Giga Turbo Agnieszka — appears to the right of the pier */
  const R = Math.min(W, H) * 0.1;
  const seaLine = H * 0.44;
  const gtaCx = W * 0.72;
  let waistY;
  if (_GTA_SCENE.phase <= 1) {
    waistY = H + R*3 - _GTA_SCENE.riseAmt * (H + R*3 - seaLine);
  } else {
    waistY = seaLine - _GTA_SCENE.flyAmt * (seaLine + R*6);
  }
  _gtaDrawGigaTurboAgnieszka(c, gtaCx, waistY, R, ts);

  /* Moonlight on sea if phase 2 */
  if (_GTA_SCENE.phase === 2 && _GTA_SCENE.flyAmt > 0.3) {
    const glow = (_GTA_SCENE.flyAmt - 0.3) / 0.7;
    c.fillStyle = `rgba(200,100,255,${glow*0.18})`;
    c.fillRect(0, 0, W, H);
  }
}

function _gtaDrawAgata(c, x, y, ts) {
  const bob = Math.sin(ts/600) * 1.2;
  c.save(); c.translate(x, y + bob);
  const s = 1.3;
  c.scale(s, s);
  c.beginPath(); c.ellipse(2,14,10,4,0,0,Math.PI*2);
  c.fillStyle='rgba(0,0,0,0.22)'; c.fill();
  c.fillStyle='#7bb8e8';
  c.fillRect(-5,5,4,12); c.fillRect(1,5,4,12);
  c.fillStyle='#d0e8ff';
  c.beginPath(); c.ellipse(0,-1,8,9,0,0,Math.PI*2); c.fill();
  c.fillStyle='#d4b830';
  c.beginPath(); c.ellipse(0,-16,8,9,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(0,-18,9,Math.PI,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(-8,-14,3.5,6,0.2,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(8,-14,3.5,6,-0.2,0,Math.PI*2); c.fill();
  c.fillStyle='#fde8d8';
  c.beginPath(); c.ellipse(0,-16,6.5,7,0,0,Math.PI*2); c.fill();
  c.fillStyle='#5a8aba';
  c.beginPath(); c.arc(-2.5,-17,2,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(2.5,-17,2,0,Math.PI*2); c.fill();
  c.fillStyle='#111';
  c.beginPath(); c.arc(-2.5,-17,0.9,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(2.5,-17,0.9,0,Math.PI*2); c.fill();
  /* angry eyebrows */
  c.strokeStyle='#3a1a08'; c.lineWidth=1.2; c.lineCap='round';
  c.beginPath(); c.moveTo(-5,-21); c.lineTo(-1,-19); c.stroke();
  c.beginPath(); c.moveTo(5,-21); c.lineTo(1,-19); c.stroke();
  /* fists (angry pose) */
  c.fillStyle='#fde8d8';
  c.beginPath(); c.arc(-12,-3,4,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(12,-3,4,0,Math.PI*2); c.fill();
  c.restore();
}

function _gtaDrawGigaTurboAgnieszka(c, cx, waistY, R, ts) {
  if (waistY > 3000) return;
  const headY = waistY - R * 3.4;

  c.shadowBlur = 0;

  /* Arms (raised menacingly) */
  c.shadowBlur = 0;
  c.fillStyle = '#f0c8a0';
  const armSwing = Math.sin(ts/700) * 0.12;
  c.save(); c.translate(cx - R*0.95, waistY - R*2.4); c.rotate(-0.45 + armSwing);
  c.fillRect(-R*0.14, -R*1.1, R*0.28, R*1.3);
  c.beginPath(); c.arc(0, -R*1.1, R*0.2, 0, Math.PI*2); c.fill();
  c.restore();
  c.save(); c.translate(cx + R*0.95, waistY - R*2.4); c.rotate(0.45 - armSwing);
  c.fillRect(-R*0.14, -R*1.1, R*0.28, R*1.3);
  c.beginPath(); c.arc(0, -R*1.1, R*0.2, 0, Math.PI*2); c.fill();
  c.restore();

  /* Neck */
  c.fillStyle = '#f0c8a0';
  c.beginPath(); c.ellipse(cx, waistY - R*3.0, R*0.22, R*0.38, 0, 0, Math.PI*2); c.fill();

  /* Body — black blouse */
  c.shadowBlur = 0;
  c.fillStyle = '#111';
  c.beginPath(); c.ellipse(cx, waistY - R*1.6, R*0.82, R*1.9, 0, 0, Math.PI*2); c.fill();

  /* Large breasts in deep V-neck décolletage */
  c.fillStyle = '#f2c4a0';
  c.beginPath(); c.ellipse(cx - R*0.3, waistY - R*2.2, R*0.5, R*0.65, 0.08, 0, Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(cx + R*0.3, waistY - R*2.2, R*0.5, R*0.65, -0.08, 0, Math.PI*2); c.fill();
  /* Cleavage shadow line */
  c.fillStyle = 'rgba(140,70,30,0.3)';
  c.beginPath();
  c.moveTo(cx, waistY - R*3.0);
  c.bezierCurveTo(cx - R*0.07, waistY - R*2.6, cx - R*0.07, waistY - R*2.1, cx, waistY - R*1.95);
  c.bezierCurveTo(cx + R*0.07, waistY - R*2.1, cx + R*0.07, waistY - R*2.6, cx, waistY - R*3.0);
  c.closePath(); c.fill();
  /* V-neck blouse edge — sharp line showing neckline */
  c.strokeStyle = '#111'; c.lineWidth = Math.max(2.5, R*0.09); c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - R*0.78, waistY - R*3.05);
  c.lineTo(cx, waistY - R*1.92);
  c.lineTo(cx + R*0.78, waistY - R*3.05);
  c.stroke();
  /* Feminine legs with fishnet (drawn before skirt so skirt covers top) */
  const legTopY = waistY - R*0.08, legBotY = waistY + R*1.5;
  const skin = '#f0c8a0';

  /* Helper: draw one curved leg and apply fishnet on top */
  function _drawLeg(oTop, iTop, oBot, iBot) {
    c.fillStyle = skin;
    c.beginPath();
    c.moveTo(oTop, legTopY);
    /* outer edge curves outward at thigh then tapers */
    c.bezierCurveTo(oTop - R*0.06, legTopY + (legBotY-legTopY)*0.35,
                    oBot - R*0.03, legTopY + (legBotY-legTopY)*0.65, oBot, legBotY);
    c.lineTo(iBot, legBotY);
    /* inner edge nearly straight */
    c.bezierCurveTo(iBot, legTopY + (legBotY-legTopY)*0.5,
                    iTop, legTopY + (legBotY-legTopY)*0.15, iTop, legTopY);
    c.closePath(); c.fill();
    /* fishnet */
    c.save(); c.clip();
    c.strokeStyle = 'rgba(8,0,12,0.55)'; c.lineWidth = Math.max(1, R*0.025);
    const ns = Math.max(4, R*0.13);
    for (let fy = legTopY; fy <= legBotY; fy += ns) {
      c.beginPath(); c.moveTo(Math.min(oTop,oBot)-R*0.1, fy); c.lineTo(Math.max(iTop,iBot)+R*0.1, fy); c.stroke();
    }
    for (let fx = Math.min(oTop,oBot)-R*0.1; fx <= Math.max(iTop,iBot)+R*0.1; fx += ns) {
      c.beginPath(); c.moveTo(fx, legTopY); c.lineTo(fx, legBotY); c.stroke();
    }
    c.restore();
  }

  const ns = Math.max(4, R*0.13);

  /* Left leg — wider thigh */
  c.save();
  c.beginPath();
  c.moveTo(cx - R*0.80, legTopY);
  c.bezierCurveTo(cx - R*0.90, legTopY+(legBotY-legTopY)*0.35, cx-R*0.58, legTopY+(legBotY-legTopY)*0.65, cx-R*0.50, legBotY);
  c.lineTo(cx - R*0.08, legBotY);
  c.bezierCurveTo(cx-R*0.08, legTopY+(legBotY-legTopY)*0.5, cx-R*0.10, legTopY+(legBotY-legTopY)*0.15, cx-R*0.10, legTopY);
  c.closePath();
  c.fillStyle = skin; c.fill();
  c.clip();
  c.strokeStyle = 'rgba(8,0,12,0.55)'; c.lineWidth = Math.max(1, R*0.025);
  for (let fy = legTopY; fy <= legBotY; fy += ns) {
    c.beginPath(); c.moveTo(cx-R*1.0,fy); c.lineTo(cx,fy); c.stroke();
  }
  for (let fx = cx-R*1.0; fx <= cx; fx += ns) {
    c.beginPath(); c.moveTo(fx,legTopY); c.lineTo(fx,legBotY); c.stroke();
  }
  c.restore();

  /* Right leg — wider thigh */
  c.save();
  c.beginPath();
  c.moveTo(cx + R*0.10, legTopY);
  c.bezierCurveTo(cx+R*0.10, legTopY+(legBotY-legTopY)*0.15, cx+R*0.08, legTopY+(legBotY-legTopY)*0.5, cx+R*0.08, legBotY);
  c.lineTo(cx + R*0.50, legBotY);
  c.bezierCurveTo(cx+R*0.58, legTopY+(legBotY-legTopY)*0.65, cx+R*0.90, legTopY+(legBotY-legTopY)*0.35, cx+R*0.80, legTopY);
  c.closePath();
  c.fillStyle = skin; c.fill();
  c.clip();
  c.strokeStyle = 'rgba(8,0,12,0.55)'; c.lineWidth = Math.max(1, R*0.025);
  for (let fy = legTopY; fy <= legBotY; fy += ns) {
    c.beginPath(); c.moveTo(cx,fy); c.lineTo(cx+R*1.0,fy); c.stroke();
  }
  for (let fx = cx; fx <= cx+R*1.0; fx += ns) {
    c.beginPath(); c.moveTo(fx,legTopY); c.lineTo(fx,legBotY); c.stroke();
  }
  c.restore();

  /* Black short skirt hem */
  c.fillStyle = '#111';
  c.beginPath(); c.ellipse(cx, waistY - R*0.55, R*0.86, R*0.62, 0, 0, Math.PI*2); c.fill();
  c.fillStyle = '#222';
  c.beginPath(); c.ellipse(cx, waistY - R*0.35, R*0.86, R*0.3, 0, 0, Math.PI*2); c.fill();

  /* Back hair — very long platinum strands behind everything */
  c.fillStyle = '#c8c8e0';
  c.beginPath();
  c.moveTo(cx - R, headY + R*0.2);
  c.bezierCurveTo(cx-R*2.0, headY+R*2.0, cx-R*2.2, headY+R*4.0, cx-R*1.8, waistY + R*0.5);
  c.lineTo(cx-R*1.1, waistY); c.bezierCurveTo(cx-R*1.6, headY+R*3.5, cx-R*1.5, headY+R*1.6, cx-R*0.7, headY+R*0.3);
  c.closePath(); c.fill();
  c.beginPath();
  c.moveTo(cx + R, headY + R*0.2);
  c.bezierCurveTo(cx+R*2.0, headY+R*2.0, cx+R*2.2, headY+R*4.0, cx+R*1.8, waistY + R*0.5);
  c.lineTo(cx+R*1.1, waistY); c.bezierCurveTo(cx+R*1.6, headY+R*3.5, cx+R*1.5, headY+R*1.6, cx+R*0.7, headY+R*0.3);
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = R*0.035; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx-R*0.4, headY); c.bezierCurveTo(cx-R*1.2, headY+R*1.5, cx-R*1.5, headY+R*3, cx-R*1.3, waistY); c.stroke();
  c.beginPath(); c.moveTo(cx+R*0.4, headY); c.bezierCurveTo(cx+R*1.2, headY+R*1.5, cx+R*1.5, headY+R*3, cx+R*1.3, waistY); c.stroke();

  /* Top hair cap — drawn BEFORE face (upper semicircle), face oval covers lower edge = clean hairline */
  c.fillStyle = '#e8e8f5';
  c.beginPath();
  c.arc(cx, headY - R*0.04, R*1.07, Math.PI, 0); // CW from left→top→right = upper half
  c.closePath(); c.fill();
  /* Platinum sheen on crown */
  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.beginPath(); c.ellipse(cx-R*0.12, headY - R*1.06, R*0.26, R*0.15, -0.35, 0, Math.PI*2); c.fill();

  /* Face — feminine oval (narrower width, slightly taller) drawn over lower hair cap */
  c.shadowBlur = 0;
  c.fillStyle = '#f0c8a0';
  c.beginPath(); c.ellipse(cx, headY + R*0.06, R*0.88, R*1.0, 0, 0, Math.PI*2); c.fill();

  /* BANGS — connects face to hair cap at hairline, sits on top of both */
  c.fillStyle = '#dcdcec';
  c.beginPath();
  c.moveTo(cx - R*1.0, headY - R*0.52);
  c.quadraticCurveTo(cx - R*0.52, headY + R*0.06, cx - R*0.16, headY - R*0.08);
  c.quadraticCurveTo(cx, headY + R*0.04, cx + R*0.16, headY - R*0.08);
  c.quadraticCurveTo(cx + R*0.52, headY + R*0.06, cx + R*1.0, headY - R*0.52);
  c.quadraticCurveTo(cx + R*1.07, headY - R*1.04, cx, headY - R*1.08);
  c.quadraticCurveTo(cx - R*1.07, headY - R*1.04, cx - R*1.0, headY - R*0.52);
  c.closePath(); c.fill();
  /* bang highlights */
  c.strokeStyle='rgba(255,255,255,0.5)'; c.lineWidth=R*0.04; c.lineCap='round';
  c.beginPath(); c.moveTo(cx-R*0.3, headY-R*0.95); c.quadraticCurveTo(cx-R*0.5, headY-R*0.38, cx-R*0.12, headY-R*0.04); c.stroke();
  c.beginPath(); c.moveTo(cx+R*0.1, headY-R*0.9); c.quadraticCurveTo(cx+R*0.3, headY-R*0.32, cx+R*0.06, headY-R*0.04); c.stroke();

  /* Side face-framing waves — drawn AFTER face so they appear IN FRONT of cheeks */
  c.fillStyle = '#d0d0e8';
  /* Left side waves */
  c.beginPath();
  c.moveTo(cx - R*0.82, headY - R*0.58);
  c.bezierCurveTo(cx-R*1.35, headY-R*0.12, cx-R*1.52, headY+R*0.48, cx-R*1.32, headY+R*0.9);
  c.bezierCurveTo(cx-R*1.12, headY+R*1.32, cx-R*1.45, headY+R*1.65, cx-R*1.25, headY+R*2.1);
  c.lineTo(cx-R*0.68, headY+R*2.1);
  c.bezierCurveTo(cx-R*0.88, headY+R*1.55, cx-R*0.58, headY+R*1.08, cx-R*0.76, headY+R*0.7);
  c.bezierCurveTo(cx-R*0.94, headY+R*0.32, cx-R*0.64, headY-R*0.04, cx-R*0.8, headY-R*0.35);
  c.closePath(); c.fill();
  /* Right side (mirror) */
  c.beginPath();
  c.moveTo(cx + R*0.82, headY - R*0.58);
  c.bezierCurveTo(cx+R*1.35, headY-R*0.12, cx+R*1.52, headY+R*0.48, cx+R*1.32, headY+R*0.9);
  c.bezierCurveTo(cx+R*1.12, headY+R*1.32, cx+R*1.45, headY+R*1.65, cx+R*1.25, headY+R*2.1);
  c.lineTo(cx+R*0.68, headY+R*2.1);
  c.bezierCurveTo(cx+R*0.88, headY+R*1.55, cx+R*0.58, headY+R*1.08, cx+R*0.76, headY+R*0.7);
  c.bezierCurveTo(cx+R*0.94, headY+R*0.32, cx+R*0.64, headY-R*0.04, cx+R*0.8, headY-R*0.35);
  c.closePath(); c.fill();
  /* Side strand highlights */
  c.strokeStyle = 'rgba(255,255,255,0.42)'; c.lineWidth = R*0.038; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx-R*1.08, headY+R*0.05); c.bezierCurveTo(cx-R*1.3, headY+R*0.85, cx-R*1.12, headY+R*1.52, cx-R*1.0, headY+R*2.05); c.stroke();
  c.beginPath(); c.moveTo(cx+R*1.08, headY+R*0.05); c.bezierCurveTo(cx+R*1.3, headY+R*0.85, cx+R*1.12, headY+R*1.52, cx+R*1.0, headY+R*2.05); c.stroke();

  /* Dark eyeshadow zones */
  const eyeOff = R*0.36, eyeY = headY - R*0.05;
  c.fillStyle = 'rgba(10,0,20,0.7)';
  c.beginPath(); c.ellipse(cx-eyeOff, eyeY, R*0.29, R*0.19, 0, 0, Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(cx+eyeOff, eyeY, R*0.29, R*0.19, 0, 0, Math.PI*2); c.fill();
  /* Eye whites — narrow for squinted/half-closed look */
  c.fillStyle = '#f5f0ff';
  c.beginPath(); c.ellipse(cx-eyeOff, eyeY, R*0.19, R*0.08, 0, 0, Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(cx+eyeOff, eyeY, R*0.19, R*0.08, 0, 0, Math.PI*2); c.fill();
  /* Dark green irises — partially hidden by narrow opening */
  c.shadowBlur=0;
  c.fillStyle='#1e3e1e';
  c.beginPath(); c.arc(cx-eyeOff, eyeY, R*0.1, 0, Math.PI*2); c.fill();
  c.beginPath(); c.arc(cx+eyeOff, eyeY, R*0.1, 0, Math.PI*2); c.fill();
  c.fillStyle='#000';
  c.beginPath(); c.arc(cx-eyeOff, eyeY, R*0.055, 0, Math.PI*2); c.fill();
  c.beginPath(); c.arc(cx+eyeOff, eyeY, R*0.055, 0, Math.PI*2); c.fill();
  /* Eye shine */
  c.fillStyle='rgba(255,255,255,0.88)';
  c.beginPath(); c.arc(cx-eyeOff+R*0.05, eyeY-R*0.028, R*0.028, 0, Math.PI*2); c.fill();
  c.beginPath(); c.arc(cx+eyeOff+R*0.05, eyeY-R*0.028, R*0.028, 0, Math.PI*2); c.fill();
  /* Upper eyelid — thick curved line creating squint */
  c.strokeStyle='#000'; c.lineWidth=Math.max(2.5, R*0.085); c.lineCap='round';
  c.beginPath(); c.moveTo(cx-eyeOff-R*0.21, eyeY+R*0.01); c.quadraticCurveTo(cx-eyeOff, eyeY-R*0.1, cx-eyeOff+R*0.21, eyeY+R*0.01); c.stroke();
  c.beginPath(); c.moveTo(cx+eyeOff-R*0.21, eyeY+R*0.01); c.quadraticCurveTo(cx+eyeOff, eyeY-R*0.1, cx+eyeOff+R*0.21, eyeY+R*0.01); c.stroke();
  /* Eyeliner wings */
  c.beginPath(); c.moveTo(cx-eyeOff-R*0.21, eyeY+R*0.01); c.lineTo(cx-eyeOff-R*0.4, eyeY-R*0.1); c.stroke();
  c.beginPath(); c.moveTo(cx+eyeOff+R*0.21, eyeY+R*0.01); c.lineTo(cx+eyeOff+R*0.4, eyeY-R*0.1); c.stroke();
  /* Lower lash line */
  c.lineWidth=Math.max(1.5, R*0.045);
  c.beginPath(); c.moveTo(cx-eyeOff-R*0.19, eyeY+R*0.07); c.quadraticCurveTo(cx-eyeOff, eyeY+R*0.12, cx-eyeOff+R*0.19, eyeY+R*0.07); c.stroke();
  c.beginPath(); c.moveTo(cx+eyeOff-R*0.19, eyeY+R*0.07); c.quadraticCurveTo(cx+eyeOff, eyeY+R*0.12, cx+eyeOff+R*0.19, eyeY+R*0.07); c.stroke();

  /* Nose */
  c.strokeStyle='rgba(180,100,60,0.4)'; c.lineWidth=R*0.05; c.lineCap='round';
  c.beginPath(); c.moveTo(cx-R*0.08,headY+R*0.18); c.lineTo(cx,headY+R*0.3); c.lineTo(cx+R*0.08,headY+R*0.18); c.stroke();

  /* Black lips — closed, realistic shape, narrow and low */
  const mX=cx, mY=headY+R*0.58, mW=R*0.22, mH=R*0.075;
  c.fillStyle='#0d0d0d';
  c.beginPath();
  /* upper lip: cupid's bow */
  c.moveTo(mX-mW, mY);
  c.bezierCurveTo(mX-mW+R*0.06, mY-mH*0.9, mX-mW*0.35, mY-mH*1.3, mX, mY-mH*0.5);
  c.bezierCurveTo(mX+mW*0.35, mY-mH*1.3, mX+mW-R*0.06, mY-mH*0.9, mX+mW, mY);
  /* lower lip: full rounded arc */
  c.bezierCurveTo(mX+mW*0.65, mY+mH*1.1, mX-mW*0.65, mY+mH*1.1, mX-mW, mY);
  c.closePath(); c.fill();
  /* subtle lower lip shine */
  c.fillStyle='rgba(80,0,60,0.35)';
  c.beginPath(); c.ellipse(mX, mY+mH*0.6, mW*0.45, mH*0.38, 0, 0, Math.PI*2); c.fill();
  /* lip line */
  c.strokeStyle='#050505'; c.lineWidth=Math.max(1, R*0.04); c.lineCap='round';
  c.beginPath();
  c.moveTo(mX-mW, mY);
  c.bezierCurveTo(mX-mW*0.4, mY+R*0.02, mX+mW*0.4, mY+R*0.02, mX+mW, mY);
  c.stroke();

  /* Name label (shown while half-emerged) */
  if (_GTA_SCENE.phase === 1) {
    const fontSize = Math.max(14, Math.round(R * 0.38));
    c.font = `bold ${fontSize}px "Segoe UI",sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'bottom';
    c.fillStyle = '#ff60ff'; c.shadowColor='#000'; c.shadowBlur=8;
    c.fillText('⚡ GIGA TURBO AGNIESZKA ⚡', cx, headY - R*1.1);
    c.shadowBlur = 0;
  }

}

SUBMAPS['gdansk'] = SUBMAP_GDANSK;
