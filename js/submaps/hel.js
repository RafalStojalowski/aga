'use strict';

/* ══════════════════════════════════════════════════════
   Hel — kształt półwyspu (kolizja)
   Półwysep biegnie po przekątnej: górny prawy → dolny lewy
   ══════════════════════════════════════════════════════ */
const _HEL_SHAPES = [
  {y:    0, xl: 1760, xr: 2370},
  {y:  420, xl: 1340, xr: 1950},
  {y:  770, xl:  990, xr: 1600},
  {y: 1080, xl:  700, xr: 1270},
  {y: 1320, xl:  480, xr:  970},
  {y: 1620, xl:  200, xr:  610},
  {y: 1920, xl:   40, xr:  310},
];

function _helBounds(y) {
  const sh = _HEL_SHAPES, n = sh.length;
  if (y <= 0)           return {xl: sh[0].xl,   xr: sh[0].xr};
  if (y >= sh[n-1].y)   return {xl: sh[n-1].xl, xr: sh[n-1].xr};
  for (let i = 0; i < n - 1; i++) {
    if (y >= sh[i].y && y < sh[i+1].y) {
      const t = (y - sh[i].y) / (sh[i+1].y - sh[i].y);
      return {
        xl: sh[i].xl + t * (sh[i+1].xl - sh[i].xl),
        xr: sh[i].xr + t * (sh[i+1].xr - sh[i].xr),
      };
    }
  }
  return {xl: sh[n-1].xl, xr: sh[n-1].xr};
}

/* ══════════════════════════════════════════════════════
   Morskie Agnieszki
   ══════════════════════════════════════════════════════ */
const _HEL_MA_SPAWNS = [
  {x: 1450, y: 630},
  {x: 1020, y: 1045},
  {x:  715, y: 1310},
  {x:  850, y: 740},
  {x: 1230, y: 880},
];

const _HEL_ST = {
  morskaAg:      [],
  spawned:       false,
  playerAttTimer: 0,
  playerHitFlash: 0,
  resCooldown:   0,
  gofCooldown:   0,
  cypelCooldown: 0,
};

/* ── Q8 quest state ── */
const _HEL_QUEST = {
  state: 'inactive',
  // inactive → q8_ready → q8_intro → q8_hunt → q8_return → q8_shop → q8_done
  kills: 0,          // cumulative kills during q8_hunt (enemies can respawn)
  trigCD: 0,
  nextState: null,
};
function _hqNext(s) { _HEL_QUEST.nextState = s; }

/* ── Q12 state ── */
const _HEL_Q12 = { state: 'inactive', trigCD: 0 };

/* ══════════════════════════════════════════════════════
   Waffle Minigame (Q12)
   ══════════════════════════════════════════════════════ */
const _WAFFLE = {
  active: false, eaten: 0, misses: 0, prevTs: 0,
  fx: 0, fy: 0,
  waffles: [],
  spawnTimer: 0,
  cream: [],
  state: 'playing',
  rafId: null, onDone: null,
};

/* simple key tracker for waffle movement */
const _WAFFLE_KEYS = { up: false, down: false, left: false, right: false };
document.addEventListener('keydown', function(e) {
  if (!_WAFFLE.active) return;
  if (e.key === 'ArrowUp'    || e.key === 'w' || e.key === 'W') _WAFFLE_KEYS.up    = true;
  if (e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S') _WAFFLE_KEYS.down  = true;
  if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') _WAFFLE_KEYS.left  = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') _WAFFLE_KEYS.right = true;
});
document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowUp'    || e.key === 'w' || e.key === 'W') _WAFFLE_KEYS.up    = false;
  if (e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S') _WAFFLE_KEYS.down  = false;
  if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') _WAFFLE_KEYS.left  = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') _WAFFLE_KEYS.right = false;
});

function _openWaffleGame(onDone) {
  const ov = document.getElementById('waffle-overlay');
  if (!ov) { if (onDone) onDone(); return; }
  const cv = document.getElementById('waffle-cvs');
  cv.width  = ov.clientWidth  || window.innerWidth;
  cv.height = ov.clientHeight || window.innerHeight;
  Object.assign(_WAFFLE, {
    active: true, eaten: 0, misses: 0,
    fx: cv.width / 2, fy: cv.height * 0.55,
    waffles: [], spawnTimer: 1.5, cream: [],
    state: 'playing', prevTs: performance.now(), onDone,
  });
  ov.classList.remove('hidden');
  document.getElementById('waffle-result').classList.add('hidden');
  document.getElementById('waffle-close').onclick = function() {
    ov.classList.add('hidden');
    _WAFFLE.active = false;
    if (_WAFFLE.rafId) { cancelAnimationFrame(_WAFFLE.rafId); _WAFFLE.rafId = null; }
    _WAFFLE_KEYS.up = _WAFFLE_KEYS.down = _WAFFLE_KEYS.left = _WAFFLE_KEYS.right = false;
    if (_WAFFLE.state === 'won') {
      if (_WAFFLE.onDone) { const cb = _WAFFLE.onDone; _WAFFLE.onDone = null; cb(); }
    } else {
      /* lost — reset cooldowns so player can retry */
      _HEL_Q12.trigCD = 0;
      _HEL_ST.gofCooldown = 0;
      _WAFFLE.onDone = null;
    }
  };
  _WAFFLE.rafId = requestAnimationFrame(_waffleLoop);
}

function _waffleLoop(ts) {
  if (!_WAFFLE.active) return;
  _WAFFLE.rafId = requestAnimationFrame(_waffleLoop);
  const dt   = Math.min(ts - _WAFFLE.prevTs, 80) / 1000;
  _WAFFLE.prevTs = ts;
  const cv   = document.getElementById('waffle-cvs');
  const c    = cv.getContext('2d');
  const W    = cv.width, H = cv.height;
  const FACE_R = Math.min(W, H) * 0.28;

  if (_WAFFLE.state === 'playing') {
    /* face movement — keyboard or joystick */
    let ix = 0, iy = 0;
    if (_WAFFLE_KEYS.left)  ix -= 1;
    if (_WAFFLE_KEYS.right) ix += 1;
    if (_WAFFLE_KEYS.up)    iy -= 1;
    if (_WAFFLE_KEYS.down)  iy += 1;
    /* also read joystick if active */
    if (typeof _joy !== 'undefined' && _joy.active) { ix = _joy.dx; iy = _joy.dy; }
    const SPD = Math.min(W, H) * 1.1;
    _WAFFLE.fx += ix * SPD * dt;
    _WAFFLE.fy += iy * SPD * dt;
    _WAFFLE.fx = Math.max(FACE_R, Math.min(W - FACE_R, _WAFFLE.fx));
    _WAFFLE.fy = Math.max(FACE_R, Math.min(H - FACE_R, _WAFFLE.fy));

    /* spawn waffles */
    _WAFFLE.spawnTimer -= dt;
    if (_WAFFLE.spawnTimer <= 0) {
      _WAFFLE.spawnTimer = 1.2 + Math.random() * 0.8;
      const margin = FACE_R + 60;
      const wx = margin + Math.random() * Math.max(1, W - margin * 2);
      const wy = margin + Math.random() * Math.max(1, H - margin * 2);
      _WAFFLE.waffles.push({ x: wx, y: wy, timer: 2.0 });
    }

    /* mouth position matches _drawWaffleAgataFace */
    const mouthX = _WAFFLE.fx;
    const mouthY = _WAFFLE.fy + FACE_R * 0.52;

    for (let i = _WAFFLE.waffles.length - 1; i >= 0; i--) {
      const wf = _WAFFLE.waffles[i];
      wf.timer -= dt;
      const eatDist = Math.hypot(wf.x - mouthX, wf.y - mouthY);
      if (eatDist < 48) {
        _WAFFLE.eaten++;
        _WAFFLE.cream.push({
          ox: (Math.random() - 0.5) * FACE_R * 0.75,
          oy: (Math.random() - 0.5) * FACE_R * 0.6,
          a:  Math.random() * Math.PI,
          rx: 12 + Math.random() * 10,
          ry:  7 + Math.random() * 6,
        });
        _WAFFLE.waffles.splice(i, 1);
        if (_WAFFLE.eaten >= 10) { _waffleEnd('won'); return; }
      } else if (wf.timer <= 0) {
        _WAFFLE.misses++;
        _WAFFLE.waffles.splice(i, 1);
        if (_WAFFLE.misses >= 3) { _waffleEnd('lost'); return; }
      }
    }
  }

  _waffleDraw(c, W, H, FACE_R);
}

