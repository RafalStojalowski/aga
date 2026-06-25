'use strict';

/* ── Trees scattered around Toruń ── */
const _TR_TREES = [
  // North side (old town greenery)
  {x:155,y:115,r:12},{x:232,y:130,r:13},{x:312,y:108,r:14},{x:362,y:148,r:11},
  {x:142,y:202,r:14},{x:220,y:244,r:12},{x:298,y:218,r:13},
  // Along Bulwar (south of promenade road, above river)
  {x:480,y:432,r:11},{x:678,y:434,r:11},
  {x:900,y:430,r:12},{x:1148,y:429,r:12},
  {x:1350,y:432,r:11},{x:1678,y:430,r:11},
  // South (Kępa Bażarowa)
  {x:700,y:722,r:16},{x:792,y:762,r:15},{x:892,y:742,r:14},
  {x:1002,y:782,r:16},{x:1102,y:758,r:15},
  {x:722,y:862,r:14},{x:862,y:902,r:15},{x:1002,y:882,r:14},
  {x:1152,y:842,r:16},{x:1282,y:822,r:13},
  {x:1480,y:762,r:16},{x:1578,y:802,r:15},{x:1678,y:872,r:14},
  {x:1552,y:952,r:15},{x:1678,y:1012,r:14},
];

/* ═══════════════════════════════════════════════════════
   Quest 2: Wspomnienia z Torunia
   ═══════════════════════════════════════════════════════ */
const _TR_QUEST = {
  state: 'inactive',  // 'inactive' | 'active' | 'collecting' | 'ready' | 'done'
  triggerCooldown: 0,
};

/* Lokalizacje triggera */
const _TR_VIEWPOINT_ZONE = { x: 1429, y: 725, r: 58 };
const _TR_MEMORY_ZONES = [
  { id: 'torun_domki',   x: 409,  y: 930,  r: 90,  emoji: '🏠' },
  { id: 'torun_kfc',     x: 492,  y: 118,  r: 70,  emoji: '🍗' },
  { id: 'torun_schodki', x: 1050, y: 425,  r: 70,  emoji: '🎵' },
];

/* ── Update ── */
function updateTorunQuests(dt, subPlayer) {
  const q   = _TR_QUEST;
  const dtS = dt / 1000;

  q.triggerCooldown = Math.max(0, q.triggerCooldown - dtS);
  if (q.state === 'inactive' || q.triggerCooldown > 0) return;

  const revealOpen = !document.getElementById('card-reveal-overlay').classList.contains('hidden');

  /* ── Trigger intro ── */
  if (q.state === 'active') {
    const dist = Math.hypot(subPlayer.x - _TR_VIEWPOINT_ZONE.x, subPlayer.y - _TR_VIEWPOINT_ZONE.y);
    if (dist < _TR_VIEWPOINT_ZONE.r && !isDialogOpen()) {
      showDialog('🌅', 'To tutaj wszystko się zaczęło, teraz będzie przypominanie.');
      q.state = 'collecting';
      q.triggerCooldown = 3;
    }
    return;
  }

  /* ── Zbieranie kart ── */
  if (q.state === 'collecting') {
    if (!revealOpen) {
      for (const zone of _TR_MEMORY_ZONES) {
        if (hasCard(zone.id)) continue;
        const dist = Math.hypot(subPlayer.x - zone.x, subPlayer.y - zone.y);
        if (dist < zone.r) {
          const card = ALL_CARDS.find(c => c.id === zone.id);
          if (card) {
            showCardReveal(card);
            q.triggerCooldown = 2;
          }
          break;
        }
      }
    }
    const allDone = _TR_MEMORY_ZONES.every(z => hasCard(z.id));
    if (allDone) { q.state = 'ready'; q.triggerCooldown = 1; }
    return;
  }

  /* ── Powrót do Punktu Widokowego ── */
  if (q.state === 'ready') {
    const dist = Math.hypot(subPlayer.x - _TR_VIEWPOINT_ZONE.x, subPlayer.y - _TR_VIEWPOINT_ZONE.y);
    if (dist < _TR_VIEWPOINT_ZONE.r && !isDialogOpen()) {
      showDialog('🌅', 'Każdy wszystko pamięta, i Agata i Rafał, cały wyjazd i wszystkie pierwsze momenty razem.\nAgnieszki atakują nie tylko Grudziądz, chyba atakują całą Polskę.\nTylko Agata jest w stanie je pokonać.\n\nCo dalej? Może w Grudziądzu coś się ciekawego dzieje... 🐾');
      q.state = 'done';
      q.triggerCooldown = 3;
    }
  }
}

