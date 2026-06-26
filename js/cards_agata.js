'use strict';

/* ═══════════════════════════════════════════════════════════════
   Karty Agaty — persistent collection & browser
   Klucz: 'agata_cards_v1'  (nigdy nie czyszczony przy restarcie)
   ═══════════════════════════════════════════════════════════════ */

const AGATA_CARDS_KEY = 'agata_cards_v1';

/* Definicje kart.
   Art: zarejestrować w _acArtFns[id] = (ctx, W, H) => { ... } */
const _AC_CARDS = [
  { id: 'chess1',         name: 'Turniej Szachowy'          },
  { id: 'chess2',         name: 'Drugi Turniej Szachowy'    },
  { id: 'spanko',         name: '21:00 (Spanko)'            },
  { id: 'matemblewo',     name: 'Matemblewo'                },
  { id: 'zajec',          name: 'Zając'                     },
  { id: 'rekus',          name: 'Rekuś'                     },
  { id: 'kolano',         name: 'Kolano'                    },
  { id: 'pilots',         name: 'Koncert Twenty One Pilots' },
  { id: 'dni_warlubia',   name: 'Dni Warlubia'              },
  { id: 'kazimierz',      name: 'Św. Kazimierz'             },
  { id: 'laptop1',        name: 'Laptop'                    },
  { id: 'kotek',          name: 'Kotek'                     },
  { id: 'kicia',          name: 'Kicia'                     },
  { id: 'komputer',       name: 'Komputer'                  },
  { id: 'maro',           name: 'Maro'                      },
  { id: 'agnieszka',      name: 'Agnieszka'                 },
  { id: 'jezioro',        name: 'Jezioro'                   },
  { id: 'zdjecie',        name: 'Zdjęcie (Nagrywanie)'      },
  { id: 'rafik',          name: 'Rafik'                     },
  { id: 'anime_baba',     name: 'Anime Baba'                },
  { id: 'figurki',        name: 'Figurki'                   },
  { id: 'wyjazd_torun',   name: 'Wyjazd KKiS do Torunia'   },
  { id: 'znajomi',        name: 'Poznawanie Kolegów'        },
  { id: 'technikalia',    name: 'Technikalia'               },
  { id: 'podloga',        name: 'Spanie na Podłodze'        },
  { id: 'hdmi',           name: 'Kabel HDMI 10m'            },
  { id: 'wd',             name: 'WD'                        },
  { id: 'dk',             name: 'DK'                        },
  { id: 'praca',          name: 'Praca'                     },
  { id: 'redukcja',       name: 'Redukcja'                  },
  { id: 'molo_gofry',     name: 'Molo i Gofry'              },
  { id: 'piosenka',       name: 'Piosenka dla Agaty'        },
  { id: 'spoznienie',     name: 'Spóźnienie'                },
  { id: 'tupanie',        name: 'Tupanie Nogą'              },
  { id: 'giga_liga',      name: 'Giga Liga'                 },
  { id: 'ubrania',        name: 'Kupowanie Ubrań'           },
  { id: 'przywidz',       name: 'Przywidz'                  },
  { id: 'park_dzien',     name: 'Park Oliwski (dzień)'      },
  { id: 'park_noc',       name: 'Park Oliwski (noc)'        },
  { id: 'zla',            name: 'Jesteś Zła?'               },
  { id: 'pepsi',          name: 'Pepsi Max'                 },
  { id: 'stary_tel',      name: 'Stary Telefon'             },
  { id: 'konafetto',      name: 'Konafetto'                 },
  { id: 'fotobudka',      name: 'Fotobudka'                 },
  { id: 'uno',            name: 'Uno Minecraft'             },
  { id: 'herbata',        name: 'Studzenie Herbaty'         },
  { id: 'sponsorzy',      name: 'Umowy ze Sponsorami'       },
  { id: 'powrot_armata',  name: 'Powrót z Armaty'           },
  { id: 'gofry_smietana', name: 'Gofry z Bitą Śmietaną'    },
  { id: 'ostroda',        name: 'Koledzy z Ostródy'         },
  { id: 'sanatorium',     name: 'Sanatorium Miłości'        },
  { id: 'wiadukt',        name: 'Wiadukt'                   },
  { id: 'zaspa',          name: 'Zaspa'                     },
  { id: 'kinderki',       name: 'Kinderki'                  },
  { id: 'zumba',          name: 'Zumba'                     },
  { id: 'licencjat',      name: 'Licencjat'                 },
  { id: 'krokodyle',      name: 'Walka z Krokodylami'       },
  { id: 'iceowka',        name: 'Icówka'                    },
  { id: 'pomidorowa',     name: 'Pomidorowa na Grillu'      },
  { id: 'slonca',         name: 'Słońca (w Toruniu)'        },
  { id: 'peppepepe',      name: 'Peppepepe'                 },
];

