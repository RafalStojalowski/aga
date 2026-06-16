'use strict';

// ── Helpers ───────────────────────────────────────────────────────────────────

function lcg(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0xffffffff; };
}

function ptSegDist(px, py, ax, ay, bx, by) {
  const dx = bx-ax, dy = by-ay, l2 = dx*dx+dy*dy;
  if (l2 === 0) return Math.hypot(px-ax, py-ay);
  const t = Math.max(0, Math.min(1, ((px-ax)*dx+(py-ay)*dy)/l2));
  return Math.hypot(px-ax-t*dx, py-ay-t*dy);
}

function ptInPoly(px, py, verts) {
  let inside = false;
  for (let i=0, j=verts.length-1; i<verts.length; j=i++) {
    const [xi,yi]=verts[i],[xj,yj]=verts[j];
    if ((yi>py)!==(yj>py) && px<((xj-xi)*(py-yi)/(yj-yi)+xi)) inside=!inside;
  }
  return inside;
}

// ── Zatoka Gdańska (sea) ──────────────────────────────────────────────────────

// Polygon clockwise from top-left → across top → coastline back
const SEA_POLY = [
  [0,0],[3200,0],[3200,210],
  [2800,255],[2560,295],[2350,335],[2100,420],
  [1900,415],[1750,412],[1590,392],
  [1380,362],[1150,348],[900,328],
  [650,348],[380,402],[150,442],[0,468],
];

const HEL_A = [1675, 412], HEL_B = [1960, 148], HEL_W = 50;

function onHel(x, y) {
  return ptSegDist(x, y, HEL_A[0], HEL_A[1], HEL_B[0], HEL_B[1]) < HEL_W;
}

function inSea(x, y, r) {
  if (y > 650 && x < 2200) return false; // quick reject for lower map
  return ptInPoly(x, y, SEA_POLY) && !onHel(x, y);
}

// ── Zalew Wiślany (lagoon) ────────────────────────────────────────────────────

const LAGOON = { cx:2650, cy:338, rx:305, ry:125 };

function inLagoon(x, y, r) {
  r = r||0;
  const dx=(x-LAGOON.cx)/(LAGOON.rx+r), dy=(y-LAGOON.cy)/(LAGOON.ry+r);
  return dx*dx+dy*dy < 1;
}

// ── Wisła river ───────────────────────────────────────────────────────────────

const WISLA = [
  {x:1638,y:2370},{x:1668,y:2108},{x:1778,y:1828},
  {x:1782,y:1552},{x:1842,y:1205},{x:1868,y:968},
  {x:1808,y:732},{x:1748,y:532},
];
const RIVER_W = 34;

const BRIDGES = [
  {ax:1545,ay:2108,bx:1798,by:2108,bw:30}, // Toruń
  {ax:1678,ay:1828,bx:1898,by:1828,bw:30}, // Grudziądz
  {ax:1675,ay:1552,bx:1840,by:1552,bw:28}, // Warlubie
];

function onBridge(x, y) {
  for (const b of BRIDGES)
    if (ptSegDist(x,y,b.ax,b.ay,b.bx,b.by) < b.bw) return true;
  return false;
}

function nearWisla(x, y, dist) {
  for (let i=0; i<WISLA.length-1; i++) {
    const p=WISLA[i],q=WISLA[i+1];
    if (ptSegDist(x,y,p.x,p.y,q.x,q.y) < dist) return true;
  }
  return false;
}

function inRiver(x, y, r) {
  r = r||0;
  return nearWisla(x, y, RIVER_W+r) && !onBridge(x, y);
}

// ── Roads ─────────────────────────────────────────────────────────────────────

const ROADS = [
  // DK91 south: Warlubie → Grudziądz → Toruń
  {pts:[{x:1568,y:1535},{x:1695,y:1830},{x:1675,y:2108},{x:1638,y:2368}], w:26},
  // DK91 north: Warlubie → Tczew → Gdańsk
  {pts:[{x:1568,y:1535},{x:1795,y:1200},{x:1848,y:968},{x:1798,y:732},{x:1748,y:532}], w:26},
  // Hel road (peninsula)
  {pts:[{x:1748,y:532},{x:1788,y:432},{x:1858,y:318},{x:1928,y:178}], w:18},
  // Krynica Morska road (east along coast)
  {pts:[{x:1748,y:532},{x:1988,y:502},{x:2260,y:492},{x:2520,y:488},{x:2618,y:490}], w:20},
];

