'use strict';
/* ═══════════════════════════════════════════════════════
   Grafiki Kart Agaty
   Każda funkcja: (ctx, W, H) gdzie W=140, H≈162
   Rysowanie w obszarze [0..W, 0..H]
   ═══════════════════════════════════════════════════════ */

/* ── Helpers ─────────────────────────────────────────── */
function _abg(ctx,W,H,a,b){
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,a); g.addColorStop(1,b);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}
function _aem(ctx,em,x,y,sz){
  ctx.font=sz+'px serif'; ctx.textAlign='center';
  ctx.textBaseline='middle'; ctx.fillText(em,x,y);
}
function _atxt(ctx,t,x,y,sz,col){
  ctx.font='bold '+sz+'px "Segoe UI",sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle=col; ctx.fillText(t,x,y);
}
function _astar(ctx,x,y,r,col){
  ctx.fillStyle=col;
  ctx.beginPath();
  for(let i=0;i<5;i++){
    const a=Math.PI*2*i/5-Math.PI/2;
    const b=a+Math.PI/5;
    i===0?ctx.moveTo(x+r*Math.cos(a),y+r*Math.sin(a)):ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));
    ctx.lineTo(x+r*0.4*Math.cos(b),y+r*0.4*Math.sin(b));
  }
  ctx.closePath(); ctx.fill();
}

/* ── 1. Turniej Szachowy ───────────────────────────────*/
_acArtFns['chess1'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#1a1508','#2e2810');
  const sq=14, ox=(W-sq*8)/2, oy=10;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    ctx.fillStyle=(r+c)%2===0?'#f0d9b5':'#b58863';
    ctx.fillRect(ox+c*sq,oy+r*sq,sq,sq);
  }
  ctx.strokeStyle='#aa7722'; ctx.lineWidth=2;
  ctx.strokeRect(ox,oy,sq*8,sq*8);
  _aem(ctx,'♔',W/2,oy+sq*8+18,28);
};

/* ── 2. Drugi Turniej Szachowy ─────────────────────────*/
_acArtFns['chess2'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#1a0808','#2e1010');
  const sq=14, ox=(W-sq*8)/2, oy=10;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    ctx.fillStyle=(r+c)%2===0?'#e8d0a0':'#8b4513';
    ctx.fillRect(ox+c*sq,oy+r*sq,sq,sq);
  }
  ctx.strokeStyle='#cc4444'; ctx.lineWidth=2;
  ctx.strokeRect(ox,oy,sq*8,sq*8);
  _aem(ctx,'🏆',W/2,oy+sq*8+18,26);
};

/* ── 3. 21:00 (Spanko) ─────────────────────────────────*/
_acArtFns['spanko'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#050520','#0a0a38');
  // stars
  ctx.fillStyle='#fff';
  [[20,20],[50,15],[90,25],[110,18],[30,45],[80,10],[120,35]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill();
  });
  // moon
  ctx.fillStyle='#fffacc'; ctx.shadowColor='#fffacc'; ctx.shadowBlur=14;
  ctx.beginPath(); ctx.arc(W/2,H/2-10,32,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#0a0a38'; ctx.shadowBlur=0;
  ctx.beginPath(); ctx.arc(W/2+14,H/2-18,26,0,Math.PI*2); ctx.fill();
  // 21:00
  _atxt(ctx,'21:00',W/2,H-22,14,'#aaaaff');
};