/* Art registry — populated per-card in separate art file */
const _acArtFns = {};

/* Opisy kart — co się dzieje po zdobyciu */
const _AC_CARD_DESC = {
  chess1:       "Przy Politechnice Gdańskiej pojawia się stragan z turniejem szachowym. Można postawić złoto i wygrać więcej, albo stracić zakład.",
  chess2:       "Drugi stragan przy Politechnice gwarantuje wielką wygraną za opłatą. Stragan nie przeżyje tej transakcji.",
  spanko:       "Co jakiś czas jest dokładnie dwudziesta pierwsza i Agata zasypia. Nie można się ruszać podczas drzemki.",
  matemblewo:   "Co jakiś czas zza krzaków wyłania się duch z Matemblewa. Agata ucieka w losowym kierunku przez chwilę.",
  zajec:        "W walce z Wielkim Zajęcem lasery lecą znacznie częściej i trudniej ich uniknąć.",
  rekus:        "W morzu przy Gdańsku pływają urocze rekiny. Dotknięcie rekusia daje złoto i serduszka.",
  kolano:       "Co jakiś czas kolano daje o sobie znać i Agata chodzi o połowę wolniej przez chwilę.",
  pilots:       "Agata biega szybciej przez całą grę, jakby była na koncercie. Efekt stały od zdobycia karty.",
  dni_warlubia: "Wokół Warlubia unoszą się nuty muzyczne. Strefa leczenia w Warlubiu regeneruje znacznie szybciej.",
  kazimierz:    "Święty Kazimierz patroluje Zaspę i co jakiś czas przylatuje nad Przymorze, żeby skończyć z Przymorzanami.",
  laptop1:      "Zdenerwowanie nie spada zbyt nisko — laptop zawsze znajdzie coś do roboty.",
  kotek:        "Zagroda w Grudziądzu może pomieścić więcej kotków niż zwykle.",
  kicia:        "Agata zadaje większe obrażenia we wszystkich walkach.",
  komputer:     "Zdenerwowanie nigdy nie spadnie za nisko — komputer ciągle zajmuje uwagę.",
  maro:         "Maro unosi się nad wiaduktem przy Gdańsku. Wiadukt świeci niebiańskim blaskiem i leczy Agatę w pobliżu.",
  agnieszka:    "Na mapie głównej pojawiają się dodatkowe Agnieszki wędrujące między miastami.",
  jezioro:      "Na mapie głównej pojawiają się jeziora. Przejście przez jezioro znacznie spowalnia ruch.",
  zdjecie:      "Co jakiś czas Rafał krąży wokół Agaty i nagrywa telefonem. Po zakończeniu nagrywania zdenerwowanie spada.",
  rafik:        "Podczas questów z Rafałem, Rafał biega szybciej i częściej ucieka po wykonaniu zadania.",
  anime_baba:   "Pamiątka z anime, które razem oglądali.",
  figurki:      "Kolekcja figurek, które stoją na półce.",
  wyjazd_torun: "Wspomnienie z wyjazdu KKiS do Torunia.",
  znajomi:      "Pamiątka z pierwszego wspólnego poznawania przyjaciół.",
  technikalia:  "Wspomnienie z Technikaliów na Politechnice.",
  podloga:      "Pamiątka ze snu na podłodze — czasem tak wychodzi.",
  hdmi:         "Legendarny kabel HDMI o długości dziesięciu metrów.",
  wd:           "Wspomnienie z wypadu nad wodę.",
  dk:           "Pamiątka z DK.",
  praca:        "Wspomnienie z początków wspólnej pracy na uczelni.",
  redukcja:     "Trudne czasy — redukcja wymaga współpracy.",
  molo_gofry:   "Pamiątka z Mola w Brzeźnie i gofrów z bitą śmietaną.",
  piosenka:     "Wspomnienie piosenki napisanej specjalnie dla Agaty.<br><br>🎵 <a href=\"https://www.youtube.com/watch?v=dQw4w9WgXcQ\" target=\"_blank\" style=\"color:#ff69b4\">Posłuchaj piosenki</a>",
  spoznienie:   "Klasyczne wspomnienie — Rafał się spóźnił.",
  tupanie:      "Pamiątka z charakterystycznego tupania nogą.",
  seminarium:   "Wspomnienie z seminarium dyplomowego.",
  giga_liga:    "Pamiątka z Giga Ligi — wielki turniej piłkarski.",
  ubrania:      "Wspomnienie z zakupów — nowe ubrania zawsze poprawiają humor.",
  krakow:       "Pamiątka z wyjazdu do Krakowa.",
  wroclaw:      "Wspomnienie z wyjazdu do Wrocławia.",
  przywidz:     "Pamiątka z wypadu do Przywidza.",
  park_dzien:   "Wspomnienie z Parku Oliwskiego w ciągu dnia.",
  park_noc:     "Pamiątka z Parku Oliwskiego nocą — romantyczna atmosfera.",
  zla:          "Wspomnienie z chwili gdy Agata była zła... i tak było słodko.",
  kapiel:       "Pamiątka z kąpieli w hotelu — chwila luksusu.",
  pepsi:        "Klasyczne Pepsi Max — niezastąpione.",
  brak_ubran:   "Wspomnienie z wyjazdu bez odpowiedniej liczby ubrań.",
  stary_tel:    "Pamiątka ze starego telefonu, który trzymał się do końca.",
  kajaki:       "Wspomnienie z wypadu na kajaki.",
  konafetto:    "Pamiątka z Konafetto — słodkie chwile.",
  fotobudka:    "Wspomnienie z sesji w fotobudce.",
  uno:          "Pamiątka z gry w Uno Minecraft.",
  herbata:      "Wspomnienie ze studzenia herbaty — ważne tradycje.",
  sponsorzy:    "Pamiątka z negocjowania umów ze sponsorami.",
  praga:        "Wspomnienie z wyjazdu do Pragi.",
  powrot_armata:"Pamiątka z powrotu z Armaty — długa droga do domu.",
  gofry_smietana:"Wspomnienie z gofrów z bitą śmietaną.",
  ostroda:      "Pamiątka ze spotkania z kolegami z Ostródy.",
  sanatorium:   "Wspomnienie z Sanatorium Miłości.",
  mieszkanie:   "Pamiątka z poszukiwania wspólnego mieszkania.",
  wiadukt:      "Wspomnienie z wiaduktu — wyjątkowe miejsce w Gdańsku.",
  zaspa:        "Pamiątka z Zaspy — mural i spacery.",
  kinderki:     "Wspomnienie z kinderków — najlepsze niespodzianki.",
  zumba:        "Pamiątka z zajęć Zumba — taneczna radość.",
  licencjat:    "Wspomnienie z obrony licencjatu.",
  krokodyle:    "Pamiątka z walki z krokodylami.",
  iceowka:      "Wspomnienie z Icówki — świetne miejsce.",
  pomidorowa:   "Pamiątka z pomidorowej na grillu.",
  slonca:       "Wspomnienie ze Słońca w Toruniu.",
  peppepepe:    "Peppepepe.",
};

