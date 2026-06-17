'use strict';

/* ── Park trees — inside new park (right of McDonald's) ── */
const _GD_TREES = [
  {x: 992,y:448,r:14},{x:1052,y:424,r:15},{x:1112,y:452,r:14},{x:1172,y:430,r:15},{x:1222,y:454,r:14},
  {x: 978,y:520,r:15},{x:1038,y:498,r:14},{x:1098,y:528,r:15},{x:1158,y:508,r:14},{x:1218,y:532,r:15},
  {x:1002,y:592,r:14},{x:1062,y:570,r:15},{x:1122,y:596,r:14},{x:1182,y:578,r:15},{x:1228,y:600,r:14},
];

const SUBMAP_GRUDZIADZ = {
  id:   'grudziadz',
  name: 'Grudziądz',
  w: 1800, h: 1200,
  bgColor: '#507840',

  spawn:         {x: 920, y: 620},
  mainMapReturn: {x: 1648, y: 1720}, // DK91 na północ od wejścia do Grudziądza, z dala od rzeki

  river: {x: 0, w: 155},
  bank:  {x: 155, w: 58},

  bridges: [
    {x1: 0, y1: 728, x2: 213, y2: 766}, // most przy południowej ulicy
  ],

  roads: [
    {x1: 210, y1: 358, x2: 1800, y2: 396},  // bulwar E-W
    {x1: 706, y1:   0, x2:  744, y2: 358},  // N-S górna
    {x1: 706, y1: 396, x2:  744, y2: 1200}, // N-S dolna
    {x1: 210, y1: 728, x2: 1800, y2: 766},  // south road E-W
  ],

  buildings: [
    {x:220,  y: 78,  w: 70,  h: 94,  name:'Wieża Klimka',                   type:'tower'},
    {x:758,  y: 75,  w:252,  h:165,  name:'II Liceum Ogólnokształcące',      type:'school', color:'#d4c898'},
    {x:220,  y:410,  w:470,  h:220,  name:'Alfa Centrum',                    type:'mall',   color:'#8898b8'},
    {x:812,  y:410,  w:134,  h:104,  name:"McDonald's",                      type:'mcd'},
    {x:958,  y:405,  w:282,  h:210,  name:'Park Miejski',                    type:'park'},
    {x:350,  y:810,  w:700,  h:320,  name:'???',                             type:'mystery'},
  ],

  parkTrees: _GD_TREES,

  exitZones: [{x:1740, y:580, r:78}],

  npcs: [
    {id:'g1', x:360, y:377, _x:360, _y:377,
     patrolAxis:'x', patrolMin:228, patrolMax:695, speed:56, _dir: 1, stepAnim:0,
     bodyColor:'#4a5870', hairColor:'#2a1a10'},
    {id:'g2', x:722, y:130, _x:722, _y:130,
     patrolAxis:'y', patrolMin: 80, patrolMax:338, speed:46, _dir: 1, stepAnim:0,
     bodyColor:'#6a4858', hairColor:'#1a2a20'},
    {id:'g3', x:460, y:544, _x:460, _y:544,
     patrolAxis:'x', patrolMin:228, patrolMax:930, speed:62, _dir: 1, stepAnim:0,
     bodyColor:'#485062', hairColor:'#3a2a10'},
    {id:'g4', x:868, y:458, _x:868, _y:458,
     patrolAxis:'x', patrolMin:820, patrolMax:938, speed:40, _dir:-1, stepAnim:0,
     bodyColor:'#506048', hairColor:'#201a18'},
  ],

  draw(ctx, ts) { _drawGrudziadz(ctx, this, ts); },
};

SUBMAPS['grudziadz'] = SUBMAP_GRUDZIADZ;

/* ════════════════════════════════════════════════════
   World drawing
   ════════════════════════════════════════════════════ */
