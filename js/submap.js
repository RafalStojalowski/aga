'use strict';

/* ── Global submap registry (filled by each submap file) ── */
const SUBMAPS = {};

/* ── Entry triggers on the main map ── */
const SUBMAP_ENTRIES = [
  {id: 'grudziadz', x: 1755, y: 1828, r: 100},
];

/* ── State ── */
let _activeSub  = null;
let _subCamX    = 0, _subCamY = 0;
const _SUB_LERP = 0.09;

const _subPlayer = {x: 0, y: 0, r: CFG.PLAYER_R, dx: 0, dy: 0, stepAnim: 0};

/* transition: 0=idle, 1=fading to black, 2=fading back */
let _transState  = 0;
let _transAlpha  = 0;
let _pendingId   = null;  // submap to enter after black
let _exitCooldown = 0;    // seconds before re-entry is allowed

/* ── Public API ── */
function isInSubmap() {
  return _activeSub !== null || _transState > 0;
}

function checkSubmapEntry(px, py) {
  if (_activeSub || _transState > 0 || _exitCooldown > 0) return;
  for (const entry of SUBMAP_ENTRIES) {
    if (Math.hypot(px - entry.x, py - entry.y) < entry.r) {
      _pendingId  = entry.id;
      _transState = 1;
      _transAlpha = 0;
      return;
    }
  }
}

/* ── Update (called from game loop when in submap) ── */
function updateSubmap(dt) {
  const dtS = dt / 1000;

  /* ── transition phase 1: fade to black ── */
  if (_transState === 1) {
    _transAlpha = Math.min(1, _transAlpha + dtS / 0.22);
    if (_transAlpha >= 1) {
      if (_pendingId) { _doEnter(_pendingId); _pendingId = null; }
      else            { _doExit(); }
      _transState = 2;
    }
    return;
  }

  /* ── transition phase 2: fade back in ── */
  if (_transState === 2) {
    _transAlpha = Math.max(0, _transAlpha - dtS / 0.28);
    if (_transAlpha <= 0) _transState = 0;
  }

  if (!_activeSub) return;
  const sub = _activeSub;

  /* ── player movement ── */
  const inp = getInput();
  const len = Math.hypot(inp.x, inp.y);
  if (len > 0.01) {
    const nx = inp.x / len, ny = inp.y / len;
    const spd = CFG.PLAYER_SPEED * dtS;
    const mx = nx * spd, my = ny * spd;
    if      (!_subBlocked(sub, _subPlayer.x + mx, _subPlayer.y + my, _subPlayer.r)) { _subPlayer.x += mx; _subPlayer.y += my; }
    else if (!_subBlocked(sub, _subPlayer.x + mx, _subPlayer.y,      _subPlayer.r))   _subPlayer.x += mx;
    else if (!_subBlocked(sub, _subPlayer.x,      _subPlayer.y + my, _subPlayer.r))   _subPlayer.y += my;
    _subPlayer.dx = nx; _subPlayer.dy = ny;
    _subPlayer.stepAnim += spd * 0.08;
  }

  /* ── exit zone check ── */
  for (const ez of sub.exitZones) {
    if (Math.hypot(_subPlayer.x - ez.x, _subPlayer.y - ez.y) < ez.r) {
      _transState = 1; _transAlpha = 0; _pendingId = null;
      return;
    }
  }

  /* ── NPC update ── */
  for (const npc of (sub.npcs || [])) _updateNPC(npc, dt);

  /* ── exit cooldown (post-exit, runs on main map side) ── */
  _exitCooldown = Math.max(0, _exitCooldown - dtS);
}

