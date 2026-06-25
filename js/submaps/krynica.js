'use strict';

/* ══════════════════════════════════════════════════════
   Krynica Morska — diagonal strip
   Bałtyk (górny-lewy) ↔ Zalew Wiślany (dolny-prawy)
   Mapa: 1600 x 1100
   ══════════════════════════════════════════════════════ */

/* ── Q10/Q11 quest state ── */
const _KM_QUEST = {
  state: 'inactive',
  nextState: null,
  trigCD: 0,
  q10Kills: 0,
  entryTriggered: false,
  rafalX: 730, rafalY: 480, rafalActive: false, /* Rafał follow position in Krynica submap */
};
function _kmqNext(s) { _KM_QUEST.nextState = s; }

/* ── Rafał position in Krynica (visible during Q11 disco) ── */
const _KM_RAFAL = { x: 1113, y: 555, visible: false };

const _KM = { topA: 170, botA: 560, slope: 0.22 };
_KM.halfW = (_KM.botA - _KM.topA) / 2; // 195

function _kmBounds(x) {
  return {
    yTop: _KM.topA + _KM.slope * x,
    yBot: _KM.botA + _KM.slope * x,
  };
}
function _kmCenter(x) { return _KM.topA + _KM.halfW + _KM.slope * x; }

/* ══════════════════════════════════════════════════════
   Kolega Rafała — AI
   ══════════════════════════════════════════════════════ */
const _KM_RES = {cx: 730, cy: 505}; // centrum Restauracji
const _KM_KOLEGA_SPAWNS = [
  {x: 618, y: 455},
  {x: 798, y: 492},
];

const _KM_ST = {
  kolegas:       [],
  spawned:       false,
  playerAttTimer: 0,
  playerHitFlash: 0,
  domCooldown:   0,
  resCooldown:   0,
  discoCooldown: 0,
  plazaCooldown: 0,
};

function _spawnKolegas() {
  _KM_ST.kolegas = _KM_KOLEGA_SPAWNS.map((pos, i) => ({
    id: i,
    _x: pos.x, _y: pos.y,
    hp: 120, maxHp: 120,
    alive: true,
    speed: 90,
    stepAnim: 0, _dir: 1,
    aiState: 'patrol',
    attackTimer: 0, hitFlash: 0,
    patrolTimer: i * 0.9,
    patrolDX: Math.cos(i * 1.8 + 1),
    patrolDY: Math.sin(i * 1.8 + 1),
    respawnTimer: 0,
  }));
}