/* ── 4. Matemblewo ─────────────────────────────────────*/
_acArtFns['matemblewo'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#051a08','#0a2e0e');
  // trees
  ctx.fillStyle='#1a5c1a';
  for(let i=0;i<6;i++){
    const x=10+i*22, w=18, th=35+i%3*10;
    ctx.beginPath(); ctx.moveTo(x,H-30); ctx.lineTo(x+w/2,H-30-th); ctx.lineTo(x+w,H-30); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#143c14'; ctx.fillRect(x+w/2-3,H-30,6,14); ctx.fillStyle='#1a5c1a';
  }
  // road
  ctx.fillStyle='#444'; ctx.fillRect(25,H-32,90,18);
  ctx.fillStyle='#ffe066'; ctx.fillRect(65,H-26,10,6);
  // car
  ctx.fillStyle='#cc3333'; ctx.fillRect(48,H-50,38,18);
  ctx.fillStyle='#88ccff'; ctx.fillRect(54,H-48,12,8); ctx.fillRect(68,H-48,12,8);
  ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(54,H-32,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(76,H-32,5,0,Math.PI*2); ctx.fill();
  _atxt(ctx,'Matemblewo',W/2,14,11,'#88ff88');
};

/* ── 5. Zając ──────────────────────────────────────────*/
_acArtFns['zajec'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#1a2808','#2e4010');
  // ground
  ctx.fillStyle='#3a6020'; ctx.fillRect(0,H-28,W,28);
  ctx.fillStyle='#4a7828'; ctx.fillRect(0,H-30,W,8);
  const cx=W/2, cy=H/2+10;
  // body
  ctx.fillStyle='#e8e8e0';
  ctx.beginPath(); ctx.ellipse(cx,cy+10,22,28,0,0,Math.PI*2); ctx.fill();
  // head
  ctx.beginPath(); ctx.ellipse(cx,cy-18,16,14,0,0,Math.PI*2); ctx.fill();
  // ears
  ctx.beginPath(); ctx.ellipse(cx-8,cy-42,5,20,-.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+8,cy-42,5,20,.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ffaaaa';
  ctx.beginPath(); ctx.ellipse(cx-8,cy-42,2.5,15,-.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+8,cy-42,2.5,15,.2,0,Math.PI*2); ctx.fill();
  // eyes
  ctx.fillStyle='#222';
  ctx.beginPath(); ctx.arc(cx-6,cy-20,2.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+6,cy-20,2.5,0,Math.PI*2); ctx.fill();
  // nose
  ctx.fillStyle='#ff9999'; ctx.beginPath(); ctx.arc(cx,cy-13,2,0,Math.PI*2); ctx.fill();
  // tail
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx+20,cy+20,6,0,Math.PI*2); ctx.fill();
};

/* ── 6. Rekuś ──────────────────────────────────────────*/
_acArtFns['rekus'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#180c04','#2a1808');
  // cat
  const cx=W/2, cy=H/2+5;
  ctx.fillStyle='#d4a06a';
  ctx.beginPath(); ctx.ellipse(cx,cy+12,22,25,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx,cy-14,17,15,0,0,Math.PI*2); ctx.fill();
  // ears
  ctx.beginPath(); ctx.moveTo(cx-16,cy-22); ctx.lineTo(cx-22,cy-40); ctx.lineTo(cx-4,cy-26); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+16,cy-22); ctx.lineTo(cx+22,cy-40); ctx.lineTo(cx+4,cy-26); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ff9999';
  ctx.beginPath(); ctx.moveTo(cx-14,cy-24); ctx.lineTo(cx-19,cy-37); ctx.lineTo(cx-5,cy-27); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+14,cy-24); ctx.lineTo(cx+19,cy-37); ctx.lineTo(cx+5,cy-27); ctx.closePath(); ctx.fill();
  // eyes
  ctx.fillStyle='#228822'; ctx.beginPath(); ctx.ellipse(cx-7,cy-16,5,5,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+7,cy-16,5,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(cx-7,cy-16,2.5,4,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+7,cy-16,2.5,4,0,0,Math.PI*2); ctx.fill();
  // nose+mouth
  ctx.fillStyle='#ff8888'; ctx.beginPath(); ctx.arc(cx,cy-8,2.5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#884444'; ctx.lineWidth=1.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx-4,cy-4); ctx.quadraticCurveTo(cx,cy-2,cx+4,cy-4); ctx.stroke();
  // whiskers
  ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(cx-18,cy-10); ctx.lineTo(cx-8,cy-9); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-18,cy-7); ctx.lineTo(cx-8,cy-7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+18,cy-10); ctx.lineTo(cx+8,cy-9); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+18,cy-7); ctx.lineTo(cx+8,cy-7); ctx.stroke();
  _atxt(ctx,'Rekuś',W/2,H-14,11,'#ffcc88');
};

/* ── 7. Kolano ─────────────────────────────────────────*/
_acArtFns['kolano'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#200808','#380c0c');
  // leg silhouette
  ctx.fillStyle='#c8905c';
  ctx.beginPath(); ctx.roundRect(W/2-16,15,32,H-40,8); ctx.fill();
  // knee bump
  ctx.fillStyle='#d8a070'; ctx.beginPath(); ctx.ellipse(W/2,H/2,22,20,0,0,Math.PI*2); ctx.fill();
  // bandage
  ctx.fillStyle='#f5f5e8';
  for(let i=0;i<3;i++){
    ctx.fillRect(W/2-28,H/2-12+i*10,56,8);
  }
  ctx.strokeStyle='#ddddcc'; ctx.lineWidth=1;
  for(let i=0;i<3;i++) { ctx.beginPath(); ctx.moveTo(W/2-28,H/2-8+i*10); ctx.lineTo(W/2+28,H/2-8+i*10); ctx.stroke(); }
  // cross
  ctx.strokeStyle='#cc2222'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(W/2-6,H/2-1); ctx.lineTo(W/2+6,H/2-1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2,H/2-7); ctx.lineTo(W/2,H/2+5); ctx.stroke();
  _aem(ctx,'😬',W/2,H-18,22);
};

