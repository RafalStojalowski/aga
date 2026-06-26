'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

let camX = 0, camY = 0;
let lastTs = null;

/* ── Player movement direction (for Q14 laser) ── */
let _playerLastDirX = 0, _playerLastDirY = 1;
let _prevPX = CFG ? CFG.SPAWN_X : 1607, _prevPY = CFG ? CFG.SPAWN_Y : 1625;

/* ── Agata speech bubbles ── */
let _agataSpeechTimer = 8 + Math.random() * 12;
let _agataSpeechText = '';
let _agataSpeechAlpha = 0;
const _AGATA_PHRASES = ['Pepepe pe pepe', 'Nenene n nene ne'];

/* high-DPI support — all drawing happens in CSS-pixel space */
let _dpr = 1, _cssW = 0, _cssH = 0;

function init() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  attachCanvasEvents(canvas);
  loadGame();
  camX = player.x - _cssW / 2;
  camY = player.y - _cssH / 2;
  clampCamera();
  requestAnimationFrame(loop);
}

function resizeCanvas() {
  _dpr  = window.devicePixelRatio || 1;
  _cssW = window.innerWidth;
  _cssH = window.innerHeight;
  canvas.width  = Math.round(_cssW * _dpr);
  canvas.height = Math.round(_cssH * _dpr);
  canvas.style.width  = _cssW + 'px';
  canvas.style.height = _cssH + 'px';
  clampCamera();
}

function clampCamera() {
  camX = Math.max(0, Math.min(CFG.WORLD_W - _cssW, camX));
  camY = Math.max(0, Math.min(CFG.WORLD_H - _cssH, camY));
}

function loop(ts) {
  const dt = lastTs === null ? 16 : Math.min(ts - lastTs, 80);
  lastTs = ts;
  tickZdBar(dt);
  _exitCooldown = Math.max(0, _exitCooldown - dt / 1000);

  /* Ending fade update */
  if (typeof updateEndingFade === 'function') updateEndingFade(dt);

  /* Skip entire loop while ending overlay is running */
  if (typeof _ENDING !== 'undefined' && ['end_koniec','end_credits','end_finale'].includes(_ENDING.state)) {
    requestAnimationFrame(loop); return;
  }

  /* Healing aura in Warlubie — disabled during Q14 boss fight */
  const _inBossFight = typeof _GTA_BOSS !== 'undefined' && _GTA_BOSS.state === 'q14_fight';
  if (!isInSubmap() && !_inBossFight) {
    const wDist = Math.hypot(player.x - CFG.SPAWN_X, player.y - CFG.SPAWN_Y);
    if (wDist < 120) {
      gameStats.zdenerwowanie = Math.max(0, gameStats.zdenerwowanie - (dt / 1000) * 4);
      _updateStatBar();
    }
  }

  /* Karta-efekty tick */
  if (typeof aceFxTick === 'function') aceFxTick(dt, isInSubmap());

  /* Agata speech bubbles */
  _agataSpeechTimer -= dt / 1000;
  if (_agataSpeechTimer <= 0 && !isDialogOpen() && !isAngerActive()) {
    _agataSpeechText = _AGATA_PHRASES[Math.floor(Math.random() * _AGATA_PHRASES.length)];
    _agataSpeechAlpha = 1;
    _agataSpeechTimer = 12 + Math.random() * 18;
  }
  if (_agataSpeechAlpha > 0) _agataSpeechAlpha = Math.max(0, _agataSpeechAlpha - dt / 2500);

  /* apply DPR scale once — all subsequent drawing is in CSS-pixel space */
  ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0);

  if (isInSubmap()) {
    if (!isDialogOpen() && !isAngerActive()) updateSubmap(dt);
    drawSubmapScene(ctx, ts, _cssW, _cssH);
    drawJoystick(ctx, _cssH);
  } else {
    /* Skip main-world update/render when overlay minigames are active */
    if ((typeof _WAFFLE !== 'undefined' && _WAFFLE.active) ||
        (typeof _PROPOSAL !== 'undefined' && _PROPOSAL.active) ||
        (typeof _GTA_SCENE !== 'undefined' && _GTA_SCENE.active)) {
      requestAnimationFrame(loop);
      return;
    }
    if (!isDialogOpen() && !isAngerActive()) {
      updatePlayer(dt);
      /* Track movement direction for Q14 laser */
      const pdx = player.x - _prevPX, pdy = player.y - _prevPY;
      if (Math.abs(pdx) > 0.3 || Math.abs(pdy) > 0.3) {
        const pd = Math.hypot(pdx, pdy) || 1;
        _playerLastDirX = pdx / pd; _playerLastDirY = pdy / pd;
      }
      _prevPX = player.x; _prevPY = player.y;
      updateWorldCompanions(dt);
      checkSubmapEntry(player.x, player.y);
    }
    const tx = player.x - _cssW / 2;
    const ty = player.y - _cssH / 2;
    camX += (tx - camX) * CFG.CAMERA_LERP;
    camY += (ty - camY) * CFG.CAMERA_LERP;
    clampCamera();
    render(ts);
  }

  requestAnimationFrame(loop);
}