function updateKrynicaQuests(dt, sp) {
  const st  = _KM_ST;
  const Q   = _KM_QUEST;
  const dtS = dt / 1000;

  if (!st.spawned) { _spawnKolegas(); st.spawned = true; }

  st.playerHitFlash = Math.max(0, st.playerHitFlash - dtS * 3);
  st.domCooldown    = Math.max(0, st.domCooldown    - dtS);
  st.resCooldown    = Math.max(0, st.resCooldown    - dtS);
  st.discoCooldown  = Math.max(0, st.discoCooldown  - dtS);
  st.plazaCooldown  = Math.max(0, st.plazaCooldown  - dtS);
  Q.trigCD          = Math.max(0, Q.trigCD - dtS);

  /* ── advance nextState when dialog closed ── */
  if (Q.nextState && !isDialogOpen()) {
    const prev = Q.state;
    Q.state = Q.nextState; Q.nextState = null;
    /* when transitioning to q10_follow: spawn Rafał near Restauracja */
    if (Q.state === 'q10_follow' && prev === 'q10_fight') {
      Q.rafalX = 700; Q.rafalY = 490; Q.rafalActive = true;
    }
  }

  /* ── Q10 follow: Rafał trails player in Krynica ── */
  if (Q.state === 'q10_follow' && Q.rafalActive) {
    const rdx = sp.x - Q.rafalX, rdy = sp.y - Q.rafalY;
    const rdist = Math.hypot(rdx, rdy) || 1;
    if (rdist > 65) {
      const rspd = 115 * dtS;
      Q.rafalX += (rdx / rdist) * rspd;
      Q.rafalY += (rdy / rdist) * rspd;
    }
  }

  if (!isDialogOpen()) {
    /* Q10: entry trigger */
    if (Q.state === 'q10_ready' && !Q.entryTriggered) {
      Q.entryTriggered = true;
      showDialog('😤', 'Matko jedyna, Rafał znowu rozmawia z kolegami których nawet nie zna. Tym razem ich pobije i zabiorę Rafała od razu do domu');
      _kmqNext('q10_fight');
    }

    /* Q11: entry trigger — Rafał at disco */
    if (Q.state === 'q11_search' && !Q.entryTriggered) {
      Q.entryTriggered = true;
      _KM_RAFAL.visible = true;
      showDialog('😲', 'Rafał? Co ty tu robisz na dyskotece?!');
      _kmqNext('q11_disco');
    }

    /* Q11_disco: approach dyskoteka to trigger proposal */
    if (Q.state === 'q11_disco' && Q.trigCD <= 0 && Math.hypot(sp.x - 1113, sp.y - 577) < 75) {
      Q.trigCD = 12;
      _openProposalScene(() => {
        showDialog('💍', 'Na 100% znowu nie będzie tego pamiętać, ale trudno, przynajmniej mam pierścionek, teraz trzeba iść coś zjeść, najlepiej znowu na Hel');
        Q.state = 'q11_done';
        _KM_RAFAL.visible = false;
      });
    }

    /* Normal building dialogs — skip disco dialog during Q11 */
    if (st.domCooldown <= 0 && Math.hypot(sp.x - 289, sp.y - 371) < 62) {
      showDialog('🏠', 'Dom Igiego!\nSłynna wakacyjna baza wypadowa.\nNajlepsze kanapki w całej Krynicy Morskiej! 🥪');
      st.domCooldown = 9;
    }
    if (st.resCooldown <= 0 && Math.hypot(sp.x - 730, sp.y - 505) < 66) {
      showDialog('🍴', 'Restauracja w Krynicy Morskiej.\nRybka prosto z morza i pierogi z kapustą.\nUważaj na kumpli przy barze... 👀');
      st.resCooldown = 9;
    }
    if (Q.state !== 'q11_disco' && st.discoCooldown <= 0 && Math.hypot(sp.x - 1113, sp.y - 577) < 62) {
      showDialog('🎵', 'Dyskoteka — Krynica Morska edition!\nNajlepsza impreza na Mierzei Wiślanej!\nDJ gra do białego rana 🌅');
      st.discoCooldown = 9;
    }
    if (st.plazaCooldown <= 0 && Math.hypot(sp.x - 420, sp.y - 290) < 58) {
      showDialog('🐊', 'Plaża z Krokodylami!\nPonoć kiedyś tu pływały krokodyle bałtyckie...\nNo dobra, to tylko piasek. Ale fajnie brzmi! 🏖️');
      st.plazaCooldown = 10;
    }
  }

  /* ─ Kolega AI ─ */
  st.playerAttTimer += dtS;
  const pa = st.playerAttTimer >= 1;
  if (pa) st.playerAttTimer = 0;

  const playerNearRes = Math.hypot(sp.x - _KM_RES.cx, sp.y - _KM_RES.cy) < 290;

  for (const en of st.kolegas) {
    if (!en.alive) {
      /* skip respawn during Q10 fight */
      if (Q.state === 'q10_fight') continue;
      en.respawnTimer -= dtS;
      if (en.respawnTimer <= 0) {
        const s2 = _KM_KOLEGA_SPAWNS[en.id];
        en._x = s2.x; en._y = s2.y;
        en.hp = en.maxHp; en.alive = true;
        en.aiState = 'patrol'; en.attackTimer = 0; en.hitFlash = 0;
      }
      continue;
    }

    en.hitFlash = Math.max(0, en.hitFlash - dtS * 4);
    const dx = sp.x - en._x, dy = sp.y - en._y, dist = Math.hypot(dx, dy) || 0.01;

    if (playerNearRes && dist < 240) en.aiState = 'chase';
    else if (!playerNearRes || dist > 390) { en.aiState = 'patrol'; en.attackTimer = 0; }

    if (en.aiState === 'chase') {
      const spd = en.speed * dtS;
      en._x += (dx/dist)*spd; en._y += (dy/dist)*spd;
      en._dir = dx >= 0 ? 1 : -1;
      en.stepAnim += spd * 0.07;
      en._x = Math.max(30, Math.min(1570, en._x));
      const bc = _kmBounds(en._x);
      en._y = Math.max(bc.yTop+15, Math.min(bc.yBot-15, en._y));
      if (dist < 60) {
        en.attackTimer += dtS;
        if (en.attackTimer >= 1) { en.attackTimer = 0; applyZdenerwowanie(12); st.playerHitFlash = 1; }
      } else { en.attackTimer = 0; }
    } else {
      en.patrolTimer += dtS;
      if (en.patrolTimer > 2.5) {
        en.patrolTimer = 0;
        const a = Math.random() * Math.PI * 2;
        en.patrolDX = Math.cos(a); en.patrolDY = Math.sin(a);
      }
      const spd = en.speed * 0.35 * dtS;
      en._x += en.patrolDX * spd; en._y += en.patrolDY * spd;
      en._x = Math.max(530, Math.min(900, en._x));
      const bp = _kmBounds(en._x);
      en._y = Math.max(bp.yTop+15, Math.min(bp.yBot-15, en._y));
      en._dir = en.patrolDX >= 0 ? 1 : -1;
      en.stepAnim += spd * 0.07;
      en.attackTimer = 0;
    }

    if (pa && dist < 60) {
      en.hp -= 15; en.hitFlash = 1;
      spawnHitEffect(en._x, en._y, 15);
      if (en.hp <= 0) {
        en.alive = false; en.respawnTimer = 15 + Math.random()*7; addZlote(25);
        if (Q.state === 'q10_fight') {
          Q.q10Kills++;
          if (Q.q10Kills >= 2 && !Q.nextState) {
            showDialog('😤', 'Mam dość, Rafał ja cię proszę, idziemy na Collegii');
            _kmqNext('q10_follow');
          }
        }
      }
    }
  }

  // separation
  const kg = st.kolegas;
  for (let i = 0; i < kg.length; i++) for (let j = i+1; j < kg.length; j++) {
    const a = kg[i], b2 = kg[j];
    if (!a.alive || !b2.alive) continue;
    const sdx=b2._x-a._x, sdy=b2._y-a._y, sd=Math.hypot(sdx,sdy);
    if (sd < 36 && sd > 0.01) {
      const push=(36-sd)*0.5, nx=sdx/sd, ny=sdy/sd;
      a._x-=nx*push; a._y-=ny*push; b2._x+=nx*push; b2._y+=ny*push;
    }
  }
}

function drawKrynicaQuests(ctx, ts) {
  for (const en of _KM_ST.kolegas) if (en.alive) _drawKolega(ctx, en, ts);
  drawHitFX(ctx);
  /* Q10: Rafał following player in Krynica */
  if (_KM_QUEST.state === 'q10_follow' && _KM_QUEST.rafalActive) {
    _drawRafalKrynica(ctx, _KM_QUEST.rafalX, _KM_QUEST.rafalY, false, ts);
  }
  /* Q11: Rafał at disco */
  if (_KM_RAFAL.visible) {
    const dancing = _KM_QUEST.state === 'q11_disco';
    _drawRafalKrynica(ctx, _KM_RAFAL.x, _KM_RAFAL.y, dancing, ts);
  }
}