/* ── 8. Koncert Twenty One Pilots ──────────────────────*/
_acArtFns['pilots'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#050510','#100820');
  // stage lights
  const cols=['#ff4444','#4444ff','#44ff44','#ffff44','#ff44ff'];
  for(let i=0;i<5;i++){
    ctx.fillStyle=cols[i]+'88';
    ctx.beginPath();
    ctx.moveTo(14+i*24,0); ctx.lineTo(14+i*24-20,H-20); ctx.lineTo(14+i*24+20,H-20); ctx.closePath(); ctx.fill();
  }
  // stage
  ctx.fillStyle='#333'; ctx.fillRect(0,H-22,W,22);
  ctx.fillStyle='#444'; ctx.fillRect(0,H-26,W,6);
  // silhouette person
  ctx.fillStyle='#000';
  ctx.beginPath(); ctx.arc(W/2,H-58,10,0,Math.PI*2); ctx.fill();
  ctx.fillRect(W/2-6,H-48,12,24);
  // text
  _atxt(ctx,'TWENTY ONE',W/2,20,9,'#ffffff');
  _atxt(ctx,'PILOTS',W/2,33,11,'#ffdd44');
};

/* ── 9. Dni Warlubia ───────────────────────────────────*/
_acArtFns['dni_warlubia'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0c0818','#181028');
  // fireworks
  const fw=[[W/2,30],[W/3,50],[2*W/3,40]];
  const fwc=['#ff6644','#44aaff','#ffee44'];
  fw.forEach(([fx,fy],i)=>{
    for(let a=0;a<8;a++){
      const ang=a*Math.PI/4;
      ctx.strokeStyle=fwc[i]; ctx.lineWidth=2; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(fx,fy);
      ctx.lineTo(fx+Math.cos(ang)*18,fy+Math.sin(ang)*18); ctx.stroke();
    }
    ctx.fillStyle=fwc[i]; ctx.beginPath(); ctx.arc(fx,fy,3,0,Math.PI*2); ctx.fill();
  });
  // banner
  ctx.fillStyle='rgba(30,10,60,0.85)'; ctx.fillRect(10,H-55,W-20,30);
  ctx.strokeStyle='#8844cc'; ctx.lineWidth=1.5; ctx.strokeRect(10,H-55,W-20,30);
  _atxt(ctx,'DNI',W/2,H-47,12,'#ffee44');
  _atxt(ctx,'WARLUBIA',W/2,H-33,10,'#ffdd88');
  // ground crowd dots
  ctx.fillStyle='#554488';
  for(let i=0;i<12;i++) { ctx.beginPath(); ctx.arc(8+i*11,H-12,4,0,Math.PI*2); ctx.fill(); }
};

