'use strict';

/* ════════════════════════════════════════════════════
   Ending Sequence
   State: inactive | end_ready | end_dialog1-3 | end_fade | end_koniec | end_credits | end_finale
   ════════════════════════════════════════════════════ */

const _ENDING = {
  state: 'inactive',
  playerAlpha: 1,
  _raf: null,
  _audio: null,
  _musicStarted: false,
};

const _CREDITS_LINES = [
  { text: '2 lata razem', style: 'title' },
  { text: '', style: 'gap' },
  { text: '── 2024 / 2025 ──', style: 'divider' },
  { text: '', style: 'gap' },
  { text: 'Stworzył, zaprogramował,', style: 'heading' },
  { text: 'narysował i wyreżyserował', style: 'heading' },
  { text: 'Rafał Stojałowski', style: 'name' },
  { text: '', style: 'gap' },
  { text: '', style: 'gap' },
  { text: 'Podgłośnij dzwięk :)', style: 'music_cue' },
  { text: '', style: 'gap' },
  { text: '', style: 'gap' },
  { text: 'Scenariusz i historia', style: 'heading' },
  { text: 'Rafał', style: 'name' },
  { text: '', style: 'gap' },
  { text: 'Grafika i animacje', style: 'heading' },
  { text: 'Rafał', style: 'name' },
  { text: '', style: 'gap' },
  { text: 'Muzyka i dźwięk', style: 'heading' },
  { text: 'Rafał', style: 'name' },
  { text: '', style: 'gap' },
  { text: 'Mapa i lokalizacje', style: 'heading' },
  { text: 'Rafał', style: 'name' },
  { text: '', style: 'gap' },
  { text: 'Koty i ich rysowanie', style: 'heading' },
  { text: 'Rafał', style: 'name' },
  { text: '', style: 'gap' },
  { text: 'Bugi i błędy', style: 'heading' },
  { text: 'Też Rafał', style: 'name' },
  { text: '', style: 'gap' },
  { text: '', style: 'gap' },
  { text: '── Szczególne podziękowania ──', style: 'divider' },
  { text: '', style: 'gap' },
  { text: 'Agata', style: 'name' },
  { text: 'za bycie najlepszą Agą na świecie', style: 'sub' },
  { text: '', style: 'gap' },
  { text: 'Tata Igiego', style: 'name' },
  { text: 'za dom w Krynicy Morskiej', style: 'sub' },
  { text: '', style: 'gap' },
  { text: 'Krzysztof Rataj Ratajski', style: 'name' },
  { text: 'za towarzystwo', style: 'sub' },
  { text: '', style: 'gap' },
  { text: 'MARO', style: 'name' },
  { text: 'za bycie najlepszym psem', style: 'sub' },
  { text: '', style: 'gap' },
  { text: 'Giga Turbo Agnieszka', style: 'name' },
  { text: 'za bycie złoczyńcą', style: 'sub' },
  { text: '', style: 'gap' },
  { text: 'Gofrownia Hel', style: 'name' },
  { text: 'za gofry na cały Hel', style: 'sub' },
  { text: '', style: 'gap' },
  { text: '', style: 'gap' },
  { text: 'Wszelkie podobieństwo do rzeczywistości', style: 'small' },
  { text: 'jest jak najbardziej zamierzone', style: 'small' },
  { text: '', style: 'gap' },
  { text: '', style: 'gap' },
  { text: '♥  Zrobiłem to wszystko bo cię kocham  ♥', style: 'love' },
  { text: '', style: 'gap' },
  { text: '', style: 'gap' },
  { text: '', style: 'gap' },
  { text: '', style: 'gap' },
];

const _LINE_HEIGHT = 36;
const _MUSIC_CUE_IDX = _CREDITS_LINES.findIndex(l => l.style === 'music_cue');

let _creditsY = 0;
let _creditsPhase = 'koniec'; // koniec | rolling | done
let _konieczAlpha = 0;
let _konieczTimer = 0;
let _musicTriggered = false;
let _musicStartY = 0; // canvas Y where music_cue line appears
let _finalePhase = 0;
let _finaleAlpha = 0;
let _finaleTimer = 0;

function _startEndingFade() {
  _ENDING.playerAlpha = 1;
  _ENDING.state = 'end_fade';
}

function updateEndingFade(dt) {
  if (_ENDING.state !== 'end_fade') return;
  _ENDING.playerAlpha = Math.max(0, _ENDING.playerAlpha - dt / 3000);
  if (_ENDING.playerAlpha <= 0) {
    _ENDING.state = 'end_koniec';
    _launchEndingOverlay();
  }
}

