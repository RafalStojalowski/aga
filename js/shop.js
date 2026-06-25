'use strict';

/* ══════════════════════════════════════════════════════
   Galeria Forum Gdańsk — sklep Ratajskiego
   ══════════════════════════════════════════════════════ */

const SHOP_RC = {
  'Pospolity':  '#9a8060',
  'Niezwykły':  '#38a838',
  'Rzadki':     '#4878e8',
  'Epicki':     '#a028c8',
  'LEGENDARNY': '#ff8c42',
};

const ALL_SHOP_ITEMS = [
  /* ── ATAK ── */
  { id:'torebka_versace',  cat:'atak',    name:'Torebka Versace',             atk:28, def:0,   price:800, rarity:'Epicki',
    desc:'Matko jedyna, ale ona musi być bogata.' },
  { id:'klej_paznokci',    cat:'atak',    name:'Klej do paznokci',            atk:8,  def:0,   price:45,  rarity:'Pospolity',
    desc:'Bardzo fajny, bez niego ilość paznokci bardzo szybko maleje.' },
  { id:'bialy_black',      cat:'atak',    name:'Biały Black bez cukru',       atk:18, def:0,   price:120, rarity:'Niezwykły',
    desc:'Niby czarny a jednak biały.' },
  { id:'worek_ubr',        cat:'atak',    name:'Worek na śmieci z ubraniami', atk:22, def:0,   price:180, rarity:'Niezwykły',
    desc:'To nie prawda że mam dużo ubrań.' },
  { id:'ryz_kfc',          cat:'atak',    name:'Ryż z KFC',                   atk:12, def:0,   price:75,  rarity:'Pospolity',
    desc:'Tym razem serio ma sos, ale niestety teriyaki.' },
  { id:'kawa_starbucks',   cat:'atak',    name:'Kawa ze Starbucksa',          atk:15, def:0,   price:130, rarity:'Pospolity',
    desc:'Czasami lepiej biec żeby jej nie kupować, a czasami odwrotnie.' },
  { id:'bluza_informatyk', cat:'atak',    name:'Bluza informatyka',           atk:20, def:0,   price:240, rarity:'Niezwykły',
    desc:'Idealna dla pani półinżynier.' },
  { id:'pizamka',          cat:'atak',    name:'Piżamka',                     atk:10, def:0,   price:65,  rarity:'Pospolity',
    desc:'Typowy outfit po 21:00.' },
  { id:'laptop',           cat:'atak',    name:'Laptop',                      atk:32, def:0,   price:650, rarity:'Rzadki',
    desc:'Czasami można nie zauważyć, że ma się system operacyjny, czasami przez pół roku.' },
  { id:'precelki',         cat:'atak',    name:'Precelki',                    atk:14, def:0,   price:55,  rarity:'Pospolity',
    desc:'Niby jeden niby 6.' },
  /* ── OBRONA ── */
  { id:'smalec',           cat:'obrona',  name:'Słoik ze smalcem',            atk:0,  def:-15, price:55,  rarity:'Pospolity',
    desc:'Podobno to owsianka ale wygląda jak smalec.' },
  { id:'krem_usta',        cat:'obrona',  name:'Krem na usta',                atk:0,  def:-8,  price:40,  rarity:'Pospolity',
    desc:'I już nie można buzi buzi.' },
  { id:'tablet',           cat:'obrona',  name:'Tablet',                      atk:0,  def:-18, price:200, rarity:'Niezwykły',
    desc:'Giga przydatny na zajęciach, zwłaszcza do grania w gry.' },
  { id:'asterka',          cat:'obrona',  name:'Asterka',                     atk:0,  def:-32, price:900, rarity:'Epicki',
    desc:'Opel Astra Turbo 5000 koni mechanicznych, jest bardzo szybki.' },
  { id:'ksiega_maro',      cat:'obrona',  name:'Księga MARO',                 atk:0,  def:-24, price:400, rarity:'Rzadki',
    desc:'Potężna księga z potężną wiedzą.' },
  { id:'kurtka_marcin',    cat:'obrona',  name:'Kurtka z napisem Marcin',     atk:0,  def:-14, price:160, rarity:'Niezwykły',
    desc:'aha marcin, to idź sobie do marcina.' },
  { id:'powerbank_armata', cat:'obrona',  name:'Powerbank z armaty',          atk:0,  def:-20, price:280, rarity:'Niezwykły',
    desc:'Nadal nie wiadomo kogo jest i jak się pojawił, ale jest.' },
  { id:'pepsi',            cat:'obrona',  name:'Pepsi',                       atk:0,  def:-12, price:70,  rarity:'Pospolity',
    desc:'Trzeba wypić po jedzeniu, bo inaczej się wybucha.' },
  { id:'fotobutka',        cat:'obrona',  name:'Zdjęcie z fotobutki',         atk:0,  def:-16, price:90,  rarity:'Pospolity',
    desc:'Na pierwszym zdjęciu Agata jest zadowolona, na drugim zła, na trzecim smutna.' },
  { id:'id_adapciak',      cat:'obrona',  name:'ID na adapciak 2024',         atk:0,  def:-10, price:35,  rarity:'Pospolity',
    desc:'ale czemu ja jestem niebieska, czemu mnie zrobili niebieską, nie fajnie mi zrobili.' },
  /* ── HYBRYDA ── */
  { id:'papierek',         cat:'hybryda', name:'Papierek',                    atk:8,  def:-8,  price:30,  rarity:'Pospolity',
    desc:'rafal, zostaw ten papiere, rafal nie jedz tego papierka, rafal ja cie prosze.' },
  { id:'matcha',           cat:'hybryda', name:'Matcha',                      atk:16, def:-16, price:200, rarity:'Niezwykły',
    desc:'fancy picie, szkoda że rafal nie chce ze mną na to chodzić.' },
  { id:'sukienka_bal',     cat:'hybryda', name:'Sukienka na bal',             atk:22, def:-22, price:500, rarity:'Rzadki',
    desc:'trzeba kupić ją co najmniej 3 miesiące przed balem bo inaczej nie ma sensu.' },
  { id:'plyta_top',        cat:'hybryda', name:'Płyta Twenty One Pilots',     atk:20, def:-18, price:350, rarity:'Rzadki',
    desc:'niby zwykła płyta ale jakbyś ją zniszczył to pewnie sam zostałbyś zniszczony w niewiadomy sposób.' },
  { id:'plakat_ronaldo',   cat:'hybryda', name:'Plakat Ronaldo',              atk:18, def:-14, price:250, rarity:'Niezwykły',
    desc:'nie ma sensu mieszkać w mieszkaniu jeżeli nie ma w nim plakatu z ronaldem.' },
  { id:'hdmi_10m',         cat:'hybryda', name:'Kabel HDMI 10m',              atk:12, def:-10, price:150, rarity:'Pospolity',
    desc:'niby śmieszny ale agata chyba ma nadzieję że w nowym mieszkaniu już go nie będzie.' },
  { id:'pegielek',         cat:'hybryda', name:'Pegiełek',                    atk:15, def:-20, price:280, rarity:'Niezwykły',
    desc:'bardzo bardzo bardzo dziwna maskotka która robi jeszcze dziwniejsze rzeczy.' },
  { id:'festoria',         cat:'hybryda', name:'Restauracja Festoria',        atk:25, def:-25, price:700, rarity:'Epicki',
    desc:'nie mam pojęcia jak ona to zmieściła do kieszeni.' },
  { id:'telefon',          cat:'hybryda', name:'Telefon',                     atk:10, def:-12, price:120, rarity:'Pospolity',
    desc:'halo, ktoś do ciebie napisał, halo, musisz odpisać.' },
  { id:'kinderki',         cat:'hybryda', name:'Kinderki',                    atk:14, def:-14, price:80,  rarity:'Pospolity',
    desc:'prosta rzecz żeby sprawić że agata będzie szczęśliwa.' },
];

