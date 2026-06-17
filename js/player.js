'use strict';

const player = {
  x: CFG.SPAWN_X,
  y: CFG.SPAWN_Y,
  r: CFG.PLAYER_R,
  // last movement direction for animation
  dx: 0,
  dy: 0,
  stepAnim: 0,
};

function updatePlayer(dt) {
  const inp = getInput();
  const len = Math.hypot(inp.x, inp.y);

  if (len > 0.01) {
    const nx = inp.x / len;
    const ny = inp.y / len;
    const spd = CFG.PLAYER_SPEED * (dt / 1000);

    const mx = nx * spd;
    const my = ny * spd;

    // Try full move, then slide on each axis
    if (!isBlocked(player.x + mx, player.y + my, player.r)) {
      player.x += mx;
      player.y += my;
    } else if (!isBlocked(player.x + mx, player.y, player.r)) {
      player.x += mx;
    } else if (!isBlocked(player.x, player.y + my, player.r)) {
      player.y += my;
    }

    player.dx = nx;
    player.dy = ny;
    player.stepAnim += spd * 0.08;
  }

  checkEventZones(player.x, player.y);
}

function drawPlayer(ctx) {
  const { x, y, stepAnim } = player;
  const bob  = Math.sin(stepAnim) * 2.5;
  const step = Math.sin(stepAnim) * 3.5;

  // Shadow
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 11, 12, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fill();

  // ── Jeans / legs ──
  ctx.fillStyle = '#7bb8e8';
  // left leg (swings opposite to bob)
  ctx.beginPath();
  ctx.ellipse(x - 4, y + 7 - step * 0.6, 4, 6, 0.15, 0, Math.PI * 2);
  ctx.fill();
  // right leg
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 7 + step * 0.6, 4, 6, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // ── Pink hoodie body ──
  ctx.beginPath();
  ctx.ellipse(x, y - 3 + bob, 9, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f472b6';
  ctx.fill();
  ctx.strokeStyle = '#db2777';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // ── Sleeves / arms ──
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.ellipse(x - 11, y - 1 + bob + step * 0.5, 3.5, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 11, y - 1 + bob - step * 0.5, 3.5, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // ── Head ──
  const hx = x, hy = y - 20 + bob;
  ctx.beginPath();
  ctx.arc(hx, hy, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#fde8d8';
  ctx.fill();

  // ── Blonde hair (top + sides) ──
  ctx.fillStyle = '#f5e060';
  ctx.beginPath();
  ctx.arc(hx, hy - 2, 10, Math.PI * 1.05, Math.PI * 1.95);
  ctx.lineTo(hx, hy - 2);
  ctx.closePath();
  ctx.fill();
  // side strands
  ctx.beginPath();
  ctx.ellipse(hx - 10, hy + 2, 3, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(hx + 10, hy + 2, 3, 7, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // ── Eyes (blue-grey) ──
  ctx.fillStyle = '#5a8aba';
  ctx.beginPath(); ctx.arc(hx - 3.5, hy - 1, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + 3.5, hy - 1, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a2a3a';
  ctx.beginPath(); ctx.arc(hx - 3.5, hy - 1, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + 3.5, hy - 1, 1.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(hx - 2.8, hy - 1.6, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + 4.2, hy - 1.6, 0.7, 0, Math.PI * 2); ctx.fill();

  // ── Blush ──
  ctx.fillStyle = 'rgba(255,150,150,0.3)';
  ctx.beginPath(); ctx.ellipse(hx - 7, hy + 1.5, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(hx + 7, hy + 1.5, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();

  // ── Smile ──
  ctx.beginPath();
  ctx.arc(hx, hy + 2.5, 4, 0.3, Math.PI - 0.3);
  ctx.strokeStyle = '#d08080';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}