/* ── Stan ────────────────────────────────────────────────────── */
let _acGameCompleted = false;
let _acDiscovered    = [];   /* persystowane — odkryte karty (nigdy nie czyszczone) */
let _acActive        = [];   /* sesyjne — aktywne w bieżącej grze, NIE persystowane */

function loadAgataCards() {
  try {
    const raw = localStorage.getItem(AGATA_CARDS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    _acGameCompleted = !!data.gameCompleted;
    _acDiscovered    = Array.isArray(data.discovered) ? data.discovered : [];
    /* _acActive celowo nie ładowane — czyste przy każdym uruchomieniu */
  } catch(e) {}
}

function _saveAgataCards() {
  try {
    localStorage.setItem(AGATA_CARDS_KEY, JSON.stringify({
      gameCompleted: _acGameCompleted,
      discovered:    _acDiscovered,
      /* active celowo pominięte */
    }));
  } catch(e) {}
}

/* Wywoływane z ending.js gdy napisy końcowe się skończą */
function acMarkGameCompleted() {
  _acGameCompleted = true;
  _saveAgataCards();
}

function acSetGameCompleted(val) {
  _acGameCompleted = !!val;
  _saveAgataCards();
}

/* Wywoływane z hel.js gdy gracz zdobędzie kartę na Cyplu —
   aktywuje na bieżącą sesję; odkrywa trwale tylko przy pierwszym zdobyciu */
function acDiscoverCard(id) {
  if (!_acActive.includes(id)) _acActive.push(id);   /* zawsze aktywuj sesyjnie */
  if (_acDiscovered.includes(id)) return false;
  _acDiscovered.push(id);
  _saveAgataCards();
  return true;
}

function acIsDiscovered(id)  { return _acDiscovered.includes(id); }
function acIsActive(id)      { return _acActive.includes(id); }
function acCanAccess()       { return _acGameCompleted; }
function acCountDiscovered() { return _acDiscovered.filter(id => _AC_CARDS.some(c => c.id === id)).length; }

/* Wywoływane przy restarcie gry (anger overlay) — kasuje sesyjne aktywacje */
function acResetActiveCards() {
  _acActive = [];
  if (_acBrowserOpen) _renderAgataCardBrowser();
  _acRefreshEquipPanel();
}

/* ── Browser kart ────────────────────────────────────────────── */
let _acBrowserOpen = false;

function isAgataCardBrowserOpen() { return _acBrowserOpen; }

function openAgataCardBrowser() {
  if (!acCanAccess()) return;
  _acBrowserOpen = true;
  _renderAgataCardBrowser();
  document.getElementById('agata-cards-overlay').classList.remove('hidden');
}

function closeAgataCardBrowser() {
  _acBrowserOpen = false;
  document.getElementById('agata-cards-overlay').classList.add('hidden');
}

function _renderAgataCardBrowser() {
  const total = _AC_CARDS.length;
  const found = acCountDiscovered();
  document.getElementById('agata-cards-count').textContent =
    total ? `${found} / ${total} odkrytych` : '';

  const grid = document.getElementById('agata-cards-grid');
  grid.innerHTML = '';

  if (total === 0) {
    const p = document.createElement('p');
    p.style.cssText = 'color:#7755bb;grid-column:1/-1;text-align:center;padding:24px';
    p.textContent = 'Brak kart do wyświetlenia.';
    grid.appendChild(p);
    return;
  }

  _AC_CARDS.forEach(card => {
    const discovered = acIsDiscovered(card.id);
    const active     = acIsActive(card.id);
    const wrap = document.createElement('div');
    wrap.className = 'ac-card' + (discovered ? ' ac-card--found' : ' ac-card--hidden') + (active ? ' ac-card--active' : '');
    wrap.dataset.cardId = card.id;

    const cvs = document.createElement('canvas');
    cvs.width = 140; cvs.height = 200;
    _drawAgataCard(cvs.getContext('2d'), card, discovered, active);
    if (discovered) {
      wrap.style.cursor = 'pointer';
      wrap.addEventListener('click', () => openCardDetail(card));
    }
    wrap.appendChild(cvs);
    grid.appendChild(wrap);
  });
}

/* ── Rysowanie karty ─────────────────────────────────────────── */
function _acRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y,   x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

function _drawAgataCard(ctx, card, discovered, active) {
  const W = 140, H = 200;
  ctx.clearRect(0, 0, W, H);

  if (!discovered) {
    /* Nieodkryta — znak zapytania */
    ctx.fillStyle = '#0e071e';
    _acRoundRect(ctx, 0, 0, W, H, 10); ctx.fill();
    ctx.strokeStyle = '#3d2288'; ctx.lineWidth = 2;
    _acRoundRect(ctx, 0, 0, W, H, 10); ctx.stroke();
    /* Wzór */
    ctx.strokeStyle = 'rgba(60,30,120,0.4)'; ctx.lineWidth = 1;
    for (let y = 12; y < H; y += 18) {
      ctx.beginPath(); ctx.moveTo(4, y); ctx.lineTo(W-4, y); ctx.stroke();
    }
    ctx.fillStyle = '#5533bb';
    ctx.font = 'bold 68px "Segoe UI",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', W/2, H/2 - 10);
    ctx.font = '11px "Segoe UI",sans-serif';
    ctx.fillStyle = '#3d2288';
    ctx.fillText('Nieodkryta', W/2, H - 16);
    return;
  }

  /* Odkryta — ramka + art + nazwa */
  ctx.fillStyle = '#0a051a';
  _acRoundRect(ctx, 0, 0, W, H, 10); ctx.fill();

  /* Złota ramka */
  const border = ctx.createLinearGradient(0, 0, W, H);
  border.addColorStop(0,   '#ffdd88');
  border.addColorStop(0.5, '#cc88ff');
  border.addColorStop(1,   '#ffdd88');
  ctx.strokeStyle = border; ctx.lineWidth = 2.5;
  _acRoundRect(ctx, 1, 1, W-2, H-2, 9); ctx.stroke();

  /* Art */
  const artFn = _acArtFns[card.id];
  const artH  = H - 38;
  if (artFn) {
    ctx.save();
    ctx.beginPath(); ctx.rect(4, 4, W-8, artH-4); ctx.clip();
    artFn(ctx, W, artH);
    ctx.restore();
  } else {
    /* Placeholder art */
    const g = ctx.createLinearGradient(4, 4, 4, artH);
    g.addColorStop(0, '#1e0840'); g.addColorStop(1, '#080318');
    ctx.fillStyle = g; ctx.fillRect(4, 4, W-8, artH - 4);
    ctx.fillStyle = 'rgba(200,150,255,0.15)';
    ctx.font = 'bold 44px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✦', W/2, artH/2);
  }

  /* Pasek nazwy */
  const stripY = H - 34;
  const stripGrad = ctx.createLinearGradient(0, stripY, 0, H);
  stripGrad.addColorStop(0, 'rgba(10,5,26,0.92)');
  stripGrad.addColorStop(1, 'rgba(20,8,40,0.98)');
  ctx.fillStyle = stripGrad;
  ctx.beginPath();
  ctx.rect(1, stripY, W-2, H - stripY - 1);
  ctx.fill();
  ctx.fillStyle = '#f0e0ff';
  ctx.font = 'bold 10px "Segoe UI",sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(card.name, W/2, stripY + (H - stripY)/2);

  /* Wskaźnik aktywności */
  if (active) {
    ctx.fillStyle = '#44ff88';
    ctx.beginPath(); ctx.arc(W - 12, 12, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.arc(W - 12, 12, 5, 0, Math.PI*2); ctx.stroke();
  }
}

