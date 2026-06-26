'use strict';

/* ════════════════════════════════════════════════════
   Quest: Agnieszki w Grudziądzu
   ════════════════════════════════════════════════════ */

/* ── Q14: Giga Turbo Agnieszka — World Map Final Boss ── */
const _GTA_BOSS = {
  state: 'inactive', // inactive|q14_ready|q14_intro|q14_zajac|q14_fight|q14_exploding|q14_vd1|q14_vd2|q14_vd3|q14_done
  x: 420, y: 1480,  // left forest area
  hp: 100, maxHp: 100,
  rocks: [],
  rockTimer: 3,
  explodeTimer: 0,
  explodePFX: [],
  laserBeam: null,   // { x1,y1,x2,y2,alpha }
  laserTimer: 3,
  zajacX: 0, zajacY: 0, zajacVY: 0,
  stillTimer: 0, lastPlayerX: 0, lastPlayerY: 0,
};

/* ── Rafał world-map companion (Q10 follow) ── */
const _RAFAL_WORLD = {
  x: 2700, y: 530,
  active: false,
  mode: 'follow',    // 'follow' | 'run' | 'stop'
  modeTimer: 6,
  runDX: 1, runDY: 0,
  speed: 150,
};

const _GD_QUEST = {
  state: 'idle',   // 'idle' | 'active' | 'complete' | 'done'
  killed: 0,
  enemies: [],
  triggerCooldown: 0,
  playerAttackTimer: 0,
  playerHitFlash: 0,
};

/* Trigger zone: just below II LO (building bottom edge y=240) */
const _GD_QUEST_ZONE = { x: 884, y: 262, r: 60 };

/* Spawn positions spread around Grudziądz (all x > 220 to avoid river) */
const _AGNIESZKA_SPAWNS = [
  {x: 420, y: 550},
  {x: 590, y: 295},
  {x: 890, y: 495},
  {x: 1130, y: 555},
  {x: 1380, y: 375},
  {x: 500,  y: 690},
  {x: 320,  y: 655},
  {x: 1070, y: 185},
  {x: 1480, y: 640},
  {x: 770,  y: 880},
];

function _spawnAgnieszkas() {
  _GD_QUEST.enemies = _AGNIESZKA_SPAWNS.map((pos, i) => ({
    id: i,
    _x: pos.x, _y: pos.y,
    hp: 40, maxHp: 40,
    alive: true,
    speed: 75,
    stepAnim: 0,
    _dir: 1,
    aiState: 'patrol',
    attackTimer: 0,
    hitFlash: 0,
    patrolTimer: i * 0.4,
    patrolDX: Math.cos(i * Math.PI * 0.63),
    patrolDY: Math.sin(i * Math.PI * 0.63),
    respawnTimer: 0,
  }));
  _GD_QUEST.killed = 0;
  _GD_QUEST.playerAttackTimer = 0;
  _GD_QUEST.playerHitFlash = 0;
}

