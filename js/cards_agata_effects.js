'use strict';
/* ═══════════════════════════════════════════════════════
   Efekty Kart Agaty — centrum logiki gameplay
   Hookowne z: player.js, input.js, equipment.js,
               cats.js, quest_agnieszka.js, game.js,
               submap.js, gdansk.js, grudziadz.js
   ═══════════════════════════════════════════════════════ */

/* ── Stan ────────────────────────────────────────────── */
const _ACE = {
  /* spanko */        spankoNext:15,  spankoDur:0,
  /* ghost */         ghostNext:80,   ghostX:0, ghostY:0,
                      ghostAlpha:0,   fleeTimer:0, fleeDX:0, fleeDY:0, ghostZigTimer:0,
  /* kolano */        kolanoNext:60,  kolanoDur:0,
  /* zdjecie */       zdjecieNext:90, zdjecieDur:0, rafalAngle:0,
  /* rekus sharks */  sharks:[], sharkNext:14,
  /* agnieszki */     mainAgn:[], agnSpawnNext:20,
  /* kazimierz */     kazX:1100, kazY:700, kazVX:35, kazVY:28,
                      kazState:'patrol', kazTarget:null, kazAngle:0, kazAtkNext:40,
  /* notes warlubie */notes:[],
  /* hearts */        hearts:[],
  /* chess 1 */       chessCD:0,
  /* chess 2 */       drugiDone:false, drugiCD:0,
  /* praca */         pracaNext:60,
  /* dk (pijana) */   dkTimer:0, dkBubbles:[],
  /* tupanie */       tupNext:80, tupDur:0,
  /* spoznienie */    spozNext:100, spozShown:false,
  /* anime_baba */    animeEvent:null, animeNext:80,
  /* torun hearts */  torunHearts:false, torunHFX:[],
  /* technikalia */   techRolls:0, techHPMod:0, techCD:0,
  /* figurki */       figurkiPicked:[],
  /* zla */           zlaNext:7, zlaShown:false,
  /* stary_tel */     thiefActive:false, thiefX:0, thiefY:0, thiefVX:0, thiefVY:0, thiefNext:50,
  /* park */          parkEarnCD:0,
  /* powrot_armata */ arRafal:null,
  /* wiadukt card */  widNPC:{x:1088,y:756,vx:22,vy:14,atkCD:0},
  /* slonca */        sloncaCircles:[], sloncaSpawnCD:0,
  /* iceowka */       iceTimer:0, iceBubbles:[],
  /* init flag */     _ok:false,
};

function _aceInit() {
  if (_ACE._ok) return; _ACE._ok = true;
  _ACE.spankoNext  = 70  + Math.random() * 80;
  _ACE.ghostNext   = 70  + Math.random() * 60;
  _ACE.kolanoNext  = 50  + Math.random() * 50;
  _ACE.zdjecieNext = 90  + Math.random() * 70;
  _ACE.sharkNext   = 12  + Math.random() * 10;
  for (let i = 0; i < 8; i++) {
    _ACE.notes.push({
      a: i * Math.PI * 2 / 8,
      r: 55 + Math.random() * 35,
      ph: Math.random() * Math.PI * 2,
      sp: 0.35 + Math.random() * 0.4,
    });
  }
}

/* ── Gettery — wywoływane z innych plików ─────────────── */

function aceInputFrozen() {
  return _ACE.spankoDur > 0 || _ACE.zdjecieDur > 0;
}

function aceInputOverride() {
  if (_ACE.fleeTimer > 0) return { x: _ACE.fleeDX, y: _ACE.fleeDY };
  return null;
}

function aceSpeedMult() {
  if (_ACE.spankoDur > 0 || _ACE.zdjecieDur > 0) return 0;
  let m = 1.0;
  if (typeof acIsActive === 'function') {
    if (acIsActive('pilots'))  m *= 2.0;
    if (_ACE.kolanoDur > 0)        m *= 0.5;
    m *= aceLakeSpeedMult(
      typeof player !== 'undefined' ? player.x : 0,
      typeof player !== 'undefined' ? player.y : 0
    );
  }
  return m;
}

function aceMinZd() {
  if (typeof acIsActive !== 'function') return 0;
  let min = 0;
  if (acIsActive('komputer')) min = Math.max(min, 40);
  if (acIsActive('laptop1'))  min = Math.max(min, 20);
  return min;
}

function getAtakMult() {
  if (typeof acIsActive !== 'function') return 1;
  return acIsActive('kicia') ? 2.0 : 1.0;
}

function aceWarlubieHealMult() {
  if (typeof acIsActive !== 'function') return 1;
  return acIsActive('dni_warlubia') ? 2.0 : 1.0;
}

function aceMaxCats() {
  if (typeof acIsActive !== 'function') return 5;
  return acIsActive('kotek') ? 7 : 5;
}

function aceLaserResetTime() {
  if (typeof acIsActive !== 'function') return 3;
  return acIsActive('zajec') ? 0.7 : 3.0;
}

function aceRafalSpeedMult() {
  if (typeof acIsActive !== 'function') return 1;
  return acIsActive('rafik') ? 1.8 : 1.0;
}

function aceMaxZd() {
  if (typeof acIsActive !== 'function') return 100;
  let max = 100;
  if (acIsActive('wyjazd_torun') && _ACE.torunHearts) max += 50;
  if (acIsActive('konafetto')) max += 100;
  if (acIsActive('kinderki'))  max += 50;
  if (acIsActive('licencjat')) max += 30;
  max += _ACE.techHPMod;
  return Math.max(40, max);
}

function aceAtakMult() {
  if (typeof acIsActive !== 'function') return 1;
  let mult = acIsActive('redukcja') ? 0.6 : 1.0;
  /* Słońca: Agata nieśmiertelna w Toruniu */
  if (acIsActive('slonca')) {
    const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
    if (sub && sub.id === 'torun') mult = 0;
  }
  return mult;
}

/* ── Zła? UI ──────────────────────────────────────────── */
function zlaClose() {
  const ov = document.getElementById('zla-overlay');
  if (ov) ov.classList.add('hidden');
  _ACE.zlaShown = false;
}

/* ── Figurki Warhammer 40k ────────────────────────────── */
const _ACE_FIGURKI = [
  { id: 0, sub: null,       x:  900, y: 1200 },
  { id: 1, sub: null,       x: 2400, y:  800 },
  { id: 2, sub: null,       x: 1600, y:  400 },
  { id: 3, sub: 'gdansk',   x: 1800, y:  900 },
  { id: 4, sub: 'gdansk',   x: 3200, y:  500 },
  { id: 5, sub: 'grudziadz',x:  500, y:  350 },
  { id: 6, sub: 'grudziadz',x: 1400, y:  600 },
  { id: 7, sub: 'hel',      x:  800, y:  450 },
  { id: 8, sub: 'krynica',  x:  400, y:  350 },
  { id: 9, sub: 'torun',    x:  750, y:  500 },
];

function _aceTickFigurki(s, inSubmap) {
  if (!acIsActive('figurki')) return;
  const picked = _ACE.figurkiPicked;
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  const sp  = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
  const px  = inSubmap && sp ? sp.x : (typeof player !== 'undefined' ? player.x : -9999);
  const py  = inSubmap && sp ? sp.y : (typeof player !== 'undefined' ? player.y : -9999);
  for (const f of _ACE_FIGURKI) {
    if (picked.includes(f.id)) continue;
    const isHere = inSubmap ? (sub && sub.id === f.sub) : f.sub === null;
    if (!isHere) continue;
    if (Math.hypot(px - f.x, py - f.y) < 36) {
      picked.push(f.id);
      _aceSpeech(`Figurka ${picked.length}/10! 🗡️`, 2);
      if (picked.length >= 10) {
        if (typeof addZlote === 'function') addZlote(2000);
        setTimeout(() => { if (typeof showDialog === 'function') showDialog('🗡️', 'Zebrałaś wszystkie 10 figurek Warhammer 40k!\n+2000 zł 💰🎉'); }, 500);
      }
    }
  }
}

function _aceDFigurki(ctx, inSubmap, ts) {
  if (!acIsActive('figurki')) return;
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  const picked = _ACE.figurkiPicked;
  const pulse = 0.7 + 0.3 * Math.sin(ts * 0.003);
  ctx.save();
  ctx.globalAlpha = pulse;
  for (const f of _ACE_FIGURKI) {
    if (picked.includes(f.id)) continue;
    const isHere = inSubmap ? (sub && sub.id === f.sub) : f.sub === null;
    if (!isHere) continue;
    ctx.font = '20px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🗡️', f.x, f.y);
    ctx.font = 'bold 10px "Segoe UI"';
    ctx.fillStyle = '#ffddaa';
    ctx.fillText(`${picked.length}/10`, f.x, f.y - 20);
  }
  ctx.globalAlpha = 1; ctx.restore();
}

/* ── Jezioro — strefy jezior na mapie głównej ──────────── */
const _ACE_LAKES = [
  { x: 1780, y:  620, r: 80 },
  { x: 1870, y:  870, r: 72 },
  { x: 1640, y:  980, r: 88 },
  { x: 1720, y: 1130, r: 68 },
  { x: 1950, y: 1180, r: 75 },
  { x: 1540, y: 1180, r: 62 },
  { x: 1460, y:  720, r: 70 },
  { x: 1580, y:  500, r: 65 },
  { x: 2080, y:  640, r: 68 },
  { x: 2150, y:  960, r: 74 },
  { x: 1380, y:  880, r: 60 },
  { x: 2020, y: 1380, r: 70 },
  { x: 1700, y: 1400, r: 65 },
  { x: 1300, y: 1100, r: 58 },
  { x: 1900, y:  420, r: 62 },
  { x: 1250, y:  650, r: 72 },
  { x: 2280, y:  820, r: 66 },
  { x: 1480, y: 1350, r: 60 },
];

function aceLakeSpeedMult(x, y) {
  if (typeof acIsActive !== 'function' || !acIsActive('jezioro')) return 1;
  for (const lk of _ACE_LAKES) {
    if (Math.hypot(x - lk.x, y - lk.y) < lk.r) return 0.4;
  }
  return 1;
}

/* ── Debug triggers ──────────────────────────────────── */
const _ACE_TRIGGERS = {
  rekus: () => {
    const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
    const sp  = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
    if (!sub || !sp || (sub.id !== 'gdansk' && sub.id !== 'krynica')) return;
    let sx, sy;
    if (sub.id === 'gdansk') {
      sx = sp.x + (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 60);
      sy = Math.max(10, Math.min(440, sp.y - 60 - Math.random() * 60));
    } else {
      sx = sp.x + (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 60);
      const coastY = 170 + 0.22 * sx;
      sy = Math.max(10, coastY - 30 - Math.random() * 50);
    }
    _ACE.sharks = [];
    _ACE.sharks.push({ x: sx, y: sy, ang: Math.random() * Math.PI * 2, spd: 55, rewarded: false, leaveT: 0 });
    _ACE.sharkNext = 45 + Math.random() * 35;
  },
  spanko: () => {
    _ACE.spankoDur  = 20;
    _ACE.spankoNext = 80 + Math.random() * 80;
    _aceSpeech('Jest 21:00... 😴 Spanko...', 4);
  },
  matemblewo: () => {
    const _sp = (typeof _subPlayer !== 'undefined' && typeof _activeSub !== 'undefined' && _activeSub) ? _subPlayer : null;
    const px = _sp ? _sp.x : (typeof player !== 'undefined' ? player.x : 1600);
    const py = _sp ? _sp.y : (typeof player !== 'undefined' ? player.y : 1600);
    const ang = Math.random() * Math.PI * 2;
    _ACE.ghostX = px + Math.cos(ang) * 90;
    _ACE.ghostY = py + Math.sin(ang) * 90;
    _ACE.ghostAlpha = 1;
    _ACE.fleeTimer  = 5;
    _ACE.ghostZigTimer = 0.35;
    _ACE.ghostNext = 70 + Math.random() * 70;
    const dx = px - _ACE.ghostX, dy = py - _ACE.ghostY;
    const len = Math.hypot(dx, dy) || 1;
    _ACE.fleeDX = dx / len; _ACE.fleeDY = dy / len;
    _aceSpeech('AAAA DUCH!!! 👻', 3);
  },
  kolano: () => {
    _ACE.kolanoDur  = 10;
    _ACE.kolanoNext = 50 + Math.random() * 50;
    _aceSpeech('Ała! Kolano boli... 🦵', 3);
  },
  zdjecie: () => {
    _ACE.zdjecieDur  = 7;
    _ACE.zdjecieNext = 80 + Math.random() * 70;
    _ACE.rafalAngle  = 0;
    _aceSpeech('😳 Rafał nagrywa!', 3);
  },
  praca: () => {
    _ACE.pracaNext = 50 + Math.random() * 50;
    _aceSpeech('No i po co ci ta praca :( głupie to', 4);
    if (typeof applyZdenerwowanie === 'function') applyZdenerwowanie(20);
  },
  tupanie: () => {
    _ACE.tupDur  = 8;
    _ACE.tupNext = 60 + Math.random() * 60;
    _aceSpeech('👣 Maro tupie nogą!!!', 3);
  },
  spoznienie: () => {
    const ov = document.getElementById('spoz-overlay');
    if (ov) { ov.classList.remove('hidden'); _ACE.spozShown = true; }
    _ACE.spozNext = 80 + Math.random() * 60;
  },
  anime_baba: () => {
    const inSub = typeof _activeSub !== 'undefined' && _activeSub;
    const px = inSub && typeof _subPlayer !== 'undefined' ? _subPlayer.x : (typeof player !== 'undefined' ? player.x : 800);
    const py = inSub && typeof _subPlayer !== 'undefined' ? _subPlayer.y : (typeof player !== 'undefined' ? player.y : 800);
    const a = Math.random() * Math.PI * 2;
    _ACE.animeEvent = { x: px + Math.cos(a)*120, y: py + Math.sin(a)*120, timer: 5, fled: false, _sub: !!inSub };
    _ACE.animeNext = 80 + Math.random() * 60;
    _aceSpeech('😤 Rafał z anime babą!?', 3);
  },
};

