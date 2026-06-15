'use strict';

// Each key is "row,col", value is an event object.
// Add more events here for the story!
const EVENTS = {
  '11,6': {
    portrait: '💭',
    text: 'Tu zaczyna się nasza historia...\n\nDodaj tu pierwsze wspomnienie! ❤️',
    id: 'memory_1',
  },
  '13,5': {
    portrait: '🌸',
    text: 'To miejsce zawsze będzie wyjątkowe.\n\nDodaj tu drugą wiadomość! 🌸',
    id: 'memory_2',
  },
  '17,6': {
    portrait: '⭐',
    text: 'Dziękuję, że jesteś. Zawsze.\n\nDodaj tu trzecią wiadomość! ⭐',
    id: 'memory_3',
  },
};

const triggeredEvents = new Set();

function onPlayerArrived(row, col) {
  const key = `${row},${col}`;
  const event = EVENTS[key];
  if (event && !triggeredEvents.has(event.id)) {
    triggeredEvents.add(event.id);
    showDialog(event.portrait, event.text);
  }
}

// Allow re-triggering already-seen events by tapping EVENT tiles while standing on them
function tryTriggerEvent(row, col) {
  const key = `${row},${col}`;
  const event = EVENTS[key];
  if (event) {
    showDialog(event.portrait, event.text);
  }
}

// ── Dialog UI ─────────────────────────────────────────────────────────────────

const dialogOverlay = document.getElementById('dialog-overlay');
const dialogPortrait = document.getElementById('dialog-portrait');
const dialogText    = document.getElementById('dialog-text');
const dialogClose   = document.getElementById('dialog-close');

let dialogOpen = false;

function showDialog(portrait, text) {
  dialogPortrait.textContent = portrait;
  // Replace \n with <br> for multi-line support
  dialogText.innerHTML = text.replace(/\n/g, '<br>');
  dialogOverlay.classList.remove('hidden');
  dialogOpen = true;
}

function closeDialog() {
  dialogOverlay.classList.add('hidden');
  dialogOpen = false;
}

function isDialogOpen() {
  return dialogOpen;
}

dialogClose.addEventListener('click', closeDialog);
dialogOverlay.addEventListener('click', e => {
  if (e.target === dialogOverlay) closeDialog();
});