/* ── Update (wywoływane z grudziadz.js przez updateGrudziadzQuests) ── */
function _updateGrudziadzEnemies(dt, subPlayer) {
  const q = _GD_QUEST;
  const dtS = dt / 1000;

  q.triggerCooldown    = Math.max(0, q.triggerCooldown - dtS);
  q.playerHitFlash     = Math.max(0, q.playerHitFlash  - dtS * 3);

  /* Quest trigger zone */
  if (q.triggerCooldown <= 0 && (q.state === 'idle' || q.state === 'complete')) {
    const dist = Math.hypot(subPlayer.x - _GD_QUEST_ZONE.x, subPlayer.y - _GD_QUEST_ZONE.y);
    if (dist < _GD_QUEST_ZONE.r) {
      if (q.state === 'idle') {
        showDialog('❗', 'Z niewiadomych przyczyn w Grudziądzu pojawiło się bardzo dużo Agnieszek,\ntrzeba je wszystkie pokonać!');
        q.state = 'active';
        _spawnAgnieszkas();
        q.triggerCooldown = 3;
      } else if (q.state === 'complete') {
        showDialog('✅', 'Na szczęście udało się pokonać wszystkie Agnieszki,\nGrudziądz jest teraz bezpieczny,\nale warto zobaczyć co się dzieje w Toruniu');
        q.state = 'done';
        q.triggerCooldown = 3;
      }
    }
  }

  if (q.enemies.length === 0) return;

  /* Respawn dead enemies */
  for (const en of q.enemies) {
    if (!en.alive) {
      en.respawnTimer -= dtS;
      if (en.respawnTimer <= 0) {
        if (q.state === 'done') { en.alive = false; continue; }
        const spawn = _AGNIESZKA_SPAWNS[en.id];
        en._x = spawn.x; en._y = spawn.y;
        en.hp = en.maxHp; en.alive = true;
        en.aiState = 'patrol'; en.attackTimer = 0; en.hitFlash = 0;
      }
    }
  }

  const AG_SEP = 28; /* minimum distance between Agnieszkas (2 * ~14px radius) */

  /* Player attacks once per second against all enemies in range */
  q.playerAttackTimer += dtS;
  const playerAttacks = q.playerAttackTimer >= 1;
  if (playerAttacks) q.playerAttackTimer = 0;

  for (const en of q.enemies) {
    if (!en.alive) continue;
    if (q.state === 'done') continue;

    const dx   = subPlayer.x - en._x;
    const dy   = subPlayer.y - en._y;
    const dist = Math.hypot(dx, dy);

    en.hitFlash = Math.max(0, en.hitFlash - dtS * 4);

    /* AI: enter chase when player is close */
    if (dist < 200) {
      en.aiState = 'chase';
    } else if (en.aiState === 'chase' && dist > 300) {
      en.aiState = 'patrol';
      en.attackTimer = 0;
    }

    if (en.aiState === 'chase') {
      const spd = en.speed * dtS;
      const nx = dx / dist, ny = dy / dist;
      en._x += nx * spd;
      en._y += ny * spd;
      en._dir = nx >= 0 ? 1 : -1;
      en.stepAnim += spd * 0.08;
      en._x = Math.max(220, Math.min(1780, en._x));
      en._y = Math.max(10,  Math.min(1185, en._y));

      /* Agnieszka attacks player (1/s, +5 zdenerwowanie) */
      if (dist < 55) {
        en.attackTimer += dtS;
        if (en.attackTimer >= 1) {
          en.attackTimer = 0;
          const nearEnclosure = subPlayer.x > 330 && subPlayer.x < 1070 && subPlayer.y > 790 && subPlayer.y < 1150;
          if (!nearEnclosure) {
            applyZdenerwowanie(5 * (typeof aceAtakMult==='function'?aceAtakMult():1));
            q.playerHitFlash = 1;
          }
        }
      } else {
        en.attackTimer = 0;
      }
    } else {
      /* Patrol: random direction, change every ~2.5s */
      en.patrolTimer += dtS;
      if (en.patrolTimer > 2.5) {
        en.patrolTimer = 0;
        const angle = Math.random() * Math.PI * 2;
        en.patrolDX = Math.cos(angle);
        en.patrolDY = Math.sin(angle);
      }
      const spd = en.speed * 0.35 * dtS;
      en._x += en.patrolDX * spd;
      en._y += en.patrolDY * spd;
      en._x = Math.max(220, Math.min(1780, en._x));
      en._y = Math.max(10,  Math.min(1185, en._y));
      en._dir = en.patrolDX >= 0 ? 1 : -1;
      en.stepAnim += spd * 0.08;
      en.attackTimer = 0;
    }

    /* Player auto-attacks (15 dmg/s) when in melee range */
    if (playerAttacks && dist < 55) {
      en.hp -= 15;
      en.hitFlash = 1;
      spawnHitEffect(en._x, en._y, 15);
      if (en.hp <= 0) {
        en.alive = false;
        en.respawnTimer = 8 + Math.random() * 5;
        addZlote(10);
        if (q.state === 'active') {
          q.killed++;
          if (q.killed >= 10) {
            q.state = 'complete';
            q.triggerCooldown = 0.3;
          }
        }
      }
    }
  }

  /* Separation pass — prevent Agnieszkas from stacking on each other */
  for (let i = 0; i < q.enemies.length; i++) {
    for (let j = i + 1; j < q.enemies.length; j++) {
      const a = q.enemies[i], b = q.enemies[j];
      if (!a.alive || !b.alive) continue;
      const sdx = b._x - a._x, sdy = b._y - a._y;
      const sd = Math.hypot(sdx, sdy);
      if (sd < AG_SEP && sd > 0.01) {
        const push = (AG_SEP - sd) * 0.5;
        const nx = sdx / sd, ny = sdy / sd;
        a._x -= nx * push; a._y -= ny * push;
        b._x += nx * push; b._y += ny * push;
        a._x = Math.max(220, Math.min(1780, a._x));
        a._y = Math.max(10,  Math.min(1185, a._y));
        b._x = Math.max(220, Math.min(1780, b._x));
        b._y = Math.max(10,  Math.min(1185, b._y));
      }
    }
  }
}