function acDbgTrigger(id) {
  if (_ACE_TRIGGERS[id]) _ACE_TRIGGERS[id]();
}

/* ── Spóźnienie UI ────────────────────────────────────── */
function spozClose() {
  document.getElementById('spoz-overlay').classList.add('hidden');
  _ACE.spozShown = false;
  if (Math.random() < 0.5) {
    if (typeof applyZdenerwowanie === 'function') applyZdenerwowanie(30);
    if (typeof showDialog === 'function') showDialog('⏰', 'Rafał się spóźnił...\n+30 zdenerwowania 😤');
  }
}

/* ── Technikalia UI ───────────────────────────────────── */
function aceTechOpen() {
  if (_ACE.techCD > 0 || !acIsActive('technikalia')) return;
  _ACE.techRolls = 0;
  _aceRefreshTechUI();
  document.getElementById('tech-overlay').classList.remove('hidden');
  if (typeof setPaused === 'function') setPaused(true);
}

function _aceRefreshTechUI() {
  const ri = document.getElementById('tech-rolls-info');
  const rb = document.getElementById('tech-btn-roll');
  if (ri) ri.textContent = `Runda ${_ACE.techRolls}/3 | Modyfikator HP: ${_ACE.techHPMod >= 0 ? '+' : ''}${_ACE.techHPMod}`;
  if (rb) rb.disabled = _ACE.techRolls >= 3;
}

function techRoll() {
  if (_ACE.techRolls >= 3) return;
  _ACE.techRolls++;
  const success = Math.random() < 0.5;
  const delta = success ? 20 : -20;
  _ACE.techHPMod += delta;
  const body = document.getElementById('tech-body');
  if (body) {
    body.textContent = success
      ? `Nic się nie zjebało! 🎉 Agata ma o 20% więcej HP max.`
      : `Coś się zjebało... 😬 Agata ma o 20% mniej HP max.`;
  }
  _aceRefreshTechUI();
}

function techClose() {
  document.getElementById('tech-overlay').classList.add('hidden');
  if (typeof setPaused === 'function') setPaused(false);
  if (typeof _GDN !== 'undefined') _GDN.techCD = 120;
}

/* ── Giga Liga — selfie z kamerą ─────────────────────── */
function _aceOpenGigaLiga() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    if (typeof showDialog === 'function') showDialog('🔥 GIGA LIGA', 'Aparat niedostępny na tym urządzeniu!\nAle i tak jesteś legendą! 💪');
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      const v = document.createElement('video');
      v.srcObject = stream; v.autoplay = true; v.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);z-index:9000;border:4px solid #ff6600;border-radius:12px;width:300px';
      const btn = document.createElement('button');
      btn.textContent = '📸 Selfie z Giga Ligą!'; btn.style.cssText = 'position:fixed;top:calc(20% + 225px);left:50%;transform:translateX(-50%);z-index:9001;padding:10px 20px;background:#ff6600;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer';
      btn.onclick = () => { stream.getTracks().forEach(t=>t.stop()); v.remove(); btn.remove(); if (typeof showDialog === 'function') showDialog('📸', 'Selfie z Giga Ligą gotowe! 💪🔥'); };
      document.body.appendChild(v); document.body.appendChild(btn);
    })
    .catch(() => { if (typeof showDialog === 'function') showDialog('🔥 GIGA LIGA', 'Brak dostępu do kamery!\nAle i tak jesteś Giga Ligą! 🏆'); });
}

/* ── WD (Wieczór Dżentelmana) — cutscenka taniec ────── */
const _WD = { active: false, t: 0, rafId: 0, prevTs: -1 };

/* Sekwencja ruchów: czas startu, czas trwania, nazwa */
const _WD_SEQ = [
  { t: 0,  dur: 3,   name: 'sway'   }, /* wolne kołysanie bioder */
  { t: 3,  dur: 3,   name: 'reach'  }, /* ręce w górę, łuk ciała */
  { t: 6,  dur: 3.5, name: 'floor'  }, /* schodzi na podłogę */
  { t: 9.5,dur: 3.5, name: 'ground' }, /* leżąc: rozłożone nogi, wicie */
  { t: 13, dur: 3,   name: 'rise'   }, /* wstaje zmysłowo */
  { t: 16, dur: 2,   name: 'finale' }, /* końcowa poza */
];
const _WD_TOTAL = 18;

function _aceOpenWD() {
  const ov = document.getElementById('wd-overlay');
  const cv = document.getElementById('wd-cvs');
  if (!ov || !cv) {
    if (typeof addZlote === 'function') addZlote(1500);
    if (typeof _GDN !== 'undefined') _GDN.wdDone = true;
    return;
  }
  cv.width  = ov.clientWidth  || window.innerWidth;
  cv.height = ov.clientHeight || window.innerHeight;
  _WD.active = true; _WD.t = 0; _WD.prevTs = -1;
  ov.classList.remove('hidden');
  document.getElementById('wd-close').classList.add('hidden');
  document.getElementById('wd-reward').classList.add('hidden');
  if (typeof setPaused === 'function') setPaused(true);
  _WD.rafId = requestAnimationFrame(_wdLoop);
}

function _wdClose() {
  _WD.active = false;
  cancelAnimationFrame(_WD.rafId);
  document.getElementById('wd-overlay').classList.add('hidden');
  if (typeof addZlote === 'function') addZlote(1500);
  if (typeof _GDN !== 'undefined') _GDN.wdDone = true;
  if (typeof setPaused === 'function') setPaused(false);
}

function _wdLoop(ts) {
  if (!_WD.active) return;
  const cv = document.getElementById('wd-cvs');
  if (!cv) return;
  /* stutter fix: ignoruj pierwszy frame, ustaw timer na drugim */
  if (_WD.prevTs < 0) { _WD.prevTs = ts; _WD.rafId = requestAnimationFrame(_wdLoop); return; }
  const dt = Math.min((ts - _WD.prevTs) / 1000, 0.05);
  _WD.prevTs = ts;
  _WD.t += dt;

  if (_WD.t >= _WD_TOTAL && _WD.active) {
    document.getElementById('wd-reward').classList.remove('hidden');
    setTimeout(() => { if (_WD.active) document.getElementById('wd-close').classList.remove('hidden'); }, 900);
    /* zatrzymaj animację, ale tło zostaje */
    _WD.active = false;
    _wdDraw(cv);
    return;
  }

  _wdDraw(cv);
  if (_WD.active) _WD.rafId = requestAnimationFrame(_wdLoop);
}

/* Interpolacja płynna między fazami */
function _wdPhase() {
  const t = _WD.t;
  for (let i = _WD_SEQ.length - 1; i >= 0; i--) {
    if (t >= _WD_SEQ[i].t) {
      const p = Math.min(1, (t - _WD_SEQ[i].t) / _WD_SEQ[i].dur);
      /* ease in-out cubic */
      const e = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2;
      return { name: _WD_SEQ[i].name, p: e, raw: p };
    }
  }
  return { name: 'sway', p: 0, raw: 0 };
}

