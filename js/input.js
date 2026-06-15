'use strict';

// ── Keyboard ──────────────────────────────────────────────────────────────────

const KEY_MAP = {
  ArrowUp:    [-1,  0],  // NW (visual up-right)
  ArrowDown:  [ 1,  0],  // SE (visual down-left)
  ArrowLeft:  [ 0, -1],  // NE (visual up-left)
  ArrowRight: [ 0,  1],  // SW (visual down-right)
  w: [-1,  0],
  s: [ 1,  0],
  a: [ 0, -1],
  d: [ 0,  1],
  W: [-1,  0],
  S: [ 1,  0],
  A: [ 0, -1],
  D: [ 0,  1],
};

document.addEventListener('keydown', e => {
  if (isDialogOpen()) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') closeDialog();
    return;
  }
  const delta = KEY_MAP[e.key];
  if (delta) {
    e.preventDefault();
    playerMoveDelta(delta[0], delta[1]);
  }
});

// ── D-Pad buttons ─────────────────────────────────────────────────────────────

document.querySelectorAll('.dpad-btn').forEach(btn => {
  const dr = parseInt(btn.dataset.dr, 10);
  const dc = parseInt(btn.dataset.dc, 10);

  const go = () => {
    if (!isDialogOpen()) playerMoveDelta(dr, dc);
  };

  btn.addEventListener('touchstart', e => { e.preventDefault(); go(); }, { passive: false });
  btn.addEventListener('mousedown',  e => { e.preventDefault(); go(); });
});

// ── Canvas tap → pathfind ─────────────────────────────────────────────────────

const canvas = document.getElementById('gameCanvas');

canvas.addEventListener('click', handleCanvasTap);
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  const touch = e.changedTouches[0];
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  handleCanvasTap({
    clientX: touch.clientX,
    clientY: touch.clientY,
    _rect: rect,
    _scale: { x: scaleX, y: scaleY },
  });
}, { passive: false });

function handleCanvasTap(e) {
  if (isDialogOpen()) { closeDialog(); return; }

  const rect = e._rect || canvas.getBoundingClientRect();
  const scaleX = e._scale ? e._scale.x : canvas.width  / rect.width;
  const scaleY = e._scale ? e._scale.y : canvas.height / rect.height;

  const sx = (e.clientX - rect.left) * scaleX;
  const sy = (e.clientY - rect.top)  * scaleY;

  const { row, col } = screenToWorld(sx, sy, game.camX, game.camY, canvas.width, canvas.height);

  // If tapping the tile the player is already on, re-trigger event
  if (row === player.row && col === player.col) {
    tryTriggerEvent(row, col);
    return;
  }

  playerMoveToTarget(row, col);
}