/* ── 10. Św. Kazimierz ─────────────────────────────────*/
_acArtFns['kazimierz'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0a0a20','#141430');
  // church
  ctx.fillStyle='#cccccc';
  ctx.fillRect(W/2-25,H-70,50,55);
  // roof
  ctx.fillStyle='#aaaaaa';
  ctx.beginPath(); ctx.moveTo(W/2-30,H-70); ctx.lineTo(W/2,H-95); ctx.lineTo(W/2+30,H-70); ctx.closePath(); ctx.fill();
  // cross
  ctx.fillStyle='#ffdd88'; ctx.shadowColor='#ffdd88'; ctx.shadowBlur=10;
  ctx.fillRect(W/2-2,H-115,4,22); ctx.fillRect(W/2-9,H-108,18,4);
  ctx.shadowBlur=0;
  // door
  ctx.fillStyle='#554422'; ctx.fillRect(W/2-8,H-30,16,30);
  ctx.fillStyle='#8877aa'; ctx.beginPath(); ctx.arc(W/2,H-30,8,Math.PI,0); ctx.fill();
  // window
  ctx.fillStyle='#ffeecc'; ctx.beginPath(); ctx.arc(W/2,H-52,6,0,Math.PI*2); ctx.fill();
  // halo
  ctx.strokeStyle='#ffcc44'; ctx.lineWidth=2.5; ctx.shadowColor='#ffaa00'; ctx.shadowBlur=12;
  ctx.beginPath(); ctx.arc(W/2,18,14,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0;
  _aem(ctx,'✝',W/2,18,14);
};

/* ── 11. Laptop ────────────────────────────────────────*/
_acArtFns['laptop1'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#060c14','#0e1c2a');
  // screen
  ctx.fillStyle='#223344'; ctx.beginPath(); ctx.roundRect(W/2-38,H/2-40,76,52,4); ctx.fill();
  ctx.fillStyle='#44aaff'; ctx.beginPath(); ctx.roundRect(W/2-34,H/2-37,68,44,2); ctx.fill();
  // screen content lines
  ctx.fillStyle='rgba(255,255,255,0.6)';
  [H/2-28,H/2-20,H/2-12,H/2-4].forEach(y=>{ ctx.fillRect(W/2-24,y,48,3); });
  // keyboard base
  ctx.fillStyle='#334455'; ctx.beginPath(); ctx.roundRect(W/2-42,H/2+12,84,12,3); ctx.fill();
  ctx.fillStyle='#445566'; ctx.beginPath(); ctx.roundRect(W/2-46,H/2+22,92,6,3); ctx.fill();
  // keys dots
  ctx.fillStyle='#556677';
  for(let r=0;r<2;r++) for(let c=0;c<8;c++) ctx.fillRect(W/2-36+c*10,H/2+14+r*5,8,3);
  _atxt(ctx,'💻 Laptop',W/2,H-14,11,'#88ccff');
};

/* ── 12. Kotek ─────────────────────────────────────────*/
_acArtFns['kotek'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0e1020','#182035');
  const cx=W/2, cy=H/2+8;
  // body
  ctx.fillStyle='#888888';
  ctx.beginPath(); ctx.ellipse(cx,cy+14,24,28,0,0,Math.PI*2); ctx.fill();
  // head
  ctx.fillStyle='#999999'; ctx.beginPath(); ctx.ellipse(cx,cy-16,18,16,0,0,Math.PI*2); ctx.fill();
  // stripes
  ctx.strokeStyle='#555'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(cx-14,cy+0); ctx.lineTo(cx-10,cy+10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+14,cy+0); ctx.lineTo(cx+10,cy+10); ctx.stroke();
  // ears
  ctx.fillStyle='#999';
  ctx.beginPath(); ctx.moveTo(cx-16,cy-25); ctx.lineTo(cx-22,cy-42); ctx.lineTo(cx-4,cy-28); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+16,cy-25); ctx.lineTo(cx+22,cy-42); ctx.lineTo(cx+4,cy-28); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffbbaa';
  ctx.beginPath(); ctx.moveTo(cx-14,cy-27); ctx.lineTo(cx-18,cy-38); ctx.lineTo(cx-6,cy-29); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+14,cy-27); ctx.lineTo(cx+18,cy-38); ctx.lineTo(cx+6,cy-29); ctx.closePath(); ctx.fill();
  // eyes (happy)
  ctx.strokeStyle='#228833'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(cx-7,cy-18,5,Math.PI*1.1,Math.PI*1.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx+7,cy-18,5,Math.PI*1.1,Math.PI*1.9); ctx.stroke();
  // nose+mouth
  ctx.fillStyle='#ff9999'; ctx.beginPath(); ctx.arc(cx,cy-11,2,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#884444'; ctx.lineWidth=1.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx-4,cy-7); ctx.quadraticCurveTo(cx,cy-5,cx+4,cy-7); ctx.stroke();
  // whiskers
  ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1;
  [-1,1].forEach(s=>{ ctx.beginPath(); ctx.moveTo(cx+s*20,cy-13); ctx.lineTo(cx+s*8,cy-11); ctx.stroke(); });
  // tail
  ctx.strokeStyle='#888'; ctx.lineWidth=6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx+20,cy+28); ctx.quadraticCurveTo(cx+46,cy+10,cx+40,cy-10); ctx.stroke();
  _atxt(ctx,'Kotek',W/2,H-14,11,'#aaccff');
};