/* ── Draw (called from game loop) ── */
function drawSubmapScene(ctx, ts, cw, ch) {
  ctx.clearRect(0, 0, cw, ch);

  if (_activeSub) {
    const sub = _activeSub;

    /* camera lerp */
    const tx = _subPlayer.x - cw / 2;
    const ty = _subPlayer.y - ch / 2;
    _subCamX += (tx - _subCamX) * _SUB_LERP;
    _subCamY += (ty - _subCamY) * _SUB_LERP;
    _subCamX = Math.max(0, Math.min(sub.w - cw, _subCamX));
    _subCamY = Math.max(0, Math.min(sub.h - ch, _subCamY));

    ctx.save();
    ctx.translate(-_subCamX, -_subCamY);

    /* world */
    sub.draw(ctx, ts);

    /* NPCs */
    for (const npc of (sub.npcs || [])) _drawNPC(ctx, npc);

    /* player — temporarily borrow the main player object for drawPlayer() */
    const sv = {x: player.x, y: player.y, dx: player.dx, dy: player.dy, stepAnim: player.stepAnim};
    player.x = _subPlayer.x; player.y = _subPlayer.y;
    player.dx = _subPlayer.dx; player.dy = _subPlayer.dy;
    player.stepAnim = _subPlayer.stepAnim;
    drawPlayer(ctx);
    player.x = sv.x; player.y = sv.y;
    player.dx = sv.dx; player.dy = sv.dy;
    player.stepAnim = sv.stepAnim;

    ctx.restore();

    /* location label */
    ctx.font = 'bold 13px "Segoe UI",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 6;
    ctx.fillText(sub.name, cw / 2, 12);
    ctx.shadowBlur = 0;
  }

  /* transition black overlay */
  if (_transAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${_transAlpha})`;
    ctx.fillRect(0, 0, cw, ch);
  }
}

/* ── Private helpers ── */
function _doEnter(id) {
  const sub = SUBMAPS[id];
  if (!sub) return;
  _activeSub = sub;
  _subPlayer.x = sub.spawn.x;
  _subPlayer.y = sub.spawn.y;
  _subPlayer.dx = 0; _subPlayer.dy = 0; _subPlayer.stepAnim = 0;
  _subCamX = _subPlayer.x - window.innerWidth  / 2;
  _subCamY = _subPlayer.y - window.innerHeight / 2;
  /* reset NPC positions */
  for (const npc of (sub.npcs || [])) {
    npc._x = npc.x; npc._y = npc.y;
    npc._dir = 1; npc.stepAnim = 0;
  }
}

function _doExit() {
  const ret = _activeSub ? _activeSub.mainMapReturn : null;
  _activeSub = null;
  _exitCooldown = 3;
  if (ret) { player.x = ret.x; player.y = ret.y; }
}

function _subBlocked(sub, x, y, r) {
  /* world bounds */
  if (x - r < 0 || x + r > sub.w || y - r < 0 || y + r > sub.h) return true;
  /* river — passable on bridges */
  const onBridge = (sub.bridges || []).some(
    br => x > br.x1 && x < br.x2 && y + r > br.y1 && y - r < br.y2
  );
  if (!onBridge && x - r < sub.river.w) return true;
  /* no building collision */
  /* park trees */
  for (const t of (sub.parkTrees || [])) {
    if (Math.hypot(x - t.x, y - t.y) < r + t.r) return true;
  }
  return false;
}

function _updateNPC(npc, dt) {
  const spd = npc.speed * dt / 1000;
  npc.stepAnim += spd * 0.08;
  if (npc.patrolAxis === 'x') {
    npc._x += npc._dir * spd;
    if (npc._x >= npc.patrolMax) { npc._x = npc.patrolMax; npc._dir = -1; }
    if (npc._x <= npc.patrolMin) { npc._x = npc.patrolMin; npc._dir = 1; }
  } else {
    npc._y += npc._dir * spd;
    if (npc._y >= npc.patrolMax) { npc._y = npc.patrolMax; npc._dir = -1; }
    if (npc._y <= npc.patrolMin) { npc._y = npc.patrolMin; npc._dir = 1; }
  }
}

function _drawNPC(ctx, npc) {
  const x = npc._x, y = npc._y;
  const bob = Math.sin(npc.stepAnim) * 2.2;

  /* shadow */
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 10, 11, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();

  /* body */
  ctx.beginPath();
  ctx.ellipse(x, y - 2 + bob, 9, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = npc.bodyColor || '#4a5870'; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.stroke();

  /* head */
  ctx.beginPath();
  ctx.arc(x, y - 18 + bob, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#f0d0b0'; ctx.fill();

  /* hair */
  ctx.fillStyle = npc.hairColor || '#2a1a10';
  ctx.beginPath();
  ctx.arc(x, y - 20 + bob, 9, Math.PI, Math.PI * 2);
  ctx.fill();

  /* eyes — direction-aware */
  const eyeX = x + (npc._dir || 1) * 3.5;
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath(); ctx.arc(eyeX, y - 18 + bob, 1.8, 0, Math.PI * 2); ctx.fill();

  /* tiny blush */
  ctx.fillStyle = 'rgba(220,120,120,0.25)';
  ctx.beginPath(); ctx.ellipse(x - 5, y - 15 + bob, 3, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 5, y - 15 + bob, 3, 2, 0, 0, Math.PI*2); ctx.fill();
}