function _launchEndingOverlay() {
  const ov = document.getElementById('ending-overlay');
  const cv = document.getElementById('ending-cvs');
  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
  ov.classList.remove('hidden');

  _creditsY     = cv.height + 60;
  _creditsPhase = 'koniec';
  _konieczAlpha = 0;
  _konieczTimer = 0;
  _musicTriggered = false;
  _finalePhase  = 0;
  _finaleAlpha  = 0;
  _finaleTimer  = 0;

  /* calculate where music_cue line ends up relative to total scrolling */
  _musicStartY  = cv.height - (_MUSIC_CUE_IDX * _LINE_HEIGHT);

  let lastTs = null;
  function tick(ts) {
    const dt2 = lastTs === null ? 16 : Math.min(ts - lastTs, 80);
    lastTs = ts;
    const dtS = dt2 / 1000;
    const W = cv.width, H = cv.height;
    const c = cv.getContext('2d');

    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);

    if (_creditsPhase === 'koniec') {
      _konieczTimer += dtS;
      _konieczAlpha = _konieczTimer < 1 ? _konieczTimer
                    : _konieczTimer < 2.5 ? 1
                    : Math.max(0, 1 - (_konieczTimer - 2.5) / 0.8);
      if (_konieczTimer > 3.3) {
        _creditsPhase = 'rolling';
        _konieczAlpha = 0;
      }
      c.save(); c.globalAlpha = _konieczAlpha;
      c.font = 'bold 72px "Segoe UI",sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#fff';
      c.shadowColor = 'rgba(255,255,255,0.4)'; c.shadowBlur = 30;
      c.fillText('KONIEC', W/2, H/2);
      c.shadowBlur = 0; c.restore();
      requestAnimationFrame(tick); return;
    }

    if (_creditsPhase === 'rolling') {
      _creditsY -= dtS * (H / 105); /* full scroll over 105 seconds */

      /* draw credits */
      let ly = _creditsY;
      for (let i = 0; i < _CREDITS_LINES.length; i++) {
        const line = _CREDITS_LINES[i];
        ly += _LINE_HEIGHT;
        if (ly < -_LINE_HEIGHT || ly > H + _LINE_HEIGHT) continue;

        /* trigger music when music_cue line scrolls into view */
        if (line.style === 'music_cue' && !_musicTriggered && ly < H * 0.85) {
          _musicTriggered = true;
          _ENDING._audio = new Audio('aga 2 lata.mp3');
          _ENDING._audio.volume = 0.85;
          _ENDING._audio.play().catch(() => {});
        }

        c.save();
        c.textAlign = 'center'; c.textBaseline = 'middle';
        switch (line.style) {
          case 'title':
            c.font = 'bold 42px "Segoe UI",sans-serif';
            c.fillStyle = '#fffce0';
            c.shadowColor = '#aa8800'; c.shadowBlur = 16;
            break;
          case 'divider':
            c.font = '18px "Segoe UI",sans-serif';
            c.fillStyle = 'rgba(255,255,200,0.5)';
            break;
          case 'heading':
            c.font = '20px "Segoe UI",sans-serif';
            c.fillStyle = 'rgba(200,200,200,0.7)';
            break;
          case 'name':
            c.font = 'bold 28px "Segoe UI",sans-serif';
            c.fillStyle = '#fff';
            c.shadowColor = 'rgba(255,255,255,0.3)'; c.shadowBlur = 8;
            break;
          case 'sub':
            c.font = '17px "Segoe UI",sans-serif';
            c.fillStyle = 'rgba(200,200,200,0.6)';
            break;
          case 'small':
            c.font = '15px "Segoe UI",sans-serif';
            c.fillStyle = 'rgba(180,180,180,0.55)';
            break;
          case 'music_cue':
            c.font = 'italic 22px "Segoe UI",sans-serif';
            c.fillStyle = '#ffd060';
            c.shadowColor = '#cc9900'; c.shadowBlur = 14;
            break;
          case 'love':
            c.font = 'bold 26px "Segoe UI",sans-serif';
            c.fillStyle = '#ff80b0';
            c.shadowColor = '#cc0044'; c.shadowBlur = 18;
            break;
          default:
            c.font = '18px "Segoe UI",sans-serif';
            c.fillStyle = '#fff';
        }
        if (line.text) c.fillText(line.text, W/2, ly);
        c.shadowBlur = 0; c.restore();
      }

      /* Check if audio ended or fallback timer (105s) */
      const audioEnded = _ENDING._audio && _ENDING._audio.ended;
      const totalLines = _CREDITS_LINES.length;
      const allScrolled = _creditsY + totalLines * _LINE_HEIGHT < 0;
      if (audioEnded || allScrolled) {
        _creditsPhase = 'done';
        if (_ENDING._audio) { _ENDING._audio.pause(); _ENDING._audio = null; }
      }
    }

    if (_creditsPhase === 'done') {
      _finaleTimer += dtS;

      /* Message 1: fade in (0-1.5s), stay (1.5-3.5s), fade out (3.5-5s) */
      if (_finalePhase === 0) {
        _finaleAlpha = _finaleTimer < 1.5 ? _finaleTimer / 1.5
                     : _finaleTimer < 3.5 ? 1
                     : Math.max(0, 1 - (_finaleTimer - 3.5) / 1.5);
        if (_finaleTimer > 5.0) { _finalePhase = 1; _finaleTimer = 0; _finaleAlpha = 0; }
        c.save(); c.globalAlpha = _finaleAlpha;
        c.font = 'bold 22px "Segoe UI",sans-serif';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 10;
        c.fillText('Kart Agaty oraz Kotków jest jeszcze bardzo dużo do odkrycia', W/2, H/2);
        c.shadowBlur = 0; c.restore();
      }

      /* Message 2 */
      if (_finalePhase === 1) {
        _finaleAlpha = _finaleTimer < 1.5 ? _finaleTimer / 1.5
                     : _finaleTimer < 3.5 ? 1
                     : Math.max(0, 1 - (_finaleTimer - 3.5) / 1.5);
        c.save(); c.globalAlpha = _finaleAlpha;
        c.font = 'bold 22px "Segoe UI",sans-serif';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = '#fff'; c.shadowColor = '#fff'; c.shadowBlur = 10;
        c.fillText('Podobno jedna Karta Agaty ma jakiś link :)', W/2, H/2);
        c.shadowBlur = 0; c.restore();
        if (_finaleTimer > 5.0) { _finalePhase = 2; _finaleTimer = 0; }
      }

      /* Restart after last message fades out */
      if (_finalePhase === 2) {
        if (_finaleTimer > 2.0) {
          try {
            acMarkGameCompleted();
            const _acSave = localStorage.getItem(AGATA_CARDS_KEY);
            localStorage.clear();
            if (_acSave) localStorage.setItem(AGATA_CARDS_KEY, _acSave);
          } catch(e) {}
          location.reload();
          return;
        }
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