function _getActiveQuestText() {
  if (typeof _GDN_QUEST !== 'undefined') {
    const gs = _GDN_QUEST.state;
    if (gs === 'q7_shopping') return '🛍️ Kup 2 przedmioty u Ratajskiego';
    if (gs === 'q9_ready')    return '🌉 Idź na Wiadukt na Zaspie';
  }
  if (typeof _HEL_QUEST !== 'undefined') {
    const hs = _HEL_QUEST.state;
    if (hs === 'q8_hunt')   return typeof _HEL_QUEST.kills !== 'undefined' ? `⚔️ Pokonaj morskie agnieszki (${_HEL_QUEST.kills}/5)` : '⚔️ Pokonaj morskie agnieszki';
    if (hs === 'q8_return') return '⚓ Wróć do Cypla Helskiego';
    if (hs === 'q8_shop')   return '🌊 Wylosuj Kartę Agaty na Cyplu';
    if (hs === 'q8_ready')  return '⚓ Idź do Cypla Helskiego';
  }
  if (typeof _GDN_QUEST !== 'undefined') {
    const gs = _GDN_QUEST.state;
    if (gs === 'q7_ready') return '🛶 Idź do Galerii Forum';
    if (['q7_intro','q7_play'].includes(gs)) return '🛶 Wyścig kajakowy!';
    if (gs === 'q6_run')   return '🎵 Biegnij do Akademii Muzycznej!';
    if (gs === 'q6_ready') return '🛍️ Idź do Galerii Bałtyckiej';
    if (['q5_intro','q5_play','q5_sleep','q5_sleeping'].includes(gs)) return '🏠 Idź do łóżka w Collegii';
    if (gs === 'q4_done')  return '🏠 Idź do Collegii';
    if (['q4_ready','q4_intro','q4_play'].includes(gs)) return '💣 Idź do Armaty - wyścig piwny!';
  }
  if (typeof _CAT_Q !== 'undefined') {
    if (_CAT_Q.state === 'pending' || _CAT_Q.state === 'revealed') return '🐾 Idź do zagrody dla kotów';
  }
  if (typeof _TR_QUEST !== 'undefined') {
    const ts2 = _TR_QUEST.state;
    if (ts2 === 'collecting') return '🃏 Zbieraj wspomnienia w Toruniu';
    if (ts2 === 'ready')      return '🌅 Wróć do Punktu Widokowego';
    if (ts2 === 'active')     return '🌅 Idź do Punktu Widokowego';
  }
  if (typeof _GD_QUEST !== 'undefined') {
    if (_GD_QUEST.state === 'active')   return `⚔ Pokonaj agnieszki (${_GD_QUEST.killed}/10)`;
    if (_GD_QUEST.state === 'complete') return '⚔ Wróć do II LO w Grudziądzu';
    if (_GD_QUEST.state === 'idle')     return '🗺️ Eksploruj - idź do II LO';
  }
  return '';
}