function nearRoads(x, y, dist) {
  for (const rd of ROADS)
    for (let i=0; i<rd.pts.length-1; i++) {
      const p=rd.pts[i],q=rd.pts[i+1];
      if (ptSegDist(x,y,p.x,p.y,q.x,q.y) < dist) return true;
    }
  return false;
}

// ── Buildings ─────────────────────────────────────────────────────────────────

const BUILDINGS = [
  // ═══ WARLUBIE (dom / home) ═══
  {x:1498,y:1468,w:72,h:62,roof:'#558834',wall:'#dcd4b0',label:'Dom'},
  {x:1586,y:1462,w:65,h:58,roof:'#7a5830',wall:'#d8d0a8',label:''},
  {x:1500,y:1548,w:65,h:58,roof:'#3a5e88',wall:'#d4cca8',label:''},
  {x:1582,y:1546,w:70,h:60,roof:'#8a4820',wall:'#dcd4ac',label:'Sklep'},
  {x:1546,y:1492,w:52,h:70,roof:'#888080',wall:'#e0dcd0',label:'Kościół'},

  // ═══ GDAŃSK ═══
  {x:1582,y:385,w:148,h:108,roof:'#8a2020',wall:'#eedcb8',label:'Ratusz Głównego Miasta'},
  {x:1752,y:382,w:105,h:92,roof:'#483a8a',wall:'#dcd4b8',label:'Bazylika Mariacka'},
  {x:1580,y:508,w:90,h:80,roof:'#6a4820',wall:'#d8ccb0',label:'Kamienica'},
  {x:1692,y:506,w:90,h:80,roof:'#1e5888',wall:'#d4cca8',label:'Kamienica'},
  {x:1802,y:498,w:90,h:80,roof:'#6a2860',wall:'#dcd0b4',label:''},
  {x:1582,y:602,w:82,h:72,roof:'#3a7a3a',wall:'#d0ccac',label:''},
  {x:1688,y:600,w:82,h:72,roof:'#8a6020',wall:'#d8d0ac',label:''},
  {x:1792,y:598,w:82,h:72,roof:'#5a1e1e',wall:'#dcd4b0',label:''},

  // ═══ HEL ═══
  {x:1882,y:148,w:74,h:60,roof:'#1e5e8a',wall:'#d8d4c0',label:'Latarnia Morska'},
  {x:1962,y:150,w:64,h:56,roof:'#5a4820',wall:'#d4ceb8',label:''},
  {x:1886,y:224,w:66,h:56,roof:'#8a3e20',wall:'#dcd4b8',label:''},

  // ═══ GRUDZIĄDZ ═══
  {x:1688,y:1778,w:122,h:98,roof:'#7a2828',wall:'#e4d8b8',label:'Zamek'},
  {x:1828,y:1782,w:90,h:80,roof:'#3a5888',wall:'#dcd0b4',label:'Kościół'},
  {x:1694,y:1898,w:84,h:74,roof:'#567820',wall:'#d4cca8',label:''},
  {x:1792,y:1896,w:84,h:74,roof:'#8a4820',wall:'#dcd4ac',label:''},
  {x:1882,y:1892,w:84,h:74,roof:'#3a3888',wall:'#d0cca8',label:''},

  // ═══ TORUŃ ═══
  {x:1498,y:2082,w:132,h:102,roof:'#8a2818',wall:'#e8d8b8',label:'Ruiny Zamku Krzyżackiego'},
  {x:1652,y:2086,w:98,h:84,roof:'#285888',wall:'#dcd0b4',label:'Kościół'},
  {x:1500,y:2202,w:86,h:76,roof:'#567820',wall:'#d4cca8',label:''},
  {x:1602,y:2200,w:86,h:76,roof:'#7a4820',wall:'#dcd4ac',label:''},
  {x:1702,y:2198,w:86,h:76,roof:'#5a2868',wall:'#d8d0b0',label:''},
  {x:1802,y:2196,w:86,h:76,roof:'#286a48',wall:'#d4ccac',label:''},

  // ═══ KRYNICA MORSKA ═══
  {x:2558,y:468,w:82,h:70,roof:'#1e6088',wall:'#d8d4c0',label:'Krynica Morska'},
  {x:2654,y:470,w:74,h:64,roof:'#558834',wall:'#d4d0b8',label:''},
  {x:2560,y:552,w:72,h:64,roof:'#8a3820',wall:'#dcd4b8',label:''},
];