function drawKrynicaQuestsHUD(ctx, cw, ch) {
  if (_KM_ST.playerHitFlash > 0) {
    ctx.fillStyle = `rgba(160,20,20,${_KM_ST.playerHitFlash * 0.32})`;
    ctx.fillRect(0, 0, cw, ch);
  }
}

/* ══════════════════════════════════════════════════════
   Kolega Rafała — rysowanie
   ══════════════════════════════════════════════════════ */
function _drawKolega(ctx, en, ts) {
  const x = en._x, y = en._y;
  const bob   = Math.sin(en.stepAnim) * 2.5;
  const swing = Math.sin(en.stepAnim * 2) * 0.12;
  const aggro = en.aiState === 'chase';

  /* cień */
  ctx.beginPath(); ctx.ellipse(x+2, y+16, 14, 6, 0, 0, Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fill();

  /* nogi */
  ctx.fillStyle='#162055';
  ctx.fillRect(x-10, y+6, 8, 22); ctx.fillRect(x+2, y+6, 8, 22);
  ctx.fillStyle='#f0f0ee';
  ctx.fillRect(x-12, y+24, 10, 6); ctx.fillRect(x+2, y+24, 10, 6);
  ctx.fillStyle='rgba(255,255,255,0.22)';
  ctx.fillRect(x-10, y+6, 8, 2); ctx.fillRect(x+2, y+6, 8, 2);

  /* bluza */
  const tg=ctx.createLinearGradient(x-16,y-10,x+16,y+8);
  tg.addColorStop(0,'#1e2e70'); tg.addColorStop(1,'#0e1848');
  ctx.fillStyle=tg;
  ctx.beginPath(); ctx.moveTo(x-8,y-2); ctx.lineTo(x-18,y+2); ctx.lineTo(x-16,y+10); ctx.lineTo(x+16,y+10); ctx.lineTo(x+18,y+2); ctx.lineTo(x+8,y-2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=2; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x-18,y+3); ctx.lineTo(x-18,y+8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+18,y+3); ctx.lineTo(x+18,y+8); ctx.stroke();

  /* ramiona */
  ctx.strokeStyle='#1e2e70'; ctx.lineWidth=12; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x-12,y-1); ctx.quadraticCurveTo(x-26,y+4+swing*9,x-24,y+18+swing*5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+12,y-1); ctx.quadraticCurveTo(x+26,y+4-swing*9,x+24,y+18-swing*5); ctx.stroke();
  ctx.fillStyle='#e8b880';
  ctx.beginPath(); ctx.arc(x-24,y+18+swing*5,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+24,y+18-swing*5,5,0,Math.PI*2); ctx.fill();

  /* szyja */
  ctx.fillStyle='#e8b880'; ctx.fillRect(x-4,y-8,8,7);

  /* głowa */
  ctx.fillStyle='#e8b880'; ctx.beginPath(); ctx.arc(x,y-18+bob,11,0,Math.PI*2); ctx.fill();

  /* włosy */
  ctx.fillStyle='#1a1010';
  ctx.beginPath(); ctx.arc(x,y-20+bob,11,Math.PI,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x-8,y-18+bob,5,Math.PI*1.2,Math.PI*2.2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+8,y-18+bob,5,Math.PI*0.8,Math.PI*1.8); ctx.fill();

  /* czapka z daszkiem odwrotnie */
  ctx.fillStyle='#0a0a14';
  ctx.beginPath(); ctx.ellipse(x,y-27+bob,13,5,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x,y-26+bob,11,Math.PI,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x-5,y-22+bob); ctx.lineTo(x-20,y-20+bob); ctx.lineTo(x-18,y-26+bob); ctx.lineTo(x-5,y-27+bob); ctx.closePath();
  ctx.fillStyle='#14141e'; ctx.fill();

  /* zarost */
  ctx.fillStyle='rgba(30,20,15,0.38)';
  ctx.beginPath(); ctx.ellipse(x,y-13+bob,7,4,0,0,Math.PI*2); ctx.fill();

  /* oczy */
  const ex=x+(en._dir>=0?4:-4);
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(ex,y-19+bob,2.5,2.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=aggro?'#cc1010':'#1a1010';
  ctx.beginPath(); ctx.arc(ex,y-19+bob,1.6,0,Math.PI*2); ctx.fill();

  /* łańcuch */
  ctx.strokeStyle='#e8b820'; ctx.lineWidth=1.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(x,y-5,6,Math.PI*1.1,Math.PI*1.9); ctx.stroke();

  /* agresja */
  if (aggro) {
    ctx.strokeStyle='rgba(200,20,20,0.35)'; ctx.lineWidth=1.5;
    for (let wi=0;wi<3;wi++) {
      const wy=y-42-wi*9+bob, amp=9+wi*4;
      ctx.beginPath(); ctx.moveTo(x-amp,wy+4); ctx.lineTo(x-amp/2,wy); ctx.lineTo(x,wy+4); ctx.lineTo(x+amp/2,wy); ctx.lineTo(x+amp,wy+4); ctx.stroke();
    }
  }

  /* HP */
  const bw=34,bh=3.5,bx=x-bw/2,by=y-48;
  ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(bx,by,bw,bh);
  const hr=en.hp/en.maxHp;
  ctx.fillStyle=hr>0.5?'#e82828':hr>0.25?'#e86820':'#e8e020';
  ctx.fillRect(bx,by,bw*hr,bh);
  ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=0.5; ctx.strokeRect(bx,by,bw,bh);

  if (en.hitFlash>0) {
    ctx.globalAlpha=en.hitFlash*0.5;
    ctx.fillStyle='#ffcccc'; ctx.beginPath(); ctx.arc(x,y-5+bob,26,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }

  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
  ctx.fillStyle=aggro?'#ff4040':'#ffb0b0';
  ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('Kolega Rafała',x,by); ctx.shadowBlur=0;
}

/* ══════════════════════════════════════════════════════
   Rafał — rysowanie (Krynica)
   ══════════════════════════════════════════════════════ */
function _drawRafalKrynica(ctx, x, y, dancing, ts) {
  const bob  = dancing ? Math.sin((ts||0)/300) * 5 : Math.sin((ts||0)/600) * 2;
  const step = dancing ? Math.sin((ts||0)/200) * 8 : 0;

  ctx.beginPath(); ctx.ellipse(x+2, y+16, 14, 6, 0, 0, Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fill();

  ctx.fillStyle='#111118';
  ctx.fillRect(x-9, y+6, 8, 22); ctx.fillRect(x+1, y+6, 8, 22);
  ctx.fillStyle='#0a0a10'; ctx.fillRect(x-11,y+25,10,6); ctx.fillRect(x+1,y+25,10,6);

  const bg = ctx.createLinearGradient(x-16,y-10,x+16,y+8);
  bg.addColorStop(0,'#151520'); bg.addColorStop(1,'#0a0a15');
  ctx.fillStyle=bg;
  ctx.beginPath(); ctx.moveTo(x-8,y-2); ctx.lineTo(x-18,y+2); ctx.lineTo(x-16,y+10);
  ctx.lineTo(x+16,y+10); ctx.lineTo(x+18,y+2); ctx.lineTo(x+8,y-2); ctx.closePath(); ctx.fill();
  ctx.font='bold 6px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.fillText('EDC', x, y+4);

  ctx.strokeStyle='#151520'; ctx.lineWidth=12; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x-12,y-1); ctx.quadraticCurveTo(x-26,y+4+step*0.4,x-24+step,y+18-step*0.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+12,y-1); ctx.quadraticCurveTo(x+26,y+4-step*0.4,x+24-step,y+18+step*0.4); ctx.stroke();
  ctx.fillStyle='#d8a878';
  ctx.beginPath(); ctx.arc(x-24+step,y+18-step*0.4,5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+24-step,y+18+step*0.4,5,0,Math.PI*2); ctx.fill();

  ctx.fillStyle='#d8a878'; ctx.fillRect(x-4,y-8,8,7);

  ctx.fillStyle='#d8a878';
  ctx.beginPath(); ctx.arc(x, y-18+bob, 11, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle='#2a1408';
  ctx.beginPath(); ctx.arc(x, y-20+bob, 11, Math.PI, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x-8, y-18+bob, 5, Math.PI*1.2, Math.PI*2.2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+8, y-18+bob, 5, Math.PI*0.8, Math.PI*1.8); ctx.fill();
  ctx.fillStyle='#2a1408';
  ctx.beginPath(); ctx.arc(x-4, y-28+bob, 4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+4, y-28+bob, 4, 0, Math.PI*2); ctx.fill();

  ctx.strokeStyle='#888890'; ctx.lineWidth=1.4; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(x-5, y-18+bob, 4, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x+5, y-18+bob, 4, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-1, y-18+bob); ctx.lineTo(x+1, y-18+bob); ctx.stroke();
  ctx.fillStyle='rgba(200,220,255,0.35)';
  ctx.beginPath(); ctx.arc(x-6, y-19+bob, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+4, y-19+bob, 1.5, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle='#1a1010';
  ctx.beginPath(); ctx.arc(x-5, y-18+bob, 1.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+5, y-18+bob, 1.2, 0, Math.PI*2); ctx.fill();

  ctx.strokeStyle='rgba(80,40,20,0.7)'; ctx.lineWidth=1.2; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(x, y-14+bob, 3.5, 0.1*Math.PI, 0.9*Math.PI); ctx.stroke();

  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
  ctx.fillStyle='#ff90c0'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('Rafał',x,y-34+bob); ctx.shadowBlur=0;
}

/* ══════════════════════════════════════════════════════
   Proposal Scene (Q11)
   ══════════════════════════════════════════════════════ */
const _PROPOSAL = {
  active: false, phase: 'walk', timer: 0,
  rafX: 0, rafY: 0, rafTargetX: 0,
  prevTs: 0, rafId: null, onDone: null, step: 0,
};

const _PROPOSAL_LINES = [
  'Agata... wiem że dużo razy wszystko psuję...',
  'Ale chcę żebyś wiedziała... że zawsze cię kocham.',
  '...i dlatego...',
  '*klęka na jedno kolano*\nWyjdziesz za mnie? 💍',
];

function _openProposalScene(onDone) {
  const ov = document.getElementById('proposal-overlay');
  if (!ov) { if (onDone) onDone(); return; }
  const cv = document.getElementById('proposal-cvs');
  cv.width  = ov.clientWidth  || window.innerWidth;
  cv.height = ov.clientHeight || window.innerHeight;
  Object.assign(_PROPOSAL, {
    active: true, phase: 'walk', timer: 0,
    rafX: cv.width * 0.82, rafY: cv.height * 0.5,
    rafTargetX: cv.width * 0.62,
    step: -1, prevTs: performance.now(), onDone,
  });
  ov.classList.remove('hidden');
  const dlg = document.getElementById('proposal-dialog');
  dlg.classList.add('hidden');
  document.getElementById('proposal-next').onclick = () => {
    _PROPOSAL.step++;
    const pText = document.getElementById('proposal-text');
    if (_PROPOSAL.step < _PROPOSAL_LINES.length) {
      pText.textContent = _PROPOSAL_LINES[_PROPOSAL.step];
    } else {
      _closeProposalScene();
    }
  };
  _PROPOSAL.rafId = requestAnimationFrame(_proposalLoop);
}

function _closeProposalScene() {
  const ov = document.getElementById('proposal-overlay');
  if (ov) ov.classList.add('hidden');
  _PROPOSAL.active = false;
  if (_PROPOSAL.rafId) { cancelAnimationFrame(_PROPOSAL.rafId); _PROPOSAL.rafId = null; }
  if (_PROPOSAL.onDone) { const cb = _PROPOSAL.onDone; _PROPOSAL.onDone = null; cb(); }
}

function _proposalLoop(ts) {
  if (!_PROPOSAL.active) return;
  _PROPOSAL.rafId = requestAnimationFrame(_proposalLoop);
  const dt = Math.min(ts - _PROPOSAL.prevTs, 80) / 1000;
  _PROPOSAL.prevTs = ts;
  const cv = document.getElementById('proposal-cvs');
  const c  = cv.getContext('2d');
  const W  = cv.width, H = cv.height;

  c.fillStyle = '#0a0018'; c.fillRect(0,0,W,H);
  const colors = ['rgba(255,0,180,0.15)','rgba(0,200,255,0.12)','rgba(255,220,0,0.1)'];
  for (let i=0;i<3;i++) {
    const a = ts/400 + i*2.1;
    const lx = W*0.5 + Math.cos(a)*W*0.3, ly = 0;
    const rg = c.createRadialGradient(lx,ly,0,lx,ly,H*0.8);
    rg.addColorStop(0,colors[i]); rg.addColorStop(1,'transparent');
    c.fillStyle=rg; c.fillRect(0,0,W,H);
  }

  c.fillStyle='rgba(20,10,40,0.8)'; c.fillRect(0,H*0.72,W,H*0.28);

  c.fillStyle='#1a0830'; c.fillRect(W*0.85,H*0.3,W*0.06,H*0.42);
  c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=2;
  c.strokeRect(W*0.85,H*0.3,W*0.06,H*0.42);
  c.font='bold 9px "Segoe UI",sans-serif'; c.textAlign='center'; c.textBaseline='top';
  c.fillStyle='rgba(200,180,255,0.5)'; c.fillText('WC',W*0.88,H*0.32);

  const ax = W * 0.35, ay = H * 0.55;
  _drawSimpleAgataProposal(c, ax, ay, H);

  if (_PROPOSAL.phase === 'walk') {
    _PROPOSAL.rafX += (_PROPOSAL.rafTargetX - _PROPOSAL.rafX) * Math.min(1, dt * 2.5);
    if (Math.abs(_PROPOSAL.rafX - _PROPOSAL.rafTargetX) < 2) {
      _PROPOSAL.phase = 'talk';
      _PROPOSAL.step = 0;
      const pText = document.getElementById('proposal-text');
      pText.textContent = _PROPOSAL_LINES[0];
      document.getElementById('proposal-dialog').classList.remove('hidden');
    }
  }

  const kneeling = _PROPOSAL.step >= 3;
  _drawRafalProposalScene(c, _PROPOSAL.rafX, H * 0.55, ts, kneeling, H);

  if (kneeling) {
    for (let si=0;si<6;si++) {
      const sa = ts/200 + si * Math.PI/3;
      const sr = 22 + Math.sin(ts/150+si)*8;
      const sx = _PROPOSAL.rafX + Math.cos(sa)*sr;
      const sy = H*0.55+20 + Math.sin(sa)*sr*0.5;
      c.fillStyle=`rgba(255,220,60,${0.6+Math.sin(ts/100+si)*0.4})`;
      c.beginPath(); c.arc(sx,sy,2.5,0,Math.PI*2); c.fill();
    }
  }
}

function _drawSimpleAgataProposal(c, x, y, H) {
  const scale = H / 600;
  const s = scale * 28;
  c.fillStyle='rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(x,y+s*0.6,s*0.5,s*0.2,0,0,Math.PI*2); c.fill();
  c.fillStyle='#c04060'; c.beginPath(); c.ellipse(x,y,s*0.3,s*0.5,0,0,Math.PI*2); c.fill();
  c.fillStyle='#d8a878'; c.beginPath(); c.arc(x,y-s*0.6,s*0.35,0,Math.PI*2); c.fill();
  c.fillStyle='#e06080';
  c.beginPath(); c.arc(x,y-s*0.72,s*0.35,Math.PI,Math.PI*2); c.fill();
  c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.arc(x,y-s*0.58,s*0.08,0,Math.PI*2); c.fill();
}

function _drawRafalProposalScene(c, x, y, ts, kneeling, H) {
  const scale = H / 600;
  const s = scale * 28;
  if (kneeling) {
    c.fillStyle='#0a0a15';
    c.fillRect(x-s*0.35,y+s*0.1,s*0.3,s*0.5);
    c.fillRect(x+s*0.05,y+s*0.2,s*0.3,s*0.3);
    c.fillStyle='rgba(0,0,0,0.2)'; c.beginPath(); c.ellipse(x,y+s*0.65,s*0.45,s*0.18,0,0,Math.PI*2); c.fill();
  } else {
    c.fillStyle='#0a0a15';
    c.fillRect(x-s*0.35,y+s*0.1,s*0.3,s*0.6);
    c.fillRect(x+s*0.05,y+s*0.1,s*0.3,s*0.6);
  }
  c.fillStyle='#151520'; c.beginPath(); c.ellipse(x,y-s*0.15,s*0.5,s*0.38,0,0,Math.PI*2); c.fill();
  c.fillStyle='rgba(255,255,255,0.65)';
  c.font=`bold ${Math.round(s*0.22)}px "Segoe UI",sans-serif`;
  c.textAlign='center'; c.textBaseline='middle'; c.fillText('EDC',x,y-s*0.15);
  c.fillStyle='#d8a878'; c.beginPath(); c.arc(x,y-s*0.7,s*0.38,0,Math.PI*2); c.fill();
  c.fillStyle='#2a1408'; c.beginPath(); c.arc(x,y-s*0.82,s*0.38,Math.PI,Math.PI*2); c.fill();
  c.strokeStyle='#888'; c.lineWidth=s*0.06;
  c.beginPath(); c.arc(x-s*0.15,y-s*0.68,s*0.14,0,Math.PI*2); c.stroke();
  c.beginPath(); c.arc(x+s*0.15,y-s*0.68,s*0.14,0,Math.PI*2); c.stroke();
  if (kneeling) {
    const hx = x+s*0.7, hy = y+s*0.05;
    c.fillStyle='#d8a878'; c.beginPath(); c.arc(hx,hy,s*0.18,0,Math.PI*2); c.fill();
    c.strokeStyle='#ffd700'; c.lineWidth=s*0.08;
    c.beginPath(); c.arc(hx,hy-s*0.12,s*0.12,0,Math.PI*2); c.stroke();
    c.fillStyle='#ff4488'; c.beginPath(); c.arc(hx,hy-s*0.22,s*0.05,0,Math.PI*2); c.fill();
  }
}

/* ══════════════════════════════════════════════════════
   Drzewa — generowane raz przy załadowaniu
   ══════════════════════════════════════════════════════ */
const _KM_TREES = (function() {
  const out = [];
  let s = 213;
  const rand = () => { s=(Math.imul(s,1664525)+1013904223)>>>0; return s/0xffffffff; };
  // Las po stronie bałtyckiej (poniżej plaży)
  for (let i = 0; i < 260; i++) {
    const x = 30 + rand() * 1550;
    const b = _kmBounds(x);
    const fromTop = 66 + rand() * 95;
    const y = b.yTop + fromTop;
    if (y >= b.yBot - 28) continue;
    out.push({x, y, r: 12 + rand()*12, side: 'top'});
  }
  // Las po stronie zalewu
  for (let i = 0; i < 230; i++) {
    const x = 30 + rand() * 1550;
    const b = _kmBounds(x);
    const fromBot = 28 + rand() * 90;
    const y = b.yBot - fromBot;
    if (y <= b.yTop + 38) continue;
    out.push({x, y, r: 12 + rand()*11, side: 'bot'});
  }
  return out;
}());

/* ══════════════════════════════════════════════════════
   Rysowanie świata
   ══════════════════════════════════════════════════════ */
function _drawKrynica(ctx, sub, ts) {
  const {w, h} = sub;
  const {topA, botA, slope} = sub.diagonalStrip;
  const halfW = (botA - topA) / 2; // 195

  /* Bałtyk — pełne tło */
  ctx.fillStyle = '#0a6888'; ctx.fillRect(0, 0, w, h);

  /* Zalew Wiślany */
  ctx.fillStyle = '#1a5040';
  ctx.beginPath();
  ctx.moveTo(0, h); ctx.lineTo(0, botA);
  ctx.lineTo(w, botA + slope*w); ctx.lineTo(w, h);
  ctx.closePath(); ctx.fill();

  /* Fale Bałtyku */
  const wo1 = (ts/1100) % 80;
  ctx.strokeStyle = 'rgba(255,255,255,0.062)'; ctx.lineWidth = 2.5;
  for (let wy = wo1 - 80; wy < 640; wy += 80) {
    for (let wx = -70; wx < w + 70; wx += 100) {
      ctx.beginPath(); ctx.moveTo(wx,wy);
      ctx.quadraticCurveTo(wx+34,wy-11,wx+68,wy); ctx.quadraticCurveTo(wx+84,wy+9,wx+100,wy);
      ctx.stroke();
    }
  }
  /* Fale Zalewu */
  const wo2 = (ts/1800) % 95;
  ctx.strokeStyle = 'rgba(255,255,255,0.028)'; ctx.lineWidth = 1.8;
  for (let wy = wo2 - 95; wy < h + 95; wy += 95) {
    for (let wx = -55; wx < w + 55; wx += 85) {
      ctx.beginPath(); ctx.moveTo(wx,wy);
      ctx.quadraticCurveTo(wx+26,wy-6,wx+52,wy); ctx.quadraticCurveTo(wx+68,wy+5,wx+85,wy);
      ctx.stroke();
    }
  }

  /* Ląd */
  ctx.beginPath();
  ctx.moveTo(0, topA); ctx.lineTo(w, topA + slope*w);
  ctx.lineTo(w, botA + slope*w); ctx.lineTo(0, botA);
  ctx.closePath();
  ctx.fillStyle = '#3a6828'; ctx.fill();

  /* Plaża wzdłuż Bałtyku */
  const beachH = 64;
  ctx.beginPath();
  ctx.moveTo(0, topA); ctx.lineTo(w, topA + slope*w);
  ctx.lineTo(w, topA + slope*w + beachH); ctx.lineTo(0, topA + beachH);
  ctx.closePath();
  const beachG = ctx.createLinearGradient(0, 0, w, 0);
  beachG.addColorStop(0, '#c4b458'); beachG.addColorStop(1, '#d0c470');
  ctx.fillStyle = beachG; ctx.fill();

  /* Wydmy */
  ctx.beginPath();
  ctx.moveTo(0, topA + beachH - 5); ctx.lineTo(w, topA + slope*w + beachH - 5);
  ctx.lineTo(w, topA + slope*w + beachH + 26); ctx.lineTo(0, topA + beachH + 26);
  ctx.closePath();
  ctx.fillStyle = '#8aaa50'; ctx.fill();

  /* Droga 501 */
  const roadOff = -14;
  ctx.beginPath();
  ctx.moveTo(0,    topA + halfW + roadOff - 36);
  ctx.lineTo(w,    topA + slope*w + halfW + roadOff - 36);
  ctx.lineTo(w,    topA + slope*w + halfW + roadOff + 36);
  ctx.lineTo(0,    topA + halfW + roadOff + 36);
  ctx.closePath();
  ctx.fillStyle = '#747068'; ctx.fill();
  ctx.setLineDash([24, 14]);
  ctx.strokeStyle = 'rgba(230,215,100,0.36)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, topA + halfW + roadOff);
  ctx.lineTo(w, topA + slope*w + halfW + roadOff);
  ctx.stroke(); ctx.setLineDash([]);

  /* Drzewa */
  for (const t of _KM_TREES) {
    const tg = ctx.createRadialGradient(t.x-2, t.y-2, 0, t.x, t.y, t.r);
    if (t.side === 'top') {
      tg.addColorStop(0,'#5ac830'); tg.addColorStop(0.65,'#308818'); tg.addColorStop(1,'#1a5608');
    } else {
      tg.addColorStop(0,'#3ca020'); tg.addColorStop(0.65,'#205a10'); tg.addColorStop(1,'#123808');
    }
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI*2); ctx.fill();
  }

  /* Budynki */
  _drawKmDomIgiego   (ctx, {x:225, y:325, w:128, h:92});
  _drawKmRestauracja (ctx, {x:650, y:448, w:162, h:114});
  _drawKmDyskoteka   (ctx, {x:1038, y:522, w:150, h:110}, ts);

  /* Plaža z Krokodylami */
  _drawKmPlazaMarker(ctx, ts);

  /* Strefy wyjścia */
  for (const ez of SUBMAP_KRYNICA.exitZones) {
    const pulse = 0.55 + Math.sin(ts/500)*0.45;
    ctx.fillStyle = `rgba(255,215,60,${pulse*0.12})`;
    ctx.beginPath(); ctx.arc(ez.x, ez.y, ez.r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = `rgba(255,215,60,${pulse*0.9})`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(ez.x, ez.y, ez.r, 0, Math.PI*2); ctx.stroke();
    ctx.font = 'bold 11px "Segoe UI",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = `rgba(255,215,60,${pulse})`;
    ctx.fillText('← Wyjście', ez.x, ez.y + ez.r + 6);
  }

  /* Etykiety wody */
  ctx.font = 'italic 14px "Segoe UI",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(180,225,255,0.42)'; ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
  ctx.fillText('Morze Bałtyckie', 500, topA - 62);
  ctx.fillStyle = 'rgba(130,210,175,0.42)';
  ctx.fillText('Zalew Wiślany', 900, botA + slope*900 + 72);
  ctx.shadowBlur = 0;

  /* granica świata */
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w-4, h-4);
}

/* ── Dom Igiego ── */
function _drawKmDomIgiego(ctx, b) {
  const hg = ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
  hg.addColorStop(0,'#e8e0d0'); hg.addColorStop(1,'#c8c0b0');
  ctx.fillStyle=hg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#7a3e18';
  ctx.beginPath(); ctx.moveTo(b.x-6,b.y); ctx.lineTo(b.x+b.w/2,b.y-36); ctx.lineTo(b.x+b.w+6,b.y); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(200,235,255,0.75)';
  ctx.fillRect(b.x+14,b.y+16,24,20); ctx.fillRect(b.x+b.w-38,b.y+16,24,20);
  ctx.fillStyle='#5a3010'; ctx.fillRect(b.x+b.w/2-11,b.y+b.h-30,22,30);
  ctx.beginPath(); ctx.arc(b.x+b.w/2,b.y+b.h-30,11,Math.PI,0); ctx.fill();
  ctx.fillStyle='#f0e8d8'; ctx.fillRect(b.x+b.w/2-28,b.y+42,56,20);
  ctx.strokeStyle='#7a3e18'; ctx.lineWidth=1; ctx.strokeRect(b.x+b.w/2-28,b.y+42,56,20);
  ctx.font='bold 8px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#5a2e10'; ctx.fillText('Dom Igiego',b.x+b.w/2,b.y+52);
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,200,100,0.8)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Restauracja ── */
function _drawKmRestauracja(ctx, b) {
  const rg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
  rg.addColorStop(0,'#e87848'); rg.addColorStop(1,'#c05020');
  ctx.fillStyle=rg; ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.fillStyle='#8a3018'; ctx.fillRect(b.x,b.y,b.w,11);
  ctx.fillStyle='#f8e030';
  for (let mx=b.x;mx<b.x+b.w;mx+=24) {
    ctx.beginPath(); ctx.moveTo(mx,b.y+11); ctx.lineTo(mx+12,b.y+28); ctx.lineTo(mx+24,b.y+11); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle='rgba(200,240,255,0.7)';
  for (let wx=b.x+14;wx<b.x+b.w-22;wx+=36) ctx.fillRect(wx,b.y+36,24,26);
  ctx.fillStyle='#f8f0e0'; ctx.fillRect(b.x+b.w/2-44,b.y+70,88,24);
  ctx.strokeStyle='#8a3018'; ctx.lineWidth=1.5; ctx.strokeRect(b.x+b.w/2-44,b.y+70,88,24);
  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#8a2010'; ctx.fillText('⚠ Restauracja',b.x+b.w/2,b.y+82);
  ctx.fillStyle='#1a1008'; ctx.fillRect(b.x+b.w/2-13,b.y+b.h-30,26,30);
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,140,100,0.9)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Dyskoteka ── */
function _drawKmDyskoteka(ctx, b, ts) {
  const dg=ctx.createLinearGradient(b.x,b.y,b.x,b.y+b.h);
  dg.addColorStop(0,'#280050'); dg.addColorStop(1,'#180030');
  ctx.fillStyle=dg; ctx.fillRect(b.x,b.y,b.w,b.h);
  const nt = Math.sin(ts/300)*0.5+0.5;
  ctx.fillStyle=`rgba(255,0,180,${0.5+nt*0.5})`;
  ctx.fillRect(b.x+4,b.y+8,b.w-8,9);
  ctx.fillStyle=`rgba(0,200,255,${0.5+(1-nt)*0.5})`;
  ctx.fillRect(b.x+4,b.y+21,b.w-8,7);
  const colorIdx = Math.floor(ts/400) % 3;
  const winColors = ['rgba(255,80,200,0.75)','rgba(80,200,255,0.75)','rgba(255,220,60,0.75)'];
  ctx.fillStyle = winColors[colorIdx];
  ctx.fillRect(b.x+14,b.y+38,28,30); ctx.fillRect(b.x+b.w-42,b.y+38,28,30);
  ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(b.x+b.w/2-40,b.y+76,80,22);
  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#ff80ff'; ctx.shadowColor='#ff00ff'; ctx.shadowBlur=8;
  ctx.fillText('🎵 Dyskoteka',b.x+b.w/2,b.y+87); ctx.shadowBlur=0;
  ctx.fillStyle='#0a0010'; ctx.fillRect(b.x+b.w/2-13,b.y+b.h-32,26,32);
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,140,255,0.85)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',b.x+b.w/2,b.y+b.h+5); ctx.shadowBlur=0;
}

/* ── Plaža z Krokodylami ── */
function _drawKmPlazaMarker(ctx, ts) {
  const mx = 420, my = 290;
  const pulse = 0.6 + Math.sin(ts*0.005)*0.4;
  ctx.beginPath(); ctx.arc(mx, my, 36*pulse, 0, Math.PI*2);
  ctx.fillStyle=`rgba(80,200,80,${pulse*0.15})`; ctx.fill();
  ctx.beginPath(); ctx.arc(mx, my, 20, 0, Math.PI*2);
  ctx.fillStyle='rgba(60,160,60,0.85)'; ctx.fill();
  ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.font='bold 13px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('🐊',mx,my); ctx.shadowBlur=0;
  ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
  ctx.fillStyle='#fff'; ctx.shadowColor='#000'; ctx.shadowBlur=5;
  ctx.fillText('Plaża z Krokodylami',mx,my-24); ctx.shadowBlur=0;
  ctx.font='italic 9px "Segoe UI",sans-serif'; ctx.textBaseline='top';
  ctx.fillStyle='rgba(255,200,100,0.85)'; ctx.shadowColor='#000'; ctx.shadowBlur=3;
  ctx.fillText('[zbliż się]',mx,my+24); ctx.shadowBlur=0;
}

/* ══════════════════════════════════════════════════════
   SUBMAP_KRYNICA
   ══════════════════════════════════════════════════════ */
const SUBMAP_KRYNICA = {
  id:   'krynica',
  name: 'Krynica Morska',
  w: 1600, h: 1100,
  bgColor: '#0a6888',

  spawn:         {x: 225, y: 395},
  mainMapReturn: {x: 2530, y: 472},

  diagonalStrip: {topA: 170, botA: 560, slope: 0.22},

  exitZones: [
    {x:  56, y: 370, r: 58},
    {x: 1545, y: 706, r: 58},
  ],

  npcs: [
    {id:'k1',x:148,y:388,_x:148,_y:388,patrolAxis:'x',patrolMin: 92,patrolMax:338,speed:48,_dir: 1,stepAnim:0,bodyColor:'#607858',hairColor:'#2a1810'},
    {id:'k2',x:330,y:448,_x:330,_y:448,patrolAxis:'x',patrolMin:325,patrolMax:580,speed:44,_dir:-1,stepAnim:0,bodyColor:'#4a6888',hairColor:'#1a2830'},
    {id:'k3',x:570,y:510,_x:570,_y:510,patrolAxis:'x',patrolMin:560,patrolMax:820,speed:52,_dir: 1,stepAnim:0,bodyColor:'#706040',hairColor:'#201810'},
    {id:'k4',x:812,y:568,_x:812,_y:568,patrolAxis:'x',patrolMin:808,patrolMax:1065,speed:46,_dir:-1,stepAnim:0,bodyColor:'#488060',hairColor:'#281808'},
    {id:'k5',x:1062,y:628,_x:1062,_y:628,patrolAxis:'x',patrolMin:1058,patrolMax:1355,speed:50,_dir: 1,stepAnim:0,bodyColor:'#705848',hairColor:'#1e1010'},
  ],

  onEnter() {
    _KM_ST.spawned = false;
    _KM_QUEST.entryTriggered = false;
    _KM_QUEST.q10Kills = 0;
    if (_KM_QUEST.state === 'q11_disco') _KM_RAFAL.visible = true;
    /* Q10 follow: Rafał spawns near player entrance point */
    if (_KM_QUEST.state === 'q10_follow') {
      _KM_QUEST.rafalX = 265; _KM_QUEST.rafalY = 405;
      _KM_QUEST.rafalActive = true;
    }
  },

  draw(ctx, ts)               { _drawKrynica(ctx, this, ts); },
  updateQuests(dt, subPlayer) { updateKrynicaQuests(dt, subPlayer); },
  drawQuests(ctx, ts)         { drawKrynicaQuests(ctx, ts); },
  drawQuestsHUD(ctx, cw, ch)  { drawKrynicaQuestsHUD(ctx, cw, ch); },
};

SUBMAPS['krynica'] = SUBMAP_KRYNICA;