function _drawQuestTracker(ctx2, cw, ch) {
  const text = _getActiveQuestText();
  if (!text) return;
  const pad = 10, margin = 14;
  ctx2.font = 'bold 12px "Segoe UI",sans-serif';
  const tw = ctx2.measureText(text).width;
  const bw = tw + pad * 2, bh = 26;
  const bx = cw - bw - margin, by = margin;
  ctx2.fillStyle = 'rgba(8,18,8,0.78)';
  ctx2.beginPath(); ctx2.roundRect(bx-2, by-2, bw+4, bh+4, 6); ctx2.fill();
  ctx2.strokeStyle = 'rgba(255,215,60,0.5)'; ctx2.lineWidth = 1.2;
  ctx2.stroke();
  ctx2.fillStyle = '#ffe060';
  ctx2.shadowColor = '#000'; ctx2.shadowBlur = 4;
  ctx2.textAlign = 'left'; ctx2.textBaseline = 'middle';
  ctx2.fillText(text, bx + pad, by + bh / 2);
  ctx2.shadowBlur = 0;
}

/* ── Comic speech bubble (world-space: px/py = character position) ── */
function _drawSpeechBubble(c, text, px, py, alpha) {
  c.save();
  c.globalAlpha = alpha;
  c.font = 'bold 13px "Segoe UI",sans-serif';
  const tw = c.measureText(text).width;
  const bw = tw + 20, bh = 26;
  const bx = px - bw / 2, by = py - 74;
  const tailX = px;

  /* bubble body */
  c.fillStyle = '#fff';
  c.beginPath(); c.roundRect(bx, by, bw, bh, 8); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1.5;
  c.stroke();

  /* tail — triangle pointing down toward character head */
  c.beginPath();
  c.moveTo(tailX - 6, by + bh - 1);
  c.lineTo(tailX + 6, by + bh - 1);
  c.lineTo(tailX,     by + bh + 11);
  c.closePath();
  c.fillStyle = '#fff'; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(tailX - 6, by + bh);
  c.lineTo(tailX,     by + bh + 11);
  c.lineTo(tailX + 6, by + bh);
  c.stroke();

  /* text */
  c.fillStyle = '#222';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(text, px, by + bh / 2);
  c.restore();
}

/* ── Debug menu ── */
let _debugOpen = false;

function _dbgToggle() {
  _debugOpen = !_debugOpen;
  document.getElementById('debug-overlay').classList.toggle('hidden', !_debugOpen);
}

function _dbgSet(quest, state) {
  switch (quest) {
    case 'gd':
      _GD_QUEST.state = state;
      if (state !== 'idle') _spawnAgnieszkas();
      if (state === 'active' || state === 'complete' || state === 'done') _GD_QUEST.killed = state === 'done' ? 10 : 0;
      player.x = 1755; player.y = 1828;
      break;
    case 'tr':
      _TR_QUEST.state = state;
      player.x = 1564; player.y = 2133;
      break;
    case 'catq':
      _CAT_Q.state = state;
      player.x = 1755; player.y = 1828;
      break;
    case 'gdn':
      _GDN_QUEST.state = state;
      player.x = 1880; player.y = 178;
      break;
    case 'hel':
      _HEL_QUEST.state = state;
      if (state === 'q8_hunt') _HEL_QUEST.kills = 0;
      player.x = 1922; player.y = 178;
      break;
    case 'km':
      _KM_QUEST.state = state;
      _KM_QUEST.entryTriggered = false;
      _KM_QUEST.q10Kills = 0;
      _RAFAL_WORLD.active = false;
      player.x = 2632; player.y = 527;
      break;
    case 'helq12':
      _HEL_Q12.state = state;
      player.x = 1922; player.y = 178;
      break;
    case 'q13':
      if (typeof _GDN_Q13 !== 'undefined') _GDN_Q13.state = state;
      player.x = 1738; player.y = 505; /* Gdańsk entry */
      break;
    case 'q14':
      if (typeof _GTA_BOSS !== 'undefined') {
        _GTA_BOSS.state = state;
        _GTA_BOSS.hp = _GTA_BOSS.maxHp;
        _GTA_BOSS.rocks = []; _GTA_BOSS.explodePFX = [];
        _GTA_BOSS.laserBeam = null;
        if (state === 'q14_fight') { _GTA_BOSS.laserTimer = 3; _GTA_BOSS.rockTimer = 3; }
      }
      player.x = 680; player.y = 1480;
      break;
    case 'end':
      if (typeof _ENDING !== 'undefined') {
        _ENDING.state = state;
        _ENDING.playerAlpha = 1;
        if (state === 'end_fade' && typeof _startEndingFade === 'function') _startEndingFade();
      }
      player.x = CFG.SPAWN_X; player.y = CFG.SPAWN_Y;
      break;
    case 'ac':
      if (typeof acSetGameCompleted === 'function') acSetGameCompleted(state === 'on');
      player.x = 1738; player.y = 505; /* teleport do Gdańska przy Ergo Arena */
      break;
  }
  _dbgToggle();
}

