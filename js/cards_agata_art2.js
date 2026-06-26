'use strict';
/* ═══════════════════════════════════════════════════════
   Grafiki Kart Agaty — część 2 (karty 23–70)
   ═══════════════════════════════════════════════════════ */

/* ── 23. Wyjazd KKiS do Torunia ────────────────────────*/
_acArtFns['wyjazd_torun'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0a0c18','#14182e');
  ctx.fillStyle='#334'; ctx.fillRect(0,H-30,W,30);
  [[W/2-40,H-30,14,50],[W/2-20,H-30,12,40],[W/2+5,H-30,18,60],[W/2+30,H-30,12,42]].forEach(([x,y,w,h])=>{
    ctx.fillStyle='#2a2e40'; ctx.fillRect(x,y-h,w,h);
    ctx.beginPath(); ctx.moveTo(x,y-h); ctx.lineTo(x+w/2,y-h-12); ctx.lineTo(x+w,y-h); ctx.fill();
    ctx.fillStyle='#446688'; ctx.fillRect(x+w/2-2,y-h-4,4,6);
  });
  ctx.fillStyle='#cc3300'; ctx.beginPath(); ctx.roundRect(15,H-70,70,28,4); ctx.fill();
  ctx.fillStyle='#88ccff'; [30,50,70].forEach(x=>{ ctx.fillRect(x,H-66,12,12); });
  ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(30,H-42,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(70,H-42,5,0,Math.PI*2); ctx.fill();
  _atxt(ctx,'KKiS → Toruń',W/2,14,9,'#88aaff');
};

/* ── 24. Poznawanie Kolegów ────────────────────────────*/
_acArtFns['znajomi'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#050c0a','#0a1814');
  const ppl=[[W/2-36,'#cc4444'],[W/2-12,'#4488cc'],[W/2+12,'#44aa44'],[W/2+36,'#cc8844']];
  ppl.forEach(([x,c])=>{
    const cy=H/2+10;
    ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(x,cy+10,9,12,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(x,cy-8,9,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(x-3,cy-9,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+3,cy-9,1.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#884422'; ctx.lineWidth=1.5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x-3,cy-4); ctx.quadraticCurveTo(x,cy-2,x+3,cy-4); ctx.stroke();
  });
  ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.roundRect(W/2-55,15,38,20,5); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.roundRect(W/2+18,20,38,20,5); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='8px sans-serif'; ctx.textAlign='left';
  ctx.fillText('Hej!',W/2-50,28); ctx.fillText('Cześć!',W/2+22,33);
  _atxt(ctx,'Nowi Znajomi',W/2,H-14,10,'#88ffcc');
};

/* ── 25. Technikalia ───────────────────────────────────*/
_acArtFns['technikalia'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040c08','#080e10');
  ctx.strokeStyle='rgba(0,200,100,0.2)'; ctx.lineWidth=1;
  [[10,20,80,20],[10,20,10,80],[80,20,80,60],[40,50,40,100],[10,80,100,80]].forEach(([x1,y1,x2,y2])=>{
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    ctx.fillStyle='rgba(0,200,100,0.3)'; ctx.beginPath(); ctx.arc(x2,y2,3,0,Math.PI*2); ctx.fill();
  });
  ctx.strokeStyle='#00cc66'; ctx.lineWidth=3; ctx.shadowColor='#00ff88'; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.arc(W/2,H/2-8,26,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2,H/2-8,14,0,Math.PI*2); ctx.stroke();
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    ctx.beginPath(); ctx.moveTo(W/2+Math.cos(a)*26,H/2-8+Math.sin(a)*26);
    ctx.lineTo(W/2+Math.cos(a)*34,H/2-8+Math.sin(a)*34); ctx.stroke();
  }
  ctx.shadowBlur=0;
  _atxt(ctx,'TECHNIKALIA',W/2,H-18,10,'#00ff88');
  _atxt(ctx,'PG',W/2,H/2-8,14,'#00cc66');
};

/* ── 26. Spanie na Podłodze ────────────────────────────*/
_acArtFns['podloga'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#050508','#0a0a10');
  ctx.fillStyle='#1a1410'; ctx.fillRect(0,H-32,W,32);
  ctx.fillStyle='#224488'; ctx.beginPath(); ctx.roundRect(10,H-68,W-20,36,18); ctx.fill();
  ctx.fillStyle='#3355aa'; ctx.beginPath(); ctx.roundRect(12,H-66,W-24,20,16); ctx.fill();
  ctx.fillStyle='#eeeedd'; ctx.beginPath(); ctx.roundRect(16,H-72,30,14,6); ctx.fill();
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(30,H-72,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(200,220,255,0.7)'; ctx.font='bold 16px serif';
  ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillText('Z',60,H-74); ctx.font='12px serif'; ctx.fillText('Z',72,H-84); ctx.font='8px serif'; ctx.fillText('z',80,H-92);
  ctx.fillStyle='rgba(255,255,255,0.2)';
  [[20,15],[50,8],[90,12],[110,20],[70,6]].forEach(([x,y])=>{ ctx.beginPath(); ctx.arc(x,y,1,0,Math.PI*2); ctx.fill(); });
  _atxt(ctx,'Podłoga 💤',W/2,H-14,10,'#8899cc');
};

/* ── 27. Kabel HDMI 10m ────────────────────────────────*/
_acArtFns['hdmi'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0a0800','#141000');
  ctx.strokeStyle='#222'; ctx.lineWidth=8; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(20,H-25);
  ctx.bezierCurveTo(20,H/2,W-20,H/2,W-20,H/3);
  ctx.bezierCurveTo(W-20,20,20,20,20,H/3);
  ctx.bezierCurveTo(20,H*0.55,W-20,H*0.55,W-20,H-25);
  ctx.stroke();
  ctx.strokeStyle='#444'; ctx.lineWidth=6;
  ctx.beginPath(); ctx.moveTo(20,H-25);
  ctx.bezierCurveTo(20,H/2,W-20,H/2,W-20,H/3);
  ctx.bezierCurveTo(W-20,20,20,20,20,H/3);
  ctx.bezierCurveTo(20,H*0.55,W-20,H*0.55,W-20,H-25);
  ctx.stroke();
  ctx.fillStyle='#888'; ctx.beginPath(); ctx.roundRect(6,H-28,20,12,2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(W-26,H-28,20,12,2); ctx.fill();
  ctx.fillStyle='#aaa'; ctx.fillRect(10,H-26,12,8); ctx.fillRect(W-22,H-26,12,8);
  _atxt(ctx,'HDMI 10m',W/2,H-14,11,'#ffcc44');
};

/* ── 28. WD ─────────────────────────────────────────────*/
_acArtFns['wd'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040c14','#082030');
  ctx.fillStyle='#223344'; ctx.beginPath(); ctx.roundRect(W/2-38,H/2-28,76,56,8); ctx.fill();
  ctx.fillStyle='#334455'; ctx.beginPath(); ctx.roundRect(W/2-34,H/2-24,68,48,6); ctx.fill();
  ctx.strokeStyle='#445566'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(W/2-10,H/2,18,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2-10,H/2,6,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='#556677'; ctx.beginPath(); ctx.arc(W/2-10,H/2,5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#88aacc'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(W/2+28,H/2-20); ctx.lineTo(W/2-8,H/2+2); ctx.stroke();
  ctx.fillStyle='#aaccee'; ctx.beginPath(); ctx.arc(W/2+28,H/2-20,4,0,Math.PI*2); ctx.fill();
  _atxt(ctx,'WD',W/2+22,H/2+6,14,'#44aaff');
  _atxt(ctx,'Western Digital',W/2,H-14,8,'#88bbdd');
};

/* ── 29. DK ─────────────────────────────────────────────*/
_acArtFns['dk'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0a0808','#141010');
  ctx.fillStyle='#2a2030'; ctx.fillRect(10,30,W-20,H-55);
  ctx.fillStyle='#ffee88';
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    ctx.fillStyle=(Math.sin(r*4+c)>0)?'#ffee88':'#222';
    ctx.fillRect(20+c*24,40+r*22,16,14);
  }
  ctx.fillStyle='#554422'; ctx.fillRect(W/2-10,H-48,20,26);
  ctx.fillStyle='#886633'; ctx.beginPath(); ctx.arc(W/2,H-48,10,Math.PI,0); ctx.fill();
  ctx.fillStyle='#441188'; ctx.fillRect(W/2-16,H-66,32,14);
  _atxt(ctx,'DK',W/2,H-59,11,'#ffaaff');
  _atxt(ctx,'Dom Kultury',W/2,H-14,10,'#cc88ff');
};

/* ── 30. Praca ─────────────────────────────────────────*/
_acArtFns['praca'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040c08','#081410');
  ctx.fillStyle='#3a2810'; ctx.fillRect(0,H/2+20,W,8);
  ctx.fillStyle='#223344'; ctx.beginPath(); ctx.roundRect(W/2-32,H/2-40,64,60,5); ctx.fill();
  ctx.fillStyle='#88ffcc'; ctx.beginPath(); ctx.roundRect(W/2-28,H/2-36,56,48,3); ctx.fill();
  ctx.fillStyle='#002200'; ctx.font='7px monospace'; ctx.textAlign='left'; ctx.textBaseline='middle';
  ['for(i=0;i<100','  work();','  coffee++;','} // done?'].forEach((t,i)=>{
    ctx.fillText(t,W/2-26,H/2-28+i*10);
  });
  ctx.fillStyle='#334455'; ctx.fillRect(W/2-3,H/2+20,6,8); ctx.fillRect(W/2-16,H/2+26,32,5);
  ctx.fillStyle='#554422'; ctx.beginPath(); ctx.roundRect(W/2+30,H/2+5,16,20,3); ctx.fill();
  ctx.fillStyle='#220e00'; ctx.fillRect(W/2+32,H/2+8,12,14);
  _atxt(ctx,'Praca 💼',W/2,H-14,11,'#88ffcc');
};

/* ── 31. Redukcja ──────────────────────────────────────*/
_acArtFns['redukcja'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#140404','#200808');
  ctx.fillStyle='#f0f0e8'; ctx.beginPath(); ctx.roundRect(W/2-28,20,56,80,4); ctx.fill();
  ctx.fillStyle='#ccc'; [32,40,48,56,64].forEach(y=>{ ctx.fillRect(W/2-20,y,40,3); });
  ctx.strokeStyle='#cc0000'; ctx.lineWidth=6; ctx.lineCap='round'; ctx.globalAlpha=0.8;
  ctx.beginPath(); ctx.moveTo(W/2-22,26); ctx.lineTo(W/2+22,92); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2+22,26); ctx.lineTo(W/2-22,92); ctx.stroke();
  ctx.globalAlpha=1;
  ctx.strokeStyle='#888'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(W/2-40,H-28); ctx.lineTo(W/2-10,H-44); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2-40,H-40); ctx.lineTo(W/2-10,H-28); ctx.stroke();
  ctx.fillStyle='#666'; ctx.beginPath(); ctx.arc(W/2-40,H-34,6,0,Math.PI*2); ctx.fill();
  _atxt(ctx,'Redukcja',W/2,H-14,11,'#ff6666');
};

/* ── 32. Molo i Gofry ──────────────────────────────────*/
_acArtFns['molo_gofry'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040e18','#081828');
  ctx.fillStyle='#082040'; ctx.fillRect(0,H/2+5,W,H-H/2-5);
  ctx.strokeStyle='rgba(80,160,220,0.4)'; ctx.lineWidth=1.5;
  [H/2+15,H/2+28,H/2+42].forEach(y=>{
    ctx.beginPath(); ctx.moveTo(0,y); ctx.quadraticCurveTo(W/2,y-8,W,y); ctx.stroke();
  });
  ctx.fillStyle='#553320';
  for(let i=0;i<7;i++) ctx.fillRect(W/2-35+i*12,H/2-35,10,H/2+40);
  ctx.fillStyle='#3a2010';
  ctx.fillRect(W/2-38,H/2-35,80,7); ctx.fillRect(W/2-38,H/2-14,80,5); ctx.fillRect(W/2-38,H/2+5,80,5);
  ctx.fillStyle='#f0a040'; ctx.beginPath(); ctx.roundRect(W/2-18,20,36,36,4); ctx.fill();
  for(let r=0;r<3;r++) for(let c=0;c<3;c++) { ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(W/2-14+c*12,24+r*12,10,10); }
  ctx.fillStyle='#ff6644'; ctx.beginPath(); ctx.ellipse(W/2,26,8,5,0,0,Math.PI*2); ctx.fill();
  _atxt(ctx,'Molo i Gofry',W/2,H-14,10,'#88ccff');
};

/* ── 33. Piosenka dla Agaty ────────────────────────────*/
_acArtFns['piosenka'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0a0414','#14082a');
  ctx.strokeStyle='rgba(180,120,255,0.4)'; ctx.lineWidth=1;
  [H/2-20,H/2-12,H/2-4,H/2+4,H/2+12].forEach(y=>{
    ctx.beginPath(); ctx.moveTo(10,y); ctx.lineTo(W-10,y); ctx.stroke();
  });
  ctx.fillStyle='#cc66ff';
  [[W/2-25,H/2-12],[W/2-10,H/2-4],[W/2+5,H/2-16],[W/2+20,H/2-8]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.ellipse(x,y,5,4,-0.4,0,Math.PI*2); ctx.fill();
    ctx.fillRect(x+4,y-16,2,16);
  });
  ctx.fillStyle='#aa44ff'; ctx.font='28px serif'; ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillText('\u{1D11E}',12,H/2);
  ctx.fillStyle='#ff4488'; ctx.shadowColor='#ff2266'; ctx.shadowBlur=12;
  ctx.font='28px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('♥',W/2,H-36); ctx.shadowBlur=0;
  _atxt(ctx,'Piosenka ♪',W/2,H-14,10,'#cc88ff');
};

/* ── 34. Spóźnienie ────────────────────────────────────*/
_acArtFns['spoznienie'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0e0400','#1c0800');
  ctx.fillStyle='#fff'; ctx.shadowColor='#ff4400'; ctx.shadowBlur=16;
  ctx.beginPath(); ctx.arc(W/2,H/2-14,32,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6, r1=26, r2=30;
    ctx.strokeStyle='#444'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W/2+Math.cos(a)*r1,H/2-14+Math.sin(a)*r1);
    ctx.lineTo(W/2+Math.cos(a)*r2,H/2-14+Math.sin(a)*r2); ctx.stroke();
  }
  ctx.strokeStyle='#cc2200'; ctx.lineWidth=4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(W/2,H/2-14); ctx.lineTo(W/2+18,H/2-14-12); ctx.stroke();
  ctx.strokeStyle='#220000'; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(W/2,H/2-14); ctx.lineTo(W/2-10,H/2-14-14); ctx.stroke();
  ctx.fillStyle='#cc2200'; ctx.beginPath(); ctx.arc(W/2,H/2-14,4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(W/2+38,H/2+20,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3355aa'; ctx.fillRect(W/2+33,H/2+27,12,14);
  _atxt(ctx,'Spóznienie!',W/2,H-14,11,'#ff6622');
};

/* ── 35. Tupanie Nogą ──────────────────────────────────*/
_acArtFns['tupanie'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0e0404','#180808');
  ctx.strokeStyle='rgba(255,80,0,0.4)'; ctx.lineWidth=2;
  [24,38,52].forEach(r=>{
    ctx.beginPath(); ctx.ellipse(W/2,H-20,r,8,0,Math.PI,Math.PI*2); ctx.stroke();
  });
  ctx.fillStyle='#442211'; ctx.beginPath(); ctx.roundRect(W/2-16,H-70,32,50,6); ctx.fill();
  ctx.fillStyle='#221100'; ctx.beginPath(); ctx.roundRect(W/2-22,H-30,44,20,8); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W/2+24,H-22,12,8,0.2,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#ff6600'; ctx.lineWidth=2; ctx.lineCap='round';
  [[-35,-25],[-28,-40],[-20,-30],[35,-25],[28,-40],[20,-30]].forEach(([dx,dy])=>{
    ctx.beginPath(); ctx.moveTo(W/2+dx*0.5,H-18+dy*0.3); ctx.lineTo(W/2+dx,H-18+dy); ctx.stroke();
  });
  _aem(ctx,'\u{1F4A2}',W/2,H/2-20,32);
  _atxt(ctx,'Tupanie Nogą',W/2,H-14,10,'#ff6600');
};

/* ── 36. Seminarium Dyplomowe ──────────────────────────*/
_acArtFns['seminarium'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#080c04','#101808');
  ctx.fillStyle='#f5e8c0'; ctx.beginPath(); ctx.roundRect(W/2-38,25,76,80,4); ctx.fill();
  ctx.fillStyle='#e0d090';
  ctx.beginPath(); ctx.ellipse(W/2-38,65,8,40,Math.PI/2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W/2+38,65,8,40,Math.PI/2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#443300'; ctx.font='7px "Segoe UI"'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('DYPLOM',W/2,45); ctx.font='bold 8px "Segoe UI"'; ctx.fillText('LICENCJATA',W/2,56);
  ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.font='6px sans-serif';
  ['Agata','Stojałowska','Politechnika'].forEach((t,i)=>{ ctx.fillText(t,W/2,68+i*9); });
  ctx.fillStyle='#cc2200'; ctx.beginPath(); ctx.arc(W/2,90,10,0,Math.PI*2); ctx.fill();
  _aem(ctx,'\u{1F393}',W/2,H-26,28);
  _atxt(ctx,'Seminarium',W/2,H-14,10,'#88cc44');
};

/* ── 37. Giga Liga ─────────────────────────────────────*/
_acArtFns['giga_liga'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0a0800','#181200');
  ctx.fillStyle='#ffcc00'; ctx.shadowColor='#ffaa00'; ctx.shadowBlur=18;
  ctx.beginPath(); ctx.moveTo(W/2-30,40); ctx.bezierCurveTo(W/2-34,70,W/2+34,70,W/2+30,40); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffdd44'; ctx.beginPath(); ctx.arc(W/2,40,30,Math.PI,0); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#ffcc00'; ctx.fillRect(W/2-6,H/2+22,12,20); ctx.fillRect(W/2-18,H/2+40,36,8);
  ctx.strokeStyle='#ffcc00'; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(W/2-30,50); ctx.bezierCurveTo(W/2-48,50,W/2-48,66,W/2-30,66); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2+30,50); ctx.bezierCurveTo(W/2+48,50,W/2+48,66,W/2+30,66); ctx.stroke();
  _atxt(ctx,'GIGA LIGA',W/2,H-14,11,'#ffdd44');
};

/* ── 38. Kupowanie Ubrań ───────────────────────────────*/
_acArtFns['ubrania'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#10080c','#1c0c14');
  ctx.strokeStyle='#888'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(W/2,20); ctx.lineTo(W/2+2,28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2,28); ctx.lineTo(W/2-34,50); ctx.lineTo(W/2+34,50); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2+1,20,5,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='#cc4488';
  ctx.beginPath(); ctx.moveTo(W/2-26,50); ctx.lineTo(W/2-36,70); ctx.lineTo(W/2-36,H-30); ctx.lineTo(W/2+36,H-30); ctx.lineTo(W/2+36,70); ctx.lineTo(W/2+26,50); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#dd55aa'; ctx.fillRect(W/2-10,50,20,25);
  ctx.fillStyle='#ffee88'; ctx.beginPath(); ctx.roundRect(W/2+20,H-60,28,35,4); ctx.fill();
  ctx.strokeStyle='#dd9900'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(W/2+26,H-60); ctx.bezierCurveTo(W/2+24,H-68,W/2+40,H-68,W/2+38,H-60); ctx.stroke();
  _atxt(ctx,'Zakupy \u{1F457}',W/2,H-14,11,'#ff88cc');
};

/* ── 39. Wyjazd do Krakowa ─────────────────────────────*/
_acArtFns['krakow'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#080408','#10081a');
  ctx.fillStyle='#2a2035'; ctx.fillRect(W/2-45,H/2,90,H/2);
  [[W/2-42,H/2,10,H/2-35],[W/2-24,H/2,10,H/2-45],[W/2-8,H/2,12,H/2-55],[W/2+12,H/2,10,H/2-45],[W/2+32,H/2,10,H/2-35]].forEach(([x,y,w,h])=>{
    ctx.fillStyle='#2a2035'; ctx.fillRect(x,y-h,w,h);
    ctx.beginPath(); ctx.moveTo(x,y-h); ctx.lineTo(x+w/2,y-h-12); ctx.lineTo(x+w,y-h); ctx.fill();
  });
  ctx.fillStyle='#1a3a6a'; ctx.fillRect(0,H-26,W,26);
  _aem(ctx,'\u{1F409}',W/2,20,26);
  _atxt(ctx,'Kraków',W/2,H-14,11,'#cc88ff');
};

/* ── 40. Wyjazd do Wrocławia ───────────────────────────*/
_acArtFns['wroclaw'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#060810','#0c1018');
  ctx.fillStyle='#1a2030'; ctx.fillRect(W/2-30,H/2+10,60,H/2-10);
  [[W/2-20,H/2+10,14,60],[W/2+6,H/2+10,14,60]].forEach(([x,y,w,h])=>{
    ctx.fillStyle='#1e1632'; ctx.fillRect(x,y-h,w,h);
    ctx.beginPath(); ctx.moveTo(x,y-h); ctx.lineTo(x+w/2,y-h-18); ctx.lineTo(x+w,y-h); ctx.fill();
  });
  ctx.fillStyle='#ffdd44'; ctx.shadowColor='#ffaa00'; ctx.shadowBlur=8;
  ctx.fillRect(W/2-15,H/2-65,3,12); ctx.fillRect(W/2-18,H/2-60,9,3);
  ctx.fillRect(W/2+9,H/2-65,3,12); ctx.fillRect(W/2+6,H/2-60,9,3);
  ctx.shadowBlur=0;
  ctx.fillStyle='#cc4422'; ctx.beginPath(); ctx.moveTo(W/2+28,H-26); ctx.lineTo(W/2+20,H-50); ctx.lineTo(W/2+36,H-50); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(W/2+28,H-52,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#cc3300'; ctx.beginPath(); ctx.arc(W/2+28,H-60,9,Math.PI,0); ctx.fill();
  _atxt(ctx,'Wrocław',W/2,H-14,11,'#88aaff');
};

/* ── 41. Przywidz ──────────────────────────────────────*/
_acArtFns['przywidz'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#020c04','#041408');
  ctx.fillStyle='#0a2010';
  for(let i=0;i<8;i++){
    const x=i*18+4, h=50+i%3*20;
    ctx.beginPath(); ctx.moveTo(x,H-24); ctx.lineTo(x+8,H-24-h); ctx.lineTo(x+16,H-24); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#143c14'; ctx.fillRect(x+4,H-24,8,14); ctx.fillStyle='#0a2010';
  }
  ctx.fillStyle='#aa3300'; ctx.shadowColor='#ff6600'; ctx.shadowBlur=20;
  ctx.beginPath(); ctx.ellipse(W/2,H-24,12,6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ff6600';
  ctx.beginPath(); ctx.moveTo(W/2-8,H-24); ctx.lineTo(W/2,H-48); ctx.lineTo(W/2+8,H-24); ctx.fill();
  ctx.fillStyle='#ffcc00';
  ctx.beginPath(); ctx.moveTo(W/2-4,H-24); ctx.lineTo(W/2,H-40); ctx.lineTo(W/2+4,H-24); ctx.fill();
  ctx.shadowBlur=0;
  _atxt(ctx,'Przywidz \u{1F332}',W/2,H-14,10,'#88ff88');
};

/* ── 42. Park Oliwski (dzień) ──────────────────────────*/
_acArtFns['park_dzien'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#080e18','#101c28');
  ctx.fillStyle='#4488cc'; ctx.fillRect(0,0,W,H*0.55);
  ctx.fillStyle='#ffee44'; ctx.shadowColor='#ffcc00'; ctx.shadowBlur=22;
  ctx.beginPath(); ctx.arc(W-22,22,14,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
  ctx.fillStyle='#336622'; ctx.fillRect(0,H*0.55,W,H*0.45);
  ctx.fillStyle='#448833'; ctx.fillRect(0,H*0.55,W,12);
  [[W/2-35,H*0.48,'#2a5518',32],[W/2+30,H*0.44,'#1e4410',38]].forEach(([x,y,c,s])=>{
    ctx.fillStyle='#553311'; ctx.fillRect(x-4,y,8,26);
    ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,s/2,0,Math.PI*2); ctx.fill();
  });
  _atxt(ctx,'Park Oliwski ☀',W/2,H-14,9,'#ffffaa');
};

/* ── 43. Park Oliwski (noc) ────────────────────────────*/
_acArtFns['park_noc'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#020408','#060810');
  ctx.fillStyle='#0a0c20'; ctx.fillRect(0,0,W,H*0.55);
  ctx.fillStyle='#fffacc'; ctx.shadowColor='#fffacc'; ctx.shadowBlur=14;
  ctx.beginPath(); ctx.arc(W-22,22,12,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#0a0c20'; ctx.shadowBlur=0;
  ctx.beginPath(); ctx.arc(W-16,18,9,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)';
  [[10,10],[30,18],[55,8],[70,15],[90,6]].forEach(([x,y])=>{ ctx.beginPath(); ctx.arc(x,y,1.2,0,Math.PI*2); ctx.fill(); });
  ctx.fillStyle='#0e1e0a'; ctx.fillRect(0,H*0.55,W,H*0.45);
  [[W/2-35,H*0.48,'#0e2008',32],[W/2+30,H*0.44,'#081608',38]].forEach(([x,y,c,s])=>{
    ctx.fillStyle='#1a0e06'; ctx.fillRect(x-4,y,8,26);
    ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,s/2,0,Math.PI*2); ctx.fill();
  });
  ctx.strokeStyle='#887755'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(W/2+40,H*0.55); ctx.lineTo(W/2+40,H*0.2); ctx.lineTo(W/2+52,H*0.2); ctx.stroke();
  ctx.fillStyle='#ffee88'; ctx.shadowColor='#ffee88'; ctx.shadowBlur=16;
  ctx.beginPath(); ctx.arc(W/2+52,H*0.2,7,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
  _atxt(ctx,'Park Oliwski \u{1F319}',W/2,H-14,9,'#aabbff');
};

/* ── 44. Jesteś Zła? ───────────────────────────────────*/
_acArtFns['zla'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0e0404','#1c0808');
  const cx=W/2, cy=H/2-5;
  ctx.fillStyle='#f5a050'; ctx.shadowColor='#ff4400'; ctx.shadowBlur=10;
  ctx.beginPath(); ctx.arc(cx,cy,42,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
  ctx.strokeStyle='#2a1000'; ctx.lineWidth=5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx-28,cy-20); ctx.lineTo(cx-8,cy-12); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+28,cy-20); ctx.lineTo(cx+8,cy-12); ctx.stroke();
  ctx.fillStyle='#111';
  ctx.beginPath(); ctx.ellipse(cx-16,cy-8,8,7,0.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+16,cy-8,8,7,-0.2,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#2a1000'; ctx.lineWidth=4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx-18,cy+20); ctx.quadraticCurveTo(cx,cy+14,cx+18,cy+20); ctx.stroke();
  _atxt(ctx,'Jesteś Zła? \u{1F4A2}',W/2,H-14,9,'#ff6622');
};

/* ── 45. Kąpiel w Hotelu ───────────────────────────────*/
_acArtFns['kapiel'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#041418','#081e24');
  ctx.fillStyle='#e0eef5'; ctx.beginPath(); ctx.roundRect(10,H/2,W-20,H/2-16,12); ctx.fill();
  ctx.fillStyle='#4499bb'; ctx.beginPath(); ctx.roundRect(14,H/2+10,W-28,H/2-30,8); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.5)';
  [[30,H/2+8],[50,H/2+4],[70,H/2+10],[90,H/2+6],[110,H/2+3]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();
  });
  ctx.fillStyle='#f0c890'; ctx.beginPath(); ctx.ellipse(W-22,H/2+8,10,8,0.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W-38,H/2+6,9,7,0.2,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(200,230,255,0.4)'; ctx.lineWidth=2; ctx.lineCap='round';
  [[W/2-20,H/2-10],[W/2,H/2-6],[W/2+20,H/2-12]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x-6,y-16,x,y-28); ctx.stroke();
  });
  ctx.fillStyle='rgba(255,220,120,0.85)'; ctx.beginPath(); ctx.roundRect(10,12,52,18,4); ctx.fill();
  _atxt(ctx,'★ HOTEL ★',36,21,9,'#442200');
  _atxt(ctx,'Kąpiel \u{1F6C1}',W/2,H-14,11,'#88ddff');
};

/* ── 46. Pepsi Max ─────────────────────────────────────*/
_acArtFns['pepsi'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#020410','#040820');
  const cx=W/2, top=18, bot=H-18, cw=34;
  ctx.fillStyle='#000088'; ctx.beginPath(); ctx.roundRect(cx-cw/2,top,cw,bot-top,10); ctx.fill();
  ctx.fillStyle='#0033cc'; ctx.beginPath(); ctx.ellipse(cx,top+38,16,16,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#cc0000'; ctx.beginPath(); ctx.arc(cx,top+38,16,Math.PI*1.1,Math.PI*1.9); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath();
  ctx.moveTo(cx-16,top+38); ctx.bezierCurveTo(cx-8,top+28,cx+8,top+48,cx+16,top+38);
  ctx.bezierCurveTo(cx+8,top+42,cx-8,top+34,cx-16,top+38); ctx.fill();
  ctx.fillStyle='#000033'; ctx.fillRect(cx-cw/2,top+62,cw,22);
  _atxt(ctx,'MAX',cx,top+73,13,'#00aaff');
  ctx.fillStyle='#888'; ctx.beginPath(); ctx.ellipse(cx,top,cw/2,5,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx,bot,cw/2,5,0,0,Math.PI*2); ctx.fill();
  _atxt(ctx,'Pepsi Max',W/2,H-14,11,'#4488ff');
};

/* ── 47. Brak Ubrania/Butów ────────────────────────────*/
_acArtFns['brak_ubran'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0e0c00','#1a1600');
  ctx.strokeStyle='rgba(150,130,80,0.5)'; ctx.lineWidth=2;
  [W/2-28,W/2,W/2+28].forEach(x=>{
    ctx.beginPath(); ctx.moveTo(x,15); ctx.lineTo(x+1,22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+1,22); ctx.lineTo(x-22,38); ctx.lineTo(x+22,38); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x+1,15,4,0,Math.PI*2); ctx.stroke();
  });
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(W/2,H/2+10,28,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(W/2-10,H/2+4,3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2+10,H/2+4,3,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#884422'; ctx.lineWidth=2.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(W/2-10,H/2+22); ctx.quadraticCurveTo(W/2,H/2+18,W/2+10,H/2+22); ctx.stroke();
  _atxt(ctx,'Brak Rozmiaru',W/2,H-14,9,'#ffcc44');
};

/* ── 48. Stary Telefon ─────────────────────────────────*/
_acArtFns['stary_tel'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#080808','#121212');
  ctx.fillStyle='#1a1a2a'; ctx.beginPath(); ctx.roundRect(W/2-22,18,44,H-32,10); ctx.fill();
  ctx.fillStyle='#444'; ctx.beginPath(); ctx.roundRect(W/2-19,22,38,H-40,8); ctx.fill();
  ctx.fillStyle='#88cc44'; ctx.fillRect(W/2-14,28,28,24);
  ctx.fillStyle='#003300'; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('NOKIA',W/2,36); ctx.fillText('...|||||',W/2,44);
  ctx.fillStyle='#2a2a3a';
  for(let r=0;r<4;r++) for(let c=0;c<3;c++) { ctx.beginPath(); ctx.roundRect(W/2-18+c*13,60+r*14,10,10,2); ctx.fill(); }
  _atxt(ctx,'Nokia 3310',W/2,H-14,10,'#88cc44');
};

/* ── 49. Kajaki ────────────────────────────────────────*/
_acArtFns['kajaki'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040e18','#081828');
  ctx.fillStyle='#0a2a4a'; ctx.fillRect(0,H/2,W,H/2);
  ctx.strokeStyle='rgba(80,160,220,0.3)'; ctx.lineWidth=2;
  [H/2+15,H/2+30,H/2+48].forEach(y=>{
    ctx.beginPath(); ctx.moveTo(0,y); ctx.quadraticCurveTo(W/2,y-8,W,y); ctx.stroke();
  });
  ctx.fillStyle='#cc3300';
  ctx.beginPath(); ctx.moveTo(W/2-35,H/2+2); ctx.bezierCurveTo(W/2-20,H/2-10,W/2+20,H/2-10,W/2+35,H/2+2);
  ctx.bezierCurveTo(W/2+20,H/2+12,W/2-20,H/2+12,W/2-35,H/2+2); ctx.fill();
  ctx.fillStyle='#111'; ctx.beginPath(); ctx.ellipse(W/2,H/2,12,6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(W/2,H/2-10,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3355aa'; ctx.fillRect(W/2-5,H/2-4,10,8);
  ctx.strokeStyle='#aa6622'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(W/2-34,H/2-12); ctx.lineTo(W/2+34,H/2+4); ctx.stroke();
  _atxt(ctx,'Kajaki \u{1F6F6}',W/2,H-14,11,'#88ccff');
};

/* ── 50. Konafetto ─────────────────────────────────────*/
_acArtFns['konafetto'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#050520','#0a0a38');
  const cols=['#ff4444','#44ff88','#4488ff','#ffdd44','#ff44ff','#44ffff'];
  for(let i=0;i<24;i++){
    const x=10+Math.floor(i*W/24), y=10+((i*17)%(H-50)), w=6+i%5, h=4+i%4;
    ctx.save(); ctx.translate(x,y); ctx.rotate(i*0.4);
    ctx.fillStyle=cols[i%cols.length]; ctx.fillRect(-w/2,-h/2,w,h); ctx.restore();
  }
  ctx.fillStyle='#fff'; ctx.shadowColor='#ffdd44'; ctx.shadowBlur=10;
  _aem(ctx,'\u{1F38A}',W/2,H/2-10,36); ctx.shadowBlur=0;
  _atxt(ctx,'Konafetto!',W/2,H-14,11,'#ffdd88');
};

/* ── 51. Fotobudka ─────────────────────────────────────*/
_acArtFns['fotobudka'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0a0008','#140010');
  ctx.fillStyle='#f0f0e8'; ctx.beginPath(); ctx.roundRect(W/2-24,12,48,H-30,3); ctx.fill();
  const pcolors=['#4488cc','#cc4444','#44aa44','#cc8822'];
  for(let i=0;i<4;i++){
    const py=18+i*30;
    ctx.fillStyle=pcolors[i]; ctx.fillRect(W/2-20,py,40,24);
    ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(W/2,py+8,7,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(W/2-3,py+6,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(W/2+3,py+6,1.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#882200'; ctx.lineWidth=1.5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(W/2-3,py+11); ctx.quadraticCurveTo(W/2,py+13,W/2+3,py+11); ctx.stroke();
  }
  ctx.fillStyle='#ffee44'; ctx.shadowColor='#ffdd00'; ctx.shadowBlur=14;
  ctx.beginPath(); ctx.arc(W/2+30,20,8,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
  _atxt(ctx,'Fotobudka \u{1F4F8}',W/2,H-14,9,'#ffaaff');
};

/* ── 52. Uno Minecraft ─────────────────────────────────*/
_acArtFns['uno'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040808','#081010');
  ctx.fillStyle='#5a9e32'; ctx.fillRect(W/2-36,H/2-20,72,20);
  ctx.fillStyle='#8b5e3c'; ctx.fillRect(W/2-36,H/2,72,32);
  ctx.strokeStyle='rgba(0,0,0,0.2)'; ctx.lineWidth=1;
  for(let x=W/2-36;x<W/2+36;x+=12){ ctx.beginPath(); ctx.moveTo(x,H/2-20); ctx.lineTo(x,H/2+32); ctx.stroke(); }
  for(let y=H/2;y<H/2+32;y+=12){ ctx.beginPath(); ctx.moveTo(W/2-36,y); ctx.lineTo(W/2+36,y); ctx.stroke(); }
  ctx.fillStyle='#cc2200'; ctx.beginPath(); ctx.roundRect(W/2-16,H/2-58,32,46,4); ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(W/2-13,H/2-55,26,40,3); ctx.stroke();
  _atxt(ctx,'UNO',W/2,H/2-35,16,'#ffdd00');
  _atxt(ctx,'Uno Minecraft',W/2,H-14,9,'#88ff88');
};

/* ── 53. Studzenie Herbaty ─────────────────────────────*/
_acArtFns['herbata'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0c0800','#1a1000');
  ctx.fillStyle='#ddc8a0'; ctx.beginPath(); ctx.ellipse(W/2,H-22,34,10,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#e8d8b0'; ctx.beginPath(); ctx.roundRect(W/2-22,H-62,44,42,6); ctx.fill();
  ctx.fillStyle='#884400'; ctx.beginPath(); ctx.roundRect(W/2-16,H-56,32,30,3); ctx.fill();
  ctx.strokeStyle='#e8d8b0'; ctx.lineWidth=4; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(W/2+22,H-52); ctx.quadraticCurveTo(W/2+34,H-44,W/2+22,H-36); ctx.stroke();
  ctx.strokeStyle='rgba(200,180,120,0.5)'; ctx.lineWidth=2; ctx.lineCap='round';
  [[W/2-8,H-66],[W/2,H-68],[W/2+8,H-66]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x-6,y-15,x,y-28); ctx.stroke();
  });
  const fx=W/2-10, fy=H-82;
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(fx,fy,14,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(fx-5,fy-3,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(fx+5,fy-3,2,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#884422'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(fx,fy+4,4,0.1,Math.PI-0.1); ctx.stroke();
  _atxt(ctx,'Studzenie \u{1F375}',W/2,H-14,10,'#ffcc88');
};

/* ── 54. Umowy ze Sponsorami ───────────────────────────*/
_acArtFns['sponsorzy'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040c04','#080e08');
  ctx.fillStyle='#f0f0e4'; ctx.beginPath(); ctx.roundRect(W/2-30,18,60,70,4); ctx.fill();
  ctx.fillStyle='#444'; ctx.font='7px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='top';
  ['UMOWA','SPONSORSKA','','§1. Technikalia','§2. Wypłata','§3. Wymagania'].forEach((t,i)=>{
    ctx.fillText(t,W/2-25,24+i*10);
  });
  ctx.strokeStyle='#666'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(W/2-26,78); ctx.lineTo(W/2,78); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2+4,78); ctx.lineTo(W/2+26,78); ctx.stroke();
  _aem(ctx,'\u{1F91D}',W/2,H-30,32);
  _atxt(ctx,'Sponsorzy',W/2,H-14,11,'#88ff88');
};

/* ── 55. Wyjazd do Pragi ───────────────────────────────*/
_acArtFns['praga'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#08040e','#100818');
  ctx.fillStyle='#1a1028'; ctx.fillRect(0,H/2+20,W,H/2-20);
  ctx.fillStyle='#120e22';
  for(let i=0;i<5;i++) { ctx.beginPath(); ctx.arc(14+i*24,H/2+20,12,Math.PI,0); ctx.fill(); }
  [[W/2-30,H/2+20,14,50],[W/2+16,H/2+20,14,44]].forEach(([x,y,w,h])=>{
    ctx.fillStyle='#1e1632'; ctx.fillRect(x,y-h,w,h);
    ctx.beginPath(); ctx.moveTo(x,y-h); ctx.lineTo(x+w/2,y-h-18); ctx.lineTo(x+w,y-h); ctx.fill();
  });
  ctx.fillStyle='#fffacc'; ctx.shadowColor='#fffacc'; ctx.shadowBlur=10;
  ctx.beginPath(); ctx.arc(W-18,18,10,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
  ctx.fillStyle='#1a2a50'; ctx.fillRect(0,H/2+18,W,6);
  _atxt(ctx,'Praha \u{1F3F0}',W/2,H-14,11,'#aa88ff');
};

/* ── 56. Powrót z Armaty ───────────────────────────────*/
_acArtFns['powrot_armata'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0a0808','#181010');
  ctx.fillStyle='#333'; ctx.beginPath(); ctx.roundRect(10,H/2,70,24,8); ctx.fill();
  ctx.fillStyle='#444'; ctx.beginPath(); ctx.ellipse(82,H/2+12,14,12,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(82,H/2+12,6,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#555';
  ctx.beginPath(); ctx.arc(25,H/2+24,10,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(60,H/2+24,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#aaa'; ctx.shadowColor='#ffaa44'; ctx.shadowBlur=10;
  ctx.beginPath(); ctx.arc(W-18,H/2-28,10,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(255,180,80,0.5)'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(82,H/2+6); ctx.bezierCurveTo(W/2,H/2-40,W-30,H/2-20,W-18,H/2-28); ctx.stroke();
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(W-18,H/2-44,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3344aa'; ctx.fillRect(W-24,H/2-36,12,14);
  _atxt(ctx,'Armata! \u{1F4A5}',W/2,H-14,11,'#ffcc44');
};

/* ── 57. Gofry z Bitą Śmietaną ────────────────────────*/
_acArtFns['gofry_smietana'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#100800','#1c1000');
  ctx.fillStyle='#c87820'; ctx.beginPath(); ctx.roundRect(W/2-36,H/2-18,72,52,6); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,0.2)';
  for(let r=0;r<4;r++) for(let c=0;c<5;c++) ctx.fillRect(W/2-33+c*14,H/2-14+r*12,11,9);
  ctx.fillStyle='#fffdf8'; ctx.shadowColor='#fff'; ctx.shadowBlur=6;
  ctx.beginPath(); ctx.arc(W/2,H/2-22,20,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2-14,H/2-16,14,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2+14,H/2-16,14,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#cc2222'; ctx.beginPath(); ctx.arc(W/2+2,H/2-36,7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,252,240,0.7)';
  [[W/2-30,H/2+20],[W/2+28,H/2+26],[W/2,H/2+38]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fill();
  });
  _atxt(ctx,'Gofry + śmietana',W/2,H-14,9,'#ffcc88');
};

/* ── 58. Koledzy z Ostródy ─────────────────────────────*/
_acArtFns['ostroda'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040c04','#081408');
  const ppl=[{x:18,c:'#cc4444'},{x:38,c:'#4488cc'},{x:W/2,c:'#aa44cc'},{x:W/2+20,c:'#44aa44'},{x:W/2+40,c:'#cc8822'}];
  ppl.forEach(({x,c})=>{
    const cy=H/2+10;
    ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(x,cy+10,9,12,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(x,cy-8,9,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(x-3,cy-9,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+3,cy-9,1.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#884422'; ctx.lineWidth=1.5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x-3,cy-4); ctx.quadraticCurveTo(x,cy-2,x+3,cy-4); ctx.stroke();
  });
  ctx.fillStyle='#336633'; ctx.fillRect(W/2-22,18,44,22);
  _atxt(ctx,'OSTRÓDA',W/2,29,10,'#ccffcc');
  _atxt(ctx,'Ekipa Ostródy',W/2,H-14,9,'#88cc88');
};

/* ── 59. Sanatorium Miłości ────────────────────────────*/
_acArtFns['sanatorium'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0e0408','#1c0810');
  ctx.fillStyle='#1a1a2a'; ctx.beginPath(); ctx.roundRect(10,14,W-20,H-38,8); ctx.fill();
  ctx.fillStyle='#223'; ctx.beginPath(); ctx.roundRect(14,18,W-28,H-46,6); ctx.fill();
  ctx.fillStyle='#f5c8a8'; ctx.beginPath(); ctx.arc(W/2-18,H/2-8,16,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f5d0b8'; ctx.beginPath(); ctx.arc(W/2+18,H/2-8,16,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#333';
  ctx.beginPath(); ctx.arc(W/2-22,H/2-10,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2-14,H/2-10,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2+14,H/2-10,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2+22,H/2-10,2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ff4488'; ctx.shadowColor='#ff2266'; ctx.shadowBlur=8;
  ctx.font='16px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('♥',W/2,H/2-10); ctx.shadowBlur=0;
  ctx.fillStyle='#333'; ctx.fillRect(W/2-3,H-26,6,8); ctx.fillRect(W/2-14,H-20,28,6);
  ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(14,H-46,W-28,16);
  _atxt(ctx,'SANATORIUM',W/2,H-38,8,'#ffaacc');
  _atxt(ctx,'Sanatorium ❤',W/2,H-14,9,'#ff88bb');
};

/* ── 60. Szukanie Mieszkania ───────────────────────────*/
_acArtFns['mieszkanie'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040c08','#081814');
  ctx.strokeStyle='#88aacc'; ctx.lineWidth=5; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(W/2-10,H/2-8,30,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2+12,H/2+14); ctx.lineTo(W/2+34,H/2+38); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(W/2-10,H/2-8,28,0,Math.PI*2); ctx.clip();
  ctx.fillStyle='#c8e8c0'; ctx.fillRect(W/2-38,H/2-36,56,36);
  ctx.fillStyle='#cc4422'; ctx.beginPath(); ctx.moveTo(W/2-38,H/2-36); ctx.lineTo(W/2-10,H/2-56); ctx.lineTo(W/2+18,H/2-36); ctx.fill();
  ctx.fillStyle='#4a3820'; ctx.fillRect(W/2-18,H/2-28,12,20);
  ctx.restore();
  ctx.fillStyle='rgba(255,180,80,0.8)'; ctx.shadowColor='#ffaa00'; ctx.shadowBlur=6;
  ctx.font='bold 20px "Segoe UI"'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('?',W/2-10,H/2-8); ctx.shadowBlur=0;
  _atxt(ctx,'Szukanie Mieszk.',W/2,H-14,9,'#88ccaa');
};

/* ── 61. Wiadukt ───────────────────────────────────────*/
_acArtFns['wiadukt'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040810','#08101e');
  ctx.fillStyle='#2a3040'; ctx.fillRect(0,H/2-8,W,20);
  [[W/2-32,H/2+12],[W/2,H/2+12],[W/2+32,H/2+12]].forEach(([x,y])=>{
    ctx.fillStyle='#333a4a'; ctx.fillRect(x-6,y,12,H/2-y+10);
  });
  ctx.fillStyle='#242a38';
  [[W/2-32,H/2+12],[W/2,H/2+12]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(x+16,y,18,0,Math.PI); ctx.fill();
  });
  ctx.strokeStyle='#4a5568'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(0,H/2-10); ctx.lineTo(W,H/2-10); ctx.stroke();
  for(let x=5;x<W;x+=12){ ctx.beginPath(); ctx.moveTo(x,H/2-10); ctx.lineTo(x,H/2-20); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(0,H/2-20); ctx.lineTo(W,H/2-20); ctx.stroke();
  ctx.fillStyle='#cc3333'; ctx.beginPath(); ctx.roundRect(W/2-18,H/2-24,36,14,3); ctx.fill();
  ctx.fillStyle='#88ccff'; ctx.fillRect(W/2-14,H/2-22,12,8); ctx.fillRect(W/2+2,H/2-22,12,8);
  _atxt(ctx,'Wiadukt',W/2,H-14,11,'#88aacc');
};

/* ── 62. Zaspa ─────────────────────────────────────────*/
_acArtFns['zaspa'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040810','#08101e');
  const blocks=[[4,H/2+5,W/3-4,H/2-5],[W/3+2,H/2-10,W/3-4,H/2+10],[2*W/3+2,H/2,W/3-4,H/2]];
  blocks.forEach(([x,y,w,h])=>{
    ctx.fillStyle='#1e2535'; ctx.fillRect(x,y,w,h);
    for(let r=0;r<4;r++) for(let c=0;c<Math.floor(w/18);c++){
      ctx.fillStyle=(r+c)%2===0?'#ffee88':'#111';
      ctx.fillRect(x+4+c*16,y+8+r*18,10,10);
    }
  });
  _aem(ctx,'\u{1F3A8}',W/3+W/6,H/2+10,36);
  _atxt(ctx,'Zaspa \u{1F5BC}',W/2,H-14,11,'#ff88cc');
};

/* ── 63. Kinderki ──────────────────────────────────────*/
_acArtFns['kinderki'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0c0008','#180010');
  ctx.fillStyle='#d05010'; ctx.beginPath(); ctx.ellipse(W/2,H/2-5,34,42,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f8f0e0'; ctx.beginPath();
  ctx.moveTo(W/2-34,H/2-5);
  ctx.bezierCurveTo(W/2-34,H/2+5,W/2+34,H/2+5,W/2+34,H/2-5);
  ctx.bezierCurveTo(W/2+34,H/2-15,W/2-34,H/2-15,W/2-34,H/2-5); ctx.fill();
  _atxt(ctx,'Kinder',W/2,H/2-5,10,'#cc3300');
  ctx.fillStyle='#ffcc00'; ctx.shadowColor='#ffcc00'; ctx.shadowBlur=8;
  ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('⭐',W/2,H-36); ctx.shadowBlur=0;
  _atxt(ctx,'Kinderki \u{1F36B}',W/2,H-14,11,'#ffbb44');
};

/* ── 64. Zumba ─────────────────────────────────────────*/
_acArtFns['zumba'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0e0208','#1c0410');
  const dlcols=['#ff4488','#44aaff','#ffdd44','#44ff88'];
  for(let i=0;i<6;i++){
    ctx.fillStyle=dlcols[i%4]+'44';
    ctx.beginPath(); ctx.moveTo(W/2,0);
    const a1=Math.PI*0.3+i*Math.PI/4, a2=a1+0.3;
    ctx.arc(W/2,0,H,a1,a2); ctx.closePath(); ctx.fill();
  }
  const cx=W/2, cy=H/2+5;
  ctx.fillStyle='#ff44aa'; ctx.beginPath(); ctx.ellipse(cx,cy,14,20,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(cx,cy-26,12,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#ff44aa'; ctx.lineWidth=5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx-14,cy-8); ctx.lineTo(cx-32,cy-28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+14,cy-8); ctx.lineTo(cx+32,cy-28); ctx.stroke();
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(cx-32,cy-28,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+32,cy-28,5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#cc1166'; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(cx-8,cy+18); ctx.lineTo(cx-28,cy+42); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+8,cy+18); ctx.lineTo(cx+28,cy+42); ctx.stroke();
  _atxt(ctx,'Zumba \u{1F483}',W/2,H-14,11,'#ff44aa');
};

/* ── 65. Licencjat ─────────────────────────────────────*/
_acArtFns['licencjat'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040e08','#081c10');
  ctx.fillStyle='#1a1408'; ctx.shadowColor='#ffcc00'; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.rect(W/2-36,H/2-22,72,14); ctx.fill();
  ctx.beginPath(); ctx.moveTo(W/2,H/2-38); ctx.lineTo(W/2-36,H/2-22); ctx.lineTo(W/2+36,H/2-22); ctx.closePath(); ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#ffdd44'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(W/2+36,H/2-22); ctx.lineTo(W/2+36,H/2+8); ctx.stroke();
  ctx.fillStyle='#f5e8c0'; ctx.beginPath(); ctx.roundRect(W/2-26,H/2+5,52,44,4); ctx.fill();
  ctx.fillStyle='rgba(150,100,0,0.3)'; ctx.fillRect(W/2-22,H/2+12,44,3); ctx.fillRect(W/2-22,H/2+20,44,3);
  ctx.fillStyle='#442200'; ctx.font='bold 8px "Segoe UI"'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('LICENCJAT',W/2,H/2+30);
  ctx.fillStyle='#cc2200'; ctx.beginPath(); ctx.arc(W/2,H/2+40,5,0,Math.PI*2); ctx.fill();
  _atxt(ctx,'Licencjat \u{1F393}',W/2,H-14,10,'#88ffaa');
};

/* ── 66. Walka z Krokodylami ───────────────────────────*/
_acArtFns['krokodyle'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#020c04','#041408');
  ctx.fillStyle='#1a3a10'; ctx.fillRect(0,H/2+10,W,H/2-10);
  ctx.strokeStyle='rgba(40,100,20,0.4)'; ctx.lineWidth=2;
  [H/2+22,H/2+38,H/2+54].forEach(y=>{
    ctx.beginPath(); ctx.moveTo(0,y); ctx.quadraticCurveTo(W/2,y-6,W,y); ctx.stroke();
  });
  ctx.fillStyle='#2a5c14'; ctx.beginPath(); ctx.ellipse(W/2-20,H/2+16,24,8,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#aaff44'; ctx.shadowColor='#88ff22'; ctx.shadowBlur=8;
  ctx.beginPath(); ctx.arc(W/2-28,H/2+12,4,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2-10,H/2+12,4,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(W/2-28,H/2+12,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2-10,H/2+12,2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f5d8b8'; ctx.beginPath(); ctx.arc(W/2,H/2-12,9,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#cc4422'; ctx.fillRect(W/2-6,H/2-3,12,16);
  ctx.strokeStyle='#cccccc'; ctx.lineWidth=3; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(W/2+8,H/2-8); ctx.lineTo(W/2+28,H/2-30); ctx.stroke();
  _atxt(ctx,'Krokodyle \u{1F40A}',W/2,H-14,10,'#44ff44');
};

/* ── 67. Icówka ────────────────────────────────────────*/
_acArtFns['iceowka'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#040c14','#081828');
  ctx.fillStyle='#ee4466'; ctx.shadowColor='#cc2244'; ctx.shadowBlur=10;
  ctx.beginPath(); ctx.roundRect(W/2-20,14,40,H-50,8); ctx.fill(); ctx.shadowBlur=0;
  ctx.fillStyle='#ff6644'; ctx.fillRect(W/2-20,14,40,20);
  ctx.fillStyle='#ffaacc'; ctx.fillRect(W/2-20,H/2-20,40,16);
  ctx.fillStyle='#d4a462'; ctx.beginPath(); ctx.roundRect(W/2-5,H-38,10,30,3); ctx.fill();
  ctx.fillStyle='#ee4466'; ctx.beginPath(); ctx.arc(W/2+18,H/2+10,6,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.7)';
  [[W/2-12,25],[W/2+8,35],[W/2-6,50]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill();
  });
  _atxt(ctx,'Icówka \u{1F366}',W/2,H-14,11,'#ffaacc');
};

/* ── 68. Pomidorowa na Grillu ──────────────────────────*/
_acArtFns['pomidorowa'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0c0404','#180808');
  ctx.fillStyle='#2a2020'; ctx.beginPath(); ctx.ellipse(W/2,H/2+30,40,14,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#444'; ctx.lineWidth=3;
  for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(W/2+i*14,H/2+18); ctx.lineTo(W/2+i*14,H/2+42); ctx.stroke(); }
  ctx.fillStyle='#cc2800'; ctx.beginPath(); ctx.ellipse(W/2,H/2-5,32,12,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#aa1c00'; ctx.beginPath(); ctx.moveTo(W/2-32,H/2-5); ctx.bezierCurveTo(W/2-28,H/2+22,W/2+28,H/2+22,W/2+32,H/2-5); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ee3300'; ctx.beginPath(); ctx.ellipse(W/2,H/2-5,30,11,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(255,252,240,0.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(W/2,H/2-14); ctx.bezierCurveTo(W/2+12,H/2-12,W/2+14,H/2-4,W/2+2,H/2); ctx.stroke();
  ctx.strokeStyle='rgba(255,200,180,0.4)'; ctx.lineWidth=2; ctx.lineCap='round';
  [[W/2-10,H/2-18],[W/2+8,H/2-16]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x-4,y-12,x,y-22); ctx.stroke();
  });
  _atxt(ctx,'Pomidorowa \u{1F345}',W/2,H-14,9,'#ff8866');
};

/* ── 69. Słońca (w Toruniu) ────────────────────────────*/
_acArtFns['slonca'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#0a0400','#180800');
  [[W/2,H/2-10,36,'#ffcc00'],[W/2-30,H/2+18,20,'#ffaa00'],[W/2+30,H/2+14,18,'#ffdd44']].forEach(([x,y,r,c])=>{
    ctx.strokeStyle=c+'aa'; ctx.lineWidth=3; ctx.lineCap='round';
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*(r+4),y+Math.sin(a)*(r+4));
      ctx.lineTo(x+Math.cos(a)*(r+14),y+Math.sin(a)*(r+14)); ctx.stroke();
    }
    ctx.fillStyle=c; ctx.shadowColor=c; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle='rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.arc(x-r*0.3,y-r*0.1,r*0.12,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+r*0.3,y-r*0.1,r*0.12,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=r*0.08; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(x,y+r*0.1,r*0.32,0.1,Math.PI-0.1); ctx.stroke();
  });
  _atxt(ctx,'Słońca (Toruń)',W/2,H-14,10,'#ffee44');
};

/* ── 70. Peppepepe ─────────────────────────────────────*/
_acArtFns['peppepepe'] = (ctx,W,H) => {
  _abg(ctx,W,H,'#060408','#100810');
  ctx.fillStyle='#ff4488'; ctx.shadowColor='#ff2266'; ctx.shadowBlur=10;
  ctx.font='bold 32px "Segoe UI"'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('PEP',W/2,H/2-28);
  ctx.fillStyle='#4488ff'; ctx.shadowColor='#2244ff'; ctx.shadowBlur=10;
  ctx.fillText('PE',W/2,H/2+2);
  ctx.fillStyle='#44ff88'; ctx.shadowColor='#22ff66'; ctx.shadowBlur=10;
  ctx.fillText('PE',W/2,H/2+32);
  ctx.shadowBlur=0;
  const dots=['#ff4488','#4488ff','#44ff88','#ffdd44','#ff88ff'];
  for(let i=0;i<16;i++){
    const a=i*Math.PI/8;
    ctx.fillStyle=dots[i%5];
    ctx.beginPath(); ctx.arc(W/2+Math.cos(a)*50*0.5,H/2+Math.sin(a)*50*0.4,3+i%3,0,Math.PI*2); ctx.fill();
  }
  _atxt(ctx,'peppepepe \u{1F3B6}',W/2,H-14,10,'#ff88ff');
};
