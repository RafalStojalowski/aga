'use strict';

const SAVE_KEY = 'nasza_przygoda_v2';

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      x: Math.round(player.x),
      y: Math.round(player.y),
      triggered: [..._triggered],
    }));
    showSaveToast();
  } catch (e) { /* storage blocked */ }
}

function loadGame() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!s) return;
    if (typeof s.x === 'number') { player.x = s.x; player.y = s.y; }
    if (Array.isArray(s.triggered)) s.triggered.forEach(id => _triggered.add(id));
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