/* pomocnicza do rysowania "!" */
function _drawExclamation_TR(ctx, ts, x, y) {
  const pulse = 0.7 + Math.sin(ts * 0.006) * 0.3;
  ctx.beginPath(); ctx.arc(x, y, 22 * pulse, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,80,0,${0.18 * pulse})`; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#ff4400'; ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.font = 'bold 16px "Segoe UI",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 3;
  ctx.fillText('!', x, y);
  ctx.shadowBlur = 0;
}

/* ── Draw world-space elements ── */
function drawTorunQuests(ctx, ts) {
  const q = _TR_QUEST;

  /* "!" nad Punktem Widokowym gdy quest aktywny lub gotowy */
  if (q.state === 'active' || q.state === 'ready') {
    _drawExclamation_TR(ctx, ts, 1429, 638);
  }

  /* "!" nad lokalizacjami wspomnień podczas zbierania */
  if (q.state === 'collecting') {
    for (const zone of _TR_MEMORY_ZONES) {
      if (!hasCard(zone.id)) _drawExclamation_TR(ctx, ts, zone.x, zone.y - 30);
    }
  }

  drawHitFX(ctx);
}

/* ── HUD (screen-space) ── */
function drawTorunQuestsHUD(_ctx, _cw, _ch) { }

/* ════════════════════════════════════════════════════
   Submap definition
   ════════════════════════════════════════════════════ */

const SUBMAP_TORUN = {
  id:   'torun',
  name: 'Toruń',
  w: 1800, h: 1200,
  bgColor: '#4a7838',

  spawn:         {x: 580, y: 280},
  mainMapReturn: {x: 1480, y: 1980},

  riverBand: {y: 462, h: 170},

  /* N-S bridge */
  bridges: [{x1: 818, x2: 870, y1: 0, y2: 1200}],

  roads: [
    {x1:    0, y1: 372, x2: 1800, y2: 408}, // Bulwar Filadelfijski (E-W)
    {x1:  375, y1:   0, x2:  410, y2: 440}, // N-S city street
    {x1:  818, y1:   0, x2:  870, y2: 440}, // bridge approach N
    {x1:  818, y1: 632, x2:  870, y2: 1200},// bridge approach S
    {x1:    0, y1: 742, x2: 1800, y2: 778}, // south E-W road
  ],

  buildings: [
    {x:  440, y:  55, w: 105, h:  88, name: 'KFC',                    type: 'kfc'},
    {x:  680, y:  40, w: 215, h: 148, name: 'Ratusz Staromiejski',    type: 'ratusz'},
    {x:  965, y:  55, w: 160, h: 115, name: 'Dom Mikołaja Kopernika', type: 'generic', color: '#c09878'},
    {x: 1210, y:  45, w: 470, h: 215, name: 'Stare Miasto',           type: 'generic', color: '#9a8870'},
    {x:  130, y: 800, w: 558, h: 310, name: '',                       type: 'domki'},
    {x: 1310, y: 658, w: 238, h: 134, name: 'Punkt Widokowy',         type: 'viewpoint'},
  ],

  /* steps right of bridge */
  schodki: {x: 985, y: 410, w: 130, h: 52},

  trees: _TR_TREES,

  exitZones: [{x: 75, y: 265, r: 68}],

  npcs: [
    {id:'t1', x:250, y:195, _x:250, _y:195, patrolAxis:'x', patrolMin:130, patrolMax:420, speed:52, _dir: 1, stepAnim:0, bodyColor:'#4a7060', hairColor:'#2a1810'},
    {id:'t2', x:760, y:285, _x:760, _y:285, patrolAxis:'x', patrolMin:415, patrolMax:808, speed:58, _dir:-1, stepAnim:0, bodyColor:'#6a5040', hairColor:'#3a2a10'},
    {id:'t3', x:1100,y:195, _x:1100,_y:195, patrolAxis:'x', patrolMin:880, patrolMax:1790,speed:48, _dir: 1, stepAnim:0, bodyColor:'#506848', hairColor:'#1a2a20'},
    {id:'t4', x:360, y:870, _x:360, _y:870, patrolAxis:'x', patrolMin:135, patrolMax:683, speed:44, _dir: 1, stepAnim:0, bodyColor:'#5a4868', hairColor:'#201a28'},
    {id:'t5', x:1550,y:920, _x:1550,_y:920, patrolAxis:'x', patrolMin:870, patrolMax:1790,speed:50, _dir:-1, stepAnim:0, bodyColor:'#485870', hairColor:'#282010'},
  ],

  draw(ctx, ts)               { _drawTorun(ctx, this, ts); },
  updateQuests(dt, subPlayer) { updateTorunQuests(dt, subPlayer); },
  drawQuests(ctx, ts)         { drawTorunQuests(ctx, ts); },
  drawQuestsHUD(ctx, cw, ch)  { drawTorunQuestsHUD(ctx, cw, ch); },
};

SUBMAPS['torun'] = SUBMAP_TORUN;

/* ════════════════════════════════════════════════════
   World drawing
   ════════════════════════════════════════════════════ */
function _drawTorun(ctx, sub, ts) {
  const {w, h} = sub;
  const rb = sub.riverBand;

  /* grass base */
  ctx.fillStyle = '#4a7838'; ctx.fillRect(0, 0, w, h);

  /* old town cobblestone (y: 0 to bulwar) */
  ctx.fillStyle = '#8a8076';
  ctx.fillRect(0, 0, w, sub.roads[0].y1);
  ctx.strokeStyle = 'rgba(0,0,0,0.09)'; ctx.lineWidth = 0.8;
  for (let cy = 10; cy < sub.roads[0].y1; cy += 16) {
    const off = (Math.floor(cy / 16) % 2 === 0) ? 0 : 14;
    for (let cx = off; cx < w; cx += 28) ctx.strokeRect(cx, cy, 24, 13);
  }

  /* promenade (bulwar exit to bank) */
  ctx.fillStyle = '#a09888';
  ctx.fillRect(0, sub.roads[0].y2, w, rb.y - sub.roads[0].y2);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
  for (let py = sub.roads[0].y2 + 10; py < rb.y; py += 20) {
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
  }

  /* Wisła */
  const riverG = ctx.createLinearGradient(0, rb.y, 0, rb.y + rb.h);
  riverG.addColorStop(0, '#1040b0'); riverG.addColorStop(0.45, '#1a54bc'); riverG.addColorStop(1, '#0e2e98');
  ctx.fillStyle = riverG; ctx.fillRect(0, rb.y, w, rb.h);
  const ro = (ts / 1100) % 80;
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2;
  for (let rx = ro - 80; rx < w + 80; rx += 80) {
    for (let ry = rb.y + 22; ry < rb.y + rb.h - 18; ry += 55) {
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.quadraticCurveTo(rx + 28, ry - 7, rx + 56, ry);
      ctx.quadraticCurveTo(rx + 68, ry + 5, rx + 80, ry);
      ctx.stroke();
    }
  }

  /* sandy south bank */
  const sandG = ctx.createLinearGradient(0, rb.y + rb.h, 0, rb.y + rb.h + 44);
  sandG.addColorStop(0, '#d8c888'); sandG.addColorStop(1, '#b8a868');
  ctx.fillStyle = sandG; ctx.fillRect(0, rb.y + rb.h, w, 44);

  /* roads */
  for (const r of sub.roads) {
    const rw = r.x2 - r.x1, rh = r.y2 - r.y1;
    ctx.fillStyle = '#686e6a'; ctx.fillRect(r.x1, r.y1, rw, rh);
    ctx.setLineDash([20, 14]);
    ctx.strokeStyle = 'rgba(220,210,100,0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (rw > rh) { const my = r.y1 + rh/2; ctx.moveTo(r.x1, my); ctx.lineTo(r.x2, my); }
    else         { const mx = r.x1 + rw/2; ctx.moveTo(mx, r.y1); ctx.lineTo(mx, r.y2); }
    ctx.stroke(); ctx.setLineDash([]);
  }

  /* N-S bridge */
  _drawTorunBridge(ctx, sub.bridges[0], rb);

  /* schodki */
  _drawSchodki(ctx, sub.schodki, rb.y);

  /* buildings */
  for (const b of sub.buildings) {
    switch (b.type) {
      case 'kfc':       _drawKFC_TR(ctx, b);       break;
      case 'ratusz':    _drawRatusz_TR(ctx, b);     break;
      case 'viewpoint': _drawViewpoint_TR(ctx, b);  break;
      case 'domki':     _drawDomki_TR(ctx, b);      break;
      default:          _drawGeneric_TR(ctx, b);    break;
    }
  }

  /* trees */
  for (const t of (sub.trees || [])) _drawTree_TR(ctx, t);

  /* exit zone */
  for (const ez of sub.exitZones) {
    const pulse = 0.55 + Math.sin(ts / 480) * 0.45;
    ctx.fillStyle = `rgba(255,215,60,${pulse * 0.12})`;
    ctx.beginPath(); ctx.arc(ez.x, ez.y, ez.r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = `rgba(255,215,60,${pulse * 0.9})`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(ez.x, ez.y, ez.r, 0, Math.PI*2); ctx.stroke();
    ctx.font = 'bold 12px "Segoe UI",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = `rgba(255,215,60,${pulse})`;
    ctx.fillText('← Wyjście z Torunia', ez.x, ez.y + ez.r + 8);
  }

  /* world border */
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w-4, h-4);
}

/* ── N-S concrete bridge ── */
function _drawTorunBridge(ctx, br, rb) {
  const bw = br.x2 - br.x1;
  const bdG = ctx.createLinearGradient(br.x1, 0, br.x2, 0);
  bdG.addColorStop(0, '#888f8a'); bdG.addColorStop(0.5, '#aab4ae'); bdG.addColorStop(1, '#888f8a');
  ctx.fillStyle = bdG; ctx.fillRect(br.x1, rb.y, bw, rb.h);
  ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 2;
  for (let jy = rb.y + 28; jy < rb.y + rb.h; jy += 28) {
    ctx.beginPath(); ctx.moveTo(br.x1, jy); ctx.lineTo(br.x2, jy); ctx.stroke();
  }
  ctx.setLineDash([18, 12]);
  ctx.strokeStyle = 'rgba(220,210,100,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(br.x1 + bw/2, rb.y); ctx.lineTo(br.x1 + bw/2, rb.y + rb.h); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = '#5a6460'; ctx.lineWidth = 4; ctx.lineCap = 'square';
  ctx.beginPath(); ctx.moveTo(br.x1+5, rb.y); ctx.lineTo(br.x1+5, rb.y+rb.h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(br.x2-5, rb.y); ctx.lineTo(br.x2-5, rb.y+rb.h); ctx.stroke();
  ctx.lineWidth = 3;
  for (let sy = rb.y+14; sy < rb.y+rb.h; sy += 26) {
    ctx.beginPath(); ctx.moveTo(br.x1+5, sy); ctx.lineTo(br.x2-5, sy); ctx.stroke();
  }
}

/* ── Schodki nad Wisłą (right of bridge) ── */
function _drawSchodki(ctx, s, riverY) {
  const steps = 5;
  const stepH = (riverY - s.y) / steps;
  for (let i = 0; i < steps; i++) {
    const sw = s.w - i * 16, sx = s.x + i * 8, sy = s.y + i * stepH;
    const light = 180 - i * 14;
    ctx.fillStyle = `rgb(${light},${light-8},${light-18})`;
    ctx.fillRect(sx, sy, sw, stepH + 1);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, sw, stepH);
  }
  ctx.strokeStyle = '#707870'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  for (let i = 0; i <= steps; i++) {
    const py = s.y + i * stepH;
    ctx.beginPath(); ctx.moveTo(s.x+6, py); ctx.lineTo(s.x+6, py-14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s.x+s.w-6, py); ctx.lineTo(s.x+s.w-6, py-14); ctx.stroke();
  }
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(s.x+6, s.y-14); ctx.lineTo(s.x+6, riverY-14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s.x+s.w-6, s.y-14); ctx.lineTo(s.x+s.w-6, riverY-14); ctx.stroke();
  ctx.font = 'bold 10px "Segoe UI",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillStyle = '#fff'; ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
  ctx.fillText('Schodki nad Wisłą', s.x + s.w/2, s.y - 4);
  ctx.shadowBlur = 0;
}

/* ── KFC ── */
function _drawKFC_TR(ctx, b) {
  ctx.fillStyle = '#cc1008'; ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = '#880606'; ctx.fillRect(b.x, b.y, b.w, 8);
  ctx.fillStyle = 'rgba(180,230,255,0.42)';
  ctx.fillRect(b.x+8, b.y+14, 28, 22); ctx.fillRect(b.x+b.w-36, b.y+14, 28, 22);
  const bx = b.x+b.w/2, by = b.y+b.h*0.52;
  ctx.fillStyle = '#f5c000';
  ctx.beginPath(); ctx.moveTo(bx-13,by-15); ctx.lineTo(bx+13,by-15); ctx.lineTo(bx+10,by+10); ctx.lineTo(bx-10,by+10); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#cc1008'; ctx.font='bold 8px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('KFC', bx, by-3);
  ctx.fillStyle='#1a1008'; ctx.fillRect(b.x+b.w/2-9, b.y+b.h-26, 18, 26);
  ctx.font='bold 11px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('KFC', b.x+b.w/2, b.y+b.h+6); ctx.shadowBlur=0;
}

/* ── Ratusz Staromiejski ── */
function _drawRatusz_TR(ctx, b) {
  const fg = ctx.createLinearGradient(b.x, b.y, b.x, b.y+b.h);
  fg.addColorStop(0,'#d4b870'); fg.addColorStop(1,'#a08848');
  ctx.fillStyle=fg; ctx.fillRect(b.x, b.y+35, b.w, b.h-35);
  ctx.strokeStyle='rgba(0,0,0,0.11)'; ctx.lineWidth=1;
  for (let ly=b.y+55; ly<b.y+b.h; ly+=14) { ctx.beginPath(); ctx.moveTo(b.x,ly); ctx.lineTo(b.x+b.w,ly); ctx.stroke(); }
  const tx=b.x+b.w/2-22;
  ctx.fillStyle='#c0a058'; ctx.fillRect(tx, b.y, 44, b.h);
  ctx.fillStyle='#a88840';
  for (let cx=tx; cx<tx+44; cx+=11) ctx.fillRect(cx, b.y-10, 7, 12);
  ctx.fillStyle='#6a4820';
  ctx.beginPath(); ctx.moveTo(tx+22,b.y-32); ctx.lineTo(tx-4,b.y-10); ctx.lineTo(tx+48,b.y-10); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#e8e0c0'; ctx.beginPath(); ctx.arc(tx+22,b.y+22,12,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#4a3818'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.strokeStyle='#4a3818'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(tx+22,b.y+22); ctx.lineTo(tx+22,b.y+14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx+22,b.y+22); ctx.lineTo(tx+28,b.y+22); ctx.stroke();
  ctx.fillStyle='rgba(180,225,255,0.48)';
  for (let wx=b.x+12; wx<b.x+b.w-20; wx+=28) {
    if (wx<tx-2||wx>tx+42) { ctx.fillRect(wx,b.y+50,16,24); ctx.beginPath(); ctx.arc(wx+8,b.y+50,8,Math.PI,0); ctx.fill(); }
  }
  ctx.fillStyle='#1a1008';
  ctx.fillRect(b.x+b.w/2-12,b.y+b.h-28,24,28); ctx.beginPath(); ctx.arc(b.x+b.w/2,b.y+b.h-28,12,Math.PI,0); ctx.fill();
  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('Ratusz', b.x+b.w/2, b.y+b.h+6);
  ctx.fillText('Staromiejski', b.x+b.w/2, b.y+b.h+19); ctx.shadowBlur=0;
}

/* ── Punkt Widokowy ── */
function _drawViewpoint_TR(ctx, b) {
  const pg = ctx.createLinearGradient(b.x,b.y,b.x+b.w,b.y+b.h);
  pg.addColorStop(0,'#c8c0b0'); pg.addColorStop(1,'#a0988a');
  ctx.fillStyle=pg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.strokeStyle='rgba(0,0,0,0.09)'; ctx.lineWidth=1;
  for (let ty=b.y+12; ty<b.y+b.h; ty+=20)
    for (let tx=b.x+12; tx<b.x+b.w; tx+=28) ctx.strokeRect(tx,ty,24,16);
  ctx.strokeStyle='#708078'; ctx.lineWidth=4; ctx.lineCap='square';
  ctx.beginPath(); ctx.moveTo(b.x+8,b.y+b.h-5); ctx.lineTo(b.x+b.w-8,b.y+b.h-5); ctx.stroke();
  ctx.lineWidth=3;
  for (let px=b.x+8; px<=b.x+b.w-8; px+=22) { ctx.beginPath(); ctx.moveTo(px,b.y+b.h-5); ctx.lineTo(px,b.y+b.h-22); ctx.stroke(); }
  ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(b.x+8,b.y+b.h-22); ctx.lineTo(b.x+b.w-8,b.y+b.h-22); ctx.stroke();
  const bx=b.x+b.w/2, by=b.y+b.h/2-8;
  ctx.fillStyle='#303838';
  ctx.beginPath(); ctx.arc(bx-11,by,13,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(bx+11,by,13,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(100,185,225,0.65)';
  ctx.beginPath(); ctx.arc(bx-11,by,8,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(bx+11,by,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#202830'; ctx.fillRect(bx-15,by-4,30,8);
  ctx.strokeStyle='rgba(255,255,200,0.2)'; ctx.lineWidth=1;
  for (const a of [-0.3,0,0.3]) { ctx.beginPath(); ctx.moveTo(bx,by+13); ctx.lineTo(bx+Math.sin(a)*80,by+80); ctx.stroke(); }
  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('Punkt', b.x+b.w/2, b.y+b.h+6);
  ctx.fillText('Widokowy', b.x+b.w/2, b.y+b.h+19); ctx.shadowBlur=0;
}

/* ── Domki z wyjazdu kkisowego ── */
function _drawDomki_TR(ctx, b) {
  const pal=[
    {wall:'#e87060',roof:'#8a3820'},{wall:'#60a8e8',roof:'#204878'},
    {wall:'#e8c050',roof:'#7a6010'},{wall:'#80c878',roof:'#2a6820'},
    {wall:'#e880b0',roof:'#7a2868'},
  ];
  const hW=78, hH=86, roofH=38, gap=114, baseY=b.y+70;
  ctx.font='bold 11px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('Domki z wyjazdu kkisowego', b.x+b.w/2-30, b.y+20); ctx.shadowBlur=0;
  for (let i=0; i<5; i++) {
    const hx=b.x+20+i*gap, {wall,roof}=pal[i];
    ctx.fillStyle='rgba(50,140,40,0.45)'; ctx.fillRect(hx-4,baseY+hH,hW+8,28);
    ctx.fillStyle='#c8b888'; ctx.fillRect(hx+hW/2-7,baseY+hH,14,28);
    ctx.fillStyle=wall; ctx.fillRect(hx,baseY,hW,hH);
    ctx.strokeStyle='rgba(0,0,0,0.07)'; ctx.lineWidth=1;
    for (let wy=baseY+12; wy<baseY+hH; wy+=12) { ctx.beginPath(); ctx.moveTo(hx,wy); ctx.lineTo(hx+hW,wy); ctx.stroke(); }
    ctx.fillStyle=roof;
    ctx.beginPath(); ctx.moveTo(hx-6,baseY); ctx.lineTo(hx+hW/2,baseY-roofH); ctx.lineTo(hx+hW+6,baseY); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#887060'; ctx.fillRect(hx+hW-18,baseY-roofH+10,9,roofH-8);
    ctx.fillStyle='rgba(190,235,255,0.72)';
    ctx.fillRect(hx+10,baseY+18,18,18); ctx.fillRect(hx+hW-28,baseY+18,18,18);
    ctx.strokeStyle='rgba(0,0,0,0.22)'; ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(hx+19,baseY+18); ctx.lineTo(hx+19,baseY+36); ctx.moveTo(hx+10,baseY+27); ctx.lineTo(hx+28,baseY+27);
    ctx.moveTo(hx+hW-19,baseY+18); ctx.lineTo(hx+hW-19,baseY+36); ctx.moveTo(hx+hW-28,baseY+27); ctx.lineTo(hx+hW-10,baseY+27);
    ctx.stroke();
    ctx.fillStyle='#5a3010';
    const dx=hx+hW/2-9; ctx.fillRect(dx,baseY+hH-28,18,28);
    ctx.beginPath(); ctx.arc(dx+9,baseY+hH-28,9,Math.PI,0); ctx.fill();
    ctx.fillStyle='#d4a040'; ctx.beginPath(); ctx.arc(dx+14,baseY+hH-15,2,0,Math.PI*2); ctx.fill();
  }
}

/* ── Generic building ── */
function _drawGeneric_TR(ctx, b) {
  ctx.fillStyle=b.color||'#a09080'; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fillRect(b.x,b.y,b.w,7);
  ctx.fillStyle='rgba(180,225,255,0.45)';
  const wW=18,wH=15,gx=26,gy=26;
  for (let wy=b.y+18; wy+wH<b.y+b.h-8; wy+=gy)
    for (let wx=b.x+14; wx+wW<b.x+b.w-10; wx+=gx) ctx.fillRect(wx,wy,wW,wH);
  if (b.h>80) { ctx.fillStyle='#1a1a2a'; ctx.fillRect(b.x+b.w/2-14,b.y+b.h-36,28,36); }
  ctx.font=`bold ${b.w>200?12:10}px "Segoe UI",sans-serif`; ctx.textAlign='center';
  const lines=b.name.split(' '), lh=14, sy=b.y+b.h/2-(lines.length-1)*lh/2+4;
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  for (let i=0;i<lines.length;i++) ctx.fillText(lines[i],b.x+b.w/2,sy+i*lh);
  ctx.shadowBlur=0;
}

/* ── Tree ── */
function _drawTree_TR(ctx, t) {
  ctx.fillStyle='rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(t.x+3,t.y+6,t.r*0.75,t.r*0.38,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#5a3a1a'; ctx.fillRect(t.x-3,t.y,6,t.r*0.55);
  const tg=ctx.createRadialGradient(t.x-2,t.y-3,0,t.x,t.y,t.r);
  tg.addColorStop(0,'#68d040'); tg.addColorStop(0.6,'#3a9020'); tg.addColorStop(1,'#2a7010');
  ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(t.x,t.y,t.r,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.11)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(t.x,t.y,t.r,0,Math.PI*2); ctx.stroke();
}
