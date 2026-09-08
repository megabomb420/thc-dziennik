const METHODS = ['dab', 'vape', 'vapor', 'smoke', 'edible', 'oil'];

const LS_ENTRIES = 'thc_entries_v1';
const LS_SETTINGS = 'thc_settings_v1';

/* ---------- bezpieczny storage (uszkodzone dane nie mogą zabić apki) ---------- */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v == null ? fallback : v;
  } catch { return fallback; }
}

function loadEntries() {
  const raw = readJSON(LS_ENTRIES, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(e => e && typeof e === 'object' && typeof e.t === 'number' && isFinite(e.t))
    .map(e => ({
      id: typeof e.id === 'string' && e.id ? e.id : Math.random().toString(36).slice(2, 10),
      t: e.t,
      m: typeof e.m === 'string' ? e.m : 'vapor',
      amount: e.amount == null ? null : String(e.amount).slice(0, 24),
      note: e.note == null ? null : String(e.note).slice(0, 200),
    }));
}

function loadSettings() {
  const raw = readJSON(LS_SETTINGS, {});
  const s = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const goal = parseInt(s.goal, 10);
  return {
    goal: isFinite(goal) ? Math.max(0, Math.min(50, goal)) : 0,
    nick: typeof s.nick === 'string' ? s.nick.slice(0, 30) : '',
    lang: s.lang === 'pl' ? 'pl' : 'en',
  };
}

let entries = loadEntries();
let settings = loadSettings();
let selectedMethod = 'vapor';

const $ = id => document.getElementById(id);
const t = (k, v) => window.i18n.t(k, v);
const methodName = id => t('method_' + id);

/* dane użytkownika nigdy nie trafiają do HTML bez escapowania */
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function save() {
  try {
    localStorage.setItem(LS_ENTRIES, JSON.stringify(entries));
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  } catch {
    toast(t('toastStorageFull'), 'alert');
  }
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
  $('methods').innerHTML = METHODS.map(id =>
    `<button class="method m-${id} ${id === selectedMethod ? 'active' : ''}" data-id="${id}"
       aria-pressed="${id === selectedMethod}">
       <span class="m-icon">${svgIcon(id)}</span><span class="m-name">${methodName(id)}</span>
     </button>`).join('');
  document.querySelectorAll('.method').forEach(b =>
    b.onclick = () => { selectedMethod = b.dataset.id; renderMethods(); });
}

/* --- statystyki --- */
function renderStats() {
  const now = new Date();
  const sorted = [...entries].sort((a, b) => a.t - b.t);
  const todayCount = entries.filter(e => sameDay(new Date(e.t), now)).length;
  if (window.fxCountTo) fxCountTo($('statToday'), todayCount);
  else $('statToday').textContent = todayCount;
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
    const over = todayCount > settings.goal;
    fill.classList.toggle('over', over);
    txt.classList.toggle('over', over);
    txt.innerHTML = (over ? svgIcon('alert') : '') +
      `<span>${t(over ? 'goalOver' : 'goalToday', { a: todayCount, b: settings.goal })}</span>`;
  } else {
    fill.style.width = '0';
    txt.innerHTML = svgIcon('sliders') + `<span>${t('goalUnset')}</span>`;
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
  const names = window.i18n.weekdays();
  $('chart').innerHTML = days.map((d, i) => `
    <div class="bar-col">
      <span class="bar-count">${counts[i] || ''}</span>
      <div class="bar ${i === 6 ? 'today' : ''}" style="height:${counts[i] / max * 72 + 4}px"></div>
      <span class="bar-label">${names[d.getDay()]}</span>
    </div>`).join('');
}

/* --- historia --- */
function renderHistory() {
  const el = $('history');
  const sorted = [...entries].sort((a, b) => b.t - a.t).slice(0, 100);
  if (!sorted.length) {
    el.innerHTML = `<div class="empty">
      <span class="empty-art">${svgIcon('leaf')}</span>
      <div class="empty-txt">${t('empty')}</div>
    </div>`;
    return;
  }
  const loc = window.i18n.locale();
  el.innerHTML = sorted.map(e => {
    const id = METHODS.includes(e.m) ? e.m : METHODS[0];
    const d = new Date(e.t);
    const when = d.toLocaleDateString(loc, { day: 'numeric', month: 'short' }) + ' ' +
                 d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
    const extra = [e.amount ? esc(e.amount) : '', e.note ? esc(e.note) : ''].filter(Boolean).join(' · ');
    return `<div class="entry m-${id}">
      <span class="e-icon">${svgIcon(id)}</span>
      <div class="e-main"><div class="e-method">${methodName(id)}</div>
      ${extra ? `<div class="e-note">${extra}</div>` : ''}</div>
      <div class="e-time">${when}</div>
      <button class="e-del" data-id="${esc(e.id)}" title="${t('titleDelete')}" aria-label="${t('ariaDelete')}">${svgIcon('close')}</button>
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
    amount: $('amountInput').value ? $('amountInput').value.slice(0, 24) : null,
    note: $('noteInput').value.trim().slice(0, 200) || null,
  });
  save();
  $('amountInput').value = ''; $('noteInput').value = '';
  renderAll();
  toast(t('toastSaved', { m: methodName(selectedMethod) }), selectedMethod);
  // eksplozja cząsteczek z miejsca kliknięcia
  const btn = $('logNow').getBoundingClientRect();
  if (window.fxBurst) fxBurst(btn.left + btn.width / 2, btn.top + btn.height / 2);
}

$('logNow').onclick = () => addEntry(Date.now());

/* --- modal własnej godziny --- */
function openTimeModal() {
  const c = $('customTime');
  c.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  $('timeModal').classList.remove('hidden');
}
function closeTimeModal() { $('timeModal').classList.add('hidden'); }

$('logCustom').onclick = openTimeModal;
$('cancelTime').onclick = closeTimeModal;
$('timeModal').addEventListener('click', e => { if (e.target === $('timeModal')) closeTimeModal(); });
$('confirmTime').onclick = () => {
  const v = $('customTime').value;
  if (!v) { toast(t('toastPickTime'), 'alert'); return; }
  addEntry(new Date(v).getTime());
  closeTimeModal();
};
document.querySelectorAll('.quick-times .chip').forEach(chip => chip.onclick = () => {
  addEntry(Date.now() - parseInt(chip.dataset.min) * 60000);
  closeTimeModal();
});

/* --- eksport --- */
$('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify({ settings, entries }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'thc-journal-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
};

/* --- ustawienia --- */
let langAtOpen = settings.lang;

$('settingsBtn').onclick = () => {
  langAtOpen = settings.lang;
  $('goalInput').value = settings.goal;
  $('nickInput').value = settings.nick;
  $('langInput').value = settings.lang;
  $('settingsModal').classList.remove('hidden');
};

// wyjście bez zapisu cofa podgląd języka
function closeSettings() {
  if (window.i18n.lang !== langAtOpen) window.i18n.setLang(langAtOpen);
  $('settingsModal').classList.add('hidden');
}
$('closeSettings').onclick = closeSettings;

// podgląd na żywo; zapis dopiero w "Zapisz"
$('langInput').onchange = e => {
  const code = e.target.value;
  window.i18n.setLang(window.i18n.langs.some(l => l.code === code) ? code : 'en');
};

$('saveSettings').onclick = () => {
  const code = $('langInput').value;
  settings.lang = window.i18n.langs.some(l => l.code === code) ? code : 'en';
  settings.goal = Math.max(0, Math.min(50, parseInt($('goalInput').value, 10) || 0));
  settings.nick = $('nickInput').value.trim().slice(0, 30);
  save(); renderAll();
  langAtOpen = settings.lang;
  $('settingsModal').classList.add('hidden');
  toast(t('toastSettings'), 'check');
};
$('wipeBtn').onclick = () => {
  if (confirm(t('confirmWipe'))) {
    entries = []; save(); renderAll();
    closeSettings();
    toast(t('toastWiped'), 'trash');
  }
};

/* --- toast --- */
let toastTimer;
function toast(msg, ico) {
  const el = $('toast');
  el.innerHTML = (ico ? svgIcon(ico) : '') + `<span>${esc(msg)}</span>`;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

/* --- init --- */
window.onLangChange = () => { renderMethods(); renderAll(); };
window.i18n.setLang(settings.lang);
$('langInput').value = settings.lang;
setInterval(renderStats, 30000); // odświeżanie "od ostatniej"
