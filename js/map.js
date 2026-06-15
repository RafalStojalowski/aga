'use strict';

// prettier-ignore
const MAP_DATA = [
//   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21
  [  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3 ], // 0
  [  3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3 ], // 1
  [  3, 0, 4, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 4, 0, 0, 3 ], // 2
  [  3, 0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 3 ], // 3
  [  3, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 3 ], // 4
  [  3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 3 ], // 5  (główna ścieżka)
  [  3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 3 ], // 6
  [  3, 0, 1, 0, 4, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 1, 0, 0, 3 ], // 7
  [  3, 0, 1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 4, 0, 1, 0, 0, 3 ], // 8
  [  3, 0, 1, 0, 0, 0, 0, 2, 2, 2, 2, 7, 2, 2, 2, 2, 0, 0, 1, 0, 0, 3 ], // 9  (7=mostek)
  [  3, 0, 1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 1, 0, 0, 3 ], // 10
  [  3, 0, 1, 0, 0, 0, 5, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 1, 0, 0, 3 ], // 11  EVENT
  [  3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 1, 0, 0, 3 ], // 12
  [  3, 0, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 3 ], // 13  EVENT
  [  3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3 ], // 14
  [  3, 0, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 3 ], // 15
  [  3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3 ], // 16
  [  3, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 3 ], // 17  EVENT
  [  3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3 ], // 18
  [  3, 0, 4, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 3 ], // 19
  [  3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3 ], // 20
  [  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3 ], // 21
];

// Player start position
const START_ROW = 13;
const START_COL = 2;

// ── Helpers ─────────────────────────────────────────────────────────────────

function tileAt(row, col) {
  if (row < 0 || row >= CFG.MAP_ROWS || col < 0 || col >= CFG.MAP_COLS) return CFG.T.TREE;
  return MAP_DATA[row][col];
}

function isWalkable(row, col) {
  return CFG.TILE_WALKABLE[tileAt(row, col)] === true;
}

// ── BFS pathfinding ──────────────────────────────────────────────────────────

function findPath(sr, sc, er, ec) {
  if (sr === er && sc === ec) return [];
  const queue = [[sr, sc]];
  const visited = new Set([`${sr},${sc}`]);
  const parent = new Map();
  const DIRS = [[-1,0],[1,0],[0,-1],[0,1]];

  while (queue.length) {
    const [r, c] = queue.shift();
    if (r === er && c === ec) {
      const path = [];
      let key = `${r},${c}`;
      const startKey = `${sr},${sc}`;
      while (key !== startKey) {
        const [pr, pc] = key.split(',').map(Number);
        path.unshift([pr, pc]);
        key = parent.get(key);
      }
      return path;
    }
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (!visited.has(key) && isWalkable(nr, nc)) {
        visited.add(key);
        parent.set(key, `${r},${c}`);
        queue.push([nr, nc]);
      }
    }
  }
  return null;
}

// ── Screen ↔ World conversion ────────────────────────────────────────────────

function worldToScreen(row, col, camX, camY, canvasW, canvasH) {
  return {
    x: canvasW / 2 + (col - row) * CFG.TILE_W / 2 - camX,
    y: canvasH / 2 + (col + row) * CFG.TILE_H / 2 - camY,
  };
}

function screenToWorld(sx, sy, camX, camY, canvasW, canvasH) {
  const a = (sx - canvasW / 2 + camX) / (CFG.TILE_W / 2);
  const b = (sy - canvasH / 2 + camY) / (CFG.TILE_H / 2);
  return {
    row: Math.round((b - a) / 2),
    col: Math.round((a + b) / 2),
  };
}

// ── Rendering ────────────────────────────────────────────────────────────────

function drawTileAt(ctx, sx, sy, tileType, waterPhase) {
  const tw = CFG.TILE_W;
  const th = CFG.TILE_H;
  const td = CFG.TILE_DEPTH;
  const [topC, leftC, rightC] = CFG.TILE_COLORS[tileType] || CFG.TILE_COLORS[0];

  // Animate water by shifting hue slightly
  let topColor = topC;
  if (tileType === CFG.T.WATER) {
    const wave = Math.sin(waterPhase) * 0.08 + 0.92;
    topColor = shiftBrightness(topC, wave);
  }

  // Top face (diamond)
  ctx.beginPath();
  ctx.moveTo(sx,          sy);
  ctx.lineTo(sx + tw / 2, sy + th / 2);
  ctx.lineTo(sx,          sy + th);
  ctx.lineTo(sx - tw / 2, sy + th / 2);
  ctx.closePath();
  ctx.fillStyle = topColor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Left face
  ctx.beginPath();
  ctx.moveTo(sx - tw / 2, sy + th / 2);
  ctx.lineTo(sx,          sy + th);
  ctx.lineTo(sx,          sy + th + td);
  ctx.lineTo(sx - tw / 2, sy + th / 2 + td);
  ctx.closePath();
  ctx.fillStyle = leftC;
  ctx.fill();
  ctx.stroke();

  // Right face
  ctx.beginPath();
  ctx.moveTo(sx + tw / 2, sy + th / 2);
  ctx.lineTo(sx,          sy + th);
  ctx.lineTo(sx,          sy + th + td);
  ctx.lineTo(sx + tw / 2, sy + th / 2 + td);
  ctx.closePath();
  ctx.fillStyle = rightC;
  ctx.fill();
  ctx.stroke();

  // Tree foliage on top
  if (tileType === CFG.T.TREE) {
    drawTree(ctx, sx, sy);
  }

  // Flower dots
  if (tileType === CFG.T.FLOWER) {
    drawFlowerDots(ctx, sx, sy);
  }

  // EVENT glow ring
  if (tileType === CFG.T.EVENT) {
    drawEventGlow(ctx, sx, sy, waterPhase);
  }
}

function drawTree(ctx, sx, sy) {
  const cx = sx;
  const cy = sy + CFG.TILE_H / 2 - 2;
  // Trunk
  ctx.fillStyle = '#7a4a1a';
  ctx.fillRect(cx - 3, cy - 20, 6, 22);
  // Foliage (two stacked circles)
  ctx.beginPath();
  ctx.arc(cx, cy - 32, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#3a8828';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy - 44, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#4aa834';
  ctx.fill();
}

function drawFlowerDots(ctx, sx, sy) {
  const cx = sx;
  const cy = sy + CFG.TILE_H / 2;
  const dots = [[-8,-4],[8,-4],[0,-10],[4,4],[-4,4]];
  for (const [dx, dy] of dots) {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ff88aa';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
}

function drawEventGlow(ctx, sx, sy, phase) {
  const cx = sx;
  const cy = sy + CFG.TILE_H / 2;
  const alpha = 0.35 + Math.sin(phase * 2) * 0.2;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, 22, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 220, 80, ${alpha})`;
  ctx.fill();
  // Tiny star
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦', cx, cy - 2);
}

function shiftBrightness(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${clamp(r * factor)},${clamp(g * factor)},${clamp(b * factor)})`;
}

function drawMap(ctx, camX, camY, canvasW, canvasH, waterPhase) {
  for (let row = 0; row < CFG.MAP_ROWS; row++) {
    for (let col = 0; col < CFG.MAP_COLS; col++) {
      const { x, y } = worldToScreen(row, col, camX, camY, canvasW, canvasH);
      // Cull tiles far off screen
      if (x < -CFG.TILE_W || x > canvasW + CFG.TILE_W ||
          y < -CFG.TILE_H * 3 || y > canvasH + CFG.TILE_H * 3) continue;
      drawTileAt(ctx, x, y, tileAt(row, col), waterPhase);
    }
  }
}