document.addEventListener('keydown', e => {
  if (e.key === '`' || e.key === '~') _dbgToggle();
});

function render(ts) {
  const w = _cssW, h = _cssH;
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(-camX, -camY);
  drawWorld(ctx, ts);
  drawEventZones(ctx, ts);
  drawMainMapQuestMarkers(ctx, ts);
  /* Player with ending fade alpha */
  const _pAlpha = (typeof _ENDING !== 'undefined') ? _ENDING.playerAlpha : 1;
  if (_pAlpha > 0.01) {
    if (_pAlpha < 1) ctx.globalAlpha = _pAlpha;
    drawPlayer(ctx);
    ctx.globalAlpha = 1;
  }
  drawPlayerZdBarOverlay(ctx, player.x, player.y);
  if (typeof aceFxDraw === 'function') aceFxDraw(ctx, ts);

  /* Healing aura visual — orbits around Agata */
  const wDist2 = Math.hypot(player.x - CFG.SPAWN_X, player.y - CFG.SPAWN_Y);
  if (wDist2 < 120) {
    const t2 = ts / 1000;
    for (let pi = 0; pi < 4; pi++) {
      const angle = t2 * 1.2 + pi * Math.PI * 0.5;
      const px2 = player.x + Math.cos(angle) * 28;
      const py2 = player.y + Math.sin(angle) * 14 - (t2 * 25 % 48);
      const alpha = 0.8 - (t2 * 0.55 % 0.8);
      ctx.fillStyle = `rgba(50,220,80,${Math.max(0, alpha)})`;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+', px2, py2);
    }
  }

  /* Agata speech bubble (world-space, comic dymek) */
  if (_agataSpeechAlpha > 0) _drawSpeechBubble(ctx, _agataSpeechText, player.x, player.y, _agataSpeechAlpha);

  ctx.restore();

  /* Q14 boss health bar (HUD, screen-space) */
  if (typeof _GTA_BOSS !== 'undefined' && ['q14_fight','q14_exploding'].includes(_GTA_BOSS.state)) {
    const bw = Math.min(w * 0.55, 380), bh = 18;
    const bx = w / 2 - bw / 2, by = 14;
    /* background */
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx-4,by-20,bw+8,bh+28,8); else ctx.rect(bx-4,by-20,bw+8,bh+28); ctx.fill();
    /* label */
    ctx.font = 'bold 11px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillStyle = '#ff80ff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
    ctx.fillText('⚡ GIGA TURBO AGNIESZKA ⚡', w/2, by);
    ctx.shadowBlur=0;
    /* bar track */
    ctx.fillStyle = '#330033'; ctx.fillRect(bx, by, bw, bh);
    /* bar fill */
    const ratio = _GTA_BOSS.hp / _GTA_BOSS.maxHp;
    const barG = ctx.createLinearGradient(bx, 0, bx+bw, 0);
    barG.addColorStop(0,'#cc00cc'); barG.addColorStop(1,'#ff00aa');
    ctx.fillStyle = barG; ctx.fillRect(bx, by, bw*ratio, bh);
    /* border */
    ctx.strokeStyle = 'rgba(255,100,255,0.6)'; ctx.lineWidth=1.5;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx,by,bw,bh,3); else ctx.rect(bx,by,bw,bh); ctx.stroke();
    /* hp text */
    ctx.font = 'bold 12px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
    ctx.fillText(`${_GTA_BOSS.hp} / ${_GTA_BOSS.maxHp}`, w/2, by+bh/2);
    ctx.shadowBlur=0;
  }

  drawMinimap(ctx, w, h);
  drawJoystick(ctx, h);
  _drawQuestTracker(ctx, w, h);
}