/* ── Draw enemies + "!" (wywoływane z grudziadz.js przez drawGrudziadzQuests) ── */
function _drawGrudziadzEnemies(ctx, ts) {
  const q = _GD_QUEST;

  /* Pulsing "!" above II LO (building top is y=75, draw at y=52) */
  if (q.state === 'idle' || q.state === 'complete') {
    const qx = _GD_QUEST_ZONE.x;
    const qy = 52;
    const pulse = 0.7 + Math.sin(ts * 0.006) * 0.3;

    ctx.beginPath();
    ctx.arc(qx, qy, 22 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,80,0,${0.18 * pulse})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(qx, qy, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4400';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 16px "Segoe UI",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 3;
    ctx.fillText('!', qx, qy);
    ctx.shadowBlur = 0;
  }

  if (q.state !== 'active') return;

  for (const en of q.enemies) {
    if (en.alive) _drawAgnieszka(ctx, en);
  }
  drawHitFX(ctx);
}

/* ── Draw screen-space HUD (outside camera transform) ── */
function drawGrudziadzQuestsHUD(ctx, cw, ch) {
  const q = _GD_QUEST;

  /* Kill counter */
  if (q.state === 'active') {
    ctx.font = 'bold 13px "Segoe UI",sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(8, 58, 152, 26, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,100,40,0.75)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ff9060';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(`⚔ Agnieszki: ${q.killed}/10`, 18, 65);
    ctx.shadowBlur = 0;
  }

  /* Red vignette when player is hit */
  if (q.playerHitFlash > 0) {
    ctx.fillStyle = `rgba(200,0,0,${q.playerHitFlash * 0.28})`;
    ctx.fillRect(0, 0, cw, ch);
  }
}

/* ── Draw one Agnieszka enemy ── */
function _drawAgnieszka(ctx, en) {
  const x  = en._x, y = en._y;
  const bob  = Math.sin(en.stepAnim) * 2.2;
  const step = Math.sin(en.stepAnim) * 3.5;
  const aggro = en.aiState === 'chase';

  /* shadow */
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 10, 11, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();

  /* legs */
  ctx.fillStyle = '#3a2a60';
  ctx.beginPath();
  ctx.ellipse(x - 4, y + 7 - step * 0.6, 4, 6,  0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 7 + step * 0.6, 4, 6, -0.15, 0, Math.PI * 2);
  ctx.fill();

  /* body — red dress */
  ctx.beginPath();
  ctx.ellipse(x, y - 2 + bob, 9, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle   = aggro ? '#aa0010' : '#cc2244';
  ctx.fill();
  ctx.strokeStyle = aggro ? '#660010' : '#991133';
  ctx.lineWidth   = 1.2;
  ctx.stroke();

  /* fists when chasing */
  if (aggro) {
    const swing = Math.sin(en.stepAnim * 2) * 5;
    ctx.fillStyle = '#f0c8a0';
    ctx.beginPath();
    ctx.ellipse(x - 13, y - 2 + bob + swing, 4.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 13, y - 2 + bob - swing, 4.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* head */
  ctx.beginPath();
  ctx.arc(x, y - 18 + bob, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#f0c8a0';
  ctx.fill();

  /* hair — dark brown */
  ctx.fillStyle = '#5a2808';
  ctx.beginPath();
  ctx.arc(x, y - 20 + bob, 9, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - 9, y - 16 + bob, 2.5, 6, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 9, y - 16 + bob, 2.5, 6,  0.25, 0, Math.PI * 2);
  ctx.fill();

  /* eyes */
  if (aggro) {
    ctx.fillStyle = '#880000';
    ctx.beginPath(); ctx.arc(x - 3.5, y - 18 + bob, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 3.5, y - 18 + bob, 2.2, 0, Math.PI * 2); ctx.fill();
    /* angry brows */
    ctx.strokeStyle = '#550000'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 6.5, y - 22.5 + bob);
    ctx.lineTo(x - 1,   y - 21   + bob);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 6.5, y - 22.5 + bob);
    ctx.lineTo(x + 1,   y - 21   + bob);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#2a1a10';
    ctx.beginPath(); ctx.arc(x - 3.5, y - 18 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 3.5, y - 18 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
    /* gentle blush */
    ctx.fillStyle = 'rgba(220,100,100,0.22)';
    ctx.beginPath(); ctx.ellipse(x - 6.5, y - 16 + bob, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 6.5, y - 16 + bob, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  }

  /* hit flash */
  if (en.hitFlash > 0) {
    ctx.save();
    ctx.globalAlpha = en.hitFlash * 0.65;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x, y - 10 + bob, 13, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* HP bar */
  const bw = 34, bh = 4;
  const bx = x - bw / 2, by = y - 37 + bob;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = en.hp > 20 ? '#44dd22' : '#dd3311';
  ctx.fillRect(bx, by, bw * (en.hp / en.maxHp), bh);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(bx, by, bw, bh);

  /* name label */
  ctx.font = 'bold 10px "Segoe UI",sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle    = aggro ? '#ff9090' : '#ffffff';
  ctx.shadowColor  = '#000'; ctx.shadowBlur = 4;
  ctx.fillText('Agnieszka', x, by);
  ctx.shadowBlur = 0;
}

/* ── Draw "!" markers on main map when quests are active ── */
function drawMainMapQuestMarkers(ctx, ts) {
  /* Auto-activate Toruń quest (Q2) once Grudziądz quest (Q1) is fully done */
  if (typeof _TR_QUEST !== 'undefined' && _TR_QUEST.state === 'inactive' && _GD_QUEST.state === 'done') {
    _TR_QUEST.state = 'active';
  }

  /* Auto-activate Gdańsk quests (Q4-Q6) once Grudziądz cat enclosure (Q3) is done */
  if (typeof _GDN_QUEST !== 'undefined' && typeof _CAT_Q !== 'undefined') {
    if (_GDN_QUEST.state === 'inactive' && _CAT_Q.state === 'done') {
      _GDN_QUEST.state = 'q4_ready';
    }
  }

  /* Auto-activate Q9 in Gdańsk when Q8 in Hel is done */
  if (typeof _GDN_QUEST !== 'undefined' && typeof _HEL_QUEST !== 'undefined') {
    if (_GDN_QUEST.state === 'q7_done' && _HEL_QUEST.state === 'q8_done') {
      _GDN_QUEST.state = 'q9_ready';
    }
  }

  /* Auto-activate Q10/Q11/Q12 chain */
  if (typeof _KM_QUEST !== 'undefined') {
    if (_KM_QUEST.state === 'inactive' && typeof _GDN_QUEST !== 'undefined' && _GDN_QUEST.state === 'q9_done') {
      _KM_QUEST.state = 'q10_ready';
    }
    if (_KM_QUEST.state === 'q10_done') {
      _KM_QUEST.state = 'q11_ready';
    }
    if (_KM_QUEST.state === 'q11_done') {
      _KM_QUEST.state = 'q12_ready';
    }
  }

  /* Auto-activate _HEL_Q12 */
  if (typeof _HEL_Q12 !== 'undefined' && typeof _KM_QUEST !== 'undefined') {
    if (_HEL_Q12.state === 'inactive' && _KM_QUEST.state === 'q12_ready') {
      _HEL_Q12.state = 'q12_active';
    }
  }

  /* Auto-activate Q13 gate: Q13 becomes available once Q12 done */
  /* (Q13 triggers itself in Gdańsk submap; nothing to auto-set here) */

  /* Auto-activate Q14 when Q13 done */
  if (typeof _GDN_Q13 !== 'undefined' && typeof _GTA_BOSS !== 'undefined') {
    if (_GDN_Q13.state === 'q13_done' && _GTA_BOSS.state === 'inactive') {
      _GTA_BOSS.state = 'q14_ready';
      _GTA_BOSS.hp = _GTA_BOSS.maxHp;
    }
  }

  /* Ending availability: Q14 done → ending ready */
  if (typeof _ENDING !== 'undefined' && _ENDING.state === 'inactive') {
    if (typeof _GTA_BOSS !== 'undefined' && _GTA_BOSS.state === 'q14_done') {
      _ENDING.state = 'end_ready';
    }
  }

  /* Grudziądz Q1: active (enemies alive) or complete (waiting for return dialog) */
  if (_GD_QUEST.state === 'active' || _GD_QUEST.state === 'complete') {
    _drawMapExclamation(ctx, ts, 1755, 1748);
  }

  /* Grudziądz Q3: cat enclosure pending or revealed but no cat yet */
  if (typeof _CAT_Q !== 'undefined' && (_CAT_Q.state === 'pending' || _CAT_Q.state === 'revealed')) {
    _drawMapExclamation(ctx, ts, 1755, 1748);
  }

  /* Toruń Q2: quest waiting for player to enter Toruń */
  if (typeof _TR_QUEST !== 'undefined' && (_TR_QUEST.state === 'active' || _TR_QUEST.state === 'collecting' || _TR_QUEST.state === 'ready')) {
    _drawMapExclamation(ctx, ts, 1630, 1982);
  }

  /* Gdańsk Q4-Q9 */
  if (typeof _GDN_QUEST !== 'undefined') {
    const gS = _GDN_QUEST.state;
    const gdActive = ['q4_ready','q4_intro','q4_play','q4_done',
                      'q5_intro','q5_play','q5_sleep','q5_sleeping',
                      'q6_ready','q6_intro','q6_run','q6_fail','q6_retry','q6_win',
                      'q7_ready','q7_intro','q7_play','q7_won','q7_shopping',
                      'q9_ready'].includes(gS);
    if (gdActive) _drawMapExclamation(ctx, ts, 1738, 505);
  }

  /* Hel Q8 */
  if (typeof _HEL_QUEST !== 'undefined') {
    const hS = _HEL_QUEST.state;
    const helActive = ['q8_ready','q8_intro','q8_hunt','q8_return','q8_shop'].includes(hS);
    if (helActive) _drawMapExclamation(ctx, ts, 1922, 178);
  }

  /* Krynica Q10/Q11 */
  if (typeof _KM_QUEST !== 'undefined') {
    const kS = _KM_QUEST.state;
    const kmActive = ['q10_ready','q10_fight','q10_follow','q10_done',
                      'q11_ready','q11_search','q11_disco'].includes(kS);
    if (kmActive) _drawMapExclamation(ctx, ts, 2632, 527);
  }

  /* Hel Q12 */
  if (typeof _HEL_Q12 !== 'undefined' && _HEL_Q12.state === 'q12_active') {
    _drawMapExclamation(ctx, ts, 1922, 178);
  }

  /* Draw Rafał on world map during Q10 follow */
  if (typeof _KM_QUEST !== 'undefined' && _KM_QUEST.state === 'q10_follow' && _RAFAL_WORLD.active) {
    _drawRafalWorld(ctx, _RAFAL_WORLD.x, _RAFAL_WORLD.y);
  }

  /* Q14: draw boss + ! marker */
  if (typeof _GTA_BOSS !== 'undefined' && _GTA_BOSS.state !== 'inactive') {
    if (typeof drawQ14Boss === 'function') drawQ14Boss(ctx, ts);
    const bS = _GTA_BOSS.state;
    if (['q14_ready','q14_intro','q14_zajac','q14_fight'].includes(bS)) {
      _drawMapExclamation(ctx, ts, _GTA_BOSS.x, _GTA_BOSS.y - 60);
    }
  }

  /* Gdańsk Q13 */
  if (typeof _GDN_Q13 !== 'undefined' && _GDN_Q13.state === 'inactive') {
    if (typeof _HEL_Q12 !== 'undefined' && _HEL_Q12.state === 'q12_done') {
      _drawMapExclamation(ctx, ts, 1738, 505);
    }
  }

  /* Ending: ! marker over Warlubie when ready */
  if (typeof _ENDING !== 'undefined' && _ENDING.state === 'end_ready') {
    _drawMapExclamation(ctx, ts, CFG.SPAWN_X, CFG.SPAWN_Y - 50);
  }
}

/* ── Rafał world-map drawing ── */
function _drawRafalWorld(ctx, x, y) {
  const bob = Math.sin(Date.now()/600) * 2;
  ctx.fillStyle='#111118'; ctx.fillRect(x-9,y+5,8,18); ctx.fillRect(x+1,y+5,8,18);
  ctx.fillStyle='#151520'; ctx.fillRect(x-14,y-10,28,20);
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.font='bold 5px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('EDC',x,y);
  ctx.fillStyle='#d8a878'; ctx.fillRect(x-3,y-16,6,7);
  ctx.beginPath(); ctx.arc(x,y-22+bob,10,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#2a1408';
  ctx.beginPath(); ctx.arc(x,y-24+bob,10,Math.PI,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#888890'; ctx.lineWidth=1.3; ctx.lineCap='round';
  ctx.beginPath(); ctx.arc(x-4,y-22+bob,3.5,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x+4,y-22+bob,3.5,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x-0.5,y-22+bob); ctx.lineTo(x+0.5,y-22+bob); ctx.stroke();
  ctx.font='bold 9px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
  ctx.fillStyle='#ff90c0'; ctx.shadowColor='#000'; ctx.shadowBlur=4;
  ctx.fillText('Rafał',x,y-36+bob); ctx.shadowBlur=0;
}

/* ── World companion update (called each frame from game.js) ── */
function updateWorldCompanions(dt) {
  const dtS = dt / 1000;
  if (typeof _KM_QUEST === 'undefined') return;

  if (_KM_QUEST.state === 'q10_follow') {
    if (!_RAFAL_WORLD.active) {
      _RAFAL_WORLD.x = 2632; _RAFAL_WORLD.y = 527;
      _RAFAL_WORLD.active = true;
      _RAFAL_WORLD.mode = 'follow';
      _RAFAL_WORLD.modeTimer = 5 + Math.random() * 6;
    }

    _RAFAL_WORLD.modeTimer -= dtS;
    if (_RAFAL_WORLD.modeTimer <= 0) {
      if (_RAFAL_WORLD.mode === 'follow') {
        /* często ucieka — 70% run, 30% stop */
        if (Math.random() < 0.7) {
          _RAFAL_WORLD.mode = 'run';
          _RAFAL_WORLD.modeTimer = 3 + Math.random() * 3;
          const a = Math.random() * Math.PI * 2;
          _RAFAL_WORLD.runDX = Math.cos(a); _RAFAL_WORLD.runDY = Math.sin(a);
        } else {
          _RAFAL_WORLD.mode = 'stop';
          _RAFAL_WORLD.modeTimer = 1.5 + Math.random() * 2;
        }
      } else if (_RAFAL_WORLD.mode === 'run') {
        _RAFAL_WORLD.mode = 'stop';
        _RAFAL_WORLD.modeTimer = 1 + Math.random() * 1.5;
      } else {
        _RAFAL_WORLD.mode = 'follow';
        _RAFAL_WORLD.modeTimer = 2 + Math.random() * 3;
      }
    }

    const dx = player.x - _RAFAL_WORLD.x;
    const dy = player.y - _RAFAL_WORLD.y;
    const dist = Math.hypot(dx, dy) || 1;

    const _iceOn = typeof acIsActive === 'function' && acIsActive('iceowka');
    const _rafalSpMult = (typeof aceRafalSpeedMult === 'function' ? aceRafalSpeedMult() : 1) * (_iceOn ? 0.5 : 1);
    const _iceTimer = _iceOn ? (Date.now()*0.002) : 0;
    const _iceDriftX = _iceOn ? Math.cos(_iceTimer*2.1)*30*dtS : 0;
    const _iceDriftY = _iceOn ? Math.sin(_iceTimer*1.7)*20*dtS : 0;
    if (_RAFAL_WORLD.mode === 'follow' && dist > 40) {
      const spd = _RAFAL_WORLD.speed * _rafalSpMult * dtS;
      _RAFAL_WORLD.x += (dx/dist) * spd + _iceDriftX;
      _RAFAL_WORLD.y += (dy/dist) * spd + _iceDriftY;
    } else if (_RAFAL_WORLD.mode === 'run') {
      const spd = _RAFAL_WORLD.speed * _rafalSpMult * 1.4 * dtS;
      _RAFAL_WORLD.x += _RAFAL_WORLD.runDX * spd + _iceDriftX;
      _RAFAL_WORLD.y += _RAFAL_WORLD.runDY * spd + _iceDriftY;
      _RAFAL_WORLD.x = Math.max(50, Math.min(CFG.WORLD_W - 50, _RAFAL_WORLD.x));
      _RAFAL_WORLD.y = Math.max(50, Math.min(CFG.WORLD_H - 50, _RAFAL_WORLD.y));
    }

    if (_RAFAL_WORLD.mode === 'stop' && dist < 80) {
      _RAFAL_WORLD.mode = 'follow';
      _RAFAL_WORLD.modeTimer = 5 + Math.random() * 5;
    }

    /* Deactivate Rafał on world map once q10 is done (completed inside Gdańsk submap) */
    if (_KM_QUEST.state !== 'q10_follow') _RAFAL_WORLD.active = false;
  } else {
    if (_KM_QUEST.state !== 'q10_fight') _RAFAL_WORLD.active = false;
  }

  /* Q14 boss update (passes last movement direction from game.js globals) */
  if (typeof updateQ14Boss === 'function') {
    const ldx = (typeof _playerLastDirX !== 'undefined') ? _playerLastDirX : 0;
    const ldy = (typeof _playerLastDirY !== 'undefined') ? _playerLastDirY : 1;
    updateQ14Boss(dt, ldx, ldy);
  }

  /* Ending dialog progression */
  if (typeof _ENDING !== 'undefined') {
    if (_ENDING.state === 'end_ready') {
      if (!isDialogOpen() && !isAngerActive() &&
          Math.hypot(player.x - CFG.SPAWN_X, player.y - CFG.SPAWN_Y) < 100) {
        _ENDING.state = 'end_dialog1';
        showDialog('😴', 'Ojojoj, już jest 21:00 dużo się działo, jest już późno, ja ide spać');
      }
    }
    if (_ENDING.state === 'end_dialog1' && !isDialogOpen()) {
      _ENDING.state = 'end_dialog2'; showDialog('😴', 'Łeło łeło');
    }
    if (_ENDING.state === 'end_dialog2' && !isDialogOpen()) {
      _ENDING.state = 'end_dialog3'; showDialog('😴', 'Mimi mimi');
    }
    if (_ENDING.state === 'end_dialog3' && !isDialogOpen()) {
      _ENDING.state = 'end_fade';
      if (typeof _startEndingFade === 'function') _startEndingFade();
    }
  }
}

function _drawMapExclamation(ctx, ts, qx, qy) {
  const pulse = 0.7 + Math.sin(ts * 0.006) * 0.3;
  ctx.beginPath();
  ctx.arc(qx, qy, 22 * pulse, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,80,0,${0.18 * pulse})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(qx, qy, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#ff4400';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = 'bold 16px "Segoe UI",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 3;
  ctx.fillText('!', qx, qy);
  ctx.shadowBlur = 0;
}

/* ════════════════════════════════════════════════════
   Q14 — Giga Turbo Agnieszka boss fight (world map)
   ════════════════════════════════════════════════════ */
function updateQ14Boss(dt, lastDirX, lastDirY) {
  const B = _GTA_BOSS;
  const dtS = dt / 1000;

  if (B.state === 'inactive' || B.state === 'q14_done') return;

  if (B.state === 'q14_ready') {
    if (!isDialogOpen() && Math.hypot(player.x - B.x, player.y - B.y) < 220) {
      B.state = 'q14_intro'; showDialog('😤', 'Na szczęście mam Zajca!');
    }
    return;
  }

  if (B.state === 'q14_intro') {
    if (!isDialogOpen()) {
      B.zajacX = player.x; B.zajacY = player.y - 420; B.zajacVY = 0;
      B.state = 'q14_zajac';
    }
    return;
  }

  if (B.state === 'q14_zajac') {
    const dy = (player.y - 55) - B.zajacY;
    B.zajacVY += (dy * 8 - B.zajacVY) * Math.min(1, dtS * 6);
    B.zajacY  += B.zajacVY * dtS;
    B.zajacX   = player.x + 22;
    if (Math.abs(dy) < 8 && Math.abs(B.zajacVY) < 20) {
      B.zajacY = player.y - 55; B.zajacVY = 0;
      B.state = 'q14_fight';
      B.laserTimer = 3; B.rockTimer = 3;
      B.rocks = []; B.explodePFX = [];
    }
    return;
  }

  if (B.state === 'q14_fight') {
    if (B.laserBeam) { B.laserBeam.alpha -= dtS * 2.8; if (B.laserBeam.alpha <= 0) B.laserBeam = null; }

    /* Laser every 3s — random 3-8 damage */
    B.laserTimer -= dtS;
    if (B.laserTimer <= 0) {
      B.laserTimer = typeof aceLaserResetTime === 'function' ? aceLaserResetTime() : 3;
      const LEN = 700;
      const ex = player.x + lastDirX * LEN, ey = player.y + lastDirY * LEN;
      B.laserBeam = { x1: player.x, y1: player.y, x2: ex, y2: ey, alpha: 1.0 };
      const ldx = ex-player.x, ldy = ey-player.y, ll = Math.hypot(ldx,ldy)||1;
      const t = Math.max(0, Math.min(1, ((B.x-player.x)*ldx+(B.y-player.y)*ldy)/(ll*ll)));
      if (Math.hypot(player.x+t*ldx-B.x, player.y+t*ldy-B.y) < 88 && t > 0.05) {
        B.hp = Math.max(0, B.hp - (3 + Math.floor(Math.random() * 6)));
      }
    }

    /* Standing still detection — big area rock after 2s */
    const movedDist = Math.hypot(player.x - B.lastPlayerX, player.y - B.lastPlayerY);
    if (movedDist > 10) {
      B.stillTimer = 0; B.lastPlayerX = player.x; B.lastPlayerY = player.y;
    } else {
      B.stillTimer += dtS;
      if (B.stillTimer >= 2) {
        B.stillTimer = 0;
        const dx=player.x-B.x, dy=player.y-B.y, d=Math.hypot(dx,dy)||1;
        B.rocks.push({ x:B.x, y:B.y, dx:dx/d*140, dy:dy/d*140, alive:true, big:true });
      }
    }

    /* Normal rocks — faster interval */
    B.rockTimer -= dtS;
    if (B.rockTimer <= 0) {
      B.rockTimer = 0.8 + Math.random() * 1.0;
      const dx=player.x-B.x, dy=player.y-B.y, d=Math.hypot(dx,dy)||1;
      B.rocks.push({ x:B.x, y:B.y, dx:dx/d*270, dy:dy/d*270, alive:true, big:false });
    }
    for (const r of B.rocks) {
      r.x += r.dx*dtS; r.y += r.dy*dtS;
      const hitR = r.big ? 52 : 22;
      const dmg  = r.big ? 25 : 12;
      if (Math.hypot(r.x-player.x, r.y-player.y) < hitR) {
        r.alive = false;
        if (typeof applyZdenerwowanie === 'function') applyZdenerwowanie(dmg * (typeof aceAtakMult==='function'?aceAtakMult():1));
      }
      if (Math.hypot(r.x-B.x, r.y-B.y) > 1000) r.alive = false;
    }
    B.rocks = B.rocks.filter(r => r.alive);
    B.zajacX = player.x+22; B.zajacY = player.y-55;

    if (B.hp <= 0) {
      B.state = 'q14_exploding'; B.explodeTimer = 2.5;
      B.rocks = []; B.laserBeam = null;
      for (let i=0; i<28; i++) {
        const a=Math.random()*Math.PI*2, s=80+Math.random()*220;
        B.explodePFX.push({ x:B.x, y:B.y, dx:Math.cos(a)*s, dy:Math.sin(a)*s, alpha:1, life:0.8+Math.random()*0.8, size:4+Math.random()*12 });
      }
    }
    return;
  }

  if (B.state === 'q14_exploding') {
    B.explodeTimer -= dtS;
    for (const p of B.explodePFX) {
      p.x+=p.dx*dtS; p.y+=p.dy*dtS;
      p.dx*=(1-dtS*1.5); p.dy*=(1-dtS*1.5);
      p.alpha=Math.max(0, p.alpha-dtS/p.life);
    }
    if (B.explodeTimer <= 0 && !isDialogOpen()) {
      B.state = 'q14_vd1';
      showDialog('😤', 'Głupia agnieszka, ja jestem Aga, a Aga to Agata a nie jakaś agnieszka');
    }
    return;
  }

  if (B.state === 'q14_vd1' && !isDialogOpen()) { B.state = 'q14_vd2'; showDialog('😤', 'I koniec'); return; }
  if (B.state === 'q14_vd2' && !isDialogOpen()) { B.state = 'q14_vd3'; showDialog('😤', 'I chuj'); return; }
  if (B.state === 'q14_vd3' && !isDialogOpen()) {
    B.state = 'q14_done';
    if (typeof _ENDING !== 'undefined') _ENDING.state = 'end_ready';
  }
}

function drawQ14Boss(ctx, ts) {
  const B = _GTA_BOSS;
  if (B.state === 'inactive') return;

  if (B.laserBeam && B.laserBeam.alpha > 0) {
    const lb = B.laserBeam;
    ctx.save(); ctx.globalAlpha = lb.alpha;
    ctx.strokeStyle='#00ffee'; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.shadowColor='#00ffff'; ctx.shadowBlur=20;
    ctx.beginPath(); ctx.moveTo(lb.x1,lb.y1); ctx.lineTo(lb.x2,lb.y2); ctx.stroke();
    ctx.lineWidth=2; ctx.strokeStyle='#fff';
    ctx.beginPath(); ctx.moveTo(lb.x1,lb.y1); ctx.lineTo(lb.x2,lb.y2); ctx.stroke();
    ctx.shadowBlur=0; ctx.globalAlpha=1; ctx.restore();
  }

  for (const r of B.rocks) {
    if (r.big) {
      ctx.fillStyle='#443'; ctx.strokeStyle='#221'; ctx.lineWidth=2.5;
      ctx.shadowColor='#ff4400'; ctx.shadowBlur=18;
      ctx.beginPath(); ctx.arc(r.x,r.y,22,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.shadowBlur=0;
      ctx.fillStyle='#665';
      ctx.beginPath(); ctx.arc(r.x-4,r.y-4,8,0,Math.PI*2); ctx.fill();
      /* AOE preview ring */
      ctx.strokeStyle='rgba(255,80,0,0.35)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(r.x,r.y,52,0,Math.PI*2); ctx.stroke();
    } else {
      ctx.fillStyle='#888'; ctx.strokeStyle='#555'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(r.x,r.y,9,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#aaa';
      ctx.beginPath(); ctx.arc(r.x-2,r.y-2,3.5,0,Math.PI*2); ctx.fill();
    }
  }

  if (B.state !== 'q14_done') _drawGTABossWorld(ctx, B.x, B.y, ts);

  if (B.state === 'q14_exploding') {
    for (const p of B.explodePFX) {
      if (p.alpha <= 0) continue;
      ctx.save(); ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.size > 8 ? '#ff8800' : '#ffee00';
      ctx.shadowColor='#ff4400'; ctx.shadowBlur=12;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  if (['q14_zajac','q14_fight'].includes(B.state)) _drawZajac(ctx, B.zajacX, B.zajacY, ts);
}

function _drawGTABossWorld(ctx, x, y, ts) {
  const B = _GTA_BOSS;
  const exploding = B.state === 'q14_exploding';
  const bob = Math.sin(ts/500) * 2.5;
  ctx.save();
  if (exploding) { ctx.shadowColor='#ff6600'; ctx.shadowBlur=40; }

  const b = bob; // shorthand

  /* ── LEGS WITH FISHNET (drawn first, skirt covers top) ── */
  if (!exploding) {
    const legTop = y+20+b, legBot = y+42+b;
    /* left leg skin */
    ctx.fillStyle = '#f5ddd0';
    ctx.fillRect(x-15, legTop, 10, legBot - legTop);
    /* right leg skin */
    ctx.fillRect(x+5,  legTop, 10, legBot - legTop);
    /* fishnet grid on both legs */
    ctx.strokeStyle = 'rgba(10,0,15,0.65)'; ctx.lineWidth = 1;
    /* horizontal */
    for (let fy = legTop+2; fy < legBot; fy += 4) {
      ctx.beginPath(); ctx.moveTo(x-15, fy); ctx.lineTo(x-5,  fy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x+5,  fy); ctx.lineTo(x+15, fy); ctx.stroke();
    }
    /* vertical */
    for (let fx = x-15; fx <= x-5; fx += 4) {
      ctx.beginPath(); ctx.moveTo(fx, legTop); ctx.lineTo(fx, legBot); ctx.stroke();
    }
    for (let fx = x+5; fx <= x+15; fx += 4) {
      ctx.beginPath(); ctx.moveTo(fx, legTop); ctx.lineTo(fx, legBot); ctx.stroke();
    }
  }

  /* ── BLACK BLOUSE (torso) ── */
  ctx.fillStyle = exploding ? '#ff6600' : '#111';
  ctx.beginPath(); ctx.ellipse(x, y+b, 22, 14, 0, 0, Math.PI*2); ctx.fill();
  /* chest curves */
  if (!exploding) {
    ctx.fillStyle='#1e1e1e';
    ctx.beginPath(); ctx.ellipse(x-7, y-4+b, 8, 7, -0.25, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+7, y-4+b, 8, 7, 0.25, 0, Math.PI*2); ctx.fill();
  }

  /* ── BLACK SHORT SKIRT ── */
  if (!exploding) {
    ctx.fillStyle='#111';
    ctx.beginPath(); ctx.ellipse(x, y+12+b, 23, 9, 0, 0, Math.PI*2); ctx.fill();
    /* hem */
    ctx.strokeStyle='#3a3a3a'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.ellipse(x, y+19+b, 22, 5, 0, 0, Math.PI*2); ctx.stroke();
  }

  /* ── HEAD — same colour as body skin ── */
  ctx.shadowBlur=0;
  ctx.fillStyle='#f5ddd0';
  ctx.beginPath(); ctx.arc(x, y-28+b, 20, 0, Math.PI*2); ctx.fill();

  /* ── WHITE HAIR — back side strands ── */
  ctx.fillStyle='#dcdcec';
  ctx.beginPath(); ctx.ellipse(x-23,y-18+b,6,15,0.28,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+23,y-18+b,6,15,-0.28,0,Math.PI*2); ctx.fill();
  /* hair cap */
  ctx.fillStyle='#e8e8f4';
  ctx.beginPath(); ctx.arc(x,y-30+b,21,Math.PI*0.82,Math.PI*2.18); ctx.fill();
  /* BANGS — white fringe over forehead */
  ctx.fillStyle='#e0e0f0';
  ctx.beginPath();
  ctx.moveTo(x-18, y-26+b);
  ctx.quadraticCurveTo(x-10, y-20+b, x-4, y-22+b);
  ctx.quadraticCurveTo(x, y-19+b, x+4, y-22+b);
  ctx.quadraticCurveTo(x+10, y-20+b, x+18, y-26+b);
  ctx.quadraticCurveTo(x, y-30+b, x-18, y-26+b);
  ctx.closePath(); ctx.fill();
  /* platinum sheen */
  ctx.fillStyle='rgba(255,255,255,0.65)';
  ctx.beginPath(); ctx.ellipse(x-3,y-40+b,5,3,-0.3,0,Math.PI*2); ctx.fill();

  /* ── DARK EYESHADOW + LINER ── */
  ctx.fillStyle='rgba(8,0,14,0.7)';
  ctx.beginPath(); ctx.ellipse(x-7.5, y-28+b, 6, 3.2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+7.5, y-28+b, 6, 3.2, 0, 0, Math.PI*2); ctx.fill();
  /* liner wings */
  ctx.strokeStyle='#000'; ctx.lineWidth=1.6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x-13,y-27+b); ctx.lineTo(x-17,y-29+b); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+13,y-27+b); ctx.lineTo(x+17,y-29+b); ctx.stroke();
  /* irises — dark green (not purple) */
  ctx.fillStyle='#225522';
  ctx.beginPath(); ctx.arc(x-7.5,y-28+b,2.6,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+7.5,y-28+b,2.6,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(x-6.5,y-29+b,1.1,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+8.5,y-29+b,1.1,0,Math.PI*2); ctx.fill();

  /* ── BLACK LIPS — closed, narrow, lower ── */
  const mX=x, mY=y-17+b, mW=5, mH=1.6;
  ctx.fillStyle='#0d0d0d';
  ctx.beginPath();
  /* upper lip: cupid's bow */
  ctx.moveTo(mX-mW, mY);
  ctx.bezierCurveTo(mX-mW+1, mY-mH*0.9, mX-mW*0.35, mY-mH*1.3, mX, mY-mH*0.5);
  ctx.bezierCurveTo(mX+mW*0.35, mY-mH*1.3, mX+mW-1, mY-mH*0.9, mX+mW, mY);
  /* lower lip: full rounded arc */
  ctx.bezierCurveTo(mX+mW*0.65, mY+mH*1.1, mX-mW*0.65, mY+mH*1.1, mX-mW, mY);
  ctx.closePath(); ctx.fill();
  /* lip line */
  ctx.strokeStyle='#050505'; ctx.lineWidth=1; ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(mX-mW, mY);
  ctx.bezierCurveTo(mX-mW*0.4, mY+0.5, mX+mW*0.4, mY+0.5, mX+mW, mY);
  ctx.stroke();

  /* ── LABEL ── */
  if (!exploding) {
    ctx.font='bold 10px "Segoe UI",sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillStyle='#cc88ff'; ctx.shadowColor='#000'; ctx.shadowBlur=6;
    ctx.fillText('GIGA TURBO',x,y-52+b); ctx.fillText('AGNIESZKA',x,y-42+b);
    ctx.shadowBlur=0;
  }
  ctx.restore();
}

function _drawZajac(ctx, x, y, ts) {
  const bob = Math.sin(ts/400) * 2;
  ctx.save(); ctx.translate(x, y+bob);
  ctx.fillStyle='#f5e8d8';
  ctx.beginPath(); ctx.ellipse(0,2,9,11,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(0,-10,8,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#e8d0c0';
  ctx.beginPath(); ctx.ellipse(-5,-22,3,10,-0.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5,-22,3,10,0.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f0a0b0';
  ctx.beginPath(); ctx.ellipse(-5,-22,1.5,7,-0.2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5,-22,1.5,7,0.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#e060a0';
  ctx.beginPath(); ctx.arc(-3,-11,2,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(3,-11,2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(-2.2,-11.5,0.7,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.8,-11.5,0.7,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#e08090';
  ctx.beginPath(); ctx.arc(0,-8,1.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(0,13,4,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