/* Rysuje postać Agaty w 2D wg sekwencji */
function _wdDrawAgata(c, W, H) {
  const t = _WD.t;
  const { name, p, raw } = _wdPhase();

  /* Kolory: jasne włosy, czarne skąpe ubranie, skóra */
  const SKIN = '#f0c8a0';
  const HAIR = '#f5e080';  /* jasny blond */
  const OUTFIT = '#111';   /* czarny */
  const LIPS = '#e8305a';

  /* Bazowy środek — zależy od fazy */
  let cx = W / 2, cy = H * 0.52;
  let bodyAngle = 0;
  let bodyLean = 0;  /* przechylenie tułowia */
  let floorY = 0;    /* offset gdy leży */

  /* ─── parametry per faza ─── */
  /* hipHold = kołysanie bioder; armUp = wzniesienie rąk; legSpread = rozłożenie nóg */
  let hipSwing = 0, hipBob = 0;
  let lArmX = -22, lArmY = -10, lArmEndX = -38, lArmEndY = 10;
  let rArmX =  22, rArmY = -10, rArmEndX =  38, rArmEndY = 10;
  let lLegX = -10, lLegY = 60, lLegEndX = -14, lLegEndY = 100;
  let rLegX =  10, rLegY = 60, rLegEndX =  14, rLegEndY = 100;
  let headTilt = 0, eyeHalf = false, lying = false;

  if (name === 'sway') {
    /* wolne zmysłowe kołysanie */
    hipSwing = Math.sin(t * 1.2) * 18;
    hipBob   = Math.abs(Math.sin(t * 1.2)) * 6;
    bodyLean = Math.sin(t * 1.2) * 0.18;
    headTilt = Math.sin(t * 1.2 + 0.5) * 0.2;
    lArmX=-20; lArmY=-8; lArmEndX=-44 + Math.sin(t*1.4)*12; lArmEndY=-25 + Math.sin(t*0.9)*10;
    rArmX= 20; rArmY=-8; rArmEndX= 44 - Math.sin(t*1.4)*12; rArmEndY=-25 - Math.sin(t*0.9)*10;
  } else if (name === 'reach') {
    /* łuk ciała, ręce wysoko */
    hipSwing = Math.sin(t * 0.8) * 14;
    bodyLean = Math.sin(t * 0.8) * 0.22 - p * 0.15;
    headTilt = p * 0.3;
    eyeHalf  = true;
    const upness = p;
    lArmX=-18; lArmY=-12; lArmEndX=-28 - upness*20; lArmEndY=-60 - upness*40;
    rArmX= 18; rArmY=-12; rArmEndX= 28 + upness*20; rArmEndY=-60 - upness*40;
    cy += p * 8;
  } else if (name === 'floor') {
    /* schodzi na podłogę — obrót ciała */
    hipSwing = (1-p) * Math.sin(t * 1.0) * 14;
    bodyLean = p * 0.8;
    floorY   = p * 70;
    cy += p * 60;
    headTilt = p * 0.6;
    eyeHalf  = true;
    lArmX=-18; lArmY=0; lArmEndX=-14 - p*30; lArmEndY=30 + p*50;
    rArmX= 18; rArmY=0; rArmEndX= 14 + p*30; rArmEndY=30 + p*50;
    /* nogi zaczynają się rozkładać */
    lLegX=-10; lLegY=60-p*50; lLegEndX=-14-p*40; lLegEndY=100-p*60;
    rLegX= 10; rLegY=60-p*50; rLegEndX= 14+p*40; rLegEndY=100-p*60;
    lying = p > 0.6;
  } else if (name === 'ground') {
    /* leży, wicie, rozłożone nogi */
    lying = true;
    cy = H * 0.72;
    bodyLean = Math.PI * 0.5; /* poziomo */
    const writhe = Math.sin(t * 1.8) * 0.15;
    headTilt = writhe + 0.4;
    eyeHalf  = true;
    /* nogi rozłożone: lewa w górę, prawa w bok */
    const spread = 0.5 + 0.5 * Math.sin(t * 0.9);
    lLegX=-10; lLegY= -40 * spread; lLegEndX= -50 - 20*spread; lLegEndY=-70 * spread;
    rLegX= 10; rLegY=  20;           rLegEndX=  60 + 20*spread; rLegEndY= 10;
    /* ręce: jedna nad głową, druga na boku */
    lArmX=-18; lArmY=0; lArmEndX=-50 - Math.sin(t*1.5)*10; lArmEndY=-20 + Math.sin(t*1.5)*8;
    rArmX= 18; rArmY=0; rArmEndX= 30; rArmEndY= 40 + Math.sin(t*1.8)*12;
    /* biodra = delikatne unoszenie */
    floorY = Math.sin(t * 1.8) * 8;
    cy += floorY;
    cx += Math.sin(t * 0.7) * 12;
  } else if (name === 'rise') {
    /* wstaje zmysłowo */
    lying = p < 0.5;
    const rp = Math.min(1, p * 2);
    cy = H * 0.72 - p * (H * 0.72 - H * 0.52);
    bodyLean = Math.PI * 0.5 * (1 - p) + Math.sin(t * 1.0) * 0.1 * (1-p);
    headTilt = (1-p) * 0.4;
    eyeHalf  = true;
    hipSwing = p * Math.sin(t * 1.2) * 18;
    lArmX=-18; lArmY=-8; lArmEndX=-30 - (1-p)*20; lArmEndY=-20 + (1-p)*20;
    rArmX= 18; rArmY=-8; rArmEndX= 30 + (1-p)*20; rArmEndY=-20 + (1-p)*20;
    lLegX=-10; lLegY=60; lLegEndX=-14 - (1-p)*30; lLegEndY=100 - (1-p)*40;
    rLegX= 10; rLegY=60; rLegEndX= 14 + (1-p)*30; rLegEndY=100 - (1-p)*40;
  } else { /* finale */
    hipSwing = Math.sin(t * 1.0) * 10;
    bodyLean = Math.sin(t * 0.8) * 0.12;
    headTilt = -0.15;
    eyeHalf  = true;
    lArmX=-18; lArmY=-8; lArmEndX=-55; lArmEndY=-45 + Math.sin(t*1.2)*10;
    rArmX= 18; rArmY=-8; rArmEndX= 55; rArmEndY=-45 - Math.sin(t*1.2)*10;
    cy += Math.sin(t*1.5)*6;
  }

  c.save();
  c.translate(cx + hipSwing, cy - hipBob);
  c.rotate(bodyLean);

  /* ── cień ── */
  if (!lying) {
    c.fillStyle='rgba(0,0,0,0.22)';
    c.beginPath(); c.ellipse(0, 108+hipBob, 30, 9, 0, 0, Math.PI*2); c.fill();
  }

  const LW = 8; /* grubość kończyn */
  c.lineCap='round'; c.lineJoin='round';

  /* ── NOGI ── */
  c.strokeStyle=SKIN; c.lineWidth=LW;
  /* lewa */
  c.beginPath(); c.moveTo(lLegX, lLegY); c.quadraticCurveTo(lLegX*1.4, (lLegY+lLegEndY)/2, lLegEndX, lLegEndY); c.stroke();
  /* prawa */
  c.beginPath(); c.moveTo(rLegX, rLegY); c.quadraticCurveTo(rLegX*1.4, (rLegY+rLegEndY)/2, rLegEndX, rLegEndY); c.stroke();
  /* czarne obcasy */
  c.fillStyle=OUTFIT; c.lineWidth=1;
  c.beginPath(); c.ellipse(lLegEndX, lLegEndY, 9, 4, 0.3, 0, Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(rLegEndX, rLegEndY, 9, 4, -0.3, 0, Math.PI*2); c.fill();

  /* ── TUŁÓW — skąpy czarny top i majtki ── */
  /* skóra brzucha (eksponowana) */
  c.fillStyle=SKIN;
  c.beginPath(); c.ellipse(0, 15, 14, 22, 0, 0, Math.PI*2); c.fill();
  /* czarny top (mały) */
  c.fillStyle=OUTFIT;
  c.beginPath(); c.moveTo(-17, -30); c.lineTo(17, -30); c.lineTo(14, -5); c.lineTo(-14, -5); c.closePath(); c.fill();
  /* ramiączka */
  c.strokeStyle=OUTFIT; c.lineWidth=3;
  c.beginPath(); c.moveTo(-8, -30); c.lineTo(-6, -48); c.stroke();
  c.beginPath(); c.moveTo( 8, -30); c.lineTo( 6, -48); c.stroke();
  /* czarne majtki */
  c.fillStyle=OUTFIT;
  c.beginPath(); c.moveTo(-16, 25); c.lineTo(16, 25); c.lineTo(12, 52); c.lineTo(-12, 52); c.closePath(); c.fill();
  /* szew dekoltu */
  c.strokeStyle='rgba(255,255,255,0.18)'; c.lineWidth=1;
  c.beginPath(); c.moveTo(-12,-28); c.lineTo(0,-8); c.lineTo(12,-28); c.stroke();

  /* ── RĘCE ── */
  c.strokeStyle=SKIN; c.lineWidth=LW;
  c.beginPath(); c.moveTo(lArmX,lArmY); c.quadraticCurveTo((lArmX+lArmEndX)/2-8, (lArmY+lArmEndY)/2, lArmEndX, lArmEndY); c.stroke();
  c.beginPath(); c.moveTo(rArmX,rArmY); c.quadraticCurveTo((rArmX+rArmEndX)/2+8, (rArmY+rArmEndY)/2, rArmEndX, rArmEndY); c.stroke();
  /* dłonie */
  c.fillStyle=SKIN; c.lineWidth=1;
  c.beginPath(); c.arc(lArmEndX, lArmEndY, 6, 0, Math.PI*2); c.fill();
  c.beginPath(); c.arc(rArmEndX, rArmEndY, 6, 0, Math.PI*2); c.fill();

  /* ── GŁOWA ── */
  c.save(); c.rotate(headTilt);
  /* szyja */
  c.fillStyle=SKIN; c.beginPath(); c.rect(-5,-42,10,16); c.fill();
  /* głowa */
  c.fillStyle=SKIN; c.beginPath(); c.ellipse(0,-56,16,18,0,0,Math.PI*2); c.fill();
  /* włosy — jasny blond, długie */
  c.fillStyle=HAIR;
  c.beginPath(); c.ellipse(0,-66,17,10,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(-14,-55,9,15,0.3,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse( 14,-55,9,15,-0.3,0,Math.PI*2); c.fill();
  /* długie włosy opadające */
  c.beginPath(); c.moveTo(-14,-48); c.quadraticCurveTo(-22,-20,-18,20); c.lineWidth=9; c.strokeStyle=HAIR; c.stroke();
  c.beginPath(); c.moveTo( 14,-48); c.quadraticCurveTo( 22,-20, 18,20); c.lineWidth=9; c.stroke();
  c.lineWidth=1;
  /* twarz */
  c.fillStyle='#333';
  /* oczy */
  if (eyeHalf) {
    c.beginPath(); c.ellipse(-6,-57,4,2.5,0,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse( 6,-57,4,2.5,0,0,Math.PI*2); c.fill();
  } else {
    c.beginPath(); c.arc(-6,-57,3.5,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc( 6,-57,3.5,0,Math.PI*2); c.fill();
  }
  /* rzęsy */
  c.strokeStyle='#222'; c.lineWidth=1.5;
  for (let i=-1;i<=1;i++) { c.beginPath(); c.moveTo(-6+i*3,-53); c.lineTo(-6+i*3,-51); c.stroke(); }
  for (let i=-1;i<=1;i++) { c.beginPath(); c.moveTo( 6+i*3,-53); c.lineTo( 6+i*3,-51); c.stroke(); }
  /* nos */
  c.fillStyle='rgba(0,0,0,0.15)'; c.beginPath(); c.arc(0,-53,2,0,Math.PI*2); c.fill();
  /* usta */
  c.fillStyle=LIPS; c.beginPath(); c.ellipse(0,-47,7,3.5,0,0,Math.PI*2); c.fill();
  c.fillStyle='rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-2,-48,3,1.5,0,0,Math.PI*2); c.fill();
  c.restore();

  c.restore();
}

function _wdDraw(cv) {
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const t = _WD.t;

  /* tło — gradient purpurowo-czarny */
  const bg = c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0a0015'); bg.addColorStop(1,'#1a0030');
  c.fillStyle=bg; c.fillRect(0,0,W,H);

  /* podłoga */
  const floorY = H * 0.78;
  const flg = c.createLinearGradient(0,floorY,0,H);
  flg.addColorStop(0,'#1c0838'); flg.addColorStop(1,'#0d0020');
  c.fillStyle=flg; c.fillRect(0,floorY,W,H-floorY);
  /* linie perspektywy podłogi */
  c.strokeStyle='rgba(180,80,255,0.15)'; c.lineWidth=1;
  for (let i=0;i<=10;i++) {
    c.beginPath(); c.moveTo(W/2,floorY); c.lineTo(i*(W/10),H); c.stroke();
  }
  for (let j=0;j<=4;j++) {
    const yy = floorY + (H-floorY)*(j/4);
    const xw = (W/2) * (j/4);
    c.beginPath(); c.moveTo(W/2-xw,yy); c.lineTo(W/2+xw,yy); c.stroke();
  }

  /* reflektor */
  const { name } = _wdPhase();
  const spotY = name === 'ground' ? H * 0.72 : H * 0.62;
  const spot = c.createRadialGradient(W/2,spotY,0,W/2,spotY,H*0.5);
  spot.addColorStop(0,'rgba(255,220,160,0.22)');
  spot.addColorStop(0.4,'rgba(200,120,255,0.10)');
  spot.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=spot; c.fillRect(0,0,W,H);

  /* tytuł */
  c.save();
  c.textAlign='center'; c.textBaseline='middle';
  c.font='bold 26px "Segoe UI",sans-serif';
  const ta = 0.7 + 0.15*Math.sin(t*1.8);
  c.fillStyle=`rgba(255,180,255,${ta})`;
  c.shadowColor='#cc44ff'; c.shadowBlur=18;
  c.fillText('Wieczór Dżentelmana', W/2, H*0.1);
  c.shadowBlur=0; c.restore();

  /* nuty unoszące się */
  const notes=['♪','♫','♩','♬'];
  for (let i=0;i<5;i++) {
    const ph = t*0.7 + i*1.26;
    const nx = W*0.15 + i*(W*0.17) + Math.sin(ph+i)*W*0.04;
    const ny = H*0.25 + Math.sin(ph*0.8)*H*0.06;
    const a  = 0.3 + 0.3*Math.sin(ph);
    c.save(); c.globalAlpha=a; c.fillStyle='#ffaaff';
    c.font='20px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(notes[i%4],nx,ny); c.globalAlpha=1; c.restore();
  }

  /* postać Agaty */
  _wdDrawAgata(c, W, H);

  /* serduszka w finale */
  if (name === 'finale' || name === 'rise') {
    for (let i=0;i<6;i++) {
      const ph3 = t*0.9 + i*1.05;
      const hx = W/2 + Math.cos(ph3)*W*0.3;
      const hy = H*0.4 - ((t*40 + i*60) % (H*0.6));
      c.save(); c.globalAlpha=0.55; c.font='16px serif';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('💕',hx,hy); c.globalAlpha=1; c.restore();
    }
  }
}

/* ── Główny tick ─────────────────────────────────────── */
function aceFxTick(dt, inSubmap) {
  _aceInit();
  const s = dt / 1000;

  _aceTickSpanko(s);
  _aceTickGhost(s);

  _aceTickZdjecie(s);

  if (!inSubmap) {
    _aceTickAgnieszki(s);
    _aceTickNotes(s);
  } else {
    _aceTickKazimierz(s);
    _aceTickSharks(s);
    _aceTickMaroHeal(s);
  }
  _aceTickKolano(s);
  _aceTickHearts(s);
  _aceTickChessCD(s);
  _aceTickPraca(s);
  _aceTickDk(s, inSubmap);
  _aceTickTupanie(s, inSubmap);
  _aceTickSpoznienie(s);
  _aceTickAnimeBaba(s, inSubmap);
  _aceTickTorunHearts(s, inSubmap);
  _aceTickFigurki(s, inSubmap);
  _aceTickZla(s);
  _aceTickStaryTel(s, inSubmap);
  _aceTickPark(s, inSubmap);
  _aceTickSponsory(s, inSubmap);
  _aceTickPowrotArmata(s, inSubmap);
  _aceTickWiadukCard(s, inSubmap);
  _aceTickSlonca(s, inSubmap);
  _aceTickIceowka(s, inSubmap);
  _aceTickPeppepepe(s);
}

/* ── Spanko ──────────────────────────────────────────── */
function _aceTickSpanko(s) {
  if (!acIsActive('spanko')) return;
  if (_ACE.spankoDur > 0) { _ACE.spankoDur = Math.max(0, _ACE.spankoDur - s); return; }
  const prevCeil = Math.ceil(_ACE.spankoNext);
  _ACE.spankoNext -= s;
  if (Math.ceil(_ACE.spankoNext) !== prevCeil) {
    console.log('[spanko] za:', Math.ceil(_ACE.spankoNext), 's');
  }
  if (_ACE.spankoNext <= 0) {
    _ACE.spankoDur  = 20;
    _ACE.spankoNext = 80 + Math.random() * 80;
    _aceSpeech('Jest 21:00... 😴 Spanko...', 4);
  }
}

/* ── Duch (Matemblewo) ───────────────────────────────── */
function _aceTickGhost(s) {
  if (!acIsActive('matemblewo')) return;
  if (_ACE.ghostAlpha > 0) _ACE.ghostAlpha = Math.max(0, _ACE.ghostAlpha - s * 0.25);
  if (_ACE.fleeTimer  > 0) {
    _ACE.fleeTimer -= s;
    _ACE.ghostZigTimer -= s;
    if (_ACE.ghostZigTimer <= 0) {
      /* zmień kierunek o ~90° w losową stronę — zygzak */
      const turn = (Math.random() < 0.5 ? 1 : -1) * (Math.PI * 0.4 + Math.random() * Math.PI * 0.3);
      const c = Math.cos(turn), si = Math.sin(turn);
      const nx = _ACE.fleeDX * c - _ACE.fleeDY * si;
      const ny = _ACE.fleeDX * si + _ACE.fleeDY * c;
      _ACE.fleeDX = nx; _ACE.fleeDY = ny;
      _ACE.ghostZigTimer = 0.35 + Math.random() * 0.2;
    }
    if (_ACE.fleeTimer <= 0) _ACE.fleeTimer = 0;
    return;
  }
  const _ghostPrevCeil = Math.ceil(_ACE.ghostNext);
  _ACE.ghostNext -= s;
  if (Math.ceil(_ACE.ghostNext) !== _ghostPrevCeil) {
    console.log('[duch] za:', Math.ceil(_ACE.ghostNext), 's');
  }
  if (_ACE.ghostNext <= 0) {
    const _sp = (typeof _subPlayer !== 'undefined' && typeof _activeSub !== 'undefined' && _activeSub) ? _subPlayer : null;
    const px = _sp ? _sp.x : (typeof player !== 'undefined' ? player.x : 1600);
    const py = _sp ? _sp.y : (typeof player !== 'undefined' ? player.y : 1600);
    const ang = Math.random() * Math.PI * 2;
    _ACE.ghostX = px + Math.cos(ang) * 90;
    _ACE.ghostY = py + Math.sin(ang) * 90;
    _ACE.ghostAlpha = 1;
    _ACE.fleeTimer  = 5;
    _ACE.ghostZigTimer = 0.35;
    const dx = px - _ACE.ghostX, dy = py - _ACE.ghostY;
    const len = Math.hypot(dx, dy) || 1;
    _ACE.fleeDX = dx / len; _ACE.fleeDY = dy / len;
    _ACE.ghostNext = 70 + Math.random() * 70;
    _aceSpeech('AAAA DUCH!!! 👻', 3);
  }
}

/* ── Kolano ──────────────────────────────────────────── */
function _aceTickKolano(s) {
  if (!acIsActive('kolano')) return;
  if (_ACE.kolanoDur > 0) { _ACE.kolanoDur = Math.max(0, _ACE.kolanoDur - s); return; }
  _ACE.kolanoNext -= s;
  if (_ACE.kolanoNext <= 0) {
    _ACE.kolanoDur  = 10;
    _ACE.kolanoNext = 50 + Math.random() * 50;
    _aceSpeech('Ała! Kolano boli... 🦵', 3);
  }
}

/* ── Zdjęcie (Nagrywanie) ────────────────────────────── */
function _aceTickZdjecie(s) {
  if (!acIsActive('zdjecie')) return;
  if (_ACE.zdjecieDur > 0) {
    _ACE.zdjecieDur -= s;
    _ACE.rafalAngle += s * 1.6;
    if (_ACE.zdjecieDur <= 0) {
      _ACE.zdjecieDur = 0;
      if (typeof applyZdenerwowanie === 'function') applyZdenerwowanie(-40);
      _aceSpeech('✓ Gotowe! ♥ Piękne ujęcie', 3);
    }
    return;
  }
  _ACE.zdjecieNext -= s;
  if (_ACE.zdjecieNext <= 0) {
    _ACE.zdjecieDur  = 7;
    _ACE.zdjecieNext = 80 + Math.random() * 70;
    _ACE.rafalAngle  = 0;
    _aceSpeech('😳 Rafał nagrywa!', 3);
  }
}

/* ── Agnieszki na mapie głównej ──────────────────────── */
function _aceTickAgnieszki(s) {
  if (!acIsActive('agnieszka')) { _ACE.mainAgn = []; return; }
  _ACE.agnSpawnNext -= s;
  if (_ACE.agnSpawnNext <= 0 && _ACE.mainAgn.length < 4) {
    _ACE.agnSpawnNext = 22 + Math.random() * 24;
    const opts = [[1920,580],[1680,820],[1840,1060],[2020,840],[1760,730]];
    const p = opts[Math.floor(Math.random() * opts.length)];
    _ACE.mainAgn.push({ x: p[0], y: p[1], dir: 1, step: 0 });
  }
  const px = typeof player !== 'undefined' ? player.x : 0;
  const py = typeof player !== 'undefined' ? player.y : 0;
  for (const a of _ACE.mainAgn) {
    const dx = px - a.x, dy = py - a.y, dist = Math.hypot(dx, dy);
    if (dist > 38 && dist < 600) {
      const spd = 70 * s;
      a.x += (dx / dist) * spd; a.y += (dy / dist) * spd;
      a.dir = dx > 0 ? 1 : -1; a.step += s * 5;
    } else if (dist <= 38) {
      a.step += s * 3;
      a.hitTimer = (a.hitTimer || 0) + s;
      if (a.hitTimer >= 1.2) {
        a.hitTimer = 0;
        if (typeof applyZdenerwowanie === 'function') applyZdenerwowanie(8);
      }
    }
  }
  _ACE.mainAgn = _ACE.mainAgn.filter(a => Math.hypot(a.x - px, a.y - py) < 1800);
}

/* ── Nuty wokół Warlubia ─────────────────────────────── */
function _aceTickNotes(s) {
  if (!acIsActive('dni_warlubia')) return;
  for (const n of _ACE.notes) { n.a += s * 0.25; n.ph += s * n.sp; }
}

/* ── Sharks (Rekuś) — Gdańsk i Krynica Morska ────────── */
function _aceTickSharks(s) {
  if (!acIsActive('rekus')) { _ACE.sharks = []; return; }
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  if (!sub || (sub.id !== 'gdansk' && sub.id !== 'krynica')) { _ACE.sharks = []; return; }
  const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
  if (!sp) return;

  _ACE.sharkNext -= s;
  if (_ACE.sharkNext <= 0 && _ACE.sharks.length < 1) {
    _ACE.sharkNext = 45 + Math.random() * 35;
    let sx, sy;
    if (sub.id === 'gdansk') {
      sx = 100 + Math.random() * 900;
      sy = 50  + Math.random() * 300;
    } else {
      /* Krynica — Bałtyk jest powyżej ukośnego pasa (y < topA + slope*x) */
      sx = 100 + Math.random() * 1400;
      const coastY = 170 + 0.22 * sx;
      sy = Math.max(15, coastY - 30 - Math.random() * 80);
    }
    _ACE.sharks.push({
      x: sx, y: sy,
      ang: Math.random() * Math.PI * 2,
      spd: 50 + Math.random() * 30,
      rewarded: false, leaveT: 0,
    });
  }

  for (const sh of _ACE.sharks) {
    const dx = sp.x - sh.x, dy = sp.y - sh.y, dist = Math.hypot(dx, dy);
    /* podpłyń do gracza gdy blisko brzegu */
    const nearCoast = sub.id === 'gdansk'
      ? sp.y > 360
      : sp.y < 170 + 0.22 * sp.x + 60;
    if (nearCoast && dist < 280 && !sh.rewarded) {
      sh.ang = Math.atan2(dy, dx);
    } else {
      sh.ang += (Math.random() - 0.5) * s * 1.8;
    }
    sh.x += Math.cos(sh.ang) * sh.spd * s;
    sh.y += Math.sin(sh.ang) * sh.spd * s;
    if (sub.id === 'gdansk') {
      sh.x = Math.max(15, Math.min(1100, sh.x));
      sh.y = Math.max(10, Math.min(440,  sh.y));
    } else {
      const coastY = 170 + 0.22 * sh.x;
      sh.x = Math.max(15, Math.min(1585, sh.x));
      sh.y = Math.max(10, Math.min(coastY - 8, sh.y));
    }
    if (!sh.rewarded && dist < 48) {
      sh.rewarded = true;
      if (typeof addZlote === 'function') addZlote(100);
      _aceSpeech('Rekuś! 🦈❤ +100 zł', 3);
      for (let i = 0; i < 6; i++) _ACE.hearts.push({
        x: sh.x + (Math.random()-0.5)*40, y: sh.y + (Math.random()-0.5)*40,
        life: 1.5, vy: -40 - Math.random()*20, vx: (Math.random()-0.5)*20, _sub: true,
      });
    }
    if (sh.rewarded) { sh.ang = Math.atan2(-1, -0.3); sh.leaveT += s; }
  }
  _ACE.sharks = _ACE.sharks.filter(sh => sh.leaveT < 3);
}

/* ── Maro — leczenie przy wiadukcie ──────────────────── */
function _aceTickMaroHeal(s) {
  if (!acIsActive('maro')) return;
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  if (!sub || sub.id !== 'gdansk') return;
  const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
  if (!sp) return;
  if (Math.hypot(sp.x - 1088, sp.y - 776) < 110) {
    if (typeof applyZdenerwowanie === 'function') applyZdenerwowanie(-6 * s);
  }
}

/* ── Kazimierz — patrol Zaspa, rzadki atak na Przymorze ─ */
function _aceTickKazimierz(s) {
  if (!acIsActive('kazimierz')) return;
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  if (!sub || sub.id !== 'gdansk') return;

  if (_ACE.kazState === 'patrol') {
    /* wander gently around Zaspa */
    _ACE.kazX += _ACE.kazVX * s;
    _ACE.kazY += _ACE.kazVY * s;
    if (_ACE.kazX <  850) { _ACE.kazVX = Math.abs(_ACE.kazVX); }
    if (_ACE.kazX > 1400) { _ACE.kazVX = -Math.abs(_ACE.kazVX); }
    if (_ACE.kazY <  450) { _ACE.kazVY = Math.abs(_ACE.kazVY); }
    if (_ACE.kazY > 1000) { _ACE.kazVY = -Math.abs(_ACE.kazVY); }
    if (Math.random() < s * 0.25) {
      const a = Math.random() * Math.PI * 2;
      _ACE.kazVX = Math.cos(a) * 50;
      _ACE.kazVY = Math.sin(a) * 50;
    }
    _ACE.kazAtkNext -= s;
    if (_ACE.kazAtkNext <= 0 && typeof _PRZYM_ST !== 'undefined') {
      const alive = _PRZYM_ST.enemies.filter(e => e.alive);
      if (alive.length > 0) {
        _ACE.kazTarget = alive[Math.floor(Math.random() * alive.length)];
        _ACE.kazState = 'strike';
      }
      _ACE.kazAtkNext = 38 + Math.random() * 28;
    }
  } else if (_ACE.kazState === 'strike') {
    const en = _ACE.kazTarget;
    if (!en || !en.alive) { _ACE.kazState = 'patrol'; return; }
    const dx = en._x - _ACE.kazX, dy = en._y - _ACE.kazY;
    const dist = Math.hypot(dx, dy) || 1;
    const flySpd = 220;
    _ACE.kazX += (dx / dist) * flySpd * s;
    _ACE.kazY += (dy / dist) * flySpd * s;
    _ACE.kazAngle = Math.atan2(dy, dx);
    if (dist < 40) {
      en.alive = false; en.hp = 0; en.hitFlash = 1; en.respawnTimer = 22;
      _ACE.kazState = 'patrol';
      _ACE.kazTarget = null;
    }
  }
}

/* ── Serca ───────────────────────────────────────────── */
function _aceTickHearts(s) {
  for (const h of _ACE.hearts) {
    h.x += (h.vx || 0) * s; h.y += h.vy * s; h.life -= s;
  }
  _ACE.hearts = _ACE.hearts.filter(h => h.life > 0);
}

/* ── Praca ───────────────────────────────────────────── */
function _aceTickPraca(s) {
  if (!acIsActive('praca')) return;
  _ACE.pracaNext -= s;
  if (_ACE.pracaNext <= 0) {
    _ACE.pracaNext = 50 + Math.random() * 50;
    _aceSpeech('No i po co ci ta praca :( głupie to', 4);
    setTimeout(() => { if (typeof applyZdenerwowanie === 'function') applyZdenerwowanie(20); }, 1200);
  }
}

/* ── DK (pijana) ─────────────────────────────────────── */
function _aceTickDk(s, inSubmap) {
  if (!acIsActive('dk')) { _ACE.dkBubbles = []; return; }
  _ACE.dkTimer += s;
  const driftX = Math.cos(_ACE.dkTimer * 2.2) * 55 * s;
  const driftY = Math.sin(_ACE.dkTimer * 1.5) * 30 * s;
  const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
  if (inSubmap && sp) {
    sp.x += driftX; sp.y += driftY;
  } else if (typeof player !== 'undefined') {
    player.x += driftX; player.y += driftY;
  }
  const px = inSubmap && sp ? sp.x : (typeof player !== 'undefined' ? player.x : 0);
  const py = inSubmap && sp ? sp.y : (typeof player !== 'undefined' ? player.y : 0);
  if (Math.random() < s * 5) {
    _ACE.dkBubbles.push({
      x: px + (Math.random()-0.5)*50, y: py - 10,
      vy: -(28 + Math.random()*18), vx: (Math.random()-0.5)*12,
      life: 2.2, r: 7 + Math.random()*7, _sub: !!inSubmap,
    });
  }
  for (const b of _ACE.dkBubbles) {
    b.x += b.vx * s; b.y += b.vy * s; b.vy *= 0.98; b.life -= s;
  }
  _ACE.dkBubbles = _ACE.dkBubbles.filter(b => b.life > 0);
}

/* ── Tupanie Nogą (Maro) ─────────────────────────────── */
function _aceTickTupanie(s, inSubmap) {
  if (!acIsActive('tupanie')) { _ACE.tupDur = 0; return; }
  if (_ACE.tupDur > 0) {
    _ACE.tupDur -= s;
    const shX = (Math.random()-0.5) * 60 * s;
    const shY = (Math.random()-0.5) * 60 * s;
    const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
    if (inSubmap && sp) { sp.x += shX; sp.y += shY; }
    else if (typeof player !== 'undefined') { player.x += shX; player.y += shY; }
    return;
  }
  _ACE.tupNext -= s;
  if (_ACE.tupNext <= 0) {
    _ACE.tupNext = 60 + Math.random() * 60;
    _ACE.tupDur  = 8;
    _aceSpeech('👣 Maro tupie nogą!!!', 3);
  }
}

/* ── Spóźnienie ──────────────────────────────────────── */
function _aceTickSpoznienie(s) {
  if (!acIsActive('spoznienie') || _ACE.spozShown) return;
  _ACE.spozNext -= s;
  if (_ACE.spozNext <= 0) {
    _ACE.spozNext  = 80 + Math.random() * 60;
    _ACE.spozShown = true;
    const ov = document.getElementById('spoz-overlay');
    if (ov) ov.classList.remove('hidden');
  }
}

/* ── Anime Baba ──────────────────────────────────────── */
function _aceTickAnimeBaba(s, inSubmap) {
  if (!acIsActive('anime_baba')) { _ACE.animeEvent = null; return; }
  if (!_ACE.animeEvent) {
    _ACE.animeNext -= s;
    if (_ACE.animeNext <= 0) {
      _ACE_TRIGGERS.anime_baba();
    }
    return;
  }
  const ev = _ACE.animeEvent;
  if (ev.fled) { ev.leaveT = (ev.leaveT||0) + s; if (ev.leaveT > 1.5) _ACE.animeEvent = null; return; }
  ev.timer -= s;
  const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
  const px = inSubmap && sp ? sp.x : (typeof player !== 'undefined' ? player.x : 0);
  const py = inSubmap && sp ? sp.y : (typeof player !== 'undefined' ? player.y : 0);
  const dist = Math.hypot(px - ev.x, py - ev.y);
  if (dist < 55) {
    ev.fled = true;
    _aceSpeech('Uciekaj anime babo! 😤', 3);
    return;
  }
  if (ev.timer <= 0) {
    /* Agata nie zdążyła — kara: +80% brakującego zdenerwowania */
    const maxZd = aceMaxZd();
    const missing = maxZd - gameStats.zdenerwowanie;
    if (typeof applyZdenerwowanie === 'function') applyZdenerwowanie(missing * 0.8);
    _aceSpeech('RAFAŁ Z ANIME BABĄ 😭', 4);
    _ACE.animeEvent = null;
    _ACE.animeNext  = 80 + Math.random() * 60;
  }
}

/* ── Wyjazd Toruń — serduszka ────────────────────────── */
function _aceTickTorunHearts(s, inSubmap) {
  if (!acIsActive('wyjazd_torun')) { _ACE.torunHFX = []; return; }
  /* Toruń zone check */
  if (!_ACE.torunHearts) {
    const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
    if (sub && sub.id === 'torun') {
      const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
      if (sp && Math.hypot(sp.x - 409, sp.y - 930) < 110) {
        _ACE.torunHearts = true;
        _aceSpeech('💝 Tyle wspomnień z wyjazdu KKiS!', 4);
      }
    }
  }
  if (!_ACE.torunHearts) { _ACE.torunHFX = []; return; }
  /* Emit hearts around player */
  const sp2 = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
  const px = inSubmap && sp2 ? sp2.x : (typeof player !== 'undefined' ? player.x : 0);
  const py = inSubmap && sp2 ? sp2.y : (typeof player !== 'undefined' ? player.y : 0);
  if (Math.random() < s * 3) {
    _ACE.torunHFX.push({
      x: px + (Math.random()-0.5)*50, y: py - 5,
      vy: -(25 + Math.random()*15), vx: (Math.random()-0.5)*12,
      life: 2, _sub: !!inSubmap,
    });
  }
  for (const h of _ACE.torunHFX) { h.x += h.vx * s; h.y += h.vy * s; h.life -= s; }
  _ACE.torunHFX = _ACE.torunHFX.filter(h => h.life > 0);
}

/* ── Jesteś Zła? ─────────────────────────────────────── */
function _aceTickZla(s) {
  if (!acIsActive('zla') || _ACE.zlaShown) return;
  _ACE.zlaNext -= s;
  if (_ACE.zlaNext <= 0) {
    _ACE.zlaNext = 7;
    _ACE.zlaShown = true;
    const ov = document.getElementById('zla-overlay');
    if (ov) ov.classList.remove('hidden');
  }
}

/* ── Stary Telefon — złodzieje ───────────────────────── */
function _aceTickStaryTel(s, inSubmap) {
  if (!acIsActive('stary_tel') || inSubmap) { if (!inSubmap) _ACE.thiefActive = false; return; }
  _ACE.thiefNext -= s;
  if (_ACE.thiefActive) {
    const px = typeof player !== 'undefined' ? player.x : 0;
    const py = typeof player !== 'undefined' ? player.y : 0;
    const dx = px - _ACE.thiefX, dy = py - _ACE.thiefY;
    const dist = Math.hypot(dx, dy);
    const spd = (typeof aceSpeedMult === 'function' ? 130 : 120);
    if (dist < 5) {
      if (typeof addZlote === 'function') addZlote(-10);
      _aceSpeech('Ktoś ukradł mi 10 zł! 😡', 3);
      _ACE.thiefActive = false;
      _ACE.thiefNext = 40 + Math.random() * 40;
      return;
    }
    _ACE.thiefX += (dx / dist) * spd * s;
    _ACE.thiefY += (dy / dist) * spd * s;
  } else if (_ACE.thiefNext <= 0) {
    const px = typeof player !== 'undefined' ? player.x : 800;
    const py = typeof player !== 'undefined' ? player.y : 800;
    const a = Math.random() * Math.PI * 2;
    _ACE.thiefX = px + Math.cos(a) * 300;
    _ACE.thiefY = py + Math.sin(a) * 300;
    _ACE.thiefActive = true;
    _ACE.thiefNext = 40 + Math.random() * 40;
    _aceSpeech('Złodzieje! 👀', 2);
  }
}

/* ── Park Oliwski — zarabianie i obrażenia ───────────── */
function _aceTickPark(s, inSubmap) {
  const dayOn  = acIsActive('park_dzien');
  const nocOn  = acIsActive('park_noc');
  if ((!dayOn && !nocOn) || !inSubmap) return;
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  if (!sub || sub.id !== 'gdansk') return;
  const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
  if (!sp || sp.x > 520) return;
  _ACE.parkEarnCD -= s;
  if (_ACE.parkEarnCD <= 0) {
    _ACE.parkEarnCD = nocOn ? 3 : 1;
    if (typeof addZlote === 'function') addZlote(1);
    if (nocOn && typeof applyZdenerwowanie === 'function') applyZdenerwowanie(4);
  }
}

/* ── Sponsorzy — denerwowanie przy Politechnice ──────── */
function _aceTickSponsory(s, inSubmap) {
  if (!acIsActive('sponsorzy') || !inSubmap) return;
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  if (!sub || sub.id !== 'gdansk') return;
  const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
  if (!sp) return;
  if (Math.hypot(sp.x - 2080, sp.y - 1525) < 200) {
    if (typeof applyZdenerwowanie === 'function') applyZdenerwowanie(5 * s);
  }
}

/* ── Powrót z Armaty — Rafał NPC w Gdańsku ──────────── */
const _AR_ROUTE = [
  { x: 1883, y: 1568 }, // Armata
  { x: 2000, y: 1200 }, // trasa N
  { x: 2300, y:  600 }, // Wrzeszcz → plaża
  { x: 2552, y:  360 }, // Molo Brzeźno
  { x: 2400, y:  550 }, // powrót
  { x: 2200, y: 1000 },
  { x: 2080, y: 1622 }, // Collegia
];
const _AR_QUIPS = [
  'Ała...', 'O nie, rozwalił mi się spodnie 😱',
  'Agata mnie zabije 😬', 'Ale jestem pijany, Agata dzwoń po karatkę!', 'Ale jestem pijany 🍺',
];

function _aceTickPowrotArmata(s, inSubmap) {
  if (!acIsActive('powrot_armata') || !inSubmap) return;
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  if (!sub || sub.id !== 'gdansk') return;
  if (!_ACE.arRafal) {
    _ACE.arRafal = { x: _AR_ROUTE[0].x, y: _AR_ROUTE[0].y, routeIdx: 0, quipCD: 0, stopCD: 0, dir: 1 };
  }
  const r = _ACE.arRafal;
  if (r.stopCD > 0) { r.stopCD -= s; return; }
  r.quipCD -= s;
  if (r.quipCD <= 0) {
    r.quipCD = 8 + Math.random() * 12;
    if (Math.random() < 0.35) { r.stopCD = 1.5 + Math.random() * 2; }
    if (Math.random() < 0.5) _aceSpeech(_AR_QUIPS[Math.floor(Math.random()*_AR_QUIPS.length)], 3);
  }
  const tgt = _AR_ROUTE[r.routeIdx];
  const dx = tgt.x - r.x, dy = tgt.y - r.y;
  const dist = Math.hypot(dx, dy);
  const spd = 55;
  if (dist < 8) {
    r.routeIdx = (r.routeIdx + 1) % _AR_ROUTE.length;
  } else {
    r.x += (dx/dist)*spd*s; r.y += (dy/dist)*spd*s;
    r.dir = dx >= 0 ? 1 : -1;
  }
}

/* ── Wiadukt karta — NPC bije Przymorze ─────────────── */
const _WIAD_PATROL = [
  { x: 1088, y: 776 }, { x: 1200, y: 800 },
  { x:  900, y: 850 }, { x:  700, y: 840 },
  { x:  600, y: 850 }, { x:  700, y: 800 }, { x: 1088, y: 776 },
];

function _aceTickWiadukCard(s, inSubmap) {
  if (!acIsActive('wiadukt') || !inSubmap) return;
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  if (!sub || sub.id !== 'gdansk') return;
  const n = _ACE.widNPC;
  n.atkCD -= s;
  const tgt = _WIAD_PATROL[Math.floor(Date.now()/8000) % _WIAD_PATROL.length];
  const dx = tgt.x - n.x, dy = tgt.y - n.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 12) { const spd = 80; n.x += (dx/dist)*spd*s; n.y += (dy/dist)*spd*s; }
  /* bije przymorzan (effect: occasional flash) */
  if (n.x < 750 && n.atkCD <= 0) {
    n.atkCD = 3 + Math.random() * 4;
    _aceSpeech('💥 Wiadukt atakuje!', 2);
  }
}

/* ── Słońca w Toruniu ────────────────────────────────── */
function _aceTickSlonca(s, inSubmap) {
  if (!acIsActive('slonca')) { _ACE.sloncaCircles = []; return; }
  if (!inSubmap) { _ACE.sloncaCircles = []; return; }
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  if (!sub || sub.id !== 'torun') { _ACE.sloncaCircles = []; return; }
  const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
  _ACE.sloncaSpawnCD -= s;
  if (_ACE.sloncaSpawnCD <= 0) {
    _ACE.sloncaSpawnCD = 0.6 + Math.random() * 0.8;
    _ACE.sloncaCircles.push({
      x: 200 + Math.random() * 1400, y: 200 + Math.random() * 900,
      r: 18 + Math.random() * 22, vx: (Math.random()-0.5)*60, vy: (Math.random()-0.5)*60,
      life: 4 + Math.random() * 3, maxLife: 7,
    });
  }
  for (const c of _ACE.sloncaCircles) {
    c.x += c.vx * s; c.y += c.vy * s; c.life -= s;
    /* slonca don't hurt Agata — immunity handled in applyZdenerwowanie via aceSloncaImmune() */
  }
  _ACE.sloncaCircles = _ACE.sloncaCircles.filter(c => c.life > 0 && _ACE.sloncaCircles.length <= 40);
}

/* ── Icówka — Rafał pijany w questach ───────────────── */
function _aceTickIceowka(s, inSubmap) {
  if (!acIsActive('iceowka')) { _ACE.iceBubbles = []; return; }
  _ACE.iceTimer += s;
  const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
  const sub = typeof _activeSub !== 'undefined' ? _activeSub : null;
  const rfx = typeof _RAFAL_WORLD !== 'undefined' ? _RAFAL_WORLD : null;
  const px = rfx ? rfx.x : (sp ? sp.x : (typeof player !== 'undefined' ? player.x : 0));
  const py = rfx ? rfx.y : (sp ? sp.y : (typeof player !== 'undefined' ? player.y : 0));
  if (Math.random() < s * 4) {
    _ACE.iceBubbles.push({
      x: px + (Math.random()-0.5)*40, y: py - 10,
      vy: -(20 + Math.random()*15), vx: (Math.random()-0.5)*10,
      life: 2, _sub: !!inSubmap,
    });
  }
  for (const b of _ACE.iceBubbles) { b.x += b.vx * s; b.y += b.vy * s; b.life -= s; }
  _ACE.iceBubbles = _ACE.iceBubbles.filter(b => b.life > 0);
}

/* ── Peppepepe — dymki prawie cały czas ─────────────── */
function _aceTickPeppepepe(s) {
  if (!acIsActive('peppepepe')) return;
  if (typeof _agataSpeechAlpha !== 'undefined' && _agataSpeechAlpha < 0.1
    && typeof _agataSpeechTimer !== 'undefined' && _agataSpeechTimer > 1.2) {
    _agataSpeechTimer = 1.2;
  }
}

/* ── Chess cooldown ─────────────────────────────────────*/
function _aceTickChessCD(s) {
  if (_ACE.chessCD  > 0) _ACE.chessCD  -= s;
  if (_ACE.drugiCD  > 0) _ACE.drugiCD  -= s;
}

/* ════════════════════════════════════════════════════════
   RYSOWANIE — mapa główna
   ════════════════════════════════════════════════════════ */
function aceFxDraw(ctx, ts) {
  if (!_ACE._ok) return;

  /* Jeziora */
  if (acIsActive('jezioro')) {
    ctx.save();
    for (const lk of _ACE_LAKES) {
      const g = ctx.createRadialGradient(lk.x,lk.y,8,lk.x,lk.y,lk.r);
      g.addColorStop(0,'rgba(50,130,200,0.55)');
      g.addColorStop(1,'rgba(30, 90,160,0.25)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(lk.x,lk.y,lk.r,lk.r*0.65,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(100,180,255,0.5)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.ellipse(lk.x,lk.y,lk.r,lk.r*0.65,0,0,Math.PI*2); ctx.stroke();
      // fale
      ctx.strokeStyle='rgba(150,210,255,0.3)'; ctx.lineWidth=1;
      const wph = (ts*0.0006)%1;
      ctx.beginPath(); ctx.ellipse(lk.x,lk.y,lk.r*(0.5+wph*0.5),lk.r*0.65*(0.5+wph*0.5),0,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='rgba(180,220,255,0.5)'; ctx.font='10px serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🌊',lk.x,lk.y);
    }
    ctx.restore();
  }

  /* Nuty wokół Warlubia */
  if (acIsActive('dni_warlubia')) {
    const wx=1555, wy=1442;
    const sym=['♪','♫','♩','♬'];
    ctx.save();
    for (let i=0;i<_ACE.notes.length;i++) {
      const n=_ACE.notes[i];
      const nx=wx+Math.cos(n.a)*n.r;
      const ny=wy+Math.sin(n.a)*n.r - Math.sin(n.ph)*14;
      ctx.globalAlpha = 0.55 + 0.3*Math.sin(n.ph);
      ctx.fillStyle='#ffeeaa'; ctx.shadowColor='#ffcc44'; ctx.shadowBlur=6;
      ctx.font='15px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(sym[i%4],nx,ny);
    }
    ctx.globalAlpha=1; ctx.shadowBlur=0;
    ctx.restore();
  }

  /* Duch */
  if (acIsActive('matemblewo') && _ACE.ghostAlpha > 0.02) {
    ctx.save();
    ctx.globalAlpha = _ACE.ghostAlpha * 0.88;
    _aceDGhost(ctx, _ACE.ghostX, _ACE.ghostY);
    ctx.globalAlpha=1; ctx.restore();
  }

  /* Agnieszki na mapie */
  if (acIsActive('agnieszka')) {
    for (const a of _ACE.mainAgn) {
      ctx.save();
      _aceDMainAgn(ctx, a.x, a.y, a.dir, a.step);
      ctx.font = 'bold 11px "Segoe UI"';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#ff69b4';
      ctx.fillText('Agnieszka', a.x, a.y - 46);
      ctx.restore();
    }
  }

  /* Rafał nagrywa */
  if (acIsActive('zdjecie') && _ACE.zdjecieDur > 0) {
    const px = typeof player !== 'undefined' ? player.x : 0;
    const py = typeof player !== 'undefined' ? player.y : 0;
    const rx = px + Math.cos(_ACE.rafalAngle) * 85;
    const ry = py + Math.sin(_ACE.rafalAngle) * 85;
    ctx.save();
    _aceDFilmRafal(ctx, rx, ry, _ACE.rafalAngle);
    ctx.font = 'bold 11px "Segoe UI"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#3a8fff';
    ctx.fillText('Rafał', rx, ry - 22);
    ctx.restore();
  }

  /* Śpi — Zzz nad graczem */
  if (_ACE.spankoDur > 0) {
    const px = typeof player !== 'undefined' ? player.x : 0;
    const py = typeof player !== 'undefined' ? player.y : 0;
    ctx.save();
    for (let i=0;i<3;i++) {
      const ph = ((ts*0.001 + i*0.4) % 1);
      ctx.globalAlpha = Math.max(0, 1-ph);
      ctx.fillStyle='#aaddff'; ctx.font=`bold ${14+i*3}px serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('Z', px+18+i*8, py-22 - ph*28 - i*6);
    }
    ctx.globalAlpha=1; ctx.restore();
  }

  /* Kolano */
  if (_ACE.kolanoDur > 0) {
    const px = typeof player !== 'undefined' ? player.x : 0;
    const py = typeof player !== 'undefined' ? player.y : 0;
    ctx.save();
    ctx.fillStyle='#ff4444'; ctx.globalAlpha=0.8;
    ctx.font='bold 13px "Segoe UI"'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Ała! 🦵', px, py-38);
    ctx.globalAlpha=1; ctx.restore();
  }

  /* Serca na mapie głównej */
  for (const h of _ACE.hearts.filter(h=>!h._sub)) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, h.life);
    ctx.fillStyle='#ff4488'; ctx.font='16px serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('♥', h.x, h.y);
    ctx.globalAlpha=1; ctx.restore();
  }

  /* Figurki Warhammer (mapa główna) */
  _aceDFigurki(ctx, false, ts);

  /* Stary Telefon — złodziej */
  if (acIsActive('stary_tel') && _ACE.thiefActive) {
    ctx.save();
    ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🦹', _ACE.thiefX, _ACE.thiefY - 12);
    ctx.font = 'bold 10px "Segoe UI"'; ctx.fillStyle = '#ff2222';
    ctx.fillText('ZŁODZIEJ!', _ACE.thiefX, _ACE.thiefY - 30);
    ctx.restore();
  }

  /* DK — bąbelki pijane (mapa główna) */
  if (acIsActive('dk')) {
    ctx.save();
    for (const b of _ACE.dkBubbles.filter(b=>!b._sub)) {
      ctx.globalAlpha = Math.min(1, b.life) * 0.75;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.fillStyle='rgba(100,230,120,0.6)'; ctx.fill();
      ctx.strokeStyle='rgba(60,200,80,0.9)'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='rgba(80,210,100,0.9)'; ctx.font='10px serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🍺', b.x, b.y);
    }
    ctx.globalAlpha=1; ctx.restore();
    const px2 = typeof player !== 'undefined' ? player.x : 0;
    const py2 = typeof player !== 'undefined' ? player.y : 0;
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.2*Math.sin(Date.now()*0.004);
    ctx.fillStyle='#4ef'; ctx.font='bold 11px "Segoe UI"';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('🥴 Pijana...', px2, py2-44);
    ctx.globalAlpha=1; ctx.restore();
  }

  /* Tupanie — Maro icon (mapa główna) */
  if (acIsActive('tupanie') && _ACE.tupDur > 0) {
    const px3 = typeof player !== 'undefined' ? player.x : 0;
    const py3 = typeof player !== 'undefined' ? player.y : 0;
    ctx.save();
    ctx.fillStyle='#ff6600'; ctx.font='bold 14px serif';
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText('👣 Maro tupie!', px3, py3-44);
    ctx.restore();
  }

  /* Anime Baba event (mapa główna) */
  if (acIsActive('anime_baba') && _ACE.animeEvent && !_ACE.animeEvent._sub) {
    const ev = _ACE.animeEvent;
    ctx.save();
    ctx.fillStyle='#ff69b4'; ctx.font='bold 14px serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('💕', ev.x + 14, ev.y - 30);
    ctx.fillStyle='#3a8fff'; ctx.font='bold 11px "Segoe UI"';
    ctx.fillText('Rafał', ev.x - 10, ev.y - 44);
    ctx.fillStyle='#ff69b4';
    ctx.fillText('🎌', ev.x + 14, ev.y - 14);
    if (!ev.fled) {
      const a = Math.max(0, Math.min(1, ev.timer));
      ctx.globalAlpha = a;
      ctx.fillStyle='#ff2222'; ctx.font='bold 16px "Segoe UI"';
      ctx.fillText(`⏱ ${Math.ceil(ev.timer)}s`, ev.x, ev.y - 60);
    } else {
      ctx.fillStyle='#44cc44'; ctx.font='bold 12px "Segoe UI"';
      ctx.fillText('✅ Uciekła!', ev.x, ev.y - 58);
    }
    ctx.globalAlpha=1; ctx.restore();
  }

  /* Toruń serduszka (mapa główna) */
  if (acIsActive('wyjazd_torun') && _ACE.torunHearts) {
    for (const h of _ACE.torunHFX.filter(h=>!h._sub)) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, h.life);
      ctx.fillStyle='#ff4488'; ctx.font='14px serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('💝', h.x, h.y);
      ctx.globalAlpha=1; ctx.restore();
    }
  }
}

/* ════════════════════════════════════════════════════════
   RYSOWANIE — submapy
   ════════════════════════════════════════════════════════ */
function aceFxDrawSub(ctx, subId, ts) {
  if (!_ACE._ok) return;

  /* Duch — we wszystkich submapach */
  if (acIsActive('matemblewo') && _ACE.ghostAlpha > 0.02) {
    ctx.save();
    ctx.globalAlpha = _ACE.ghostAlpha * 0.88;
    _aceDGhost(ctx, _ACE.ghostX, _ACE.ghostY);
    ctx.globalAlpha = 1; ctx.restore();
  }

  /* Rekiny — Gdańsk i Krynica */
  if (acIsActive('rekus') && (subId === 'gdansk' || subId === 'krynica')) {
    ctx.save();
    for (const sh of _ACE.sharks) _aceDShark(ctx, sh.x, sh.y, sh.ang);
    ctx.restore();
  }

  /* Kolano — tekst przy graczu we wszystkich submapach */
  if (_ACE.kolanoDur > 0) {
    const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
    if (sp) {
      ctx.save();
      ctx.fillStyle = '#ff4444'; ctx.globalAlpha = 0.8;
      ctx.font = 'bold 13px "Segoe UI"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Ała! 🦵', sp.x, sp.y - 38);
      ctx.globalAlpha = 1; ctx.restore();
    }
  }

  /* Rafał nagrywa — we wszystkich submapach */
  if (acIsActive('zdjecie') && _ACE.zdjecieDur > 0) {
    const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
    if (sp) {
      const rx = sp.x + Math.cos(_ACE.rafalAngle) * 85;
      const ry = sp.y + Math.sin(_ACE.rafalAngle) * 85;
      ctx.save();
      _aceDFilmRafal(ctx, rx, ry, _ACE.rafalAngle);
      ctx.font = 'bold 11px "Segoe UI"';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#3a8fff';
      ctx.fillText('Rafał', rx, ry - 22);
      ctx.restore();
    }
  }

  /* Figurki Warhammer (submapy) */
  _aceDFigurki(ctx, true, ts);

  /* Icówka — zielone bąbelki przy Rafale */
  if (acIsActive('iceowka')) {
    for (const b of _ACE.iceBubbles.filter(b=>b._sub)) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, b.life) * 0.8;
      ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI*2);
      ctx.fillStyle='rgba(60,220,80,0.6)'; ctx.fill();
      ctx.strokeStyle='rgba(40,200,60,0.9)'; ctx.lineWidth=1.2; ctx.stroke();
      ctx.globalAlpha=1; ctx.restore();
    }
  }

  /* DK — bąbelki pijane (submapy) */
  if (acIsActive('dk')) {
    ctx.save();
    for (const b of _ACE.dkBubbles.filter(b=>b._sub)) {
      ctx.globalAlpha = Math.min(1, b.life) * 0.75;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.fillStyle='rgba(100,230,120,0.6)'; ctx.fill();
      ctx.strokeStyle='rgba(60,200,80,0.9)'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='rgba(80,210,100,0.9)'; ctx.font='10px serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🍺', b.x, b.y);
    }
    ctx.globalAlpha=1; ctx.restore();
    const sp = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
    if (sp) {
      ctx.save();
      ctx.globalAlpha = 0.6 + 0.2*Math.sin(Date.now()*0.004);
      ctx.fillStyle='#4ef'; ctx.font='bold 11px "Segoe UI"';
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillText('🥴 Pijana...', sp.x, sp.y-44);
      ctx.globalAlpha=1; ctx.restore();
    }
  }

  /* Tupanie — Maro (submapy) */
  if (acIsActive('tupanie') && _ACE.tupDur > 0) {
    const sp2 = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
    if (sp2) {
      ctx.save();
      ctx.fillStyle='#ff6600'; ctx.font='bold 14px serif';
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillText('👣 Maro tupie!', sp2.x, sp2.y-44);
      ctx.restore();
    }
  }

  /* Anime Baba event (submapy) */
  if (acIsActive('anime_baba') && _ACE.animeEvent && _ACE.animeEvent._sub) {
    const ev = _ACE.animeEvent;
    ctx.save();
    ctx.fillStyle='#3a8fff'; ctx.font='bold 11px "Segoe UI"';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Rafał', ev.x - 10, ev.y - 44);
    ctx.fillStyle='#ff69b4'; ctx.font='bold 14px serif';
    ctx.fillText('🎌', ev.x + 14, ev.y - 14);
    ctx.fillText('💕', ev.x + 14, ev.y - 30);
    if (!ev.fled) {
      ctx.globalAlpha = Math.max(0, Math.min(1, ev.timer));
      ctx.fillStyle='#ff2222'; ctx.font='bold 16px "Segoe UI"';
      ctx.fillText(`⏱ ${Math.ceil(ev.timer)}s`, ev.x, ev.y - 60);
    } else {
      ctx.fillStyle='#44cc44'; ctx.font='bold 12px "Segoe UI"';
      ctx.fillText('✅ Uciekła!', ev.x, ev.y - 58);
    }
    ctx.globalAlpha=1; ctx.restore();
  }

  /* Toruń serduszka (submapy) */
  if (acIsActive('wyjazd_torun') && _ACE.torunHearts) {
    for (const h of _ACE.torunHFX.filter(h=>h._sub)) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, h.life);
      ctx.fillStyle='#ff4488'; ctx.font='14px serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('💝', h.x, h.y);
      ctx.globalAlpha=1; ctx.restore();
    }
  }

  if (subId !== 'gdansk') return;

  /* Kazimierz — blask nad Zaspą + postać */
  if (acIsActive('kazimierz')) {
    ctx.save();
    const zg = ctx.createRadialGradient(1120,720,20,1120,720,320);
    zg.addColorStop(0,'rgba(255,248,190,0.20)');
    zg.addColorStop(1,'rgba(255,248,190,0)');
    ctx.fillStyle=zg; ctx.fillRect(800,400,640,640);
    _aceDKazimierz(ctx, _ACE.kazX, _ACE.kazY, ts);
    ctx.restore();
  }

  /* Maro nad wiaduktem */
  if (acIsActive('maro')) {
    ctx.save();
    const pulse = 0.18 + 0.08 * Math.sin(ts*0.002);
    const mg = ctx.createRadialGradient(1088,756,8,1088,756,130);
    mg.addColorStop(0,`rgba(255,255,200,${pulse})`);
    mg.addColorStop(1,'rgba(255,255,200,0)');
    ctx.fillStyle=mg; ctx.fillRect(958,626,260,260);
    _aceDMaroDog(ctx, 1088, 720 + Math.sin(ts*0.0018)*8);
    ctx.restore();
  }


  /* Serca w submapie */
  for (const h of _ACE.hearts.filter(h=>h._sub)) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, h.life);
    ctx.fillStyle='#ff4488'; ctx.font='16px serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('♥', h.x, h.y);
    ctx.globalAlpha=1; ctx.restore();
  }

  /* Słońca w Toruniu */
  if (acIsActive('slonca') && subId === 'torun') {
    ctx.save();
    for (const c of _ACE.sloncaCircles) {
      const alpha = Math.min(1, c.life / c.maxLife);
      ctx.globalAlpha = alpha * 0.85;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
      ctx.strokeStyle='#ffee22'; ctx.lineWidth=3; ctx.stroke();
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 0.5, 0, Math.PI*2);
      ctx.fillStyle='rgba(255,220,30,0.25)'; ctx.fill();
    }
    ctx.globalAlpha=1; ctx.restore();
    /* serduszka wokół Agaty — zawsze */
    const spT = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
    if (spT) {
      const ph = (ts*0.003) % (Math.PI*2);
      ctx.save();
      for (let i=0;i<5;i++) {
        const a = ph + i*Math.PI*0.4;
        ctx.font='14px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('❤️', spT.x + Math.cos(a)*28, spT.y + Math.sin(a)*16 - 10);
      }
      ctx.restore();
    }
  }

  /* Wiadukt NPC (Gdańsk) */
  if (acIsActive('wiadukt') && subId === 'gdansk') {
    const n = _ACE.widNPC;
    ctx.save();
    ctx.font='18px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🌉', n.x, n.y - 18);
    if (n.x < 750 && n.atkCD < 1) {
      ctx.globalAlpha = (1 - n.atkCD) * 0.8;
      ctx.fillStyle='#ffff00'; ctx.font='bold 14px serif';
      ctx.fillText('💥', n.x + (Math.random()-0.5)*30, n.y - 30);
    }
    ctx.globalAlpha=1; ctx.restore();
  }

  /* Powrót z Armaty — Rafał NPC (Gdańsk) */
  if (acIsActive('powrot_armata') && subId === 'gdansk' && _ACE.arRafal) {
    const r = _ACE.arRafal;
    ctx.save();
    ctx.font='18px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.save();
    if (r.dir < 0) { ctx.scale(-1,1); }
    ctx.fillText('🚶', r.dir < 0 ? -r.x : r.x, r.y - 18);
    ctx.restore();
    ctx.font='bold 10px "Segoe UI"'; ctx.fillStyle='#3a8fff';
    ctx.fillText('Rafał', r.x, r.y - 34);
    ctx.restore();
  }

  /* Zaspa 2 — wizualna (Gdańsk) */
  if (acIsActive('zaspa') && subId === 'gdansk') {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle='rgba(100,140,200,0.18)';
    ctx.fillRect(1400, 600, 400, 400);
    ctx.strokeStyle='rgba(150,190,255,0.5)'; ctx.lineWidth=2;
    ctx.strokeRect(1400, 600, 400, 400);
    ctx.font = 'bold 14px "Segoe UI"'; ctx.fillStyle='#aaccff';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Zaspa II', 1600, 800);
    ctx.globalAlpha=1; ctx.restore();
  }

  /* Park Oliwski — ikona zarabiania */
  if ((acIsActive('park_dzien') || acIsActive('park_noc')) && subId === 'gdansk') {
    const spP = typeof _subPlayer !== 'undefined' ? _subPlayer : null;
    if (spP && spP.x < 520) {
      ctx.save();
      const col = acIsActive('park_noc') ? '#ff6633' : '#44cc44';
      ctx.font='bold 11px "Segoe UI"'; ctx.fillStyle=col;
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillText(acIsActive('park_noc') ? '💰+zd' : '💰+1zł', spP.x, spP.y - 44);
      ctx.restore();
    }
  }

  /* Technikalia — teren koncertowy (2350, 1300) */
  if (acIsActive('technikalia')) {
    ctx.save();
    const pulse2 = 0.6 + 0.3*Math.sin(ts*0.002);
    ctx.globalAlpha = pulse2;
    ctx.font = '22px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🎓🎸', 2350, 1300 - 22);
    ctx.font = 'bold 11px "Segoe UI"'; ctx.fillStyle = '#aaccff';
    ctx.fillText('Technikalia', 2350, 1300 - 6);
    ctx.globalAlpha = 1; ctx.restore();
  }

  /* Wieczór Dżentelmana (przy Politechnice) */
  if (acIsActive('wd') && !(_GDN && _GDN.wdDone)) {
    ctx.save();
    const pulse3 = 0.6 + 0.3*Math.sin(ts*0.0025 + 1);
    ctx.globalAlpha = pulse3;
    ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('💃', 2080, 1525 - 30);
    ctx.font = 'bold 10px "Segoe UI"'; ctx.fillStyle = '#ffccee';
    ctx.fillText('WD', 2080, 1525 - 14);
    ctx.globalAlpha = 1; ctx.restore();
  }

  /* Straganы szachowe przy Politechnice Gdańskiej */
  if (acIsActive('chess1')) {
    _aceDrawChessStall(ctx, 2185, 1525, '♟ Turniej Szachowy', '#3a2266', ts);
  }
  if (acIsActive('chess2')) {
    if (!_ACE.drugiDone) {
      _aceDrawChessStall(ctx, 2185, 1610, '♟♟ Wielki Turniej!', '#662200', ts);
    } else {
      ctx.save(); ctx.fillStyle='#888'; ctx.globalAlpha=0.5;
      ctx.fillRect(2168,1600,34,20); ctx.globalAlpha=1;
      ctx.font='13px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('💥', 2185, 1610);
      ctx.restore();
    }
  }
}

/* ════════════════════════════════════════════════════════
   Figury
   ════════════════════════════════════════════════════════ */

function _aceDGhost(ctx, x, y) {
  ctx.fillStyle='rgba(190,215,255,0.92)';
  ctx.beginPath();
  ctx.arc(x,y-18,20,Math.PI,0);
  ctx.lineTo(x+20,y+10);
  for(let i=0;i<3;i++) ctx.quadraticCurveTo(x+20-i*14-7,y+22,x+20-i*14-14,y+10);
  ctx.lineTo(x-20,y+10); ctx.fill();
  ctx.fillStyle='rgba(0,10,40,0.85)';
  ctx.beginPath(); ctx.ellipse(x-7,y-18,4,6,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+7,y-18,4,6,0,0,Math.PI*2); ctx.fill();
}

function _aceDMainAgn(ctx, x, y, dir, step) {
  const bob = Math.sin(step) * 2.5;
  /* cień */
  ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.ellipse(x,y+3,13,4,0,0,Math.PI*2); ctx.fill();
  /* długie włosy (za ciałem) */
  ctx.fillStyle='#bb6611';
  ctx.beginPath(); ctx.ellipse(x, y-10+bob, 11, 20, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x-10, y-5+bob, 5, 16, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+10, y-5+bob, 5, 16, 0.2, 0, Math.PI*2); ctx.fill();
  /* sukienka */
  ctx.fillStyle='#e044bb';
  ctx.beginPath();
  ctx.moveTo(x-9, y-4+bob); ctx.lineTo(x+9, y-4+bob);
  ctx.lineTo(x+13, y+14+bob); ctx.lineTo(x-13, y+14+bob);
  ctx.closePath(); ctx.fill();
  /* top */
  ctx.fillStyle='#cc33aa';
  ctx.beginPath(); ctx.ellipse(x, y-4+bob, 9, 8, 0, 0, Math.PI*2); ctx.fill();
  /* twarz */
  ctx.fillStyle='#fde8d8';
  ctx.beginPath(); ctx.arc(x, y-22+bob, 10, 0, Math.PI*2); ctx.fill();
  /* fringe włosów (na czole) */
  ctx.fillStyle='#cc7722';
  ctx.beginPath(); ctx.arc(x, y-22+bob, 10, Math.PI*0.75, Math.PI*2.25); ctx.fill();
  /* oczy (fioletowe, przyjazne) */
  ctx.fillStyle='#6644aa';
  ctx.beginPath(); ctx.arc(x-3.5, y-23+bob, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+3.5, y-23+bob, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#000';
  ctx.beginPath(); ctx.arc(x-3.5, y-23+bob, 1.1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+3.5, y-23+bob, 1.1, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.arc(x-2.8, y-24+bob, 0.8, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+4.2, y-24+bob, 0.8, 0, Math.PI*2); ctx.fill();
  /* uśmiech */
  ctx.strokeStyle='#cc4422'; ctx.lineWidth=1.3; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(x, y-20+bob, 3.5, 0.2, Math.PI-0.2); ctx.stroke();
  /* ramiona + dłonie (po bokach) */
  ctx.fillStyle='#fde8d8';
  const aw = Math.sin(step*1.2)*0.15;
  ctx.save(); ctx.translate(x-11, y-5+bob); ctx.rotate(aw-0.15);
  ctx.fillRect(-3,0,6,9); ctx.beginPath(); ctx.arc(0,9,3.5,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.translate(x+11, y-5+bob); ctx.rotate(-aw+0.15);
  ctx.fillRect(-3,0,6,9); ctx.beginPath(); ctx.arc(0,9,3.5,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function _aceDFilmRafal(ctx, x, y, ang) {
  /* ciało */
  ctx.fillStyle='#f0c880'; ctx.beginPath(); ctx.arc(x,y-12,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#2244aa'; ctx.beginPath(); ctx.ellipse(x,y+2,7,9,0,0,Math.PI*2); ctx.fill();
  /* telefon */
  ctx.fillStyle='#222'; ctx.beginPath(); ctx.roundRect(x+7,y-18,11,17,2); ctx.fill();
  ctx.fillStyle='#ff2222'; ctx.beginPath(); ctx.arc(x+17,y-16,2.5,0,Math.PI*2); ctx.fill();
  /* linia celowania */
  const toP = ang + Math.PI;
  ctx.strokeStyle='rgba(255,200,0,0.55)'; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(toP)*30,y+Math.sin(toP)*30); ctx.stroke();
  ctx.setLineDash([]);
}

function _aceDKazimierz(ctx, x, y, ts) {
  const bob = Math.sin(ts*0.0022)*6;
  /* aureola */
  ctx.strokeStyle='#ffdd44'; ctx.lineWidth=2.5;
  ctx.shadowColor='#ffaa00'; ctx.shadowBlur=12;
  ctx.beginPath(); ctx.arc(x,y-25+bob,13,0,Math.PI*2); ctx.stroke();
  ctx.shadowBlur=0;
  /* skrzydła */
  ctx.fillStyle='rgba(255,255,200,0.5)';
  ctx.beginPath(); ctx.moveTo(x-11,y-4+bob);
  ctx.bezierCurveTo(x-38,y-20+bob,x-42,y+10+bob,x-13,y+14+bob); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x+11,y-4+bob);
  ctx.bezierCurveTo(x+38,y-20+bob,x+42,y+10+bob,x+13,y+14+bob); ctx.closePath(); ctx.fill();
  /* szata */
  ctx.fillStyle='#4466aa';
  ctx.beginPath(); ctx.moveTo(x-16,y+18+bob); ctx.lineTo(x-10,y-6+bob);
  ctx.lineTo(x+10,y-6+bob); ctx.lineTo(x+16,y+18+bob); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#dde4ff';
  ctx.beginPath(); ctx.moveTo(x-8,y+16+bob); ctx.lineTo(x-4,y-4+bob);
  ctx.lineTo(x+4,y-4+bob); ctx.lineTo(x+8,y+16+bob); ctx.closePath(); ctx.fill();
  /* głowa */
  ctx.fillStyle='#f0d0a0'; ctx.beginPath(); ctx.arc(x,y-16+bob,10,0,Math.PI*2); ctx.fill();
  /* krzyż */
  ctx.strokeStyle='#ffdd88'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x+14,y-7+bob); ctx.lineTo(x+14,y+9+bob); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+9,y-1+bob); ctx.lineTo(x+19,y-1+bob); ctx.stroke();
}

/* Maro — umięśniony chłopak z jasnymi włosami, bez koszulki */
function _aceDMaroDog(ctx, x, y) {
  /* aureola */
  ctx.strokeStyle='rgba(255,255,180,0.8)'; ctx.lineWidth=2.5;
  ctx.shadowColor='rgba(255,255,150,0.7)'; ctx.shadowBlur=12;
  ctx.beginPath(); ctx.ellipse(x, y-38, 18, 6, 0, 0, Math.PI*2); ctx.stroke();
  ctx.shadowBlur=0;
  /* włosy (jasne) */
  ctx.fillStyle='#e8d860';
  ctx.beginPath(); ctx.arc(x, y-24, 13, 0, Math.PI*2); ctx.fill();
  /* boczne kosmyki */
  ctx.beginPath(); ctx.ellipse(x-12, y-20, 5, 9, -0.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+12, y-20, 5, 9, 0.2, 0, Math.PI*2); ctx.fill();
  /* twarz */
  ctx.fillStyle='#f5c880';
  ctx.beginPath(); ctx.arc(x, y-22, 11, 0, Math.PI*2); ctx.fill();
  /* oczy */
  ctx.fillStyle='#2255bb';
  ctx.beginPath(); ctx.arc(x-4, y-23, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+4, y-23, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#000';
  ctx.beginPath(); ctx.arc(x-4, y-23, 1.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+4, y-23, 1.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.arc(x-3, y-24, 0.8, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+5, y-24, 0.8, 0, Math.PI*2); ctx.fill();
  /* uśmiech */
  ctx.strokeStyle='#a04420'; ctx.lineWidth=1.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(x, y-19, 4, 0.2, Math.PI-0.2); ctx.stroke();
  /* tułów — bez koszulki, umięśniony */
  ctx.fillStyle='#f0c070';
  ctx.beginPath(); ctx.ellipse(x, y-2, 15, 17, 0, 0, Math.PI*2); ctx.fill();
  /* mięśnie — linia środka + klata */
  ctx.strokeStyle='rgba(160,100,40,0.25)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(x, y-14); ctx.lineTo(x, y+10); ctx.stroke();
  ctx.beginPath(); ctx.arc(x-5, y-5, 7, 0.6, Math.PI-0.6); ctx.stroke();
  ctx.beginPath(); ctx.arc(x+5, y-5, 7, 0.4, Math.PI-0.4); ctx.stroke();
  /* ramiona */
  ctx.fillStyle='#f0c070';
  ctx.beginPath(); ctx.ellipse(x-20, y-2, 7, 13, -0.15, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+20, y-2, 7, 13, 0.15, 0, Math.PI*2); ctx.fill();
  /* dłonie */
  ctx.beginPath(); ctx.arc(x-24, y+8, 5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+24, y+8, 5, 0, Math.PI*2); ctx.fill();
  /* spodenki */
  ctx.fillStyle='#2244aa';
  ctx.beginPath(); ctx.ellipse(x, y+14, 14, 8, 0, 0, Math.PI*2); ctx.fill();
}

function _aceDShark(ctx, x, y, ang) {
  ctx.save();
  ctx.translate(x,y); ctx.rotate(ang);
  ctx.fillStyle='#7799bb';
  ctx.beginPath(); ctx.moveTo(-22,0);
  ctx.bezierCurveTo(-16,-8,12,-8,22,0);
  ctx.bezierCurveTo(12,8,-16,8,-22,0); ctx.fill();
  ctx.fillStyle='#e8f0f8'; ctx.beginPath(); ctx.ellipse(0,2,13,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#5577aa';
  ctx.beginPath(); ctx.moveTo(-4,-6); ctx.lineTo(-1,-17); ctx.lineTo(6,-6); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(12,-3,4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(13,-3,2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(14,-4,1,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#334466'; ctx.lineWidth=1.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(16,1,4,0,Math.PI*0.7); ctx.stroke();
  ctx.restore();
}

function _aceDrawChessStall(ctx, cx, cy, label, color, ts) {
  ctx.save();
  const pulse = 0.5 + 0.5 * Math.sin(ts * 0.004);
  ctx.fillStyle = color;
  ctx.fillRect(cx-22, cy-22, 44, 34);
  ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(cx-22, cy-22, 44, 8);
  ctx.strokeStyle=`rgba(255,220,80,${0.5+0.5*pulse})`; ctx.lineWidth=1.5;
  ctx.strokeRect(cx-22, cy-22, 44, 34);
  ctx.fillStyle='#ffe066'; ctx.font='bold 13px serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('♟', cx, cy-8);
  ctx.fillStyle='#fff'; ctx.font='7px "Segoe UI"';
  ctx.fillText(label.replace(/♟+\s*/,''), cx, cy+8);
  ctx.globalAlpha=0.35+0.3*pulse; ctx.strokeStyle='#ffdd44'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(cx, cy+12, 58, 0, Math.PI*2); ctx.stroke();
  ctx.globalAlpha=1; ctx.restore();
}

/* ════════════════════════════════════════════════════════
   CHESS MINI-GAME (Turniej Szachowy przy Politechnice)
   ════════════════════════════════════════════════════════ */
let _aceChessMenu = null;

function aceOpenChessGame(stall) {
  if (_aceChessMenu) return;
  if (typeof isDialogOpen === 'function' && isDialogOpen()) return;
  const overlay = document.getElementById('ace-chess-overlay');
  if (!overlay) return;
  _aceChessMenu = stall; // 1 = turniej1, 2 = drugi
  document.getElementById('ace-chess-overlay').classList.remove('hidden');

  document.getElementById('ace-chess-anim').classList.add('hidden');
  document.getElementById('ace-chess-result').classList.add('hidden');
  document.getElementById('ace-chess-btns').style.display = '';
  if (stall === 1) {
    document.getElementById('ace-chess-title').textContent = '♟ Turniej Szachowy';
    document.getElementById('ace-chess-body').innerHTML = '<p>Obstawiam 100 zł na graczy?</p>';
    document.getElementById('ace-chess-btn-yes').textContent = '✔ Obstawiam!';
    document.getElementById('ace-chess-btn-no').textContent  = '✘ Uciekam';
  } else {
    document.getElementById('ace-chess-title').textContent = '♟♟ Drugi Turniej Szachowy';
    document.getElementById('ace-chess-body').innerHTML = '<p>Wpłać 500 zł i sprawdź co się stanie...</p>';
    document.getElementById('ace-chess-btn-yes').textContent = '✔ Wpłacam 500 zł!';
    document.getElementById('ace-chess-btn-no').textContent  = '✘ Nie tym razem';
  }
}

function aceChessConfirm() {
  if (!_aceChessMenu) return;
  const stall = _aceChessMenu;

  if (stall === 1) {
    const gold = typeof gameStats !== 'undefined' ? gameStats.zlote : 0;
    if (gold < 100) { _aceChessClose(); if (typeof showDialog==='function') showDialog('♟','Za mało złota!'); return; }
    if (typeof addZlote === 'function') addZlote(-100);
    _ACE.chessCD = 8;
  } else {
    const gold = typeof gameStats !== 'undefined' ? gameStats.zlote : 0;
    if (gold < 500) { _aceChessClose(); if (typeof showDialog==='function') showDialog('♟♟','Za mało złota!'); return; }
    if (_ACE.drugiDone) { _aceChessClose(); if (typeof showDialog==='function') showDialog('♟♟','Stragan już wybuchł...'); return; }
    if (typeof addZlote === 'function') addZlote(-500);
    _ACE.drugiDone = true;
    _ACE.drugiCD = 99999;
  }

  /* Animacja "grają..." — ukryj przyciski, pokaż migające figury */
  document.getElementById('ace-chess-btns').style.display = 'none';
  const animEl = document.getElementById('ace-chess-anim');
  animEl.textContent = '♟ ♙ ♞ ♘ ♟ ♙';
  animEl.classList.remove('hidden');

  const frames = ['♟ ♙ ♞ ♘ ♟ ♙', '♙ ♞ ♘ ♟ ♙ ♟', '♞ ♘ ♟ ♙ ♟ ♙', '♘ ♟ ♙ ♞ ♘ ♟'];
  let fi = 0;
  const iv = setInterval(() => { animEl.textContent = frames[fi++ % frames.length]; }, 300);

  setTimeout(() => {
    clearInterval(iv);
    animEl.classList.add('hidden');
    const resultEl = document.getElementById('ace-chess-result');
    resultEl.classList.remove('hidden');
    if (stall === 1) {
      const win = Math.random() < 0.5;
      if (win) {
        if (typeof addZlote === 'function') addZlote(300);
        resultEl.style.color = '#88ff88';
        resultEl.textContent = '🎉 Wygrałaś! +200 zł netto';
      } else {
        resultEl.style.color = '#ff8888';
        resultEl.textContent = '😢 Przegrałaś... -100 zł';
      }
    } else {
      if (typeof addZlote === 'function') addZlote(2000);
      resultEl.style.color = '#ffee44';
      resultEl.textContent = '💥 STRAGAN WYBUCHŁ! +2000 zł!';
    }
    /* Przycisk zamknij */
    const btns = document.getElementById('ace-chess-btns');
    btns.style.display = '';
    document.getElementById('ace-chess-btn-yes').style.display = 'none';
    document.getElementById('ace-chess-btn-no').textContent = '✘ Zamknij';
    document.getElementById('ace-chess-btn-no').onclick = () => {
      document.getElementById('ace-chess-btn-yes').style.display = '';
      document.getElementById('ace-chess-btn-no').textContent = '✘ Uciekam';
      document.getElementById('ace-chess-btn-no').onclick = aceChessCancel;
      _aceChessClose();
    };
  }, 2200);
}

function aceChessCancel() { _aceChessClose(); }
function _aceChessClose() {
  _aceChessMenu = null;
  const ov = document.getElementById('ace-chess-overlay');
  if (ov) ov.classList.add('hidden');
}

/* Interakcja ze straganami — wywoływane z grudziadz.js */
function aceUpdateChessStalls(sp) {
  if (typeof isDialogOpen === 'function' && isDialogOpen()) return;
  if (_aceChessMenu) return;
  // Stall 1 przy Politechnice Gdańskiej (2080, 1525), +100px w prawo
  if (acIsActive('chess1') && _ACE.chessCD <= 0) {
    if (Math.hypot(sp.x - 2185, sp.y - 1525) < 60) {
      aceOpenChessGame(1);
    }
  }
  // Stall 2 — 80px niżej
  if (acIsActive('chess2') && !_ACE.drugiDone && _ACE.drugiCD <= 0) {
    if (Math.hypot(sp.x - 2185, sp.y - 1610) < 60) {
      aceOpenChessGame(2);
    }
  }
}

/* ─────────────────────────────────────────────────────── */
function _aceSpeech(text, dur) {
  if (typeof _agataSpeechTimer !== 'undefined') {
    _agataSpeechText  = text;
    _agataSpeechTimer = dur;
    _agataSpeechAlpha = 1;
  }
}