function _drawGrudziadz(ctx, sub, ts) {
  const {w, h} = sub;

  /* grass base */
  ctx.fillStyle = '#507840';
  ctx.fillRect(0, 0, w, h);

  /* subtle grass texture */
  ctx.fillStyle = 'rgba(30,70,10,0.2)';
  for (let gy = 0; gy < h; gy += 80) {
    for (let gx = 210; gx < w; gx += 120) {
      ctx.fillRect(gx + 8, gy + 18, 28, 7);
      ctx.fillRect(gx + 68, gy + 48, 18, 5);
    }
  }

  /* riverbank */
  const bankG = ctx.createLinearGradient(sub.river.w, 0, sub.river.w + sub.bank.w, 0);
  bankG.addColorStop(0, '#b8a878'); bankG.addColorStop(1, '#a09060');
  ctx.fillStyle = bankG;
  ctx.fillRect(sub.river.w, 0, sub.bank.w, h);

  /* river */
  const riverG = ctx.createLinearGradient(0, 0, sub.river.w, 0);
  riverG.addColorStop(0, '#1038a0'); riverG.addColorStop(1, '#1a50b8');
  ctx.fillStyle = riverG;
  ctx.fillRect(0, 0, sub.river.w, h);

  /* river ripples */
  const ro = (ts / 1400) % 70;
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.5;
  for (let ry = ro - 70; ry < h; ry += 70) {
    ctx.beginPath();
    ctx.moveTo(12, ry);
    ctx.quadraticCurveTo(50, ry - 9, 90, ry);
    ctx.quadraticCurveTo(128, ry + 9, sub.river.w - 8, ry);
    ctx.stroke();
  }

  /* roads */
  for (const r of sub.roads) {
    const rw = r.x2 - r.x1, rh = r.y2 - r.y1;
    ctx.fillStyle = '#686e6a';
    ctx.fillRect(r.x1, r.y1, rw, rh);
    ctx.setLineDash([20, 14]);
    ctx.strokeStyle = 'rgba(220,210,100,0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (rw > rh) { const my = r.y1 + rh/2; ctx.moveTo(r.x1, my); ctx.lineTo(r.x2, my); }
    else         { const mx = r.x1 + rw/2; ctx.moveTo(mx, r.y1); ctx.lineTo(mx, r.y2); }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 2;
    ctx.strokeRect(r.x1, r.y1, rw, rh);
  }

  /* bridge */
  for (const br of sub.bridges) _drawBridge(ctx, br, sub.river.w, sub.bank.w);

  /* buildings */
  for (const b of sub.buildings) {
    switch (b.type) {
      case 'tower':   _drawTower(ctx, b);   break;
      case 'park':    _drawPark(ctx, b, sub.parkTrees); break;
      case 'mcd':     _drawMcd(ctx, b);     break;
      case 'mystery': _drawMystery(ctx, b, ts); break;
      default:        _drawGeneric(ctx, b); break;
    }
  }

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
    ctx.fillText('← Wyjście z miasta', ez.x, ez.y + ez.r + 8);
  }

  /* world border */
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w-4, h-4);
}

