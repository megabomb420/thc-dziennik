const METHODS = [
  { id:'dab',    icon:'💧', name:'Dab' },
  { id:'vape',   icon:'💨', name:'Vape' },
  { id:'vapor',  icon:'🌬️', name:'Waporyzator' },
  { id:'smoke',  icon:'🚬', name:'Palenie' },
  { id:'edible', icon:'🍪', name:'Edibles' },
  { id:'oil',    icon:'🧴', name:'Olejek/Tincture' },
];

const LS_ENTRIES = 'thc_entries_v1';
const LS_SETTINGS = 'thc_settings_v1';

let entries = JSON.parse(localStorage.getItem(LS_ENTRIES) || '[]');
let settings = JSON.parse(localStorage.getItem(LS_SETTINGS) || '{"goal":0,"nick":""}');
let selectedMethod = 'vapor';

const $ = id => document.getElementById(id);

function save() {
  localStorage.setItem(LS_ENTRIES, JSON.stringify(entries));
  localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
}

function fmtSince(ms) {
  if (ms < 0) ms = 0;
  const m = Math.floor(ms / 60000);
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ' + (m % 60) + 'm';
  return Math.floor(h / 24) + 'd ' + (h % 24) + 'h';
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* --- metody --- */
function renderMethods() {
  $('methods').innerHTML = METHODS.map(m =>
    `<button class="method ${m.id === selectedMethod ? 'active' : ''}" data-id="${m.id}">
       <span class="m-icon">${m.icon}</span><span class="m-name">${m.name}</span>
     </button>`).join('');
  document.querySelectorAll('.method').forEach(b =>
    b.onclick = () => { selectedMethod = b.dataset.id; renderMethods(); });
}

/* --- statystyki --- */
function renderStats() {
  const now = new Date();
  const sorted = [...entries].sort((a, b) => a.t - b.t);
  const todayCount = entries.filter(e => sameDay(new Date(e.t), now)).length;
  $('statToday').textContent = todayCount;
  $('statSince').textContent = sorted.length ? fmtSince(now - sorted[sorted.length - 1].t) : '–';

  if (sorted.length > 1) {
    const span = sorted[sorted.length - 1].t - sorted[0].t;
    $('statGap').textContent = fmtSince(span / (sorted.length - 1));
  } else $('statGap').textContent = '–';

  $('statGoal').textContent = settings.goal > 0 ? settings.goal : '–';

  const fill = $('goalFill'), txt = $('goalText');
  if (settings.goal > 0) {
    const pct = Math.min(100, todayCount / settings.goal * 100);
    fill.style.width = pct + '%';
    fill.classList.toggle('over', todayCount > settings.goal);
    txt.textContent = todayCount > settings.goal
      ? `⚠️ Limit przekroczony: ${todayCount}/${settings.goal}`
      : `Dzisiejszy limit: ${todayCount}/${settings.goal}`;
  } else {
    fill.style.width = '0';
    txt.textContent = 'Ustaw limit dzienny w ustawieniach ⚙️';
  }
}

/* --- wykres --- */
function renderChart() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d);
  }
  const counts = days.map(d => entries.filter(e => sameDay(new Date(e.t), d)).length);
  const max = Math.max(1, ...counts);
  const names = ['Nd','Pn','Wt','Śr','Cz','Pt','So'];
  $('chart').innerHTML = days.map((d, i) => `
    <div class="bar-col">
      <span class="bar-count">${counts[i] || ''}</span>
      <div class="bar ${i === 6 ? 'today' : ''}" style="height:${counts[i] / max * 72 + 4}px"></div>
      <span class="bar-label">${names[d.getDay()]}</span>
    </div>`).join('');
}

/* --- historia --- */
function methodOf(id) { return METHODS.find(m => m.id === id) || METHODS[0]; }

function renderHistory() {
  const el = $('history');
  const sorted = [...entries].sort((a, b) => b.t - a.t).slice(0, 100);
  if (!sorted.length) { el.innerHTML = '<div class="empty">Brak wpisów — zapisz pierwszą sesję 🌿</div>'; return; }
  el.innerHTML = sorted.map(e => {
    const m = methodOf(e.m);
    const d = new Date(e.t);
    const when = d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }) + ' ' +
                 d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const extra = [e.amount ? e.amount : '', e.note || ''].filter(Boolean).join(' · ');
    return `<div class="entry">
      <span class="e-icon">${m.icon}</span>
      <div class="e-main"><div class="e-method">${m.name}</div>
      ${extra ? `<div class="e-note">${extra}</div>` : ''}</div>
      <div class="e-time">${when}</div>
      <button class="e-del" data-id="${e.id}" title="Usuń">✕</button>
    </div>`;
  }).join('');
  el.querySelectorAll('.e-del').forEach(b => b.onclick = () => {
    entries = entries.filter(e => e.id !== b.dataset.id);
    save(); renderAll();
  });
}

function renderAll() { renderStats(); renderChart(); renderHistory(); }

/* --- zapis --- */
function addEntry(ts) {
  entries.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    t: ts,
    m: selectedMethod,
    amount: $('amountInput').value ? $('amountInput').value : null,
    note: $('noteInput').value.trim() || null,
  });
  save();
  $('amountInput').value = ''; $('noteInput').value = '';
  renderAll();
  const m = methodOf(selectedMethod);
  toast(`${m.icon} Zapisano: ${m.name}`);
}

$('logNow').onclick = () => addEntry(Date.now());
$('logCustom').onclick = () => {
  const c = $('customTime');
  c.classList.remove('hidden');
  c.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  c.onchange = () => { if (c.value) { addEntry(new Date(c.value).getTime()); c.classList.add('hidden'); } };
  c.focus();
};

/* --- eksport --- */
$('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify({ settings, entries }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'thc-dziennik-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
};

/* --- ustawienia --- */
$('settingsBtn').onclick = () => {
  $('goalInput').value = settings.goal;
  $('nickInput').value = settings.nick;
  $('settingsModal').classList.remove('hidden');
};
$('closeSettings').onclick = () => $('settingsModal').classList.add('hidden');
$('saveSettings').onclick = () => {
  settings.goal = Math.max(0, parseInt($('goalInput').value) || 0);
  settings.nick = $('nickInput').value.trim();
  save(); renderAll();
  $('settingsModal').classList.add('hidden');
  toast('✅ Zapisano ustawienia');
};
$('wipeBtn').onclick = () => {
  if (confirm('Na pewno usunąć WSZYSTKIE wpisy? Tego nie da się cofnąć.')) {
    entries = []; save(); renderAll();
    $('settingsModal').classList.add('hidden');
    toast('🗑 Dane usunięte');
  }
};

/* --- toast --- */
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}

/* --- init --- */
renderMethods();
renderAll();
setInterval(renderStats, 30000); // odświeżanie "od ostatniej"