function _waffleEnd(result) {
  _WAFFLE.state = result;
  const res = document.getElementById('waffle-result');
  const txt = document.getElementById('waffle-result-text');
  if (result === 'won') {
    txt.textContent = 'Ale dobry był ten gofr, taki dobry że jeszcze nigdy nie byłam taka brudna, no ale dobry był';
  } else {
    txt.textContent = 'Nie udało się zjeść wszystkich gofrów... może następnym razem!';
  }
  if (res) res.classList.remove('hidden');
}

function _drawWaffleAgataFace(c, fx, fy, R, cream, ts) {
  const SKIN = '#fde8d8', SKIN2 = '#fad0b8';
  /* head */
  c.fillStyle = SKIN;
  c.beginPath(); c.ellipse(fx, fy, R * 0.9, R, 0, 0, Math.PI * 2); c.fill();
  /* cream stains — painted ON skin before hair/eyes so features stay clean-ish */
  for (const cr of cream) {
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.beginPath(); c.ellipse(fx + cr.ox, fy + cr.oy, cr.rx, cr.ry, cr.a, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(200,200,200,0.5)'; c.lineWidth = 1; c.stroke();
  }
  /* back hair (golden, long strands) */
  c.fillStyle = '#d4b830';
  c.beginPath(); c.moveTo(fx - R*0.86, fy - R*0.4); c.bezierCurveTo(fx - R*1.3, fy + R*0.4, fx - R*1.4, fy + R*1.5, fx - R*1.2, fy + R*2.6); c.lineTo(fx - R*0.9, fy + R*2.6); c.bezierCurveTo(fx - R*1.1, fy + R*1.3, fx - R*1.0, fy + R*0.5, fx - R*0.7, fy - R*0.25); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(fx + R*0.86, fy - R*0.4); c.bezierCurveTo(fx + R*1.3, fy + R*0.4, fx + R*1.4, fy + R*1.5, fx + R*1.2, fy + R*2.6); c.lineTo(fx + R*0.9, fy + R*2.6); c.bezierCurveTo(fx + R*1.1, fy + R*1.3, fx + R*1.0, fy + R*0.5, fx + R*0.7, fy - R*0.25); c.closePath(); c.fill();
  /* top hair */
  c.fillStyle = '#f5e060';
  c.beginPath(); c.moveTo(fx - R*0.93, fy - R*0.55); c.bezierCurveTo(fx - R, fy - R*1.3, fx - R*0.47, fy - R*1.6, fx, fy - R*1.58); c.bezierCurveTo(fx + R*0.47, fy - R*1.6, fx + R, fy - R*1.3, fx + R*0.93, fy - R*0.55); c.bezierCurveTo(fx + R*0.87, fy - R*0.97, fx + R*0.27, fy - R*1.17, fx, fy - R*1.17); c.bezierCurveTo(fx - R*0.27, fy - R*1.17, fx - R*0.87, fy - R*0.97, fx - R*0.93, fy - R*0.55); c.closePath(); c.fill();
  /* front strands */
  c.beginPath(); c.moveTo(fx - R*0.86, fy - R*0.4); c.bezierCurveTo(fx - R*1.2, fy + R*0.3, fx - R*1.2, fy + R*1.0, fx - R, fy + R*1.5); c.lineTo(fx - R*0.8, fy + R*1.5); c.bezierCurveTo(fx - R, fy + R*0.95, fx - R*0.95, fy + R*0.3, fx - R*0.6, fy - R*0.35); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(fx + R*0.86, fy - R*0.4); c.bezierCurveTo(fx + R*1.2, fy + R*0.3, fx + R*1.2, fy + R*1.0, fx + R, fy + R*1.5); c.lineTo(fx + R*0.8, fy + R*1.5); c.bezierCurveTo(fx + R, fy + R*0.95, fx + R*0.95, fy + R*0.3, fx + R*0.6, fy - R*0.35); c.closePath(); c.fill();
  /* hair clip */
  c.fillStyle = '#f472b6';
  c.beginPath(); if (c.roundRect) c.roundRect(fx + R*0.47, fy - R*1.35, R*0.33, R*0.17, 3); else c.rect(fx + R*0.47, fy - R*1.35, R*0.33, R*0.17); c.fill();
  c.fillStyle = '#fff'; c.font = `${Math.round(R*0.22)}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('✿', fx + R*0.63, fy - R*1.26);
  /* blush */
  c.fillStyle = 'rgba(255,160,160,0.3)';
  c.beginPath(); c.ellipse(fx - R*0.62, fy + R*0.12, R*0.25, R*0.15, 0, 0, Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(fx + R*0.62, fy + R*0.12, R*0.25, R*0.15, 0, 0, Math.PI*2); c.fill();
  /* eyes (blink occasionally) */
  const eyeY   = fy - R * 0.05;
  const eyeOff = R * 0.37;
  const blinkAmt = ts ? Math.max(0, Math.sin(ts / 2800) * 2 - 1) : 0;
  const eyeSY = Math.max(0.04, 1 - blinkAmt);
  c.fillStyle = '#fff';
  c.beginPath(); c.ellipse(fx - eyeOff, eyeY, R*0.17, R*0.18*eyeSY, 0, 0, Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(fx + eyeOff, eyeY, R*0.17, R*0.18*eyeSY, 0, 0, Math.PI*2); c.fill();
  if (blinkAmt < 0.85) {
    c.fillStyle = '#5a8aba';
    c.beginPath(); c.arc(fx - eyeOff, eyeY, R*0.12, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc(fx + eyeOff, eyeY, R*0.12, 0, Math.PI*2); c.fill();
    c.fillStyle = '#1a2a3a';
    c.beginPath(); c.arc(fx - eyeOff, eyeY, R*0.07, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc(fx + eyeOff, eyeY, R*0.07, 0, Math.PI*2); c.fill();
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(fx - eyeOff + R*0.05, eyeY - R*0.04, R*0.04, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc(fx + eyeOff + R*0.05, eyeY - R*0.04, R*0.04, 0, Math.PI*2); c.fill();
  }
  /* lashes */
  c.strokeStyle = '#1a1a2a'; c.lineWidth = Math.max(1, R*0.04); c.lineCap = 'round';
  for (const [ex, dir] of [[fx - eyeOff, -1], [fx + eyeOff, 1]]) {
    for (let l = -2; l <= 2; l++) {
      c.beginPath(); c.moveTo(ex + l*R*0.06, eyeY - R*0.14); c.lineTo(ex + l*R*0.06 + dir*R*0.02, eyeY - R*0.22); c.stroke();
    }
  }
  /* nose */
  c.strokeStyle = 'rgba(180,100,60,0.5)'; c.lineWidth = Math.max(1.5, R*0.05); c.lineCap = 'round';
  c.beginPath(); c.moveTo(fx - R*0.08, fy + R*0.2); c.lineTo(fx, fy + R*0.32); c.lineTo(fx + R*0.08, fy + R*0.2); c.stroke();
  /* mouth — the eating zone */
  const mouthY = fy + R * 0.52;
  c.strokeStyle = 'rgba(200,80,60,0.95)'; c.lineWidth = Math.max(2, R*0.1); c.lineCap = 'round';
  c.beginPath(); c.arc(fx, mouthY, R*0.25, 0.05*Math.PI, 0.95*Math.PI); c.stroke();
  c.fillStyle = 'rgba(180,50,50,0.6)';
  c.beginPath(); c.arc(fx, mouthY + R*0.06, R*0.18, 0, Math.PI); c.fill();
}

function _drawWaffleItem(c, wf, ts) {
  const urgency = wf.timer < 0.7 ? (0.7 - wf.timer) / 0.7 : 0;
  c.save(); c.translate(wf.x, wf.y);
  const ws = 32;
  /* waffle grid */
  c.fillStyle = '#d4a030'; c.fillRect(-ws, -ws, ws*2, ws*2);
  c.strokeStyle = '#a07020'; c.lineWidth = 2;
  for (let gi = -ws; gi <= ws; gi += 11) {
    c.beginPath(); c.moveTo(gi, -ws); c.lineTo(gi, ws); c.stroke();
    c.beginPath(); c.moveTo(-ws, gi); c.lineTo(ws, gi); c.stroke();
  }
  /* whipped cream */
  c.fillStyle = 'rgba(255,255,255,0.92)';
  c.beginPath(); c.ellipse(0, -ws*0.35, 14, 9, 0, 0, Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(-8, -ws*0.6, 7, 5, 0.3, 0, Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(8, -ws*0.6, 7, 5, -0.3, 0, Math.PI*2); c.fill();
  /* urgency ring */
  if (urgency > 0) {
    c.fillStyle = `rgba(255,60,0,${urgency*0.35})`; c.beginPath(); c.arc(0,0,ws+5,0,Math.PI*2); c.fill();
  }
  /* timer bar */
  c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(-ws, ws+5, ws*2, 5);
  c.fillStyle = urgency > 0 ? `rgba(255,80,0,${0.7+urgency*0.3})` : '#60c040';
  c.fillRect(-ws, ws+5, ws*2*(wf.timer/2), 5);
  c.restore();
}

function _waffleDraw(c, W, H, FACE_R) {
  /* ── Hel beach background ── */
  /* sky */
  const skyG = c.createLinearGradient(0, 0, 0, H * 0.5);
  skyG.addColorStop(0, '#5bb8f5'); skyG.addColorStop(1, '#a8d8f0');
  c.fillStyle = skyG; c.fillRect(0, 0, W, H * 0.5);
  /* sun */
  c.fillStyle = '#ffe060'; c.shadowColor = 'rgba(255,220,0,0.6)'; c.shadowBlur = 30;
  c.beginPath(); c.arc(W*0.84, H*0.1, Math.min(W,H)*0.045, 0, Math.PI*2); c.fill();
  c.shadowBlur = 0;
  /* sea */
  const seaG = c.createLinearGradient(0, H*0.44, 0, H*0.68);
  seaG.addColorStop(0, '#1a8acb'); seaG.addColorStop(1, '#0d5fa0');
  c.fillStyle = seaG; c.fillRect(0, H*0.44, W, H*0.24);
  /* waves */
  const wt = performance.now();
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2; c.lineCap = 'round';
  for (let wi = 0; wi < 4; wi++) {
    const wy = H*(0.47 + wi*0.04) + Math.sin(wt/700 + wi)*4;
    c.beginPath(); c.moveTo(0, wy);
    for (let x = 0; x < W; x += 45) c.quadraticCurveTo(x+22, wy - 5, x+45, wy);
    c.stroke();
  }
  /* sand */
  const sandG = c.createLinearGradient(0, H*0.65, 0, H);
  sandG.addColorStop(0, '#f5dfa0'); sandG.addColorStop(1, '#e0c870');
  c.fillStyle = sandG; c.fillRect(0, H*0.65, W, H*0.35);
  /* sand texture */
  c.strokeStyle = 'rgba(190,165,70,0.35)'; c.lineWidth = 1;
  for (let sd = 0; sd < 6; sd++) {
    c.beginPath(); c.ellipse(W*(0.08+sd*0.16), H*(0.72+Math.sin(sd*2.3)*0.04), 22, 5, 0.15, 0, Math.PI*2); c.stroke();
  }
  /* lighthouse silhouette */
  c.fillStyle = 'rgba(20,40,80,0.5)';
  c.fillRect(W*0.08, H*0.3, W*0.025, H*0.15);
  c.beginPath(); c.moveTo(W*0.08, H*0.3); c.lineTo(W*0.105, H*0.3); c.lineTo(W*0.0925, H*0.24); c.closePath(); c.fill();

  /* ── Agata face (EQ-style, drawn BEFORE waffles) ── */
  _drawWaffleAgataFace(c, _WAFFLE.fx, _WAFFLE.fy, FACE_R, _WAFFLE.cream, wt);

  /* ── Waffles drawn ON TOP of face so they're visible when near mouth ── */
  for (const wf of _WAFFLE.waffles) _drawWaffleItem(c, wf, wt);

  /* ── HUD ── */
  c.fillStyle = 'rgba(0,0,0,0.65)';
  c.beginPath();
  if (c.roundRect) c.roundRect(10, 10, 250, 54, 10); else c.rect(10, 10, 250, 54);
  c.fill();
  c.font = 'bold 17px "Segoe UI",sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
  c.fillStyle = '#ffd060'; c.shadowColor = '#000'; c.shadowBlur = 4;
  c.fillText('🧇 Zjedzone: ' + _WAFFLE.eaten + '/10', 18, 28);
  c.fillStyle = _WAFFLE.misses >= 2 ? '#ff5050' : '#ff9090';
  c.fillText('❌ Pudła: ' + _WAFFLE.misses + '/3', 18, 50);
  c.shadowBlur = 0;
}

function _spawnMorskaAgnieszki() {
  _HEL_ST.morskaAg = _HEL_MA_SPAWNS.map((pos, i) => ({
    id: i,
    _x: pos.x, _y: pos.y,
    hp: 60, maxHp: 60,
    alive: true,
    speed: 85,
    stepAnim: 0, _dir: 1,
    aiState: 'patrol',
    attackTimer: 0, hitFlash: 0,
    patrolTimer: i * 0.7,
    patrolDX: Math.cos(i * 2.1),
    patrolDY: Math.sin(i * 2.1),
    respawnTimer: 0,
  }));
}

/* ── Update ── */
function updateHelQuests(dt, sp) {
  const st  = _HEL_ST;
  const Q8  = _HEL_QUEST;
  const dtS = dt / 1000;

  if (!st.spawned) { _spawnMorskaAgnieszki(); st.spawned = true; }

  st.playerHitFlash = Math.max(0, st.playerHitFlash - dtS * 3);
  st.resCooldown    = Math.max(0, st.resCooldown    - dtS);
  st.gofCooldown    = Math.max(0, st.gofCooldown    - dtS);
  st.cypelCooldown  = Math.max(0, st.cypelCooldown  - dtS);
  Q8.trigCD         = Math.max(0, Q8.trigCD         - dtS);

  /* Auto-activate Q8 when Q7 is done */
  if (Q8.state === 'inactive' && typeof _GDN_QUEST !== 'undefined' && _GDN_QUEST.state === 'q7_done') {
    Q8.state = 'q8_ready';
  }

  /* Advance Q8 nextState once dialog closes */
  if (Q8.nextState && !isDialogOpen()) {
    Q8.state = Q8.nextState; Q8.nextState = null;
  }

  /* Q12: auto-activate handled in drawMainMapQuestMarkers, also check here */
  if (_HEL_Q12.state === 'inactive' && typeof _KM_QUEST !== 'undefined' && _KM_QUEST.state === 'q12_ready') {
    _HEL_Q12.state = 'q12_active';
  }
  _HEL_Q12.trigCD = Math.max(0, _HEL_Q12.trigCD - dtS);

  if (!isDialogOpen()) {
    /* Restauracja {x:1790, y:215, w:140, h:96} → center (1860, 263) */
    if (st.resCooldown <= 0 && Math.hypot(sp.x - 1860, sp.y - 263) < 72) {
      showDialog('🍽️', 'Restauracja nad morzem!\nŚwieże ryby z Bałtyku i widok na Zatokę Pucką.\nŚledzik z cebulką — polecamy! 🐟');
      st.resCooldown = 8;
    }
    /* Gofrownia {x:1830, y:335, w:120, h:82} → center (1890, 376) */
    if (st.gofCooldown <= 0 && Math.hypot(sp.x - 1890, sp.y - 376) < 62) {
      if (_HEL_Q12.state === 'q12_active' && _HEL_Q12.trigCD <= 0) {
        _HEL_Q12.trigCD = 20;
        st.gofCooldown = 20;
        _openWaffleGame(() => {
          _HEL_Q12.state = 'q12_done';
          if (typeof _KM_QUEST !== 'undefined') _KM_QUEST.state = 'q12_done';
        });
      } else if (_HEL_Q12.state !== 'q12_active') {
        showDialog('🧇', 'Gofrownia na Helu!\nNajlepsze gofry nad morzem.\nZ bitą śmietaną i truskawkami 🍓');
        st.gofCooldown = 8;
      }
    }
    /* Cypel Helski — gated by Q8 */
    if (st.cypelCooldown <= 0 && Q8.trigCD <= 0 && Math.hypot(sp.x - 175, sp.y - 1940) < 75) {
      switch (Q8.state) {
        case 'inactive':
          // Before Q8: info dialog only
          showDialog('⚓', 'Cypel Helski!\nNajdalszy punkt Półwyspu Helskiego.\nMagiczne miejsce, ale coś tu nie gra... 🌊');
          st.cypelCooldown = 8;
          break;
        case 'q8_ready':
          showDialog('⚓', 'Dzieją się tutaj magiczne rzeczy, ale morskie agnieszki przeszkadzają i to bardzo, trzeba je pokonać!');
          Q8.kills = 0; Q8.trigCD = 2;
          _hqNext('q8_hunt');
          st.cypelCooldown = 12;
          break;
        case 'q8_hunt':
          showDialog('⚔️', `Pokonaj morskie agnieszki! (${Q8.kills}/5)\nWróć tu gdy pokonasz 5!`);
          st.cypelCooldown = 8;
          break;
        case 'q8_return':
          showDialog('⚓', 'Brawo! Pokonałaś 5 morskich agnieszek! 🎉\nCypel odblokowany — możesz wylosować Kartę Wspomnienia!');
          _hqNext('q8_shop');
          st.cypelCooldown = 12;
          break;
        case 'q8_shop':
          // unlock card draw; set hook to detect purchase
          _cypelDrawHook = () => {
            showDialog('🌊', 'Ale jestem teraz silna, ale gdzie jest Rafał?\nPoszukam go na wiadukcie! 🌉');
            Q8.state = 'q8_done';
            // unlock Q9 by marking in GDN_QUEST if available
            if (typeof _GDN_QUEST !== 'undefined' && _GDN_QUEST.state === 'q7_done') {
              _GDN_QUEST.state = 'q9_ready';
            }
          };
          openCypelMenu();
          st.cypelCooldown = 12;
          break;
        case 'q8_done':
          // Normal card draw access forever after
          openCypelMenu();
          st.cypelCooldown = 12;
          break;
      }
    }
  }

  /* AI */
  st.playerAttTimer += dtS;
  const pa = st.playerAttTimer >= 1;
  if (pa) st.playerAttTimer = 0;

  for (const en of st.morskaAg) {
    if (!en.alive) {
      en.respawnTimer -= dtS;
      if (en.respawnTimer <= 0) {
        const sp2 = _HEL_MA_SPAWNS[en.id];
        en._x = sp2.x; en._y = sp2.y;
        en.hp = en.maxHp; en.alive = true;
        en.aiState = 'patrol'; en.attackTimer = 0; en.hitFlash = 0;
      }
      continue;
    }

    en.hitFlash = Math.max(0, en.hitFlash - dtS * 4);
    const dx = sp.x - en._x, dy = sp.y - en._y, dist = Math.hypot(dx, dy) || 0.01;

    if (dist < 200)                             en.aiState = 'chase';
    else if (en.aiState === 'chase' && dist > 320) { en.aiState = 'patrol'; en.attackTimer = 0; }

    const bb = _helBounds(en._y);
    const xMin = bb.xl + 12, xMax = bb.xr - 12, yMin = 55, yMax = 1960;

    if (en.aiState === 'chase') {
      const spd = en.speed * dtS;
      en._x += (dx/dist)*spd; en._y += (dy/dist)*spd;
      en._dir = dx >= 0 ? 1 : -1;
      en.stepAnim += spd * 0.08;
      en._x = Math.max(xMin, Math.min(xMax, en._x));
      en._y = Math.max(yMin, Math.min(yMax, en._y));
      if (dist < 55) {
        en.attackTimer += dtS;
        if (en.attackTimer >= 1) { en.attackTimer = 0; applyZdenerwowanie(Math.round(8 * getObronaMult())); st.playerHitFlash = 1; }
      } else { en.attackTimer = 0; }
    } else {
      en.patrolTimer += dtS;
      if (en.patrolTimer > 2.8) {
        en.patrolTimer = 0;
        const a = Math.random() * Math.PI * 2;
        en.patrolDX = Math.cos(a); en.patrolDY = Math.sin(a);
      }
      const spd = en.speed * 0.35 * dtS;
      en._x += en.patrolDX * spd; en._y += en.patrolDY * spd;
      en._x = Math.max(xMin, Math.min(xMax, en._x));
      en._y = Math.max(yMin, Math.min(yMax, en._y));
      en._dir = en.patrolDX >= 0 ? 1 : -1;
      en.stepAnim += spd * 0.08;
      en.attackTimer = 0;
    }

    if (pa && dist < 55) {
      const dmg = Math.round(15 * getAtakMult());
      en.hp -= dmg; en.hitFlash = 1;
      spawnHitEffect(en._x, en._y, dmg);
      if (en.hp <= 0) {
        en.alive = false; en.respawnTimer = 12 + Math.random()*6; addZlote(15);
        if (Q8.state === 'q8_hunt') {
          Q8.kills++;
          if (Q8.kills >= 5) _hqNext('q8_return');
        }
      }
    }
  }

  /* separation */
  const ag = st.morskaAg;
  for (let i = 0; i < ag.length; i++) for (let j = i+1; j < ag.length; j++) {
    const a = ag[i], b2 = ag[j];
    if (!a.alive || !b2.alive) continue;
    const sdx=b2._x-a._x, sdy=b2._y-a._y, sd=Math.hypot(sdx,sdy);
    if (sd < 30 && sd > 0.01) {
      const push=(30-sd)*0.5, nx=sdx/sd, ny=sdy/sd;
      a._x-=nx*push; a._y-=ny*push; b2._x+=nx*push; b2._y+=ny*push;
    }
  }
}

/* ── Draw world-space ── */
function drawHelQuests(ctx, ts) {
  for (const en of _HEL_ST.morskaAg) if (en.alive) _drawMorskaAgnieszka(ctx, en, ts);
  drawHitFX(ctx);
}

/* ── HUD ── */
function drawHelQuestsHUD(ctx, cw, ch) {
  if (_HEL_ST.playerHitFlash > 0) {
    ctx.fillStyle = `rgba(0,80,180,${_HEL_ST.playerHitFlash * 0.28})`;
    ctx.fillRect(0, 0, cw, ch);
  }
  if (_HEL_QUEST.state === 'q8_hunt') {
    const k = _HEL_QUEST.kills;
    ctx.save();
    ctx.font = 'bold 18px "Segoe UI",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = k >= 4 ? '#60ffb0' : '#ffe060';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
    ctx.fillText(`⚔️ Morskie Agnieszki: ${k}/5`, cw / 2, 46);
    ctx.restore();
  }
}

/* ══════════════════════════════════════════════════════
   Morska Agnieszka — rysowanie
   ══════════════════════════════════════════════════════ */
function _drawMorskaAgnieszka(ctx, en, ts) {
  const x = en._x, y = en._y;
  const bob   = Math.sin(en.stepAnim) * 2.2;
  const swing = Math.sin(en.stepAnim * 2) * 0.09;
  const aggro = en.aiState === 'chase';

  ctx.beginPath(); ctx.ellipse(x+2,y+14,12,5,0,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fill();

  const sg=ctx.createLinearGradient(x-16,y+2,x+16,y+22);
  sg.addColorStop(0,'#20b8c8'); sg.addColorStop(1,'#0d7898');
  ctx.fillStyle=sg;
  ctx.beginPath(); ctx.moveTo(x-8,y+2); ctx.lineTo(x-20,y+22); ctx.lineTo(x+20,y+22); ctx.lineTo(x+8,y+2); ctx.closePath(); ctx.fill();

  const bg=ctx.createLinearGradient(x-22,y-8,x+22,y+4);
  bg.addColorStop(0,'#e8f8ff'); bg.addColorStop(1,'#a8d8ee');
  ctx.fillStyle=bg;
  ctx.beginPath(); ctx.moveTo(x-8,y-4); ctx.lineTo(x-24,y+1); ctx.lineTo(x-22,y+7); ctx.lineTo(x+22,y+7); ctx.lineTo(x+24,y+1); ctx.lineTo(x+8,y-4); ctx.closePath(); ctx.fill();

  ctx.strokeStyle='#a8d8ee'; ctx.lineWidth=10; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x-12,y-1); ctx.quadraticCurveTo(x-26,y+5+swing*8,x-24,y+17+swing*5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+12,y-1); ctx.quadraticCurveTo(x+26,y+5-swing*8,x+24,y+17-swing*5); ctx.stroke();

  ctx.fillStyle='#f0c8a0'; ctx.fillRect(x-3,y-6,6,5);

  ctx.fillStyle='#f0c8a0'; ctx.beginPath(); ctx.arc(x,y-16+bob,9,0,Math.PI*2); ctx.fill();

  ctx.fillStyle='#1a2840';
  ctx.beginPath(); ctx.arc(x,y-18+bob,9,Math.PI,Math.PI*2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x-7,y-15+bob); ctx.bezierCurveTo(x-18,y-6,x-20,y+8,x-16,y+18);
  ctx.lineTo(x-10,y+18); ctx.bezierCurveTo(x-13,y+8,x-11,y-4,x-5,y-11+bob); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x+7,y-15+bob); ctx.bezierCurveTo(x+18,y-6,x+20,y+8,x+16,y+18);
  ctx.lineTo(x+10,y+18); ctx.bezierCurveTo(x+13,y+8,x+11,y-4,x+5,y-11+bob); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(40,70,110,0.5)'; ctx.lineWidth=1.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x-15,y+bob); ctx.quadraticCurveTo(x-17,y+7,x-15,y+14); ctx.stroke();

  const ex2=x+(en._dir>=0?3:-3);
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(ex2,y-16+bob,2.5,2.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#0a2040'; ctx.beginPath(); ctx.arc(ex2,y-16+bob,1.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(180,120,200,0.25)';
  ctx.beginPath(); ctx.ellipse(x-5,y-12+bob,3,2,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+5,y-12+bob,3,2,0,0,Math.PI*2); ctx.fill();

  if (aggro) {
    ctx.strokeStyle='rgba(0,160,210,0.38)'; ctx.lineWidth=1.2;
    for (let wi=0;wi<3;wi++) {
      const wy=y-38-wi*8+bob, amp=7+wi*3;
      ctx.beginPath(); ctx.moveTo(x-amp,wy); ctx.quadraticCurveTo(x-amp/2,wy-4,x,wy);
      ctx.quadraticCurveTo(x+amp/2,wy+4,x+amp,wy); ctx.stroke();
    }
  }

  const bw=30,bh=3,bx=x-bw/2,by=y-40;
  ctx.fillStyle='rgba(0,0,0,0.52)'; ctx.fillRect(bx,by,bw,bh);
  const hr=en.hp/en.maxHp;
  ctx.fillStyle=hr>0.5?'#20e0d0':hr>0.25?'#e8c820':'#e83020';
  ctx.fillRect(bx,by,bw*hr,bh);
  ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=0.5;
  ctx.strokeRect(bx,by,bw,bh);

  if (en.hitFlash>0) {
    ctx.globalAlpha=en.hitFlash*0.5;
    ctx.fillStyle='#aaeeff'; ctx.beginPath(); ctx.arc(x,y-4+bob,24,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }

  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
  ctx.fillStyle=aggro?'#60e0ff':'#d8f4ff';
  ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('Morska Agnieszka',x,by); ctx.shadowBlur=0;
}

/* ══════════════════════════════════════════════════════
   Drzewa lasu — generowane raz
   ══════════════════════════════════════════════════════ */
const _HEL_FOREST_TREES = (function() {
  const out=[], n=240;
  let s=137;
  const rand=()=>{ s=(Math.imul(s,1664525)+1013904223)>>>0; return s/0xffffffff; };
  /* Bałtyk (prawa / xr) strona lasu */
  for (let i=0;i<n;i++) {
    const y=590+rand()*710;
    const b=_helBounds(y);
    const margin=28+rand()*110;
    const x=b.xr-margin;
    const r=10+rand()*11;
    if (x-r<b.xl+22) continue;
    out.push({x,y,r});
  }
  /* Zatoka (lewa / xl) strona lasu */
  for (let i=0;i<60;i++) {
    const y=610+rand()*680;
    const b=_helBounds(y);
    const x=b.xl+18+rand()*60;
    const r=9+rand()*9;
    if (x+r>b.xr-30) continue;
    out.push({x,y,r});
  }
  return out;
}());

/* ══════════════════════════════════════════════════════
   Rysowanie świata
   ══════════════════════════════════════════════════════ */
function _drawHel(ctx, sub, ts) {
  const {w, h} = sub;
  const sh  = _HEL_SHAPES;
  const last = sh[sh.length-1];
  const tipX = (last.xl + last.xr) / 2; /* ≈175 — koniec cypla */

  /* ── Woda ── */
  /* Zatoka Pucka (całe tło — spokojniejsza) */
  ctx.fillStyle='#1858b0'; ctx.fillRect(0,0,w,h);
  /* Bałtyk (prawa/górna strona — ciemniejszy) */
  ctx.beginPath();
  ctx.moveTo(sh[0].xr, 0);
  for (const s of sh) ctx.lineTo(s.xr, s.y);
  ctx.lineTo(tipX, h); ctx.lineTo(w, h); ctx.lineTo(w, 0);
  ctx.closePath(); ctx.fillStyle='#0a3080'; ctx.fill();

  /* ── Fale Zatoka ── */
  const wOff1=(ts/1500)%80;
  ctx.strokeStyle='rgba(255,255,255,0.042)'; ctx.lineWidth=2;
  for (let wy=wOff1-80; wy<h+80; wy+=80)
    for (let wx=-80; wx<w+80; wx+=65) {
      ctx.beginPath(); ctx.moveTo(wx,wy);
      ctx.quadraticCurveTo(wx+20,wy-5,wx+40,wy); ctx.quadraticCurveTo(wx+52,wy+4,wx+65,wy);
      ctx.stroke();
    }
  /* ── Fale Bałtyk (większe) ── */
  const wOff2=(ts/1050)%65;
  ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=2.5;
  for (let wy=wOff2-65; wy<h+65; wy+=65)
    for (let wx=-65; wx<w+65; wx+=85) {
      ctx.beginPath(); ctx.moveTo(wx,wy);
      ctx.quadraticCurveTo(wx+30,wy-9,wx+60,wy); ctx.quadraticCurveTo(wx+75,wy+7,wx+85,wy);
      ctx.stroke();
    }

  /* ── Ląd — zielony polygon ── */
  ctx.beginPath();
  ctx.moveTo(sh[0].xl, 0);
  for (const s of sh) ctx.lineTo(s.xl, s.y);
  ctx.lineTo(tipX, h);
  for (let i=sh.length-1; i>=0; i--) ctx.lineTo(sh[i].xr, sh[i].y);
  ctx.lineTo(sh[0].xr, 0);
  ctx.closePath();
  ctx.fillStyle='#4a7838'; ctx.fill();

  /* ── Plaża (prawa / Bałtyk coast) ── */
  ctx.beginPath();
  ctx.moveTo(sh[0].xr-30, 0);
  for (const s of sh) ctx.lineTo(s.xr-28, s.y);
  ctx.lineTo(tipX, h);
  for (let i=sh.length-1; i>=0; i--) ctx.lineTo(sh[i].xr, sh[i].y);
  ctx.lineTo(sh[0].xr, 0);
  ctx.closePath();
  ctx.fillStyle='#c8b868'; ctx.fill();

  /* ── Bruk — miasteczko (y: 0–560) ── */
  const cityY = 560;
  const bCityEnd = _helBounds(cityY);
  ctx.beginPath();
  ctx.moveTo(sh[0].xl, 0);
  for (const s of sh) { if (s.y <= cityY) ctx.lineTo(s.xl+2, s.y); }
  ctx.lineTo(bCityEnd.xl+2, cityY);
  ctx.lineTo(bCityEnd.xr-26, cityY);
  for (let i=sh.length-1; i>=0; i--) { if (sh[i].y <= cityY) ctx.lineTo(sh[i].xr-26, sh[i].y); }
  ctx.lineTo(sh[0].xr-26, 0);
  ctx.closePath();
  ctx.fillStyle='#86807a'; ctx.fill();
  /* kafelki bruku */
  ctx.strokeStyle='rgba(0,0,0,0.08)'; ctx.lineWidth=0.8;
  for (let cy=14; cy<cityY; cy+=16) {
    const off=(Math.floor(cy/16)%2)*13;
    const bb=_helBounds(cy);
    for (let cx=bb.xl+2+off; cx<bb.xr-28; cx+=26) ctx.strokeRect(cx,cy,22,13);
  }

  /* ── Las — ciemna zieleń (y: 560–1300) ── */
  const forestMinY=560, forestMaxY=1300;
  const bFor0=_helBounds(forestMinY), bFor1=_helBounds(forestMaxY);
  ctx.beginPath();
  ctx.moveTo(bFor0.xl+2, forestMinY); ctx.lineTo(bFor1.xl+2, forestMaxY);
  ctx.lineTo(bFor1.xr-26, forestMaxY); ctx.lineTo(bFor0.xr-26, forestMinY);
  ctx.closePath(); ctx.fillStyle='#28561e'; ctx.fill();

  /* drzewa */
  for (const t of _HEL_FOREST_TREES) {
    const tg=ctx.createRadialGradient(t.x-2,t.y-2,0,t.x,t.y,t.r);
    tg.addColorStop(0,'#5cc035'); tg.addColorStop(0.65,'#348820'); tg.addColorStop(1,'#1e5810');
    ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(t.x,t.y,t.r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.1)'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.arc(t.x,t.y,t.r,0,Math.PI*2); ctx.stroke();
  }

  /* ── Cypel — piaszczysto-trawiasty (y: 1300–2000) ── */
  const bCyp=_helBounds(forestMaxY);
  ctx.beginPath();
  ctx.moveTo(bCyp.xl+2, forestMaxY);
  for (let cy2=forestMaxY; cy2<=h; cy2+=40) { const bb=_helBounds(cy2); ctx.lineTo(bb.xl, cy2); }
  ctx.lineTo(tipX, h);
  for (let cy2=h; cy2>=forestMaxY; cy2-=40) { const bb=_helBounds(cy2); ctx.lineTo(bb.xr, cy2); }
  ctx.lineTo(bCyp.xr-26, forestMaxY);
  ctx.closePath();
  const cypG=ctx.createLinearGradient(725, forestMaxY, tipX, 1920);
  cypG.addColorStop(0,'#4a7838'); cypG.addColorStop(0.35,'#8aaa58'); cypG.addColorStop(1,'#c0c870');
  ctx.fillStyle=cypG; ctx.fill();

  /* ── Droga główna wzdłuż osi półwyspu ── */
  const roadW = 32;
  ctx.beginPath();
  for (let i=0; i<sh.length; i++) {
    const cx=(sh[i].xl+sh[i].xr)/2;
    if (i===0) ctx.moveTo(cx-roadW, sh[i].y);
    else        ctx.lineTo(cx-roadW, sh[i].y);
  }
  ctx.lineTo(tipX-4, h);
  for (let i=sh.length-1; i>=0; i--) {
    const cx=(sh[i].xl+sh[i].xr)/2;
    ctx.lineTo(cx+roadW, sh[i].y);
  }
  ctx.closePath();
  ctx.fillStyle='#787068'; ctx.fill();
  /* linia środkowa przerywana */
  ctx.setLineDash([20,14]);
  ctx.strokeStyle='rgba(220,210,100,0.38)'; ctx.lineWidth=1.5;
  ctx.beginPath();
  for (let i=0; i<sh.length; i++) {
    const cx=(sh[i].xl+sh[i].xr)/2;
    if (i===0) ctx.moveTo(cx, sh[i].y);
    else        ctx.lineTo(cx, sh[i].y);
  }
  ctx.lineTo(tipX, h); ctx.stroke();
  ctx.setLineDash([]);

  /* ── Port (lewa / Zatoka Pucka) ── */
  _drawHelPort(ctx, sh, ts);

  /* ── Budynki miasteczka ── */
  _drawHelLatarnia  (ctx, {x:2160, y:40,  w:70,  h:110});
  _drawHelMuzeum    (ctx, {x:1795, y:55,  w:120, h:90});
  _drawHelHotel     (ctx, {x:2010, y:122, w:130, h:90});
  _drawHelKosciol   (ctx, {x:1970, y:215, w:100, h:85});
  _drawHelRestauracja(ctx,{x:1790, y:215, w:140, h:96});
  _drawHelGofrownia (ctx, {x:1830, y:335, w:120, h:82});

  /* ── Cypel Helski marker ── */
  _drawCypelMarker(ctx, ts);

  /* ── Strefa wyjścia ── */
  const ez = SUBMAP_HEL.exitZones[0];
  const pulse = 0.55+Math.sin(ts/500)*0.45;
  ctx.fillStyle = `rgba(255,215,60,${pulse*0.12})`;
  ctx.beginPath(); ctx.arc(ez.x, ez.y, ez.r, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = `rgba(255,215,60,${pulse*0.9})`; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.arc(ez.x, ez.y, ez.r, 0, Math.PI*2); ctx.stroke();
  ctx.font='bold 11px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle = `rgba(255,215,60,${pulse})`;
  ctx.fillText('Wyjście z Helu', ez.x, ez.y+ez.r+6);

  /* ── Granica świata ── */
  ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=4;
  ctx.strokeRect(2,2,w-4,h-4);
}

/* ── Port morski (lewa / Zatoka Pucka) ── */
function _drawHelPort(ctx, sh, ts) {
  /* port zaczyna się 80px w głąb Zatoki od lewej krawędzi lądu przy y≈170 */
  const refY  = 170;
  const portX = _helBounds(refY).xl - 80; /* ≈ 1590-80 = 1510 */
  const py    = 90;

  /* woda przystani */
  ctx.fillStyle='#1040a0'; ctx.fillRect(portX-10, py, 92, 270);

  /* falochron */
  ctx.fillStyle='#607868'; ctx.fillRect(portX-12, py-8, 96, 12);
  ctx.strokeStyle='#485a50'; ctx.lineWidth=2;
  ctx.strokeRect(portX-12, py-8, 96, 12);

  /* molo */
  ctx.fillStyle='#7a6848';
  for (let my=py+20; my<py+250; my+=60) ctx.fillRect(portX+62, my, 24, 44);

  /* budynki portowe */
  const pg=ctx.createLinearGradient(portX, py+20, portX, py+100);
  pg.addColorStop(0,'#6a7868'); pg.addColorStop(1,'#4a5848');
  ctx.fillStyle=pg; ctx.fillRect(portX+2, py+20, 60, 80);
  ctx.fillStyle='#3a4838'; ctx.fillRect(portX+2, py+20, 60, 8);
  ctx.fillStyle='rgba(180,225,255,0.6)';
  ctx.fillRect(portX+10, py+32, 16, 20); ctx.fillRect(portX+36, py+32, 16, 20);
  ctx.fillStyle='#5a4828'; ctx.fillRect(portX+24, py+78, 12, 22);

  /* maszt */
  ctx.strokeStyle='#484038'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(portX+32, py+20); ctx.lineTo(portX+32, py-32); ctx.stroke();

  /* flaga */
  const fp=0.5+Math.sin(ts/600)*0.5;
  ctx.fillStyle='#e83020';
  ctx.beginPath();
  ctx.moveTo(portX+32, py-30); ctx.lineTo(portX+32+fp*18, py-24-fp*3); ctx.lineTo(portX+32, py-18);
  ctx.closePath(); ctx.fill();

  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('Port Morski', portX+32, py+106); ctx.shadowBlur=0;
}

/* ── Latarnia Morska ── */
function _drawHelLatarnia(ctx, b) {
  ctx.fillStyle='#d0ccc0'; ctx.fillRect(b.x+10,b.y+60,b.w-20,b.h-60);
  const tg=ctx.createLinearGradient(b.x+18,b.y,b.x+b.w-18,b.y+70);
  tg.addColorStop(0,'#f8f8f8'); tg.addColorStop(1,'#d8d8d0');
  ctx.fillStyle=tg;
  ctx.beginPath(); ctx.moveTo(b.x+18,b.y+60); ctx.lineTo(b.x+22,b.y); ctx.lineTo(b.x+b.w-22,b.y); ctx.lineTo(b.x+b.w-18,b.y+60); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#cc2020';
  for (let sy=b.y+12; sy<b.y+55; sy+=20) {
    const l=b.x+22+(sy-b.y)/60*4, r2=b.x+b.w-22-(sy-b.y)/60*4;
    ctx.fillRect(l,sy,r2-l,9);
  }
  const lg=ctx.createRadialGradient(b.x+b.w/2,b.y-8,0,b.x+b.w/2,b.y-8,16);
  lg.addColorStop(0,'#ffffa0'); lg.addColorStop(0.5,'#f8c820'); lg.addColorStop(1,'#8a6820');
  ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(b.x+b.w/2,b.y-8,16,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#4a3810'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='rgba(255,255,180,0.9)'; ctx.beginPath(); ctx.arc(b.x+b.w/2,b.y-8,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,80,0.4)'; ctx.beginPath(); ctx.arc(b.x+b.w/2,b.y-8,22,0,Math.PI*2); ctx.fill();
  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('Latarnia Morska',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Hotel Hel ── */
function _drawHelHotel(ctx, b) {
  const hg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
  hg.addColorStop(0,'#d8e0e8'); hg.addColorStop(1,'#b0bcc8');
  ctx.fillStyle=hg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#2a3a5a'; ctx.fillRect(b.x,b.y,b.w,8);
  ctx.fillStyle='rgba(200,235,255,0.7)';
  for (let wy=b.y+18; wy<b.y+b.h-10; wy+=22)
    for (let wx=b.x+12; wx<b.x+b.w-22; wx+=28) ctx.fillRect(wx,wy,18,16);
  ctx.fillStyle='#1a2840'; ctx.fillRect(b.x+b.w/2-14,b.y+b.h-30,28,30);
  ctx.beginPath(); ctx.arc(b.x+b.w/2,b.y+b.h-30,14,Math.PI,0); ctx.fill();
  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('Hotel Hel',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Muzeum Rybołówstwa ── */
function _drawHelMuzeum(ctx, b) {
  ctx.fillStyle='#8a7858'; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#6a5838'; ctx.fillRect(b.x,b.y,b.w,7);
  ctx.strokeStyle='rgba(180,150,100,0.4)'; ctx.lineWidth=1;
  for (let my=b.y+18; my<b.y+b.h-10; my+=14)
    for (let mx=b.x+10; mx<b.x+b.w-8; mx+=14) { ctx.beginPath(); ctx.arc(mx,my,5,0,Math.PI*2); ctx.stroke(); }
  ctx.fillStyle='#3a2810'; ctx.fillRect(b.x+b.w/2-13,b.y+b.h-28,26,28);
  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('Muzeum',b.x+b.w/2,b.y+b.h+5); ctx.fillText('Rybołówstwa',b.x+b.w/2,b.y+b.h+18); ctx.shadowBlur=0;
}

/* ── Kościół ── */
function _drawHelKosciol(ctx, b) {
  ctx.fillStyle='#e8e0d0'; ctx.fillRect(b.x,b.y+30,b.w,b.h-30);
  ctx.fillStyle='#8a3820';
  ctx.beginPath(); ctx.moveTo(b.x-4,b.y+30); ctx.lineTo(b.x+b.w/2,b.y-8); ctx.lineTo(b.x+b.w+4,b.y+30); ctx.closePath(); ctx.fill();
  const tw=22, tx=b.x+b.w/2-tw/2;
  ctx.fillStyle='#d0c8b8'; ctx.fillRect(tx,b.y,tw,36);
  ctx.fillStyle='#8a3820'; ctx.fillRect(tx-2,b.y-6,tw+4,8);
  ctx.strokeStyle='#604828'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(tx+tw/2,b.y-24); ctx.lineTo(tx+tw/2,b.y-6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx+tw/2-7,b.y-17); ctx.lineTo(tx+tw/2+7,b.y-17); ctx.stroke();
  ctx.fillStyle='rgba(200,230,255,0.65)';
  for (let wy=b.y+40; wy<b.y+b.h-10; wy+=26) {
    const wx=b.x+14; ctx.fillRect(wx,wy,18,20); ctx.beginPath(); ctx.arc(wx+9,wy,9,Math.PI,0); ctx.fill();
    const wx2=b.x+b.w-32; ctx.fillRect(wx2,wy,18,20); ctx.beginPath(); ctx.arc(wx2+9,wy,9,Math.PI,0); ctx.fill();
  }
  ctx.fillStyle='#1a1008'; ctx.fillRect(b.x+b.w/2-9,b.y+b.h-26,18,26);
  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('Kościół',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Restauracja ── */
function _drawHelRestauracja(ctx, b) {
  const rg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
  rg.addColorStop(0,'#e87040'); rg.addColorStop(1,'#c04820');
  ctx.fillStyle=rg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#803010'; ctx.fillRect(b.x,b.y,b.w,9);
  ctx.fillStyle='#f0e830';
  for (let mx=b.x; mx<b.x+b.w; mx+=20) { ctx.beginPath(); ctx.moveTo(mx,b.y+9); ctx.lineTo(mx+10,b.y+24); ctx.lineTo(mx+20,b.y+9); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle='rgba(200,240,255,0.65)';
  for (let wx=b.x+10; wx<b.x+b.w-18; wx+=32) ctx.fillRect(wx,b.y+32,22,22);
  ctx.fillStyle='#f8f8e8'; ctx.fillRect(b.x+b.w/2-38,b.y+60,76,22);
  ctx.strokeStyle='#803010'; ctx.lineWidth=1.5; ctx.strokeRect(b.x+b.w/2-38,b.y+60,76,22);
  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#802010'; ctx.fillText('Restauracja',b.x+b.w/2,b.y+71);
  ctx.fillStyle='#1a1008'; ctx.fillRect(b.x+b.w/2-13,b.y+b.h-28,26,28);
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,200,100,0.8)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Gofrownia ── */
function _drawHelGofrownia(ctx, b) {
  const gg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
  gg.addColorStop(0,'#f8d040'); gg.addColorStop(1,'#d0a010');
  ctx.fillStyle=gg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#906808'; ctx.fillRect(b.x,b.y,b.w,8);
  ctx.fillStyle='rgba(200,240,255,0.65)';
  ctx.fillRect(b.x+10,b.y+16,20,20); ctx.fillRect(b.x+b.w-30,b.y+16,20,20);
  ctx.fillStyle='#fff'; ctx.fillRect(b.x+b.w/2-32,b.y+44,64,20);
  ctx.strokeStyle='#906808'; ctx.lineWidth=1.5; ctx.strokeRect(b.x+b.w/2-32,b.y+44,64,20);
  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#805008'; ctx.fillText('🧇 Gofrownia',b.x+b.w/2,b.y+54);
  ctx.fillStyle='#1a1008'; ctx.fillRect(b.x+b.w/2-11,b.y+b.h-26,22,26);
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,200,100,0.8)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Cypel Helski marker ── */
function _drawCypelMarker(ctx, ts) {
  const cx=175, cy=1940;
  const pulse=0.6+Math.sin(ts*0.005)*0.4;
  ctx.beginPath(); ctx.arc(cx,cy,38*pulse,0,Math.PI*2);
  ctx.fillStyle=`rgba(0,160,220,${pulse*0.12})`; ctx.fill();
  ctx.beginPath(); ctx.arc(cx,cy,20,0,Math.PI*2);
  ctx.fillStyle='rgba(0,140,200,0.8)'; ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('Cypel Helski',cx,cy-24); ctx.shadowBlur=0;
  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#fff'; ctx.shadowColor='rgba(0,0,0,0.7)'; ctx.shadowBlur=3;
  ctx.fillText('⚓',cx,cy); ctx.shadowBlur=0;
}

/* ══════════════════════════════════════════════════════
   SUBMAP_HEL
   ══════════════════════════════════════════════════════ */
const SUBMAP_HEL = {
  id:   'hel',
  name: 'Hel',
  w: 2400, h: 2000,
  bgColor: '#1040b0',

  spawn:         {x: 2050, y: 200},
  mainMapReturn: {x: 1900, y: 220},

  peninsulaShapes: _HEL_SHAPES,

  exitZones: [{x: 2050, y: 45, r: 65}],

  npcs: [
    {id:'h1',x:1970,y:320,_x:1970,_y:320,patrolAxis:'x',patrolMin:1820,patrolMax:2010,speed:46,_dir: 1,stepAnim:0,bodyColor:'#4a7060',hairColor:'#2a1810'},
    {id:'h2',x:1820,y:380,_x:1820,_y:380,patrolAxis:'x',patrolMin:1700,patrolMax:1965,speed:52,_dir:-1,stepAnim:0,bodyColor:'#607040',hairColor:'#3a2010'},
    {id:'h3',x:1880,y:260,_x:1880,_y:260,patrolAxis:'y',patrolMin:145,patrolMax:440,speed:40,_dir: 1,stepAnim:0,bodyColor:'#486888',hairColor:'#1a2a30'},
    {id:'h4',x:1880,y:155,_x:1880,_y:155,patrolAxis:'x',patrolMin:1755,patrolMax:2080,speed:44,_dir: 1,stepAnim:0,bodyColor:'#705040',hairColor:'#201810'},
    {id:'h5',x:580, y:1370,_x:580, _y:1370,patrolAxis:'x',patrolMin:480,patrolMax:750,speed:38,_dir:-1,stepAnim:0,bodyColor:'#4a6858',hairColor:'#281808'},
  ],

  onEnter() { _HEL_ST.spawned = false; },

  draw(ctx, ts)               { _drawHel(ctx, this, ts); },
  updateQuests(dt, subPlayer) { updateHelQuests(dt, subPlayer); },
  drawQuests(ctx, ts)         { drawHelQuests(ctx, ts); },
  drawQuestsHUD(ctx, cw, ch)  { drawHelQuestsHUD(ctx, cw, ch); },
};

SUBMAPS['hel'] = SUBMAP_HEL;