/* ── 13. Kicia ─────────────────────────────────────────*/
_acArtFns['kicia'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#1a0828','#2e1040');
  const cx=W/2, cy=H/2+5;
  // body — orange tabby
  ctx.fillStyle='#e07830';
  ctx.beginPath(); ctx.ellipse(cx,cy+14,22,26,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx,cy-16,16,14,0,0,Math.PI*2); ctx.fill();
  // ears
  ctx.fillStyle='#e07830';
  ctx.beginPath(); ctx.moveTo(cx-14,cy-22); ctx.lineTo(cx-20,cy-40); ctx.lineTo(cx-4,cy-25); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+14,cy-22); ctx.lineTo(cx+20,cy-40); ctx.lineTo(cx+4,cy-25); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffccaa';
  ctx.beginPath(); ctx.moveTo(cx-12,cy-25); ctx.lineTo(cx-16,cy-36); ctx.lineTo(cx-6,cy-27); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+12,cy-25); ctx.lineTo(cx+16,cy-36); ctx.lineTo(cx+6,cy-27); ctx.closePath(); ctx.fill();
  // tabby stripes
  ctx.strokeStyle='#c05818'; ctx.lineWidth=2;
  [cy-5,cy+2,cy+9].forEach(y=>{ ctx.beginPath(); ctx.moveTo(cx-14,y); ctx.lineTo(cx+14,y); ctx.stroke(); });
  // eyes (green)
  ctx.fillStyle='#44aa44'; ctx.beginPath(); ctx.ellipse(cx-6,cy-18,5,5,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+6,cy-18,5,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(cx-6,cy-18,2,4,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+6,cy-18,2,4,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(cx-4,cy-20,1.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+8,cy-20,1.5,0,Math.PI*2); ctx.fill();
  // nose
  ctx.fillStyle='#ff8888'; ctx.beginPath(); ctx.arc(cx,cy-11,2,0,Math.PI*2); ctx.fill();
  // whiskers
  ctx.strokeStyle='rgba(255,255,240,0.7)'; ctx.lineWidth=1;
  [-1,1].forEach(s=>{
    ctx.beginPath(); ctx.moveTo(cx+s*20,cy-13); ctx.lineTo(cx+s*8,cy-12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+s*20,cy-10); ctx.lineTo(cx+s*8,cy-10); ctx.stroke();
  });
  // bow (pink)
  ctx.fillStyle='#ff88cc';
  ctx.beginPath(); ctx.moveTo(cx,cy+28); ctx.bezierCurveTo(cx-14,cy+22,cx-14,cy+34,cx,cy+28); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx,cy+28); ctx.bezierCurveTo(cx+14,cy+22,cx+14,cy+34,cx,cy+28); ctx.fill();
  ctx.fillStyle='#ff44aa'; ctx.beginPath(); ctx.arc(cx,cy+28,3,0,Math.PI*2); ctx.fill();
  _atxt(ctx,'Kicia ♥',W/2,H-14,11,'#ff88cc');
};

/* ── 14. Komputer ──────────────────────────────────────*/
_acArtFns['komputer'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#080c10','#101820');
  // monitor
  ctx.fillStyle='#1a2230'; ctx.beginPath(); ctx.roundRect(W/2-40,15,80,62,5); ctx.fill();
  ctx.fillStyle='#223355'; ctx.beginPath(); ctx.roundRect(W/2-37,18,74,54,3); ctx.fill();
  // screen content
  ctx.fillStyle='#44ff88'; ctx.font='9px monospace'; ctx.textAlign='left';
  ['> Hello!','> C:\\>_','> run.exe'].forEach((t,i)=>{ ctx.fillText(t,W/2-32,30+i*14); });
  // stand
  ctx.fillStyle='#2a3040'; ctx.fillRect(W/2-4,77,8,14); ctx.fillRect(W/2-18,89,36,5);
  // tower
  ctx.fillStyle='#2a3040'; ctx.beginPath(); ctx.roundRect(W/2-42,H-58,22,42,3); ctx.fill();
  ctx.fillStyle='#3a4050'; ctx.fillRect(W/2-38,H-50,14,4); ctx.fillRect(W/2-38,H-42,14,4);
  ctx.fillStyle='#88ff44'; ctx.beginPath(); ctx.arc(W/2-31,H-24,3,0,Math.PI*2); ctx.fill();
  // keyboard
  ctx.fillStyle='#222'; ctx.beginPath(); ctx.roundRect(W/2-4,H-42,52,14,3); ctx.fill();
  ctx.fillStyle='#333';
  for(let r=0;r<2;r++) for(let c=0;c<6;c++) ctx.fillRect(W/2-2+c*8,H-40+r*6,6,4);
  _atxt(ctx,'Komputer',W/2,H-14,11,'#44ff88');
};

