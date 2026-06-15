'use strict';

const SAVE_KEY = 'nasza_przygoda_save';

function saveGame() {
  const state = {
    row: player.row,
    col: player.col,
    triggered: [...triggeredEvents],
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    showSaveToast();
  } catch (e) {
    console.warn('Nie udało się zapisać:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const state = JSON.parse(raw);

    if (typeof state.row === 'number' && typeof state.col === 'number') {
      player.row = state.row;
      player.col = state.col;
      player.prevRow = state.row;
      player.prevCol = state.col;
      player.t = 1;
    }

    if (Array.isArray(state.triggered)) {
      state.triggered.forEach(id => triggeredEvents.add(id));
    }

    return true;
  } catch (e) {
    console.warn('Nie udało się wczytać:', e);
    return false;
  }
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

// Auto-save every 15 seconds
setInterval(saveGame, 15000);

// Save on page hide (mobile: when user closes tab/app)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveGame();
});

// ── Toast ─────────────────────────────────────────────────────────────────────

const saveToast = document.getElementById('save-toast');

function showSaveToast() {
  const toast = document.getElementById('save-toast');
  toast.classList.remove('hidden');
  toast.style.animation = 'none';
  // Force reflow to restart CSS animation
  void toast.offsetWidth;
  toast.style.animation = '';
  setTimeout(() => toast.classList.add('hidden'), 2100);
}