function bldgBlocks(b, x, y, r) {
  return x+r>b.x && x-r<b.x+b.w && y+r>b.y && y-r<b.y+b.h;
}

// ── Trees ─────────────────────────────────────────────────────────────────────

const CITY_ZONES = [
  {x:1478,y:1448,w:240,h:172}, // Warlubie
  {x:1558,y:358, w:360,h:295}, // Gdańsk
  {x:1858,y:118, w:155,h:148}, // Hel
  {x:1662,y:1758,w:290,h:185}, // Grudziądz
  {x:1478,y:2058,w:348,h:205}, // Toruń
  {x:2538,y:448, w:188,h:158}, // Krynica Morska
];

function inCityZone(x, y, r) {
  for (const z of CITY_ZONES)
    if (x+r>z.x && x-r<z.x+z.w && y+r>z.y && y-r<z.y+z.h) return true;
  return false;
}

const TREES = (function() {
  const rand = lcg(271);
  const out = [];
  for (let i = 0; i < 650; i++) {
    const x = 65 + rand() * (CFG.WORLD_W - 130);
    const y = 65 + rand() * (CFG.WORLD_H - 130);
    const r = 14 + rand() * 13;
    if (inSea(x, y, r+28)) continue;
    if (inLagoon(x, y, r+18)) continue;
    if (nearWisla(x, y, r+55)) continue;
    if (inCityZone(x, y, r+28)) continue;
    if (nearRoads(x, y, r+32)) continue;
    out.push({x, y, r});
  }
  return out;
}());

// ── Draw helpers ──────────────────────────────────────────────────────────────

function catmullPath(ctx, pts) {
  if (pts.length < 2) return;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i=0; i<pts.length-1; i++) {
    const p0=pts[Math.max(0,i-1)], p1=pts[i], p2=pts[i+1], p3=pts[Math.min(pts.length-1,i+2)];
    ctx.bezierCurveTo(
      p1.x+(p2.x-p0.x)/6, p1.y+(p2.y-p0.y)/6,
      p2.x-(p3.x-p1.x)/6, p2.y-(p3.y-p1.y)/6,
      p2.x, p2.y
    );
  }
}

// ── Draw: sea ─────────────────────────────────────────────────────────────────

