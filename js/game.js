'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const game = {
  camX: 0,
  camY: 0,
  waterPhase: 0,
  lastTime: null,
};

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  loadGame();

  // Snap camera to player immediately (no lerp on first frame)
  const isoX = (player.col - player.row) * CFG.TILE_W / 2;
  const isoY = (player.col + player.row) * CFG.TILE_H / 2;
  game.camX = isoX;
  game.camY = isoY;

  requestAnimationFrame(loop);
}

function resizeCanvas() {
  canvas.width  = canvas.clientWidth  || window.innerWidth;
  canvas.height = canvas.clientHeight || window.innerHeight;
}

// ── Loop ──────────────────────────────────────────────────────────────────────

function loop(timestamp) {
  const dt = game.lastTime === null ? 16 : Math.min(timestamp - game.lastTime, 100);
  game.lastTime = timestamp;

  update(dt);
  render();

  requestAnimationFrame(loop);
}

function update(dt) {
  playerUpdate(dt);

  // Camera follows visual player position (smooth lerp)
  const vr = player.visualRow;
  const vc = player.visualCol;
  const targetCamX = (vc - vr) * CFG.TILE_W / 2;
  const targetCamY = (vc + vr) * CFG.TILE_H / 2;
  game.camX += (targetCamX - game.camX) * CFG.CAMERA_LERP;
  game.camY += (targetCamY - game.camY) * CFG.CAMERA_LERP;

  game.waterPhase += dt * 0.002;
}

function render() {
  const w = canvas.width;
  const h = canvas.height;

  // Background sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#1a1a3e');
  sky.addColorStop(1, '#2d1b4e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawMap(ctx, game.camX, game.camY, w, h, game.waterPhase);
  drawPlayer(ctx, game.camX, game.camY, w, h);
}

// ── Start ─────────────────────────────────────────────────────────────────────

init();