// ── Minimap ───────────────────────────────────────────────────────────────────

const MM_W = 148, MM_H = 111, MM_PAD = 14;

function drawMinimap(ctx, cw, ch) {
  const mx = cw - MM_W - MM_PAD, my = MM_PAD;
  const sx = MM_W / CFG.WORLD_W, sy = MM_H / CFG.WORLD_H;

  // Background panel
  ctx.fillStyle = 'rgba(8,18,8,0.75)';
  ctx.beginPath(); ctx.roundRect(mx-4,my-4,MM_W+8,MM_H+8,6); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth=1; ctx.stroke();

  ctx.save();
  ctx.beginPath(); ctx.roundRect(mx,my,MM_W,MM_H,4); ctx.clip();

  // Grass
  ctx.fillStyle = '#3a8020';
  ctx.fillRect(mx, my, MM_W, MM_H);

  // Bory Tucholskie tint
  ctx.fillStyle = 'rgba(20,60,8,0.35)';
  ctx.fillRect(mx, my + 1000*sy, 1400*sx, 1400*sy);

  // Sea polygon
  ctx.beginPath();
  for (const [x,y] of SEA_POLY) ctx.lineTo(mx+x*sx, my+y*sy);
  ctx.closePath();
  ctx.fillStyle='#1a4888'; ctx.fill();

  // Lagoon
  ctx.beginPath();
  ctx.ellipse(mx+LAGOON.cx*sx, my+LAGOON.cy*sy, LAGOON.rx*sx, LAGOON.ry*sy, 0,0,Math.PI*2);
  ctx.fillStyle='#1a5878'; ctx.fill();

  // Hel peninsula
  ctx.beginPath();
  ctx.moveTo(mx+HEL_A[0]*sx, my+HEL_A[1]*sy);
  ctx.lineTo(mx+HEL_B[0]*sx, my+HEL_B[1]*sy);
  ctx.strokeStyle='#3a8020'; ctx.lineWidth=HEL_W*sx*2; ctx.stroke();

  // Wisła
  ctx.beginPath();
  ctx.moveTo(mx+WISLA[0].x*sx, my+WISLA[0].y*sy);
  for (const p of WISLA) ctx.lineTo(mx+p.x*sx, my+p.y*sy);
  ctx.strokeStyle='#2a60b8'; ctx.lineWidth=3; ctx.stroke();

  // Roads
  for (const rd of ROADS) {
    ctx.beginPath();
    ctx.moveTo(mx+rd.pts[0].x*sx, my+rd.pts[0].y*sy);
    for (const p of rd.pts) ctx.lineTo(mx+p.x*sx, my+p.y*sy);
    ctx.strokeStyle='#c8b870'; ctx.lineWidth=1.5; ctx.stroke();
  }

  // Cities (orange squares)
  const cities = [
    [1685,440,'G'],[1922,178,'H'],[1755,1828,'Gr'],[1630,2130,'T'],
    [2612,490,'K'],[1555,1492,'W'],
  ];
  for (const [cx,cy,lbl] of cities) {
    const mx2=mx+cx*sx, my2=my+cy*sy;
    ctx.fillStyle='#e8a040';
    ctx.fillRect(mx2-4, my2-4, 8, 8);
    ctx.font='bold 7px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='middle';
    ctx.fillStyle='#f8e8c0'; ctx.fillText(lbl, mx2+5, my2);
  }

  // Event zones
  for (const ev of EVENT_ZONES) {
    ctx.beginPath();
    ctx.arc(mx+ev.x*sx, my+ev.y*sy, 3,0,Math.PI*2);
    ctx.fillStyle = _triggered.has(ev.id) ? '#888' : '#ffd040';
    ctx.fill();
  }

  // Player dot
  ctx.beginPath();
  ctx.arc(mx+player.x*sx, my+player.y*sy, 4,0,Math.PI*2);
  ctx.fillStyle='#ff6090'; ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke();

  ctx.restore();

  ctx.font='10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,255,255,0.32)';
  ctx.fillText('MAPA', mx+MM_W/2, my+MM_H+3);
}

init();
