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
  const bob = Math.sin(stepAnim) * 2.5;

  // Shadow
  ctx.beginPath();
  ctx.ellipse(x + 3, y + 11, 13, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.ellipse(x, y - 2 + bob, 10, 13, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e868a0';
  ctx.fill();
  ctx.strokeStyle = '#c04478';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Head
  const hx = x, hy = y - 20 + bob;
  ctx.beginPath();
  ctx.arc(hx, hy, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#fddab4';
  ctx.fill();
  ctx.strokeStyle = '#d49870';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Hair
  ctx.beginPath();
  ctx.arc(hx, hy - 2, 11, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#5a2e0e';
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#2e1808';
  ctx.beginPath(); ctx.arc(hx - 4, hy - 1, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + 4, hy - 1, 2, 0, Math.PI * 2); ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(hx, hy + 2.5, 4, 0.25, Math.PI - 0.25);
  ctx.strokeStyle = '#b06030';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}