/* ── Card detail overlay ─────────────────────────────────────── */
function openCardDetail(card) {
  const ov = document.getElementById('ac-card-detail');
  if (!ov) return;
  const cvs = document.getElementById('ac-card-detail-canvas');
  cvs.width = 280; cvs.height = 400;
  const dctx = cvs.getContext('2d');
  dctx.save(); dctx.scale(280/140, 400/200);
  _drawAgataCard(dctx, card, true, acIsActive(card.id));
  dctx.restore();
  document.getElementById('ac-card-detail-name').textContent = card.name;
  const _descEl = document.getElementById('ac-card-detail-desc');
  const _descRaw = _AC_CARD_DESC[card.id] || '';
  _descEl.innerHTML = _descRaw;
  const badge = document.getElementById('ac-card-detail-badge');
  if (badge) {
    const on = acIsActive(card.id);
    badge.textContent = on ? '✓ Aktywna w tej rozgrywce' : 'Nieaktywna — zbierz na Cyplu Helskim';
    badge.className = on ? 'ac-badge ac-badge--on' : 'ac-badge ac-badge--off';
  }
  ov.classList.remove('hidden');
}

function closeCardDetail() {
  document.getElementById('ac-card-detail')?.classList.add('hidden');
}

/* ── Aktywne karty w ekwipunku ───────────────────────────────── */
function _acRefreshEquipPanel() {
  const grid = document.getElementById('equip-agata-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const activeCards = _AC_CARDS.filter(c => acIsActive(c.id));
  if (activeCards.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'equip-agata-empty';
    empty.textContent = 'Brak aktywnych kart — włącz je w przeglądzie kart.';
    grid.appendChild(empty);
    return;
  }
  activeCards.forEach(card => {
    const wrap = document.createElement('div');
    wrap.className = 'equip-agata-card';
    wrap.title = _AC_CARD_DESC[card.id] || card.name;
    const cvs = document.createElement('canvas');
    cvs.width = 84; cvs.height = 120;
    const ctx2 = cvs.getContext('2d');
    ctx2.save(); ctx2.scale(84/140, 120/200);
    _drawAgataCard(ctx2, card, true, true);
    ctx2.restore();
    const lbl = document.createElement('div');
    lbl.className = 'equip-agata-label';
    lbl.textContent = card.name;
    wrap.appendChild(cvs);
    wrap.appendChild(lbl);
    grid.appendChild(wrap);
  });
}

/* ── Debug: card toggle submenu ─────────────────────────────── */
function acDbgOpenCardToggleMenu() {
  const ov = document.getElementById('dbg-card-toggle-overlay');
  if (!ov) return;
  _acDbgRenderCardToggleGrid();
  ov.classList.remove('hidden');
}

function acDbgCloseCardToggleMenu() {
  document.getElementById('dbg-card-toggle-overlay')?.classList.add('hidden');
}

function _acDbgRenderCardToggleGrid() {
  const grid = document.getElementById('dbg-card-toggle-grid');
  if (!grid) return;
  grid.innerHTML = '';
  _AC_CARDS.forEach(card => {
    const disc   = acIsDiscovered(card.id);
    const active = acIsActive(card.id);
    const row = document.createElement('div');
    row.className = 'dbg-ctog-row ' + (active ? 'active' : 'inactive');
    row.title = disc ? (active ? 'Aktywna — kliknij aby dezaktywować' : 'Odkryta — kliknij aby aktywować') : 'Nieodkryta — kliknij aby odkryć i aktywować';
    const hasTrigger = typeof _ACE_TRIGGERS !== 'undefined' && !!_ACE_TRIGGERS[card.id];
    row.innerHTML =
      `<div class="dbg-ctog-dot"></div>` +
      `<span class="dbg-ctog-name">${card.name}</span>` +
      `<span class="dbg-ctog-id">${card.id}</span>` +
      (hasTrigger ? `<button class="dbg-ctog-trig" title="Triggeruj efekt teraz">⚡</button>` : '');
    row.addEventListener('click', e => {
      if (e.target.classList.contains('dbg-ctog-trig')) {
        if (typeof acDbgTrigger === 'function') acDbgTrigger(card.id);
        return;
      }
      if (active) {
        _acActive = _acActive.filter(x => x !== card.id);
      } else {
        if (!_acDiscovered.includes(card.id)) {
          _acDiscovered.push(card.id);
          _saveAgataCards();
        }
        if (!_acActive.includes(card.id)) _acActive.push(card.id);
      }
      _acDbgRenderCardToggleGrid();
      if (_acBrowserOpen) _renderAgataCardBrowser();
      _acRefreshEquipPanel();
    });
    grid.appendChild(row);
  });
}

/* ── Debug helpers ───────────────────────────────────────────── */
function acDbgToggle(id) {
  id = (id || '').trim();
  if (!id) return;
  if (_acDiscovered.includes(id)) {
    _acDiscovered = _acDiscovered.filter(x => x !== id);
  } else {
    _acDiscovered.push(id);
  }
  _saveAgataCards();
  if (_acBrowserOpen) _renderAgataCardBrowser();
}

function acDbgUnlockAll() {
  _acGameCompleted = true;
  _acDiscovered = _AC_CARDS.map(c => c.id);
  _acActive     = _AC_CARDS.map(c => c.id);   /* debug: aktywuje wszystkie sesyjnie */
  _saveAgataCards();
  if (_acBrowserOpen) _renderAgataCardBrowser();
  else openAgataCardBrowser();
  _acRefreshEquipPanel();
}

function acDbgLockAll() {
  _acDiscovered = [];
  _acActive = [];
  _saveAgataCards();
  if (_acBrowserOpen) _renderAgataCardBrowser();
  _acRefreshEquipPanel();
}

/* ── Klawiatura (Escape zamyka) ──────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const det = document.getElementById('ac-card-detail');
    if (det && !det.classList.contains('hidden')) { closeCardDetail(); e.preventDefault(); return; }
    if (_acBrowserOpen) { closeAgataCardBrowser(); e.preventDefault(); }
  }
});

/* ── Init ────────────────────────────────────────────────────── */
loadAgataCards();