/* ── 15. Laptop (drugi) ────────────────────────────────*/
_acArtFns['laptop2'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#060c14','#0e1c2a');
  ctx.fillStyle='#223344'; ctx.beginPath(); ctx.roundRect(W/2-38,H/2-40,76,52,4); ctx.fill();
  ctx.fillStyle='#4488cc'; ctx.beginPath(); ctx.roundRect(W/2-34,H/2-37,68,44,2); ctx.fill();
  // error screen (blue screen of death style)
  _atxt(ctx,':(',W/2,H/2-22,24,'#fff');
  _atxt(ctx,'Błąd systemu',W/2,H/2-5,8,'#aaddff');
  _atxt(ctx,'💀',W/2,H/2+8,16);
  ctx.fillStyle='#334455'; ctx.beginPath(); ctx.roundRect(W/2-42,H/2+12,84,12,3); ctx.fill();
  ctx.fillStyle='#445566'; ctx.beginPath(); ctx.roundRect(W/2-46,H/2+22,92,6,3); ctx.fill();
  _atxt(ctx,'Laptop (drugi)',W/2,H-14,10,'#88bbff');
};

/* ── 16. Maro ──────────────────────────────────────────*/
_acArtFns['maro'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#100808','#1c1208');
  const cx=W/2, cy=H/2+5;
  // body
  ctx.fillStyle='#c8904a';
  ctx.beginPath(); ctx.ellipse(cx,cy+16,26,28,0,0,Math.PI*2); ctx.fill();
  // head
  ctx.beginPath(); ctx.ellipse(cx,cy-16,20,17,0,0,Math.PI*2); ctx.fill();
  // ears (floppy)
  ctx.beginPath(); ctx.ellipse(cx-18,cy-16,10,20,-0.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+18,cy-16,10,20,0.3,0,Math.PI*2); ctx.fill();
  // snout
  ctx.fillStyle='#e8aa70'; ctx.beginPath(); ctx.ellipse(cx,cy-7,10,8,0,0,Math.PI*2); ctx.fill();
  // nose
  ctx.fillStyle='#883322'; ctx.beginPath(); ctx.ellipse(cx,cy-11,5,4,0,0,Math.PI*2); ctx.fill();
  // eyes
  ctx.fillStyle='#442200'; ctx.beginPath(); ctx.arc(cx-8,cy-20,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+8,cy-20,5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(cx-6,cy-22,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+10,cy-22,2,0,Math.PI*2); ctx.fill();
  // mouth
  ctx.strokeStyle='#883322'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx-5,cy-4); ctx.quadraticCurveTo(cx,cy,cx+5,cy-4); ctx.stroke();
  // tongue
  ctx.fillStyle='#ff6666'; ctx.beginPath(); ctx.ellipse(cx,cy+1,5,4,0,0,Math.PI*2); ctx.fill();
  // tail
  ctx.strokeStyle='#c8904a'; ctx.lineWidth=7; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx+22,cy+20); ctx.quadraticCurveTo(cx+48,cy+8,cx+44,cy-8); ctx.stroke();
  _atxt(ctx,'Maro 🐕',W/2,H-14,11,'#ffcc88');
};

/* ── 17. Agnieszka ─────────────────────────────────────*/
_acArtFns['agnieszka'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#080012','#14002a');
  // lightning bolts
  ctx.fillStyle='rgba(200,0,255,0.25)';
  ctx.beginPath(); ctx.moveTo(30,5); ctx.lineTo(18,35); ctx.lineTo(26,35); ctx.lineTo(14,65); ctx.lineTo(22,65); ctx.lineTo(8,95); ctx.lineTo(20,65); ctx.lineTo(12,65); ctx.lineTo(24,35); ctx.lineTo(16,35); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(110,5); ctx.lineTo(98,35); ctx.lineTo(106,35); ctx.lineTo(94,65); ctx.lineTo(102,65); ctx.lineTo(88,95); ctx.lineTo(100,65); ctx.lineTo(92,65); ctx.lineTo(104,35); ctx.lineTo(96,35); ctx.closePath(); ctx.fill();
  // silhouette
  const cx=W/2, cy=H/2;
  ctx.fillStyle='#cc00ff'; ctx.shadowColor='#cc00ff'; ctx.shadowBlur=18;
  // head
  ctx.beginPath(); ctx.arc(cx,cy-30,18,0,Math.PI*2); ctx.fill();
  // hair spikes
  [[cx-20,cy-54],[cx-10,cy-58],[cx,cy-60],[cx+10,cy-58],[cx+20,cy-54]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.moveTo(cx-8,cy-44); ctx.lineTo(x,y); ctx.lineTo(cx+8,cy-44); ctx.fill();
  });
  ctx.shadowBlur=0;
  // body
  ctx.fillStyle='#550077';
  ctx.beginPath(); ctx.ellipse(cx,cy+10,20,28,0,0,Math.PI*2); ctx.fill();
  // ⚡ text
  _atxt(ctx,'⚡ GIGA ⚡',W/2,H-24,10,'#ff44ff');
  _atxt(ctx,'TURBO',W/2,H-13,10,'#cc00ff');
};

