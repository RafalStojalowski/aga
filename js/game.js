'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

let camX = 0, camY = 0;
let lastTs = null;

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

  /* apply DPR scale once — all subsequent drawing is in CSS-pixel space */
  ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0);

  if (isInSubmap()) {
    if (!isDialogOpen() && !isAngerActive()) updateSubmap(dt);
    drawSubmapScene(ctx, ts, _cssW, _cssH);
    drawJoystick(ctx, _cssH);
  } else {
    if (!isDialogOpen() && !isAngerActive()) {
      updatePlayer(dt);
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

function render(ts) {
  const w = _cssW, h = _cssH;
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(-camX, -camY);
  drawWorld(ctx, ts);
  drawEventZones(ctx, ts);
  drawPlayer(ctx);
  ctx.restore();

  drawMinimap(ctx, w, h);
  drawJoystick(ctx, h);
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
