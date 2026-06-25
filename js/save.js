'use strict';

const SAVE_KEY = 'nasza_przygoda_v3';

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      x:           Math.round(player.x),
      y:           Math.round(player.y),
      triggered:   [..._triggered],
      zlote:       gameStats.zlote,
      maroPoints:  catState.maroPoints,
      cats:        catState.cats.map(c => ({ typeId: c.typeId, px: c._x, py: c._y, appearance: c.appearance })),
      playerCards: playerCards,
      equipState:  { atakowny: equipState.atakowny, obronny: equipState.obronny, hybrydowy: equipState.hybrydowy },
      gdQuestState: _GD_QUEST.state,
      gdKilled:     _GD_QUEST.killed,
      trQuestState: _TR_QUEST.state,
      catQState:    _CAT_Q.state,
      catQFirstDone: _CAT_Q.firstCatDone,
      gdnQuestState: _GDN_QUEST.state,
      helQuestState: _HEL_QUEST.state,
      helQuestKills: _HEL_QUEST.kills,
      kmQuestState:  typeof _KM_QUEST !== 'undefined' ? _KM_QUEST.state : 'inactive',
      helQ12State:   typeof _HEL_Q12  !== 'undefined' ? _HEL_Q12.state  : 'inactive',
      gdnQ13State:   typeof _GDN_Q13  !== 'undefined' ? _GDN_Q13.state  : 'inactive',
      gtaBossState:  typeof _GTA_BOSS  !== 'undefined' ? _GTA_BOSS.state  : 'inactive',
      endingState:   typeof _ENDING   !== 'undefined' ? _ENDING.state   : 'inactive',
    }));
    showSaveToast();
  } catch (e) { /* storage blocked */ }
}