/* ── 18. Jezioro ───────────────────────────────────────*/
_acArtFns['jezioro'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040c20','#082038');
  // sky gradient top
  // horizon
  const hy=H*0.45;
  ctx.fillStyle='#081828'; ctx.fillRect(0,0,W,hy);
  // sun reflection
  ctx.fillStyle='#ffee88'; ctx.shadowColor='#ffee88'; ctx.shadowBlur=16;
  ctx.beginPath(); ctx.ellipse(W/2,hy,6,6,0,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  // water
  ctx.fillStyle='#0a2a4a'; ctx.fillRect(0,hy,W,H-hy);
  // water ripples
  ctx.strokeStyle='rgba(100,180,255,0.35)'; ctx.lineWidth=1.5;
  [hy+12,hy+24,hy+38,hy+52].forEach(y=>{
    ctx.beginPath(); ctx.moveTo(10,y); ctx.quadraticCurveTo(W/2,y-6,W-10,y); ctx.stroke();
  });
  // reflection column
  ctx.strokeStyle='rgba(255,238,136,0.4)'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(W/2,hy); ctx.lineTo(W/2,hy+48); ctx.stroke();
  // trees
  ctx.fillStyle='#0a3010';
  [[5,hy],[W-25,hy],[W-45,hy+5],[20,hy+3]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+10,y-28); ctx.lineTo(x+20,y); ctx.fill();
  });
  _atxt(ctx,'Jezioro',W/2,H-14,11,'#88ccff');
};