/* ── Bridge ── */
function _drawBridge(ctx, br, riverW, bankW) {
  const bh = br.y2 - br.y1;

  /* deck over the river only */
  const deckG = ctx.createLinearGradient(br.x1, 0, riverW, 0);
  deckG.addColorStop(0, '#9a8060'); deckG.addColorStop(1, '#7a6448');
  ctx.fillStyle = deckG;
  ctx.fillRect(br.x1, br.y1, riverW - br.x1, bh);

  /* road continuation over bank */
  ctx.fillStyle = '#686e6a';
  ctx.fillRect(riverW, br.y1, bankW, bh);

  /* wood planks */
  ctx.strokeStyle = 'rgba(50,30,10,0.28)'; ctx.lineWidth = 1.5;
  for (let px = br.x1 + 5; px < riverW; px += 10) {
    ctx.beginPath(); ctx.moveTo(px, br.y1); ctx.lineTo(px, br.y2); ctx.stroke();
  }

  /* railings */
  ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(br.x1+2, br.y1+3); ctx.lineTo(riverW, br.y1+3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(br.x1+2, br.y2-3); ctx.lineTo(riverW, br.y2-3); ctx.stroke();

  /* posts */
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#4a3018';
  for (let px = 8; px < riverW; px += 28) {
    ctx.beginPath(); ctx.moveTo(px, br.y1); ctx.lineTo(px, br.y2); ctx.stroke();
  }

  /* curb markings onto the bank road */
  ctx.setLineDash([14, 10]);
  ctx.strokeStyle = 'rgba(220,210,100,0.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(riverW, br.y1 + bh/2); ctx.lineTo(riverW + bankW, br.y1 + bh/2); ctx.stroke();
  ctx.setLineDash([]);
}

/* ── Tower ── */
function _drawTower(ctx, b) {
  const cW = 11, cH = 14, cGap = 9;
  const sg = ctx.createLinearGradient(b.x, b.y, b.x, b.y+b.h);
  sg.addColorStop(0, '#b8a890'); sg.addColorStop(1, '#7a6c5c');
  ctx.fillStyle = sg;
  ctx.fillRect(b.x, b.y+cH, b.w, b.h-cH);
  ctx.fillStyle = '#9a8878';
  for (let tx = b.x; tx < b.x+b.w-2; tx += cW+cGap)
    ctx.fillRect(tx, b.y, Math.min(cW, b.x+b.w-tx), cH+5);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
  for (let ly = b.y+cH+10; ly < b.y+b.h; ly += 10) {
    ctx.beginPath(); ctx.moveTo(b.x, ly); ctx.lineTo(b.x+b.w, ly); ctx.stroke();
  }
  for (let row=0, ly=b.y+cH+5; ly<b.y+b.h; ly+=10, row++) {
    const off = row%2===0?0:8;
    for (let vx=b.x+off; vx<b.x+b.w; vx+=16) {
      ctx.beginPath(); ctx.moveTo(vx,ly); ctx.lineTo(vx,ly+10); ctx.stroke();
    }
  }
  ctx.fillStyle = '#1a1008';
  ctx.fillRect(b.x+b.w/2-2, b.y+cH+10, 4, 16);
  const dw=18, dh=26, dx=b.x+b.w/2-dw/2, dy=b.y+b.h-dh;
  ctx.fillStyle='#1a1008';
  ctx.beginPath(); ctx.rect(dx,dy+dw/2,dw,dh-dw/2); ctx.arc(dx+dw/2,dy+dw/2,dw/2,Math.PI,0); ctx.fill();
  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText(b.name, b.x+b.w/2, b.y+b.h+14); ctx.shadowBlur=0;
}

/* ── Park ── */
function _drawPark(ctx, b, trees) {
  const pg = ctx.createRadialGradient(b.x+b.w/2,b.y+b.h/2,0, b.x+b.w/2,b.y+b.h/2,Math.max(b.w,b.h)/2);
  pg.addColorStop(0,'#3a8830'); pg.addColorStop(1,'#2a7020');
  ctx.fillStyle=pg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.strokeStyle='rgba(200,180,120,0.55)'; ctx.lineWidth=7;
  ctx.beginPath(); ctx.moveTo(b.x,b.y+b.h/2); ctx.lineTo(b.x+b.w,b.y+b.h/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(b.x+b.w/2,b.y); ctx.lineTo(b.x+b.w/2,b.y+b.h); ctx.stroke();
  ctx.fillStyle='#8a6a40';
  for (const [bx,by] of [[b.x+40,b.y+b.h/2-18],[b.x+b.w-64,b.y+b.h/2-18]]) {
    ctx.fillRect(bx,by,22,7); ctx.fillRect(bx+3,by-5,4,5); ctx.fillRect(bx+15,by-5,4,5);
  }
  for (const [fx,fy,fc] of [
    [b.x+60, b.y+b.h-60,'rgba(255,200,80,0.4)'],
    [b.x+b.w-80,b.y+50,'rgba(255,100,150,0.4)'],
    [b.x+140,b.y+b.h-80,'rgba(160,255,100,0.35)'],
  ]) { ctx.fillStyle=fc; ctx.beginPath(); ctx.arc(fx,fy,12,0,Math.PI*2); ctx.fill(); }
  for (const t of trees) _drawSubTree(ctx,t);
  ctx.font='bold 11px "Segoe UI",sans-serif'; ctx.textAlign='center';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText(b.name, b.x+b.w/2, b.y+b.h-12); ctx.shadowBlur=0;
}

/* ── McDonald's ── */
function _drawMcd(ctx, b) {
  ctx.fillStyle='#cc1010'; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#aa0808'; ctx.fillRect(b.x,b.y,b.w,8);
  ctx.fillStyle='rgba(180,230,255,0.4)';
  ctx.fillRect(b.x+8,b.y+14,30,20); ctx.fillRect(b.x+b.w-38,b.y+14,30,20);
  ctx.strokeStyle='#f5c000'; ctx.lineWidth=7; ctx.lineCap='round';
  const ax=b.x+b.w/2, ay=b.y+b.h*0.56;
  ctx.beginPath(); ctx.arc(ax-15,ay,17,-Math.PI*0.85,0); ctx.stroke();
  ctx.beginPath(); ctx.arc(ax+15,ay,17,Math.PI,Math.PI*0.15,true); ctx.stroke();
  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText(b.name, b.x+b.w/2, b.y+b.h+14); ctx.shadowBlur=0;
}

/* ── Mystery zone (cat farm placeholder) ── */
function _drawMystery(ctx, b, ts) {
  /* concrete base */
  ctx.fillStyle='#7a7e7a'; ctx.fillRect(b.x,b.y,b.w,b.h);
  /* tile lines */
  ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.lineWidth=1;
  for (let gx=b.x; gx<b.x+b.w; gx+=40) {
    ctx.beginPath(); ctx.moveTo(gx,b.y); ctx.lineTo(gx,b.y+b.h); ctx.stroke();
  }
  for (let gy=b.y; gy<b.y+b.h; gy+=40) {
    ctx.beginPath(); ctx.moveTo(b.x,gy); ctx.lineTo(b.x+b.w,gy); ctx.stroke();
  }
  /* border */
  ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=3;
  ctx.strokeRect(b.x+2,b.y+2,b.w-4,b.h-4);
  /* atmospheric fog layers */
  for (let i=0; i<3; i++) {
    const off = (ts / (800+i*300)) % 1;
    const fx = b.x + (off * b.w * 1.5) % b.w - b.w*0.2;
    const fogG = ctx.createRadialGradient(fx, b.y+b.h/2, 0, fx, b.y+b.h/2, b.h*0.6);
    fogG.addColorStop(0,'rgba(180,180,200,0.18)'); fogG.addColorStop(1,'transparent');
    ctx.fillStyle=fogG; ctx.fillRect(b.x,b.y,b.w,b.h);
  }
  /* big pulsing "?" */
  const qPulse = 0.75 + Math.sin(ts/800)*0.25;
  ctx.save();
  ctx.translate(b.x+b.w/2, b.y+b.h/2);
  ctx.scale(qPulse, qPulse);
  ctx.font='bold 120px "Segoe UI",sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(255,255,255,0.12)';
  ctx.fillText('?', 0, 0);
  ctx.fillStyle='rgba(255,255,255,0.55)';
  ctx.shadowColor='rgba(200,220,255,0.5)'; ctx.shadowBlur=30;
  ctx.fillText('?', 0, 0);
  ctx.shadowBlur=0;
  ctx.restore();
  /* corner icons */
  ctx.font='18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(255,255,255,0.2)';
  for (const [ix,iy] of [[b.x+30,b.y+30],[b.x+b.w-30,b.y+30],[b.x+30,b.y+b.h-30],[b.x+b.w-30,b.y+b.h-30]]) {
    ctx.fillText('?', ix, iy);
  }
}

/* ── Generic building ── */
function _drawGeneric(ctx, b) {
  ctx.fillStyle=b.color||'#a09080'; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(b.x,b.y,b.w,7);
  ctx.fillStyle='rgba(180,225,255,0.45)';
  const wW=18,wH=15,gx=26,gy=26;
  for (let wy=b.y+18; wy+wH<b.y+b.h-8; wy+=gy)
    for (let wx=b.x+14; wx+wW<b.x+b.w-10; wx+=gx)
      ctx.fillRect(wx,wy,wW,wH);
  if (b.h>80) {
    const ew=28,eh=36,ex=b.x+b.w/2-14;
    ctx.fillStyle='#1a1a2a'; ctx.fillRect(ex,b.y+b.h-eh,ew,eh);
  }
  ctx.font=`bold ${b.w>200?12:10}px "Segoe UI",sans-serif`; ctx.textAlign='center';
  const lines=b.name.split(' '), lh=14;
  const sy=b.y+b.h/2-(lines.length-1)*lh/2+4;
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  for (let i=0;i<lines.length;i++) ctx.fillText(lines[i],b.x+b.w/2,sy+i*lh);
  ctx.shadowBlur=0;
}

/* ── Tree (shared) ── */
function _drawSubTree(ctx, t) {
  ctx.fillStyle='rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(t.x+3,t.y+6,t.r*0.75,t.r*0.38,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#5a3a1a'; ctx.fillRect(t.x-3,t.y,6,t.r*0.55);
  const tg=ctx.createRadialGradient(t.x-2,t.y-3,0,t.x,t.y,t.r);
  tg.addColorStop(0,'#68d040'); tg.addColorStop(0.6,'#3a9020'); tg.addColorStop(1,'#2a7010');
  ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(t.x,t.y,t.r,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.14)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(t.x,t.y,t.r,0,Math.PI*2); ctx.stroke();
}