function loadGame() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!s) return;
    if (typeof s.x === 'number' && typeof s.y === 'number') {
      if (!isBlocked(s.x, s.y, CFG.PLAYER_R)) {
        player.x = s.x;
        player.y = s.y;
      }
    }
    if (Array.isArray(s.triggered)) s.triggered.forEach(id => _triggered.add(id));
    if (typeof s.zlote      === 'number') addZlote(s.zlote);
    if (typeof s.maroPoints === 'number') addMaro(s.maroPoints);
    if (Array.isArray(s.playerCards))
      playerCards = s.playerCards.filter(id => ALL_CARDS.some(c => c.id === id));
    if (s.equipState) {
      const valid = id => !id || ALL_SHOP_ITEMS.some(i => i.id === id);
      if (valid(s.equipState.atakowny))  equipState.atakowny  = s.equipState.atakowny  || null;
      if (valid(s.equipState.obronny))   equipState.obronny   = s.equipState.obronny   || null;
      if (valid(s.equipState.hybrydowy)) equipState.hybrydowy = s.equipState.hybrydowy || null;
    }
    const VALID_GD = ['idle','active','complete','done'];
    const VALID_TR = ['inactive','active','collecting','ready','done'];
    const VALID_CAT_Q = ['hidden','pending','revealed','done'];
    if (s.gdQuestState && VALID_GD.includes(s.gdQuestState)) {
      _GD_QUEST.state  = s.gdQuestState;
      _GD_QUEST.killed = typeof s.gdKilled === 'number' ? s.gdKilled : 0;
      if (s.gdQuestState === 'active' || s.gdQuestState === 'complete' || s.gdQuestState === 'done') _spawnAgnieszkas();
    }
    if (s.trQuestState && VALID_TR.includes(s.trQuestState)) _TR_QUEST.state = s.trQuestState;
    if (s.gdnQuestState) {
      let gs = s.gdnQuestState;
      /* collapse mid-minigame states back to safe checkpoints */
      if (['q4_intro','q4_play'].includes(gs))                          gs = 'q4_ready';
      if (['q5_intro','q5_play','q5_sleep','q5_sleeping'].includes(gs)) gs = 'q4_done';
      if (['q6_intro','q6_run','q6_fail','q6_retry','q6_win'].includes(gs)) gs = 'q6_ready';
      if (['q7_intro','q7_play'].includes(gs))                          gs = 'q7_ready';
      if (gs === 'q7_won')                                              gs = 'q7_shopping';
      if (gs === 'q9_scene')                                            gs = 'q9_ready';
      _GDN_QUEST.state = gs;
    }
    if (s.helQuestState) {
      let hs = s.helQuestState;
      if (hs === 'q8_intro') hs = 'q8_ready';
      const VALID_HEL = ['inactive','q8_ready','q8_hunt','q8_return','q8_shop','q8_done'];
      if (VALID_HEL.includes(hs)) {
        _HEL_QUEST.state = hs;
        _HEL_QUEST.kills = typeof s.helQuestKills === 'number' ? s.helQuestKills : 0;
      }
    }
    if (s.kmQuestState) {
      let ks = s.kmQuestState;
      if (['q10_fight'].includes(ks)) ks = 'q10_ready';
      if (['q11_disco'].includes(ks)) ks = 'q11_search';
      const VALID_KM = ['inactive','q10_ready','q10_fight','q10_follow','q10_done',
                        'q11_ready','q11_search','q11_disco','q11_done',
                        'q12_ready','q12_done'];
      if (typeof _KM_QUEST !== 'undefined' && VALID_KM.includes(ks)) _KM_QUEST.state = ks;
    }
    if (s.helQ12State && typeof _HEL_Q12 !== 'undefined') {
      if (['inactive','q12_active','q12_done'].includes(s.helQ12State)) _HEL_Q12.state = s.helQ12State;
    }
    if (s.gdnQ13State && typeof _GDN_Q13 !== 'undefined') {
      if (['inactive','q13_done'].includes(s.gdnQ13State)) _GDN_Q13.state = s.gdnQ13State;
    }
    if (s.gtaBossState && typeof _GTA_BOSS !== 'undefined') {
      const VALID_GTA = ['inactive','q14_ready','q14_done'];
      if (VALID_GTA.includes(s.gtaBossState)) {
        _GTA_BOSS.state = s.gtaBossState;
        _GTA_BOSS.hp = _GTA_BOSS.maxHp;
      }
    }
    if (s.endingState && typeof _ENDING !== 'undefined') {
      if (['inactive','end_ready','end_done'].includes(s.endingState)) _ENDING.state = s.endingState;
    }
    if (s.catQState && VALID_CAT_Q.includes(s.catQState)) {
      _CAT_Q.state = s.catQState;
      _CAT_Q.firstCatDone = !!s.catQFirstDone;
    }
    if (Array.isArray(s.cats)) {
      /* stare save'y bez catQState — jeśli gracz miał koty, zagroda musiała być odkryta */
      if (!s.catQState && s.cats.length > 0) { _CAT_Q.state = 'done'; _CAT_Q.firstCatDone = true; }
      for (const sc of s.cats) {
        const type = CAT_TYPES.find(t => t.id === sc.typeId);
        if (!type) continue;
        const margin = 48;
        catState.cats.push({
          typeId:     sc.typeId,
          appearance: sc.appearance || {},
          _x:         sc.px ?? (CAT_ENC.x + margin + Math.random() * (CAT_ENC.w - margin*2)),
          _y:         sc.py ?? (CAT_ENC.y + 80 + Math.random() * (CAT_ENC.h - 120)),
          _dir:       1,
          _mewTimer:  Math.random() * 10 + 5,
          _mewAlpha:  0,
          patrolMin:  CAT_ENC.x + margin,
          patrolMax:  CAT_ENC.x + CAT_ENC.w - margin,
          speed:      28 + Math.random() * 28,
          stepAnim:   Math.random() * Math.PI * 2,
        });
      }
    }
  } catch (e) { /* ignore */ }
}

setInterval(saveGame, 15000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveGame();
});

function showSaveToast() {
  const el = document.getElementById('save-toast');
  el.classList.remove('hidden');
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  setTimeout(() => el.classList.add('hidden'), 2100);
}
