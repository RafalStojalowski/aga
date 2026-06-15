'use strict';

const EVENT_ZONES = [
  {
    x:1555, y:1492, r:40, phase:0,
    portrait:'🏡',
    text:'Warlubie — tu wszystko się zaczęło.\n\nTo nasz dom. Zawsze tu wrócę, gdziekolwiek będziemy. ❤️',
    id:'ev_warlubie',
  },
  {
    x:1685, y:465, r:42, phase:1.4,
    portrait:'⚓',
    text:'Gdańsk — miasto pełne historii.\n\nPamiętasz jak tu razem chodziliśmy? Dodaj tu swoje wspomnienie! 🌊',
    id:'ev_gdansk',
  },
  {
    x:1922, y:185, r:38, phase:2.8,
    portrait:'🌅',
    text:'Hel — koniec lądu, początek morza.\n\nStoimy na samym czubku półwyspu. Co widzisz na horyzoncie? 💙',
    id:'ev_hel',
  },
  {
    x:1755, y:1828, r:40, phase:0.9,
    portrait:'🏰',
    text:'Grudziądz — miasto zamku nad Wisłą.\n\nDodaj tu swoje wspomnienie z Grudziądza! 🏯',
    id:'ev_grudziadz',
  },
  {
    x:1630, y:2135, r:40, phase:2.1,
    portrait:'🎂',
    text:'Toruń — miasto pierników i Kopernika.\n\nI naszej drugiej rocznicy! 🎉❤️',
    id:'ev_torun',
  },
  {
    x:2612, y:510, r:38, phase:3.5,
    portrait:'🌊',
    text:'Krynica Morska — Zalew Wiślany za plecami, Bałtyk przed nami.\n\nDodaj tu swoją wiadomość! 🐚',
    id:'ev_krynica',
  },
];

const _triggered = new Set();

function checkEventZones(px, py) {
  for (const ev of EVENT_ZONES) {
    if (_triggered.has(ev.id)) continue;
    if (Math.hypot(px-ev.x, py-ev.y) < ev.r) {
      _triggered.add(ev.id);
      showDialog(ev.portrait, ev.text);
      break;
    }
  }
}

function drawEventZones(ctx, ts) {
  for (const ev of EVENT_ZONES) {
    const done = _triggered.has(ev.id);
    const a = done ? 0.12 : (0.28 + 0.13*Math.sin(ts*0.0018+ev.phase));
    ctx.beginPath();
    ctx.arc(ev.x, ev.y, ev.r+5, 0, Math.PI*2);
    ctx.fillStyle = done ? `rgba(120,120,120,${a*0.4})` : `rgba(255,215,60,${a*0.45})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ev.x, ev.y, ev.r, 0, Math.PI*2);
    ctx.fillStyle = done ? `rgba(100,100,100,${a})` : `rgba(255,230,80,${a})`;
    ctx.fill();
    ctx.font='18px sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.globalAlpha = done ? 0.4 : 1;
    ctx.fillText(done ? '✓' : '✦', ev.x, ev.y);
    ctx.globalAlpha = 1;
  }
}

// ── Dialog ────────────────────────────────────────────────────────────────────

const _dlgOverlay  = document.getElementById('dialog-overlay');
const _dlgPortrait = document.getElementById('dialog-portrait');
const _dlgText     = document.getElementById('dialog-text');
const _dlgClose    = document.getElementById('dialog-close');
let _dlgOpen = false;

function showDialog(portrait, text) {
  _dlgPortrait.textContent = portrait;
  _dlgText.innerHTML = text.replace(/\n/g,'<br>');
  _dlgOverlay.classList.remove('hidden');
  _dlgOpen = true;
}

function closeDialog() {
  _dlgOverlay.classList.add('hidden');
  _dlgOpen = false;
}

function isDialogOpen() { return _dlgOpen; }

_dlgClose.addEventListener('click', closeDialog);
_dlgOverlay.addEventListener('click', e => { if (e.target===_dlgOverlay) closeDialog(); });
document.addEventListener('keydown', e => {
  if (_dlgOpen && (e.key==='Enter'||e.key===' '||e.key==='Escape')) closeDialog();
});