function drawSea(ctx, ts) {
  // Main sea body
  ctx.beginPath();
  for (const [x,y] of SEA_POLY) ctx.lineTo(x,y);
  ctx.closePath();
  const grad = ctx.createLinearGradient(1600,0,1600,600);
  grad.addColorStop(0,  '#0e3a78');
  grad.addColorStop(0.6,'#1a5298');
  grad.addColorStop(1,  '#2268b0');
  ctx.fillStyle = grad;
  ctx.fill();

  // Shore line
  ctx.strokeStyle = 'rgba(80,160,220,0.6)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Wave shimmer on sea
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = 0.07 + 0.04*Math.sin(ts*0.0012);
  for (let i=0; i<5; i++) {
    const wy = 120 + i*80 + Math.sin(ts*0.001+i*1.3)*25;
    ctx.beginPath();
    ctx.moveTo(200, wy);
    ctx.bezierCurveTo(700,wy-30, 1200,wy+30, 1700,wy-15);
    ctx.bezierCurveTo(2000,wy+20, 2500,wy-10, 3000,wy);
    ctx.strokeStyle = '#80c8f0';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();

  // Lagoon (Zalew Wiślany)
  ctx.beginPath();
  ctx.ellipse(LAGOON.cx, LAGOON.cy, LAGOON.rx, LAGOON.ry, 0, 0, Math.PI*2);
  const lgrad = ctx.createRadialGradient(LAGOON.cx-60,LAGOON.cy-30,20, LAGOON.cx,LAGOON.cy,320);
  lgrad.addColorStop(0, '#1a6890');
  lgrad.addColorStop(1, '#0e4870');
  ctx.fillStyle = lgrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,160,200,0.5)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Hel peninsula (land-colored strip on sea)
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(HEL_A[0], HEL_A[1]);
  ctx.lineTo(HEL_B[0], HEL_B[1]);
  ctx.strokeStyle = '#4e9030';
  ctx.lineWidth = HEL_W * 2;
  ctx.stroke();
  // Sandy beach edge on Hel
  ctx.beginPath();
  ctx.moveTo(HEL_A[0], HEL_A[1]);
  ctx.lineTo(HEL_B[0], HEL_B[1]);
  ctx.strokeStyle = 'rgba(200,185,120,0.6)';
  ctx.lineWidth = HEL_W * 2 + 6;
  ctx.globalAlpha = 0.3;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// ── Draw: Wisła river ─────────────────────────────────────────────────────────

function drawRiver(ctx) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // River edges
  ctx.beginPath();
  catmullPath(ctx, WISLA);
  ctx.strokeStyle = '#1848a0';
  ctx.lineWidth = RIVER_W*2 + 10;
  ctx.stroke();

  // River surface
  ctx.beginPath();
  catmullPath(ctx, WISLA);
  ctx.strokeStyle = '#2a68c8';
  ctx.lineWidth = RIVER_W*2;
  ctx.stroke();

  // River highlight
  ctx.beginPath();
  catmullPath(ctx, WISLA);
  ctx.strokeStyle = 'rgba(80,140,220,0.35)';
  ctx.lineWidth = RIVER_W*0.8;
  ctx.stroke();

  // Bridges
  for (const b of BRIDGES) {
    // Planks
    ctx.beginPath();
    ctx.moveTo(b.ax, b.ay);
    ctx.lineTo(b.bx, b.by);
    ctx.strokeStyle = '#9a7848';
    ctx.lineWidth = b.bw * 2;
    ctx.stroke();
    // Railing
    ctx.beginPath();
    ctx.moveTo(b.ax, b.ay);
    ctx.lineTo(b.bx, b.by);
    ctx.strokeStyle = '#c0a060';
    ctx.lineWidth = b.bw * 2 - 8;
    ctx.stroke();
    // Center line
    ctx.beginPath();
    ctx.moveTo(b.ax, b.ay);
    ctx.lineTo(b.bx, b.by);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ── Draw: roads ───────────────────────────────────────────────────────────────

function drawRoads(ctx) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const rd of ROADS) {
    ctx.beginPath(); catmullPath(ctx, rd.pts);
    ctx.strokeStyle = '#a09060'; ctx.lineWidth = rd.w + 10; ctx.stroke();

    ctx.beginPath(); catmullPath(ctx, rd.pts);
    ctx.strokeStyle = '#d4be88'; ctx.lineWidth = rd.w; ctx.stroke();

    ctx.setLineDash([18,16]);
    ctx.beginPath(); catmullPath(ctx, rd.pts);
    ctx.strokeStyle = 'rgba(190,170,100,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ── Draw: buildings ───────────────────────────────────────────────────────────

function drawBuilding(ctx, b) {
  const {x,y,w,h,wall,roof,label} = b;
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.roundRect(x+6,y+6,w,h,5); ctx.fill();

  ctx.fillStyle = roof;
  ctx.beginPath(); ctx.roundRect(x,y,w,h,5); ctx.fill();

  ctx.fillStyle = wall;
  ctx.beginPath(); ctx.roundRect(x,y+h*0.68,w,h*0.32,[0,0,5,5]); ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x,y,w,h,5); ctx.stroke();

  const wy=y+h*0.18, wsz=9;
  ctx.fillStyle='rgba(255,242,185,0.92)';
  ctx.fillRect(x+9,wy,wsz,wsz);
  if(w>65) ctx.fillRect(x+w-18,wy,wsz,wsz);

  const dw=Math.max(10,w*0.18), dh=h*0.26;
  ctx.fillStyle='#6a3a14';
  ctx.beginPath(); ctx.roundRect(x+w/2-dw/2,y+h-dh,dw,dh,[3,3,0,0]); ctx.fill();

}

function drawBuildings(ctx) {
  [...BUILDINGS].sort((a,b)=>(a.y+a.h)-(b.y+b.h)).forEach(b=>drawBuilding(ctx,b));
}

// ── Draw: trees ───────────────────────────────────────────────────────────────

function drawTree(ctx, {x,y,r}) {
  ctx.beginPath();
  ctx.ellipse(x+4,y+r*0.5,r*0.9,r*0.42,0,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.16)'; ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x,y+r*0.18,r*0.28,r*0.32,0,0,Math.PI*2);
  ctx.fillStyle='#6a4020'; ctx.fill();

  ctx.beginPath(); ctx.arc(x,y-r*0.15,r,0,Math.PI*2);
  ctx.fillStyle='#2a7015'; ctx.fill();

  ctx.beginPath(); ctx.arc(x-r*0.18,y-r*0.3,r*0.72,0,Math.PI*2);
  ctx.fillStyle='#3e9822'; ctx.fill();

  ctx.beginPath(); ctx.arc(x-r*0.28,y-r*0.48,r*0.28,0,Math.PI*2);
  ctx.fillStyle='#5ebc3a'; ctx.fill();
}

function drawTrees(ctx) {
  for (const t of TREES) drawTree(ctx, t);
}

// ── Draw: grass background ────────────────────────────────────────────────────

function drawGrass(ctx) {
  const g = ctx.createLinearGradient(0,0,CFG.WORLD_W,CFG.WORLD_H);
  g.addColorStop(0,  '#5caa3a');
  g.addColorStop(0.5,'#54a030');
  g.addColorStop(1,  '#4c9828');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,CFG.WORLD_W,CFG.WORLD_H);

  // Bory Tucholskie dark forest region (western area)
  const rf=lcg(55);
  for (let i=0;i<200;i++) {
    const fx = 100+rf()*(1400-100), fy = 1000+rf()*1300;
    ctx.beginPath();
    ctx.arc(fx,fy,40+rf()*80,0,Math.PI*2);
    ctx.fillStyle=`rgba(30,80,12,${0.06+rf()*0.07})`;
    ctx.fill();
  }
}