/* ── 19. Zdjęcie (Nagrywanie) ──────────────────────────*/
_acArtFns['zdjecie'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0a0a08','#181814');
  // phone
  ctx.fillStyle='#222'; ctx.beginPath(); ctx.roundRect(W/2-22,20,44,88,8); ctx.fill();
  ctx.fillStyle='#333'; ctx.beginPath(); ctx.roundRect(W/2-20,23,40,82,6); ctx.fill();
  // screen recording
  ctx.fillStyle='#111'; ctx.beginPath(); ctx.roundRect(W/2-18,26,36,72,4); ctx.fill();
  // video frame
  ctx.fillStyle='#224'; ctx.fillRect(W/2-16,28,32,50);
  // REC indicator
  ctx.fillStyle='#ff2222'; ctx.shadowColor='#ff0000'; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.arc(W/2+10,35,4,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#ff4444'; ctx.font='7px sans-serif'; ctx.textAlign='left';
  ctx.fillText('REC',W/2-14,37);
  // play triangle
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.moveTo(W/2-8,48); ctx.lineTo(W/2+10,56); ctx.lineTo(W/2-8,64); ctx.closePath(); ctx.fill();
  // home button
  ctx.fillStyle='#444'; ctx.beginPath(); ctx.arc(W/2,100,4,0,Math.PI*2); ctx.fill();
  _atxt(ctx,'Nagrywanie',W/2,H-14,11,'#aaaaff');
};

/* ── 20. Rafik ─────────────────────────────────────────*/
_acArtFns['rafik'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#080c18','#101828');
  const cx=W/2, cy=H/2;
  // body
  ctx.fillStyle='#3344aa';
  ctx.beginPath(); ctx.ellipse(cx,cy+12,22,26,0,0,Math.PI*2); ctx.fill();
  // head
  ctx.fillStyle='#f0c890'; ctx.beginPath(); ctx.ellipse(cx,cy-18,18,16,0,0,Math.PI*2); ctx.fill();
  // hair (dark brown, messy)
  ctx.fillStyle='#442211';
  ctx.beginPath(); ctx.ellipse(cx,cy-28,18,12,0,Math.PI,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx-12,cy-24,7,6,-0.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+12,cy-24,7,6,0.5,0,Math.PI*2); ctx.fill();
  // eyes
  ctx.fillStyle='#442200'; ctx.beginPath(); ctx.arc(cx-6,cy-20,3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+6,cy-20,3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(cx-4,cy-22,1.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+8,cy-22,1.2,0,Math.PI*2); ctx.fill();
  // smile
  ctx.strokeStyle='#883322'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx-5,cy-11); ctx.quadraticCurveTo(cx,cy-8,cx+5,cy-11); ctx.stroke();
  // heart
  ctx.fillStyle='#ff6688'; ctx.font='18px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('♥',cx,cy+14);
  _atxt(ctx,'Rafik ♥',W/2,H-14,11,'#aabbff');
};

/* ── 21. Anime Baba ────────────────────────────────────*/
_acArtFns['anime_baba'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#100818','#200a2e');
  const cx=W/2, cy=H/2;
  // big anime eyes
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.ellipse(cx,cy-10,22,20,0,0,Math.PI*2); ctx.fill();
  // eyes — huge
  ctx.fillStyle='#2244aa'; ctx.beginPath(); ctx.ellipse(cx-9,cy-12,9,11,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+9,cy-12,9,11,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(cx-9,cy-12,5,7,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+9,cy-12,5,7,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(cx-6,cy-16,3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+12,cy-16,3,0,Math.PI*2); ctx.fill();
  // hair — flowing purple/blue
  ctx.fillStyle='#6622cc';
  ctx.beginPath(); ctx.ellipse(cx,cy-26,22,14,0,Math.PI,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx-22,cy-20); ctx.bezierCurveTo(cx-40,cy,cx-36,cy+40,cx-28,cy+60); ctx.lineTo(cx-16,cy+56); ctx.bezierCurveTo(cx-26,cy+36,cx-30,cy+2,cx-18,cy-14); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx+22,cy-20); ctx.bezierCurveTo(cx+40,cy,cx+36,cy+40,cx+28,cy+60); ctx.lineTo(cx+16,cy+56); ctx.bezierCurveTo(cx+26,cy+36,cx+30,cy+2,cx+18,cy-14); ctx.closePath(); ctx.fill();
  // blush
  ctx.fillStyle='rgba(255,150,150,0.4)'; ctx.beginPath(); ctx.ellipse(cx-16,cy-6,6,4,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+16,cy-6,6,4,0,0,Math.PI*2); ctx.fill();
  // mouth tiny
  ctx.fillStyle='#cc6688'; ctx.beginPath(); ctx.arc(cx,cy+2,3,0,Math.PI*2); ctx.fill();
  _atxt(ctx,'Anime Baba',W/2,H-14,11,'#cc88ff');
};

/* ── 22. Figurki ───────────────────────────────────────*/
_acArtFns['figurki'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#080a10','#10141e');
  // shelf
  ctx.fillStyle='#3a2810'; ctx.fillRect(0,H/2+10,W,8);
  ctx.fillStyle='#2a1c0a'; ctx.fillRect(0,H/2+16,W,4);
  // figurines
  const figs=[
    {x:W/2-35,c:'#cc4444',h:40},
    {x:W/2-14,c:'#4488cc',h:34},
    {x:W/2+5, c:'#44aa44',h:44},
    {x:W/2+26,c:'#cc8844',h:36},
  ];
  figs.forEach(({x,c,h})=>{
    ctx.fillStyle=c;
    // body
    ctx.beginPath(); ctx.roundRect(x-6,H/2+10-h,12,h*0.7,3); ctx.fill();
    // head
    ctx.beginPath(); ctx.arc(x,H/2+10-h-6,7,0,Math.PI*2); ctx.fill();
    // base
    ctx.fillStyle='#222'; ctx.fillRect(x-8,H/2+8,16,4);
    // face
    ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(x,H/2+10-h-6,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#000';
    ctx.beginPath(); ctx.arc(x-2,H/2+10-h-7,1,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+2,H/2+10-h-7,1,0,Math.PI*2); ctx.fill();
  });
  // stars on shelf decor
  _aem(ctx,'⭐',W/2,H-18,14);
  _atxt(ctx,'Figurki',W/2,H-14,11,'#aabbff');
};
