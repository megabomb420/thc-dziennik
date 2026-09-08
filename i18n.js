/* ===== I18N: angielski (domyślny) + polski ===== */
(() => {
  const STRINGS = {
    en: {
      locale: 'en-GB',
      weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      appTitle: 'THC Journal — control & reduction',
      brandWord: 'Journal',
      statToday: 'sessions today',
      statSince: 'since last',
      statGap: 'avg gap',
      statGoal: 'limit/day',
      goalUnset: 'Set a daily limit in settings',
      goalToday: 'Today: {a}/{b}',
      goalOver: 'Limit exceeded: {a}/{b}',
      logTitle: 'Log a session',
      amountPh: 'Amount (optional, g / mg)',
      notePh: 'Note (mood, reason…)',
      logNow: 'Log now',
      logCustom: 'Pick a time',
      chartTitle: 'Last 7 days',
      historyTitle: 'History',
      exportJson: 'Export JSON',
      empty: 'No entries yet — log your first session to start tracking your rhythm',
      footer: 'data stays on this device only · v1.3.0',
      settings: 'Settings',
      goalLabel: 'Daily session limit (0 = no limit)',
      nickLabel: 'Nickname (optional)',
      langLabel: 'Language',
      save: 'Save',
      cancel: 'Cancel',
      wipe: 'Delete all data',
      timeTitle: 'When was it?',
      ago15: '15 min ago',
      ago30: '30 min ago',
      ago60: '1 h ago',
      ago120: '2 h ago',
      timeLabel: 'or an exact date and time',
      toastSaved: 'Saved: {m}',
      toastPickTime: 'Pick a date and time',
      toastSettings: 'Settings saved',
      toastWiped: 'Data deleted',
      confirmWipe: 'Delete ALL entries? This cannot be undone.',
      ariaSettings: 'Settings',
      ariaDelete: 'Delete entry',
      titleDelete: 'Delete',
      method_dab: 'Dab',
      method_vape: 'Vape',
      method_vapor: 'Dry herb vape',
      method_smoke: 'Smoking',
      method_edible: 'Edibles',
      method_oil: 'Oil/Tincture',
    },
    pl: {
      locale: 'pl-PL',
      weekdays: ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So'],
      appTitle: 'THC Dziennik — kontrola i redukcja',
      brandWord: 'Dziennik',
      statToday: 'dziś sesji',
      statSince: 'od ostatniej',
      statGap: 'śr. odstęp',
      statGoal: 'limit/dzień',
      goalUnset: 'Ustaw limit dzienny w ustawieniach',
      goalToday: 'Dzisiejszy limit: {a}/{b}',
      goalOver: 'Limit przekroczony: {a}/{b}',
      logTitle: 'Zapisz sesję',
      amountPh: 'Ilość (opcjonalnie, g / mg)',
      notePh: 'Notatka (nastrój, powód…)',
      logNow: 'Zapisz teraz',
      logCustom: 'Wybierz godzinę',
      chartTitle: 'Ostatnie 7 dni',
      historyTitle: 'Historia',
      exportJson: 'Eksport JSON',
      empty: 'Brak wpisów — zapisz pierwszą sesję, żeby zacząć śledzić swój rytm',
      footer: 'dane zapisują się lokalnie na tym urządzeniu · v1.3.0',
      settings: 'Ustawienia',
      goalLabel: 'Dzienny limit sesji (0 = bez limitu)',
      nickLabel: 'Nick (opcjonalnie)',
      langLabel: 'Język',
      save: 'Zapisz',
      cancel: 'Anuluj',
      wipe: 'Usuń wszystkie dane',
      timeTitle: 'Kiedy to było?',
      ago15: '15 min temu',
      ago30: '30 min temu',
      ago60: '1 h temu',
      ago120: '2 h temu',
      timeLabel: 'albo dokładna data i godzina',
      toastSaved: 'Zapisano: {m}',
      toastPickTime: 'Wybierz datę i godzinę',
      toastSettings: 'Zapisano ustawienia',
      toastWiped: 'Dane usunięte',
      confirmWipe: 'Na pewno usunąć WSZYSTKIE wpisy? Tego nie da się cofnąć.',
      ariaSettings: 'Ustawienia',
      ariaDelete: 'Usuń wpis',
      titleDelete: 'Usuń',
      method_dab: 'Dab',
      method_vape: 'Vape',
      method_vapor: 'Dry herb vape',
      method_smoke: 'Palenie',
      method_edible: 'Edibles',
      method_oil: 'Olejek/Tincture',
    },
  };

  const DEFAULT = 'en';
  const table = () => STRINGS[lang] || STRINGS[DEFAULT];
  let lang = DEFAULT;

  function t(key, vars) {
    let s = table()[key];
    if (s == null) s = STRINGS[DEFAULT][key];
    if (s == null) return key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : ''));
    return s;
  }

  function apply() {
    document.documentElement.lang = lang;
    document.title = t('appTitle');
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  }

  function setLang(code) {
    lang = STRINGS[code] ? code : DEFAULT;
    apply();
    if (window.onLangChange) window.onLangChange();
  }

  function stored() {
    try {
      const s = JSON.parse(localStorage.getItem('thc_settings_v1') || '{}');
      return STRINGS[s.lang] ? s.lang : DEFAULT;
    } catch { return DEFAULT; }
  }

  window.i18n = {
    t,
    setLang,
    get lang() { return lang; },
    locale: () => table().locale,
    weekdays: () => table().weekdays,
    langs: [{ code: 'en', label: 'English' }, { code: 'pl', label: 'Polski' }],
  };

  lang = stored();
  apply();
})();