function drawBorder(ctx) {
  const m=90,w=CFG.WORLD_W,h=CFG.WORLD_H;
  [[0,0,m,h,0,0,m,0],[w-m,0,m,h,w,0,w-m,0],
   [0,0,w,m,0,0,0,m],[0,h-m,w,m,0,h,0,h-m]].forEach(([rx,ry,rw,rh,x1,y1,x2,y2])=>{
    const g=ctx.createLinearGradient(x1,y1,x2,y2);
    g.addColorStop(0,'rgba(0,0,0,0.55)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g; ctx.fillRect(rx,ry,rw,rh);
  });
}

// City label
function cityLabel(ctx, x, y, name) {
  ctx.font='bold 14px "Segoe UI",sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='bottom';
  ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillText(name,x+1,y+1);
  ctx.fillStyle='#f8eed8';          ctx.fillText(name,x,  y);
}

// ── Collision ─────────────────────────────────────────────────────────────────

function isBlocked(x, y, r) {
  if (x-r<0||x+r>CFG.WORLD_W||y-r<0||y+r>CFG.WORLD_H) return true;
  if (inSea(x, y, r)) return true;
  if (inLagoon(x, y, r)) return true;
  if (inRiver(x, y, r)) return true;
  for (const t of TREES) if ((x-t.x)**2+(y-t.y)**2 < (r+t.r*0.52)**2) return true;
  return false;
}

// ── Main draw ─────────────────────────────────────────────────────────────────

function drawWorld(ctx, ts) {
  drawGrass(ctx);
  drawSea(ctx, ts);
  drawRiver(ctx);
  drawRoads(ctx);
  drawBuildings(ctx);
  drawTrees(ctx);
  cityLabel(ctx, 1685, 355,  'Gdańsk');
  cityLabel(ctx, 1922, 115,  'Hel');
  cityLabel(ctx, 1755, 1752, 'Grudziądz');
  cityLabel(ctx, 1630, 2055, 'Toruń');
  cityLabel(ctx, 2612, 440,  'Krynica Morska');
  cityLabel(ctx, 1555, 1442, 'Warlubie ★');
  drawBorder(ctx);
}