/* ── Equipment state ── */
const equipState = { atakowny: null, obronny: null, hybrydowy: null };

function _equippedItem(cat) {
  const id = cat === 'atak' ? equipState.atakowny
           : cat === 'obrona' ? equipState.obronny
           : equipState.hybrydowy;
  return id ? ALL_SHOP_ITEMS.find(i => i.id === id) : null;
}

function getAtakMult() {
  let b = 0;
  const a = _equippedItem('atak');    if (a) b += a.atk;
  const h = _equippedItem('hybryda'); if (h) b += h.atk;
  return 1 + b / 100;
}

function getObronaMult() {
  let b = 0;
  const o = _equippedItem('obrona');  if (o) b += o.def;
  const h = _equippedItem('hybryda'); if (h) b += h.def;
  return 1 + b / 100;
}

/* ══════════════════════════════════════════════════════
   Ikony itemów — 44 × 44
   ══════════════════════════════════════════════════════ */
const _IC = {
  torebka_versace(c,w,h) {
    c.fillStyle='#c8a030';
    c.beginPath(); c.moveTo(w*.18,h*.44); c.lineTo(w*.13,h*.88); c.lineTo(w*.87,h*.88); c.lineTo(w*.82,h*.44); c.closePath(); c.fill();
    c.strokeStyle='#906010'; c.lineWidth=1.5; c.stroke();
    c.strokeStyle='#906010'; c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.arc(w*.5,h*.36,w*.18,Math.PI,0); c.stroke();
    c.fillStyle='rgba(255,245,190,0.55)'; c.font=`bold ${w*.26}px serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('V',w*.5,h*.66);
    c.fillStyle='rgba(255,255,255,0.15)'; c.beginPath(); c.ellipse(w*.3,h*.62,w*.06,h*.12,-.3,0,Math.PI*2); c.fill();
  },
  klej_paznokci(c,w,h) {
    c.fillStyle='#e03070'; c.fillRect(w*.36,h*.38,w*.28,h*.5);
    c.fillStyle='#b01848'; c.fillRect(w*.36,h*.38,w*.28,h*.09);
    c.fillStyle='#202020'; c.fillRect(w*.38,h*.13,w*.24,h*.27);
    c.beginPath(); c.ellipse(w*.5,h*.13,w*.12,h*.05,0,0,Math.PI*2); c.fill();
    c.fillStyle='#ff80a8'; c.beginPath(); c.ellipse(w*.5,h*.38,w*.14,h*.07,0,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.28)'; c.fillRect(w*.38,h*.41,w*.07,h*.3);
  },
  bialy_black(c,w,h) {
    c.fillStyle='#ede8de';
    c.beginPath(); c.moveTo(w*.18,h*.34); c.lineTo(w*.23,h*.84); c.lineTo(w*.77,h*.84); c.lineTo(w*.82,h*.34); c.closePath(); c.fill();
    c.strokeStyle='#c8c0a8'; c.lineWidth=1.2; c.stroke();
    c.fillStyle='#e0dace'; c.beginPath(); c.ellipse(w*.5,h*.84,w*.3,h*.07,0,0,Math.PI*2); c.fill();
    c.fillStyle='#f8f5f0'; c.beginPath(); c.ellipse(w*.5,h*.36,w*.28,h*.08,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#c8c0a8'; c.lineWidth=2; c.beginPath(); c.arc(w*.82,h*.57,w*.11,-.4,Math.PI*.7); c.stroke();
    c.fillStyle='#888070'; c.font=`bold ${w*.14}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('0%',w*.5,h*.58);
  },
  worek_ubr(c,w,h) {
    c.fillStyle='#282830';
    c.beginPath(); c.moveTo(w*.5,h*.08); c.bezierCurveTo(w*.12,h*.08,w*.06,h*.28,w*.08,h*.62); c.bezierCurveTo(w*.08,h*.9,w*.92,h*.9,w*.92,h*.62); c.bezierCurveTo(w*.94,h*.28,w*.88,h*.08,w*.5,h*.08); c.closePath(); c.fill();
    c.strokeStyle='#585860'; c.lineWidth=2; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.38,h*.08); c.quadraticCurveTo(w*.5,h*.02,w*.62,h*.08); c.stroke();
    c.fillStyle='#e03838'; c.fillRect(w*.28,h*.24,w*.16,w*.12);
    c.fillStyle='#3858e0'; c.fillRect(w*.54,h*.28,w*.14,w*.1);
    c.fillStyle='#e0c030'; c.fillRect(w*.32,h*.42,w*.12,w*.09);
    c.fillStyle='rgba(255,255,255,0.07)'; c.beginPath(); c.ellipse(w*.32,h*.48,w*.1,h*.2,-.3,0,Math.PI*2); c.fill();
  },
  ryz_kfc(c,w,h) {
    c.fillStyle='#f8f4ea';
    c.beginPath(); c.ellipse(w*.5,h*.65,w*.37,h*.27,0,0,Math.PI*2); c.fill();
    c.fillStyle='#ece4d4'; c.beginPath(); c.ellipse(w*.5,h*.55,w*.37,h*.1,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#d8c8a0'; c.lineWidth=2; c.beginPath(); c.ellipse(w*.5,h*.55,w*.37,h*.1,0,0,Math.PI*2); c.stroke();
    c.fillStyle='#fffff5';
    for (let i=0;i<10;i++){const a=i*.63,r=.14;c.beginPath();c.ellipse(w*.5+Math.cos(a)*w*r,h*.6+Math.sin(a)*h*.06,2.5,1.5,a,0,Math.PI*2);c.fill();}
    c.fillStyle='rgba(180,60,0,0.45)'; c.beginPath(); c.ellipse(w*.5,h*.52,w*.22,h*.06,0,0,Math.PI*2); c.fill();
    c.fillStyle='#e81212'; c.fillRect(w*.3,h*.18,w*.4,h*.16); c.strokeStyle='#c00'; c.lineWidth=1; c.strokeRect(w*.3,h*.18,w*.4,h*.16);
    c.fillStyle='#fff'; c.font=`bold ${w*.15}px sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('KFC',w*.5,h*.26);
  },
  kawa_starbucks(c,w,h) {
    c.fillStyle='#1a6640';
    c.beginPath(); c.moveTo(w*.2,h*.42); c.lineTo(w*.24,h*.84); c.lineTo(w*.76,h*.84); c.lineTo(w*.8,h*.42); c.closePath(); c.fill();
    c.fillStyle='#228855';
    c.beginPath(); c.moveTo(w*.2,h*.42); c.lineTo(w*.24,h*.8); c.lineTo(w*.76,h*.8); c.lineTo(w*.8,h*.42); c.closePath(); c.fill();
    c.fillStyle='#e8f2e0';
    c.beginPath(); c.arc(w*.5,h*.4,w*.3,Math.PI,0); c.lineTo(w*.8,h*.46); c.lineTo(w*.2,h*.46); c.closePath(); c.fill();
    c.strokeStyle='#3ab870'; c.lineWidth=2.5; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.64,h*.16); c.lineTo(w*.6,h*.44); c.stroke();
    c.fillStyle='#1a6640'; c.beginPath(); c.arc(w*.5,h*.63,w*.13,0,Math.PI*2); c.fill();
    c.fillStyle='#fff'; c.font=`${w*.2}px serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('☆',w*.5,h*.64);
  },
  bluza_informatyk(c,w,h) {
    c.fillStyle='#252535';
    c.beginPath(); c.moveTo(w*.18,h*.5); c.lineTo(w*.16,h*.92); c.lineTo(w*.84,h*.92); c.lineTo(w*.82,h*.5); c.closePath(); c.fill();
    c.lineWidth=13; c.strokeStyle='#252535'; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.2,h*.54); c.lineTo(w*.06,h*.82); c.stroke();
    c.beginPath(); c.moveTo(w*.8,h*.54); c.lineTo(w*.94,h*.82); c.stroke();
    c.fillStyle='#252535'; c.beginPath(); c.ellipse(w*.5,h*.38,w*.28,h*.22,0,0,Math.PI*2); c.fill();
    c.fillStyle='#333345'; c.beginPath(); c.ellipse(w*.5,h*.38,w*.2,h*.16,0,0,Math.PI*2); c.fill();
    c.fillStyle='#60ff90'; c.font=`bold ${w*.15}px "Courier New",monospace`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('</>',w*.5,h*.71);
  },
  pizamka(c,w,h) {
    c.fillStyle='#c8a0d0';
    c.fillRect(w*.2,h*.24,w*.6,h*.38);
    c.fillRect(w*.06,h*.28,w*.16,w*.24); c.fillRect(w*.78,h*.28,w*.16,w*.24);
    c.fillRect(w*.2,h*.62,w*.26,h*.32); c.fillRect(w*.54,h*.62,w*.26,h*.32);
    c.fillStyle='#b080c0';
    c.beginPath(); c.moveTo(w*.38,h*.24); c.lineTo(w*.5,h*.38); c.lineTo(w*.62,h*.24); c.closePath(); c.fill();
    c.fillStyle='rgba(255,220,30,0.7)'; c.font=`${w*.2}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('★',w*.5,h*.42); c.font=`${w*.13}px sans-serif`;
    c.fillText('★',w*.28,h*.55); c.fillText('★',w*.72,h*.55);
  },
  laptop(c,w,h) {
    c.fillStyle='#1a1a2a';
    c.beginPath(); if(c.roundRect)c.roundRect(w*.1,h*.1,w*.8,h*.52,3);else c.rect(w*.1,h*.1,w*.8,h*.52); c.fill();
    c.fillStyle='#1e88e8'; c.fillRect(w*.14,h*.14,w*.72,h*.44);
    c.fillStyle='#fff'; c.font=`${w*.12}px "Courier New",monospace`; c.textAlign='left'; c.textBaseline='top';
    c.fillText('> _',w*.17,h*.2);
    c.fillStyle='rgba(100,200,255,0.55)'; c.fillRect(w*.17,h*.34,w*.4,h*.05); c.fillRect(w*.17,h*.42,w*.28,h*.04);
    c.fillStyle='#282838'; c.fillRect(w*.08,h*.62,w*.84,h*.04);
    c.fillStyle='#282838';
    c.beginPath(); c.moveTo(w*.04,h*.66); c.lineTo(w*.07,h*.88); c.lineTo(w*.93,h*.88); c.lineTo(w*.96,h*.66); c.closePath(); c.fill();
    c.fillStyle='#404055';
    for(let r=0;r<3;r++)for(let k=0;k<6;k++)c.fillRect(w*(.14+k*.13),h*(.7+r*.06),w*.1,h*.04);
  },
  precelki(c,w,h) {
    const cx=w*.5, cy=h*.5;
    c.strokeStyle='#c8882a'; c.lineWidth=7; c.lineCap='round';
    c.beginPath(); c.arc(cx-w*.1,cy-h*.05,w*.15,Math.PI*1.15,Math.PI*2.85); c.stroke();
    c.beginPath(); c.arc(cx+w*.1,cy-h*.05,w*.15,Math.PI*.15,Math.PI*1.85); c.stroke();
    c.strokeStyle='#a86818'; c.lineWidth=6; c.lineCap='round';
    c.beginPath(); c.moveTo(cx-w*.09,cy+h*.08); c.bezierCurveTo(cx-w*.16,cy+h*.26,cx+w*.16,cy+h*.26,cx+w*.09,cy+h*.08); c.stroke();
    c.fillStyle='rgba(255,255,240,0.8)';
    [[-8,-6],[6,-9],[0,4],[-10,9],[9,7]].forEach(([dx,dy])=>{c.beginPath();c.arc(cx+dx,cy+dy,2,0,Math.PI*2);c.fill();});
  },

  smalec(c,w,h) {
    c.fillStyle='#eae8d5';
    c.beginPath(); c.moveTo(w*.2,h*.34); c.lineTo(w*.18,h*.84); c.lineTo(w*.82,h*.84); c.lineTo(w*.8,h*.34); c.closePath(); c.fill();
    c.strokeStyle='#c8c4a0'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#8a7840'; c.fillRect(w*.16,h*.24,w*.68,h*.12); c.strokeStyle='#6a5820'; c.lineWidth=1.2; c.strokeRect(w*.16,h*.24,w*.68,h*.12);
    c.fillStyle='#f5f2e0'; c.beginPath(); c.ellipse(w*.5,h*.35,w*.3,h*.07,0,0,Math.PI*2); c.fill();
    c.fillStyle='#806020'; c.fillRect(w*.23,h*.5,w*.54,h*.22);
    c.fillStyle='rgba(255,255,230,0.75)'; c.font=`bold ${w*.11}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('smalec',w*.5,h*.61);
  },
  krem_usta(c,w,h) {
    c.fillStyle='#901840'; c.fillRect(w*.36,h*.12,w*.28,h*.26);
    c.fillStyle='#ff6080'; c.beginPath(); c.ellipse(w*.5,h*.36,w*.14,h*.07,0,0,Math.PI*2); c.fill();
    c.fillStyle='#d02858';
    c.beginPath(); if(c.roundRect)c.roundRect(w*.36,h*.36,w*.28,h*.52,3);else c.rect(w*.36,h*.36,w*.28,h*.52); c.fill();
    c.fillStyle='#b01840'; c.fillRect(w*.36,h*.36,w*.28,h*.09);
    c.fillStyle='rgba(255,255,255,0.22)'; c.fillRect(w*.38,h*.39,w*.07,h*.34);
    c.fillStyle='rgba(255,220,230,0.6)'; c.font=`${w*.22}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('👄',w*.5,h*.76);
  },
  tablet(c,w,h) {
    c.fillStyle='#1a1a28';
    c.beginPath(); if(c.roundRect)c.roundRect(w*.12,h*.08,w*.76,h*.84,6);else c.rect(w*.12,h*.08,w*.76,h*.84); c.fill();
    c.fillStyle='#1e80d8'; c.fillRect(w*.17,h*.13,w*.66,h*.7);
    c.fillStyle='#252535'; c.beginPath(); c.arc(w*.5,h*.9,w*.05,0,Math.PI*2); c.fill();
    c.fillStyle='#fff'; c.font=`${w*.28}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('🎮',w*.5,h*.47);
    c.fillStyle='rgba(255,255,255,0.35)'; c.font=`${w*.1}px sans-serif`; c.fillText('GRAJ',w*.5,h*.68);
  },
  asterka(c,w,h) {
    c.fillStyle='#d82010';
    c.beginPath(); c.moveTo(w*.05,h*.66); c.lineTo(w*.1,h*.42); c.lineTo(w*.3,h*.28); c.lineTo(w*.7,h*.28); c.lineTo(w*.9,h*.42); c.lineTo(w*.95,h*.66); c.closePath(); c.fill();
    c.fillStyle='#88c4ee';
    c.beginPath(); c.moveTo(w*.14,h*.46); c.lineTo(w*.2,h*.34); c.lineTo(w*.48,h*.32); c.lineTo(w*.48,h*.44); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(w*.52,h*.32); c.lineTo(w*.74,h*.34); c.lineTo(w*.8,h*.46); c.lineTo(w*.52,h*.44); c.closePath(); c.fill();
    c.fillStyle='#0a0a0a'; c.beginPath(); c.arc(w*.25,h*.7,w*.15,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(w*.75,h*.7,w*.15,0,Math.PI*2); c.fill();
    c.fillStyle='#707070'; c.beginPath(); c.arc(w*.25,h*.7,w*.07,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(w*.75,h*.7,w*.07,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`bold ${w*.11}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('5000',w*.5,h*.54);
  },
  ksiega_maro(c,w,h) {
    c.fillStyle='#1a3060'; c.fillRect(w*.06,h*.1,w*.42,h*.8); c.fillRect(w*.52,h*.1,w*.42,h*.8);
    c.fillStyle='#f8f5e8'; c.fillRect(w*.09,h*.13,w*.36,h*.74); c.fillRect(w*.55,h*.13,w*.36,h*.74);
    c.fillStyle='#0e2040'; c.fillRect(w*.46,h*.1,w*.08,h*.8);
    c.fillStyle='#1a3060'; c.font=`bold ${w*.13}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('MARO',w*.27,h*.28);
    c.fillStyle='#c03030'; c.beginPath(); c.arc(w*.27,h*.52,w*.1,0,Math.PI*2); c.fill();
    [[-8,-9],[8,-9],[-10,-2],[10,-2]].forEach(([dx,dy])=>{c.beginPath();c.arc(w*.27+dx,h*.52+dy,w*.045,0,Math.PI*2);c.fill();});
    c.strokeStyle='rgba(0,0,0,0.12)'; c.lineWidth=1;
    for(let i=0;i<5;i++){c.beginPath();c.moveTo(w*.58,h*(.24+i*.11));c.lineTo(w*.88,h*(.24+i*.11));c.stroke();}
  },
  kurtka_marcin(c,w,h) {
    c.fillStyle='#2a4060';
    c.beginPath(); c.moveTo(w*.16,h*.5); c.lineTo(w*.14,h*.92); c.lineTo(w*.86,h*.92); c.lineTo(w*.84,h*.5); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(w*.34,h*.28); c.lineTo(w*.5,h*.5); c.lineTo(w*.66,h*.28); c.closePath(); c.fill();
    c.lineWidth=14; c.strokeStyle='#2a4060'; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.18,h*.54); c.lineTo(w*.04,h*.82); c.stroke();
    c.beginPath(); c.moveTo(w*.82,h*.54); c.lineTo(w*.96,h*.82); c.stroke();
    c.fillStyle='#3a5070';
    c.beginPath(); c.ellipse(w*.12,h*.48,w*.1,h*.07,-.4,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(w*.88,h*.48,w*.1,h*.07,.4,0,Math.PI*2); c.fill();
    c.strokeStyle='#c8d0d8'; c.lineWidth=2; c.beginPath(); c.moveTo(w*.5,h*.5); c.lineTo(w*.5,h*.9); c.stroke();
    c.fillStyle='#fff'; c.font=`bold ${w*.1}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('MARCIN',w*.5,h*.7);
  },
  powerbank_armata(c,w,h) {
    c.fillStyle='#282830';
    c.beginPath(); if(c.roundRect)c.roundRect(w*.1,h*.28,w*.8,h*.45,7);else c.rect(w*.1,h*.28,w*.8,h*.45); c.fill();
    c.strokeStyle='#484850'; c.lineWidth=1.5; c.stroke();
    for(let i=0;i<4;i++){c.fillStyle=i<3?'#38c838':'#303038';c.fillRect(w*(.18+i*.18),h*.36,w*.14,h*.29);}
    c.fillStyle='#383840'; c.fillRect(w*.36,h*.8,w*.28,h*.08);
    c.fillStyle='rgba(255,255,255,0.12)'; c.fillRect(w*.38,h*.81,w*.08,h*.06);
    c.fillStyle='#f0c030'; c.font=`${w*.28}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('⚡',w*.5,h*.5);
  },
  pepsi(c,w,h) {
    c.fillStyle='#1040d0';
    c.beginPath(); c.moveTo(w*.22,h*.5); c.lineTo(w*.24,h*.86); c.bezierCurveTo(w*.24,h*.92,w*.76,h*.92,w*.76,h*.86); c.lineTo(w*.78,h*.5); c.closePath(); c.fill();
    c.fillStyle='#e81020';
    c.beginPath(); c.moveTo(w*.22,h*.5); c.lineTo(w*.22,h*.22); c.bezierCurveTo(w*.22,h*.15,w*.78,h*.15,w*.78,h*.22); c.lineTo(w*.78,h*.5); c.closePath(); c.fill();
    c.fillStyle='#fff';
    c.beginPath(); c.moveTo(w*.22,h*.46); c.bezierCurveTo(w*.36,h*.39,w*.64,h*.59,w*.78,h*.52); c.lineTo(w*.78,h*.5); c.bezierCurveTo(w*.64,h*.57,w*.36,h*.37,w*.22,h*.44); c.closePath(); c.fill();
    c.fillStyle='#b8b8c0'; c.beginPath(); c.ellipse(w*.5,h*.16,w*.28,h*.07,0,0,Math.PI*2); c.fill();
    c.fillStyle='#808090'; c.beginPath(); c.ellipse(w*.5,h*.12,w*.1,h*.04,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(w*.5,h*.5,w*.1,0,Math.PI*2); c.stroke();
  },
  fotobutka(c,w,h) {
    c.fillStyle='#f5f3e8'; c.fillRect(w*.28,h*.04,w*.44,h*.92);
    c.strokeStyle='#d0cdb0'; c.lineWidth=1; c.strokeRect(w*.28,h*.04,w*.44,h*.92);
    const moods=['😊','😠','😢'], ys=[h*.07,h*.36,h*.64];
    moods.forEach((m,i)=>{
      c.fillStyle='#e0d8b8'; c.fillRect(w*.31,ys[i],w*.38,w*.26);
      c.fillStyle='#fff'; c.font=`${w*.22}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(m,w*.5,ys[i]+w*.13);
    });
  },
  id_adapciak(c,w,h) {
    c.fillStyle='#1040a0';
    c.beginPath(); if(c.roundRect)c.roundRect(w*.06,h*.16,w*.88,h*.68,5);else c.rect(w*.06,h*.16,w*.88,h*.68); c.fill();
    c.fillStyle='#1858c0'; c.fillRect(w*.06,h*.16,w*.88,h*.24);
    c.fillStyle='#90b8f0'; c.fillRect(w*.1,h*.26,w*.24,w*.3);
    c.fillStyle='#f0d8c0'; c.beginPath(); c.arc(w*.22,h*.34,w*.08,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.7)'; c.fillRect(w*.38,h*.29,w*.5,h*.06);
    c.fillStyle='rgba(255,255,255,0.35)'; c.fillRect(w*.38,h*.38,w*.4,h*.05); c.fillRect(w*.38,h*.45,w*.46,h*.05);
    c.fillStyle='rgba(255,230,0,0.8)'; c.font=`bold ${w*.11}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('ADAPCIAK',w*.5,h*.66);
    c.fillStyle='rgba(255,255,255,0.55)'; c.font=`${w*.1}px sans-serif`; c.fillText('2024',w*.5,h*.76);
  },

  papierek(c,w,h) {
    c.fillStyle='#f8f4e6';
    c.beginPath(); c.moveTo(w*.32,h*.18); c.lineTo(w*.8,h*.13); c.lineTo(w*.84,h*.74); c.lineTo(w*.2,h*.8); c.lineTo(w*.16,h*.46); c.closePath(); c.fill();
    c.strokeStyle='#e0d8c0'; c.lineWidth=1.2; c.stroke();
    c.strokeStyle='rgba(155,145,110,0.35)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(w*.32,h*.18); c.lineTo(w*.5,h*.5); c.lineTo(w*.2,h*.8); c.stroke();
    c.beginPath(); c.moveTo(w*.8,h*.13); c.lineTo(w*.52,h*.48); c.stroke();
    c.fillStyle='rgba(0,0,0,0.28)'; c.font=`${w*.09}px sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.save(); c.rotate(-.1);
    c.fillText('rafal,',w*.47,h*.36); c.fillText('zostaw',w*.48,h*.47); c.fillText('papier',w*.49,h*.58); c.restore();
  },
  matcha(c,w,h) {
    c.fillStyle='#f2f2f2';
    c.beginPath(); c.moveTo(w*.16,h*.34); c.lineTo(w*.2,h*.84); c.lineTo(w*.8,h*.84); c.lineTo(w*.84,h*.34); c.closePath(); c.fill();
    c.strokeStyle='#d0d0c8'; c.lineWidth=1.2; c.stroke();
    c.fillStyle='#4aaa22'; c.beginPath(); c.ellipse(w*.5,h*.36,w*.31,h*.09,0,0,Math.PI*2); c.fill();
    c.strokeStyle='#6acc44'; c.lineWidth=2; c.lineCap='round';
    c.beginPath(); c.arc(w*.4,h*.36,w*.08,0,Math.PI*1.5); c.stroke();
    c.beginPath(); c.arc(w*.6,h*.36,w*.08,Math.PI,Math.PI*2.5); c.stroke();
    c.strokeStyle='#4aaa22'; c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.72,h*.1); c.lineTo(w*.67,h*.36); c.stroke();
    c.fillStyle='#2a7a10'; c.font=`bold ${w*.13}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('抹茶',w*.5,h*.62);
  },
  sukienka_bal(c,w,h) {
    c.fillStyle='#8828b8';
    c.beginPath(); c.moveTo(w*.34,h*.2); c.lineTo(w*.66,h*.2); c.lineTo(w*.7,h*.52); c.lineTo(w*.3,h*.52); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(w*.3,h*.52); c.bezierCurveTo(w*.08,h*.56,w*.02,h*.97,w*.14,h*.97); c.lineTo(w*.86,h*.97); c.bezierCurveTo(w*.98,h*.97,w*.92,h*.56,w*.7,h*.52); c.closePath(); c.fill();
    c.strokeStyle='#6818a0'; c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.4,h*.2); c.lineTo(w*.38,h*.1); c.stroke();
    c.beginPath(); c.moveTo(w*.6,h*.2); c.lineTo(w*.62,h*.1); c.stroke();
    c.fillStyle='rgba(255,220,30,0.8)';
    [[.22,.66],[.5,.74],[.78,.68],[.36,.84],[.64,.86],[.5,.6],[.3,.76],[.7,.79]].forEach(([x,y])=>{c.beginPath();c.arc(w*x,h*y,1.8,0,Math.PI*2);c.fill();});
    c.fillStyle='#c060e8'; c.beginPath(); c.arc(w*.5,h*.52,w*.07,0,Math.PI*2); c.fill();
  },
  plyta_top(c,w,h) {
    c.fillStyle='#0e0e0e'; c.beginPath(); c.arc(w*.5,h*.5,w*.42,0,Math.PI*2); c.fill();
    c.fillStyle='#e8d020'; c.beginPath(); c.arc(w*.5,h*.5,w*.19,0,Math.PI*2); c.fill();
    c.fillStyle='#1a1a1a'; c.beginPath(); c.arc(w*.5,h*.5,w*.06,0,Math.PI*2); c.fill();
    c.fillStyle='#0e0e0e'; c.font=`bold ${w*.12}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('TOP',w*.5,h*.5);
    c.strokeStyle='rgba(255,255,255,0.06)'; c.lineWidth=1.5;
    for(let r=.22;r<.4;r+=.05){c.beginPath();c.arc(w*.5,h*.5,w*r,0,Math.PI*2);c.stroke();}
    c.fillStyle='rgba(255,255,255,0.1)'; c.beginPath(); c.arc(w*.36,h*.35,w*.09,0,Math.PI*2); c.fill();
  },
  plakat_ronaldo(c,w,h) {
    c.fillStyle='#ece8e0'; c.fillRect(w*.08,h*.05,w*.84,h*.9);
    c.strokeStyle='#c8c0b0'; c.lineWidth=1; c.strokeRect(w*.08,h*.05,w*.84,h*.9);
    c.fillStyle='#d01010'; c.font=`bold ${w*.24}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('CR7',w*.5,h*.28);
    c.fillStyle='#141414';
    c.beginPath(); c.arc(w*.5,h*.5,w*.08,0,Math.PI*2); c.fill();
    c.lineWidth=4; c.strokeStyle='#141414'; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.5,h*.58); c.lineTo(w*.5,h*.76); c.stroke();
    c.beginPath(); c.moveTo(w*.5,h*.64); c.lineTo(w*.34,h*.7); c.stroke();
    c.beginPath(); c.moveTo(w*.5,h*.64); c.lineTo(w*.7,h*.58); c.stroke();
    c.beginPath(); c.moveTo(w*.5,h*.76); c.lineTo(w*.38,h*.9); c.stroke();
    c.beginPath(); c.moveTo(w*.5,h*.76); c.lineTo(w*.64,h*.88); c.stroke();
    c.fillStyle='#d01010'; c.font=`bold ${w*.13}px sans-serif`; c.textAlign='center';
    c.fillText('SIUUU!',w*.5,h*.96);
  },
  hdmi_10m(c,w,h) {
    c.strokeStyle='#181818'; c.lineWidth=5; c.lineCap='round';
    for(let i=0;i<3;i++){c.beginPath();c.ellipse(w*.5,h*(.44+i*.16),w*.26,h*.07,0,0,Math.PI*2);c.stroke();}
    c.fillStyle='#282828'; c.fillRect(w*.2,h*.07,w*.6,h*.22);
    c.fillStyle='#383838';
    c.beginPath(); c.moveTo(w*.2,h*.29); c.lineTo(w*.27,h*.4); c.lineTo(w*.73,h*.4); c.lineTo(w*.8,h*.29); c.closePath(); c.fill();
    c.fillStyle='#c8a028';
    for(let p=0;p<5;p++)c.fillRect(w*(.27+p*.09),h*.09,w*.07,h*.13);
    c.fillStyle='#e0c050'; c.font=`bold ${w*.15}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('10M',w*.5,h*.85);
  },
  pegielek(c,w,h) {
    c.fillStyle='#e89abc';
    c.beginPath(); c.arc(w*.5,h*.6,w*.34,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(w*.5,h*.33,w*.25,0,Math.PI*2); c.fill();
    c.beginPath(); c.moveTo(w*.26,h*.2); c.lineTo(w*.2,h*.05); c.lineTo(w*.4,h*.17); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(w*.74,h*.2); c.lineTo(w*.8,h*.05); c.lineTo(w*.6,h*.17); c.closePath(); c.fill();
    c.fillStyle='#fff'; c.beginPath(); c.arc(w*.38,h*.32,w*.11,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(w*.62,h*.32,w*.11,0,Math.PI*2); c.fill();
    c.fillStyle='#8020a8'; c.beginPath(); c.arc(w*.38,h*.33,w*.08,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(w*.62,h*.33,w*.08,0,Math.PI*2); c.fill();
    c.fillStyle='#0a0a10'; c.beginPath(); c.arc(w*.38,h*.33,w*.04,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(w*.62,h*.33,w*.04,0,Math.PI*2); c.fill();
    c.strokeStyle='#c06090'; c.lineWidth=2; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.38,h*.44); c.bezierCurveTo(w*.4,h*.51,w*.6,h*.51,w*.62,h*.44); c.stroke();
    c.strokeStyle='#e89abc'; c.lineWidth=11; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.18,h*.62); c.lineTo(w*.06,h*.76); c.stroke();
    c.beginPath(); c.moveTo(w*.82,h*.62); c.lineTo(w*.94,h*.76); c.stroke();
  },
  festoria(c,w,h) {
    c.fillStyle='#d4a860'; c.fillRect(w*.1,h*.36,w*.8,h*.58);
    c.fillStyle='#8b4520';
    c.beginPath(); c.moveTo(w*.06,h*.36); c.lineTo(w*.5,h*.1); c.lineTo(w*.94,h*.36); c.closePath(); c.fill();
    c.fillStyle='#ffe090'; c.fillRect(w*.15,h*.44,w*.2,h*.16); c.fillRect(w*.65,h*.44,w*.2,h*.16);
    c.fillStyle='#6b3515'; c.fillRect(w*.38,h*.6,w*.24,h*.34);
    c.fillStyle='#c07818'; c.fillRect(w*.44,h*.64,w*.05,h*.05);
    c.fillStyle='#f0e020'; c.fillRect(w*.12,h*.28,w*.76,h*.1);
    c.fillStyle='#8b4520'; c.font=`bold ${w*.1}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('FESTORIA',w*.5,h*.33);
    c.strokeStyle='#d0c8b8'; c.lineWidth=2; c.lineCap='round';
    c.beginPath(); c.moveTo(w*.5,h*.37); c.lineTo(w*.5,h*.29); c.stroke();
    c.beginPath(); c.moveTo(w*.46,h*.29); c.lineTo(w*.54,h*.29); c.stroke();
  },
  telefon(c,w,h) {
    c.fillStyle='#1c1c28';
    c.beginPath(); if(c.roundRect)c.roundRect(w*.22,h*.05,w*.56,h*.9,7);else c.rect(w*.22,h*.05,w*.56,h*.9); c.fill();
    c.fillStyle='#1e3870'; c.fillRect(w*.27,h*.11,w*.46,h*.78);
    c.fillStyle='#e83030'; c.beginPath(); c.arc(w*.73,h*.19,w*.11,0,Math.PI*2); c.fill();
    c.fillStyle='#fff'; c.font=`bold ${w*.12}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('3',w*.73,h*.19);
    c.fillStyle='#fff';
    c.beginPath(); if(c.roundRect)c.roundRect(w*.3,h*.35,w*.4,h*.22,4);else c.rect(w*.3,h*.35,w*.4,h*.22); c.fill();
    c.fillStyle='#2a3460'; c.font=`${w*.1}px sans-serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('halo!',w*.5,h*.46);
    c.fillStyle='#2c2c3a';
    c.beginPath(); if(c.roundRect)c.roundRect(w*.38,h*.87,w*.24,h*.04,2);else c.rect(w*.38,h*.87,w*.24,h*.04); c.fill();
  },
  kinderki(c,w,h) {
    c.fillStyle='#e05018';
    c.beginPath(); if(c.roundRect)c.roundRect(w*.06,h*.28,w*.88,h*.44,6);else c.rect(w*.06,h*.28,w*.88,h*.44); c.fill();
    c.fillStyle='#381808';
    c.beginPath(); if(c.roundRect)c.roundRect(w*.1,h*.32,w*.37,h*.36,4);else c.rect(w*.1,h*.32,w*.37,h*.36); c.fill();
    c.beginPath(); if(c.roundRect)c.roundRect(w*.53,h*.32,w*.37,h*.36,4);else c.rect(w*.53,h*.32,w*.37,h*.36); c.fill();
    c.fillStyle='#f8f0e0'; c.fillRect(w*.12,h*.44,w*.33,h*.12); c.fillRect(w*.55,h*.44,w*.33,h*.12);
    c.fillStyle='#e05018'; c.font=`italic bold ${w*.1}px serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('kinder',w*.285,h*.5); c.fillText('kinder',w*.715,h*.5);
    c.fillStyle='rgba(255,255,255,0.75)'; c.font=`bold ${w*.1}px sans-serif`;
    c.fillText('Bueno',w*.5,h*.8);
  },
};

function drawShopItemIcon(id, ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  const fn = _IC[id];
  if (!fn) {
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(4, 4, w-8, h-8);
    return;
  }
  ctx.save();
  try { fn(ctx, w, h); } catch(e) { /* ignore drawing errors */ }
  ctx.restore();
}

/* ══════════════════════════════════════════════════════
   Ratajski — portret (canvas 120 × 160) — siwe włosy
   ══════════════════════════════════════════════════════ */
let _shopRaf = null, _shopT0 = null;

function _startRatajski() {
  _stopRatajski();
  _shopT0 = performance.now();
  function tick(now) {
    _drawRatajski(Math.sin((now - _shopT0) / 820) * 2);
    _shopRaf = requestAnimationFrame(tick);
  }
  _shopRaf = requestAnimationFrame(tick);
}
function _stopRatajski() {
  if (_shopRaf) { cancelAnimationFrame(_shopRaf); _shopRaf = null; }
}

function _drawRatajski(dy) {
  const cv = document.getElementById('ratajski-cvs');
  if (!cv) return;
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height, cx = W / 2;
  c.clearRect(0, 0, W, H);

  const bg = c.createRadialGradient(cx, H * 0.35, 0, cx, H * 0.35, W * 0.62);
  bg.addColorStop(0, 'rgba(180,30,30,0.14)'); bg.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);

  c.save(); c.translate(0, dy);

  const pG = c.createLinearGradient(cx, H*0.8, cx, H);
  pG.addColorStop(0,'#1e2255'); pG.addColorStop(1,'#111440');
  c.fillStyle = pG;
  c.beginPath(); c.moveTo(cx-14,H*0.8); c.lineTo(cx-20,H); c.lineTo(cx-2,H); c.lineTo(cx,H*0.8); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(cx,H*0.8);    c.lineTo(cx+2,H);  c.lineTo(cx+20,H); c.lineTo(cx+14,H*0.8); c.closePath(); c.fill();

  const sG = c.createLinearGradient(cx-28,H*0.5,cx+28,H*0.82);
  sG.addColorStop(0,'#cc1212'); sG.addColorStop(1,'#980a0a');
  c.fillStyle = sG;
  c.beginPath(); c.moveTo(cx-14,H*0.5); c.lineTo(cx-30,H*0.54); c.lineTo(cx-28,H*0.82); c.lineTo(cx+28,H*0.82); c.lineTo(cx+30,H*0.54); c.lineTo(cx+14,H*0.5); c.closePath(); c.fill();
  c.fillStyle='#fff'; c.beginPath(); c.moveTo(cx-8,H*0.5); c.lineTo(cx,H*0.59); c.lineTo(cx+8,H*0.5); c.closePath(); c.fill();
  c.fillStyle='rgba(255,255,255,0.22)';
  c.fillRect(cx-30,H*0.63,14,H*0.19); c.fillRect(cx+16,H*0.63,14,H*0.19);
  c.font='bold 7px "Segoe UI",sans-serif'; c.textAlign='center'; c.textBaseline='middle';
  c.fillStyle='rgba(255,255,255,0.72)'; c.fillText('PDC',cx,H*0.635);

  c.strokeStyle='#cc1212'; c.lineWidth=13; c.lineCap='round';
  c.beginPath(); c.moveTo(cx-16,H*0.52); c.quadraticCurveTo(cx-36,H*0.62,cx-32,H*0.74); c.stroke();
  c.beginPath(); c.moveTo(cx+16,H*0.52); c.quadraticCurveTo(cx+36,H*0.62,cx+34,H*0.72); c.stroke();

  const SKIN='#f0d8c0', SKIN2='#e0c8b0';
  c.fillStyle=SKIN2;
  c.beginPath(); c.ellipse(cx-31,H*0.75,7,5,-0.3,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(cx+33,H*0.73,7,5, 0.3,0,Math.PI*2); c.fill();

  c.strokeStyle='#c8a040'; c.lineWidth=2; c.lineCap='butt';
  c.beginPath(); c.moveTo(cx+33,H*0.73); c.lineTo(cx+52,H*0.55); c.stroke();
  c.fillStyle='#c09030';
  c.beginPath(); c.moveTo(cx+52,H*0.55); c.lineTo(cx+56,H*0.51); c.lineTo(cx+49,H*0.53); c.closePath(); c.fill();
  c.strokeStyle='#707070'; c.lineWidth=1.5;
  c.beginPath(); c.moveTo(cx+33,H*0.73); c.lineTo(cx+26,H*0.78); c.stroke();
  c.fillStyle='rgba(200,40,40,0.85)';
  c.beginPath(); c.moveTo(cx+26,H*0.78); c.lineTo(cx+21,H*0.72); c.lineTo(cx+25,H*0.8); c.closePath(); c.fill();
  c.fillStyle='rgba(255,255,255,0.6)';
  c.beginPath(); c.moveTo(cx+26,H*0.78); c.lineTo(cx+22,H*0.74); c.lineTo(cx+25,H*0.8); c.closePath(); c.fill();

  c.fillStyle=SKIN2; c.fillRect(cx-5,H*0.45,10,7);

  c.fillStyle=SKIN;
  c.beginPath(); c.ellipse(cx,H*0.27,26,29,0,0,Math.PI*2); c.fill();

  /* włosy — siwe/srebrne */
  c.fillStyle='#b8b8c0';
  c.beginPath();
  c.moveTo(cx-25,H*0.19);
  c.bezierCurveTo(cx-28,H*0.07,cx-8,H*0.03,cx,H*0.04);
  c.bezierCurveTo(cx+8, H*0.03,cx+28,H*0.07,cx+25,H*0.19);
  c.bezierCurveTo(cx+18,H*0.14,cx+8, H*0.12,cx-8, H*0.12);
  c.bezierCurveTo(cx-18,H*0.12,cx-25,H*0.19,cx-25,H*0.19);
  c.closePath(); c.fill();
  /* boki/skronie */
  c.fillRect(cx-27,H*0.2,7,14); c.fillRect(cx+20,H*0.2,7,14);
  /* cień nadaje głębię siwym włosom */
  c.fillStyle='rgba(100,100,115,0.3)';
  c.beginPath();
  c.moveTo(cx-25,H*0.19); c.bezierCurveTo(cx-20,H*0.15,cx-8,H*0.13,cx,H*0.13);
  c.bezierCurveTo(cx+8,H*0.13,cx+20,H*0.15,cx+25,H*0.19);
  c.bezierCurveTo(cx+18,H*0.14,cx+8,H*0.12,cx-8,H*0.12);
  c.bezierCurveTo(cx-18,H*0.12,cx-25,H*0.19,cx-25,H*0.19); c.closePath(); c.fill();

  c.fillStyle='#fff';
  c.beginPath(); c.ellipse(cx-10,H*0.27,4.5,4.2,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(cx+10,H*0.27,4.5,4.2,0,0,Math.PI*2); c.fill();
  c.fillStyle='#507090';
  c.beginPath(); c.arc(cx-10,H*0.27,3,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(cx+10,H*0.27,3,0,Math.PI*2); c.fill();
  c.fillStyle='#181820';
  c.beginPath(); c.arc(cx-10,H*0.27,1.8,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(cx+10,H*0.27,1.8,0,Math.PI*2); c.fill();
  c.fillStyle='#fff';
  c.beginPath(); c.arc(cx-8.5,H*0.262,1,0,Math.PI*2); c.fill();
  c.beginPath(); c.arc(cx+11.5,H*0.262,1,0,Math.PI*2); c.fill();

  /* brwi — ciemniejsza szarość */
  c.strokeStyle='#707078'; c.lineWidth=1.8; c.lineCap='round';
  c.beginPath(); c.moveTo(cx-15,H*0.244); c.lineTo(cx-5,H*0.237); c.stroke();
  c.beginPath(); c.moveTo(cx+5,H*0.237);  c.lineTo(cx+15,H*0.244); c.stroke();

  c.fillStyle='#d0a888';
  c.beginPath(); c.ellipse(cx,H*0.312,5,6,0,0,Math.PI*2); c.fill();

  c.fillStyle='#fff';
  c.beginPath(); c.arc(cx,H*0.362,10,0.08,Math.PI-0.08); c.closePath(); c.fill();
  c.strokeStyle='#c08070'; c.lineWidth=1.8; c.lineCap='round';
  c.beginPath(); c.arc(cx,H*0.362,10,0.08,Math.PI-0.08); c.stroke();

  c.fillStyle='rgba(230,150,130,0.28)';
  c.beginPath(); c.ellipse(cx-18,H*0.327,8,5.5,0,0,Math.PI*2); c.fill();
  c.beginPath(); c.ellipse(cx+18,H*0.327,8,5.5,0,0,Math.PI*2); c.fill();

  c.font='11px serif'; c.textAlign='center'; c.textBaseline='middle';
  c.globalAlpha=0.55; c.fillStyle='#fff';
  c.fillText('🦅',cx,H*0.75); c.globalAlpha=1;

  c.restore();
}

/* ══════════════════════════════════════════════════════
   Wyświetlanie założonych itemów w panelu ekwipunku
   ══════════════════════════════════════════════════════ */
function buildEquipGear() {
  const gear = document.getElementById('equipped-gear');
  if (!gear) return;
  gear.innerHTML = '';

  const cats = [
    { cat:'atak',    icon:'⚔️', label:'Atak' },
    { cat:'obrona',  icon:'🛡️', label:'Obrona' },
    { cat:'hybryda', icon:'⚡', label:'Hybryda' },
  ];

  for (const { cat, icon, label } of cats) {
    const item = _equippedItem(cat);
    const rc = item ? (SHOP_RC[item.rarity] || '#888') : null;

    const slot = document.createElement('div');
    slot.className = 'gear-slot' + (item ? ' gear-slot-on' : '');

    const cv = document.createElement('canvas');
    cv.width = 48; cv.height = 48; cv.className = 'gear-slot-cvs';
    const ctx = cv.getContext('2d');
    if (item) {
      drawShopItemIcon(item.id, ctx, 48, 48);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(3,3,42,42);
      ctx.font = '22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillText(icon, 24, 24);
    }

    const name = document.createElement('div');
    name.className = 'gear-slot-name';
    name.style.color = rc || 'rgba(180,180,200,0.4)';
    name.textContent = item ? item.name : label;

    const fx = document.createElement('div');
    fx.className = 'gear-slot-fx';
    if (item) {
      const p = [];
      if (item.atk > 0) p.push(`+${item.atk}%`);
      if (item.def < 0) p.push(`${item.def}%`);
      fx.textContent = p.join(' / ');
    }

    slot.append(cv, name, fx);
    gear.appendChild(slot);
  }
}

/* ══════════════════════════════════════════════════════
   Shop UI
   ══════════════════════════════════════════════════════ */
let _shopOpen = false;
let _shopCat  = 'atak';

const _LINES = {
  open:    'Cześć! Ratajski jestem,\nKrzysztof. Polskie Orły\npozdrawiają! Czym mogę\nsłużyć? 🎯',
  buy:     'Dobry wybór!\nCelny jak moje strzałki! 🎯',
  replace: 'Zamieniam stary na nowy!\nDobra decyzja! 🎯',
  noMoney: 'Hej, rozumiem,\nale darta też kosztuje.\nWróć jak będziesz miała kasę.',
};

function _setSpeech(key) {
  const el = document.getElementById('ratajski-speech');
  if (!el) return;
  el.textContent = _LINES[key] || '';
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
}

function openShop() {
  if (_shopOpen) return;
  _shopOpen = true;
  _shopCat  = 'atak';
  document.getElementById('shop-overlay').classList.remove('hidden');
  document.querySelectorAll('.shop-tab').forEach(b => b.classList.toggle('active', b.dataset.cat === 'atak'));
  _startRatajski();
  _setSpeech('open');
  _refreshShop();
  document.addEventListener('keydown', _shopEsc);
}

function closeShop() {
  if (!_shopOpen) return;
  _shopOpen = false;
  document.getElementById('shop-overlay').classList.add('hidden');
  _stopRatajski();
  document.removeEventListener('keydown', _shopEsc);
}

function _shopEsc(e) { if (e.key === 'Escape') closeShop(); }

function _refreshShop() {
  _renderItems();
  _renderEquippedBar();
  const el = document.getElementById('shop-currency-amt');
  if (el) el.textContent = gameStats.zlote;
}

function _renderEquippedBar() {
  const bar = document.getElementById('shop-equipped-bar');
  if (!bar) return;
  const parts = [];
  const a = _equippedItem('atak');    if (a) parts.push(`⚔️ ${a.name} (+${a.atk}%)`);
  const o = _equippedItem('obrona');  if (o) parts.push(`🛡️ ${o.name} (${o.def}%)`);
  const h = _equippedItem('hybryda'); if (h) parts.push(`⚡ ${h.name}`);
  bar.textContent = parts.length ? parts.join('  ·  ') : 'Brak założonych itemów';
}

function _renderItems() {
  const list = document.getElementById('shop-item-list');
  if (!list) return;
  list.innerHTML = '';
  const slotKey = _shopCat === 'atak' ? 'atakowny' : _shopCat === 'obrona' ? 'obronny' : 'hybrydowy';

  for (const item of ALL_SHOP_ITEMS.filter(i => i.cat === _shopCat)) {
    const equipped = equipState[slotKey] === item.id;
    const rc = SHOP_RC[item.rarity] || '#888';
    const fxParts = [];
    if (item.atk > 0) fxParts.push(`+${item.atk}% ATK`);
    if (item.def < 0) fxParts.push(`${item.def}% DMG`);

    const row = document.createElement('div');
    row.className = 'shop-row' + (equipped ? ' shop-row-eq' : '');

    /* ikona canvasowa */
    const iconCV = document.createElement('canvas');
    iconCV.width = 44; iconCV.height = 44; iconCV.className = 'shop-icon-cvs';
    drawShopItemIcon(item.id, iconCV.getContext('2d'), 44, 44);

    const main = document.createElement('div'); main.className = 'shop-row-main';
    main.innerHTML = `
      <span class="shop-row-name" style="color:${rc}">${equipped ? '✓ ' : ''}${item.name}</span>
      <span class="shop-row-rar"  style="color:${rc}">${item.rarity}</span>
      <p   class="shop-row-desc">${item.desc}</p>
      <span class="shop-row-fx">${fxParts.join(' / ')}</span>`;

    const side = document.createElement('div'); side.className = 'shop-row-side';
    const btn = document.createElement('button');
    btn.className = 'shop-buy-btn' + (equipped ? ' shop-buy-eq' : '');
    btn.disabled = equipped;
    btn.textContent = equipped ? 'Założony' : 'Kup i załóż';
    if (!equipped) btn.addEventListener('click', () => _buyItem(item, slotKey));
    side.innerHTML = `<span class="shop-row-price">🪙 ${item.price} zł</span>`;
    side.appendChild(btn);

    row.append(iconCV, main, side);
    list.appendChild(row);
  }
}

/* incremented each purchase, read by Q7 quest logic in gdansk.js */
let _forumBuyCount = 0;

function _buyItem(item, slotKey) {
  if (gameStats.zlote < item.price) { _setSpeech('noMoney'); return; }
  const wasEquipped = equipState[slotKey] !== null;
  addZlote(-item.price);
  equipState[slotKey] = item.id;
  _forumBuyCount++;
  _setSpeech(wasEquipped ? 'replace' : 'buy');
  _refreshShop();
  buildEquipGear();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('shop-close').addEventListener('click', closeShop);
  document.getElementById('shop-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('shop-overlay')) closeShop();
  });
  document.querySelectorAll('.shop-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      _shopCat = btn.dataset.cat;
      document.querySelectorAll('.shop-tab').forEach(b => b.classList.toggle('active', b === btn));
      _renderItems();
    });
  });
  /* odśwież gear-sloty za każdym razem gdy otwiera się panel ekwipunku */
  document.getElementById('equip-btn').addEventListener('click', () => {
    requestAnimationFrame(buildEquipGear);
  });
});
