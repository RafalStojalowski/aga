'use strict';

// Keyboard state
const _keys = {};
document.addEventListener('keydown', e => { _keys[e.key] = true; });
document.addEventListener('keyup',   e => { _keys[e.key] = false; });

// Virtual joystick state
const _joy = {
  active: false,
  touchId: null,
  baseX: 0, baseY: 0,
  knobX: 0, knobY: 0,
  dx: 0, dy: 0,
};

function attachCanvasEvents(canvas) {
  canvas.addEventListener('touchstart',  onTouchStart,  { passive: false });
  canvas.addEventListener('touchmove',   onTouchMove,   { passive: false });
  canvas.addEventListener('touchend',    onTouchEnd,    { passive: false });
  canvas.addEventListener('touchcancel', onTouchEnd,    { passive: false });
}

function onTouchStart(e) {
  e.preventDefault();
  if (isDialogOpen()) { closeDialog(); return; }

  // Only the first touch activates joystick
  if (!_joy.active) {
    const t = e.changedTouches[0];
    const rect = e.target.getBoundingClientRect();
    _joy.active = true;
    _joy.touchId = t.identifier;
    _joy.baseX = t.clientX - rect.left;
    _joy.baseY = t.clientY - rect.top;
    _joy.knobX = _joy.baseX;
    _joy.knobY = _joy.baseY;
    _joy.dx = 0;
    _joy.dy = 0;
  }
}

function onTouchMove(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier !== _joy.touchId) continue;
    const rect = e.target.getBoundingClientRect();
    const cx = t.clientX - rect.left;
    const cy = t.clientY - rect.top;
    const ddx = cx - _joy.baseX;
    const ddy = cy - _joy.baseY;
    const len = Math.hypot(ddx, ddy);
    const max = CFG.JOY_BASE_R;
    const clamped = Math.min(len, max);
    _joy.dx = len > 0 ? (ddx / len) * (clamped / max) : 0;
    _joy.dy = len > 0 ? (ddy / len) * (clamped / max) : 0;
    _joy.knobX = _joy.baseX + _joy.dx * max;
    _joy.knobY = _joy.baseY + _joy.dy * max;
  }
}

function onTouchEnd(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier === _joy.touchId) {
      _joy.active = false;
      _joy.touchId = null;
      _joy.dx = 0; _joy.dy = 0;
    }
  }
}

// Returns normalised {x, y} in [-1, 1]
function getInput() {
  /* suppress movement while minigames / cinematic overlays are active */
  if (typeof _DNAV  !== 'undefined' && _DNAV.active)  return { x: 0, y: 0 };
  if (typeof _MARO  !== 'undefined' && _MARO.active)  return { x: 0, y: 0 };
  if (_joy.active) return { x: _joy.dx, y: _joy.dy };

  let x = 0, y = 0;
  if (_keys['ArrowLeft']  || _keys['a'] || _keys['A']) x -= 1;
  if (_keys['ArrowRight'] || _keys['d'] || _keys['D']) x += 1;
  if (_keys['ArrowUp']    || _keys['w'] || _keys['W']) y -= 1;
  if (_keys['ArrowDown']  || _keys['s'] || _keys['S']) y += 1;
  return { x, y };
}

// Draw virtual joystick on the canvas (call from render, after ctx.restore)
function drawJoystick(ctx, canvasH) {
  if (!_joy.active) {
    // Show a faint hint when no touch
    const hx = CFG.JOY_MARGIN_X;
    const hy = canvasH - CFG.JOY_MARGIN_Y;
    ctx.beginPath();
    ctx.arc(hx, hy, CFG.JOY_BASE_R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText('☜', hx, hy);
    return;
  }

  // Base
  ctx.beginPath();
  ctx.arc(_joy.baseX, _joy.baseY, CFG.JOY_BASE_R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.30)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Knob
  ctx.beginPath();
  ctx.arc(_joy.knobX, _joy.knobY, CFG.JOY_KNOB_R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.30)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.50)';
  ctx.lineWidth = 2;
  ctx.stroke();
}
