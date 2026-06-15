'use strict';

const player = {
  row: START_ROW,
  col: START_COL,
  prevRow: START_ROW,
  prevCol: START_COL,
  t: 1,           // 0 = start of move, 1 = arrived
  path: [],       // queued steps (BFS result)
  moving: false,

  // Visual draw position (interpolated between prev and current tile)
  get visualRow() { return this.prevRow + (this.row - this.prevRow) * this.easeT(this.t); },
  get visualCol() { return this.prevCol + (this.col - this.prevCol) * this.easeT(this.t); },

  easeT(t) {
    // Smooth ease-in-out
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
};

function playerUpdate(dt) {
  if (player.t < 1) {
    player.t = Math.min(1, player.t + dt / CFG.MOVE_MS);
    if (player.t >= 1) {
      player.t = 1;
      player.moving = false;
      onPlayerArrived(player.row, player.col);
    }
  }

  if (player.t >= 1 && player.path.length > 0) {
    const [nr, nc] = player.path.shift();
    playerStepTo(nr, nc);
  }
}

function playerStepTo(row, col) {
  player.prevRow = player.row;
  player.prevCol = player.col;
  player.row = row;
  player.col = col;
  player.t = 0;
  player.moving = true;
}

function playerMoveDelta(dr, dc) {
  const nr = player.row + dr;
  const nc = player.col + dc;
  if (isWalkable(nr, nc)) {
    player.path = [];
    playerStepTo(nr, nc);
  }
}

function playerMoveToTarget(tr, tc) {
  if (!isWalkable(tr, tc)) return;
  const path = findPath(player.row, player.col, tr, tc);
  if (path && path.length > 0) {
    player.path = path;
  }
}

// ── Player drawing ────────────────────────────────────────────────────────────

function drawPlayer(ctx, camX, camY, canvasW, canvasH) {
  const vr = player.visualRow;
  const vc = player.visualCol;
  const { x: sx, y: sy } = worldToScreen(vr, vc, camX, camY, canvasW, canvasH);

  const cx = sx;
  const cy = sy + CFG.TILE_H / 2;  // center of the tile's top face

  // Shadow
  ctx.beginPath();
  ctx.ellipse(cx, cy + 5, 14, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fill();

  // Body (little dress / figure)
  ctx.beginPath();
  ctx.ellipse(cx, cy - 10, 9, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e86ea0';
  ctx.fill();
  ctx.strokeStyle = '#c04878';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - 27, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#fddbb4';
  ctx.fill();
  ctx.strokeStyle = '#d4996a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#3a2010';
  ctx.beginPath();
  ctx.arc(cx - 3.5, cy - 28, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 3.5, cy - 28, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(cx, cy - 25.5, 4, 0.2, Math.PI - 0.2);
  ctx.strokeStyle = '#c07040';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Hair
  ctx.beginPath();
  ctx.arc(cx, cy - 32, 10, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#5a3010';
  ctx.fill();
}
