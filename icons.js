/* ===== IKONY: wektorowe, inline SVG (offline, dziedziczą kolor, skalują się) ===== */
(() => {
  const ICONS = {
    /* --- znak / logo: liść marihuany (7 listków) --- */
    leaf: `<g fill="currentColor" stroke="none">
      <path d="M12 21.8L13.52 22.34L13.86 21.9L15.28 22.14L15.65 21.59L16.97 21.71L17.33 21.13L18.46 21.04L18.78 20.51L19.77 20.19L20.11 19.74L20.83 18.93L19.77 18.7L19.23 18.54L18.24 18.86L17.67 18.61L16.71 19.2L16.08 18.95L15.08 19.82L14.46 19.6L13.45 20.63L12.91 20.47Z"/>
      <path d="M12 21.8L11.09 20.47L10.55 20.63L9.54 19.6L8.92 19.82L7.92 18.95L7.29 19.2L6.33 18.61L5.76 18.86L4.77 18.54L4.23 18.7L3.17 18.93L3.89 19.74L4.23 20.19L5.22 20.51L5.54 21.04L6.67 21.13L7.03 21.71L8.35 21.59L8.72 22.14L10.14 21.9L10.48 22.34Z"/>
      <path d="M12 21.8L14.21 21.56L14.37 20.79L16.27 20.23L16.4 19.33L18.11 18.68L18.21 17.75L19.55 16.95L19.62 16.11L20.66 15.11L20.81 14.34L21.21 12.91L19.76 13.25L18.99 13.38L17.96 14.38L17.11 14.42L16.26 15.74L15.33 15.8L14.62 17.49L13.71 17.59L13.09 19.47L12.32 19.6Z"/>
      <path d="M12 21.8L11.68 19.6L10.91 19.47L10.29 17.59L9.38 17.49L8.67 15.8L7.74 15.74L6.89 14.42L6.04 14.38L5.01 13.38L4.24 13.25L2.79 12.91L3.19 14.34L3.34 15.11L4.38 16.11L4.45 16.95L5.79 17.75L5.89 18.68L7.6 19.33L7.73 20.23L9.63 20.79L9.79 21.56Z"/>
      <path d="M12 21.8L14.25 20.59L14.09 19.71L15.88 18.29L15.63 17.27L17.17 15.84L16.88 14.81L17.97 13.38L17.68 12.44L18.35 10.93L18.19 10.05L17.99 8.35L16.59 9.34L15.83 9.81L15.15 11.32L14.27 11.73L13.93 13.5L12.97 13.97L12.94 16.07L12.01 16.57L12.16 18.85L11.39 19.31Z"/>
      <path d="M12 21.8L12.61 19.31L11.84 18.85L11.99 16.57L11.06 16.07L11.03 13.97L10.07 13.5L9.73 11.73L8.85 11.32L8.17 9.81L7.41 9.34L6.01 8.35L5.81 10.05L5.65 10.93L6.32 12.44L6.03 13.38L7.12 14.81L6.83 15.84L8.37 17.27L8.12 18.29L9.91 19.71L9.75 20.59Z"/>
      <path d="M12 21.8L13.7 19.6L13.15 18.8L14.3 16.6L13.6 15.7L14.5 13.6L13.75 12.7L14.2 10.8L13.5 10L13.5 8.2L12.95 7.4L12 5.8L11.05 7.4L10.5 8.2L10.5 10L9.8 10.8L10.25 12.7L9.5 13.6L10.4 15.7L9.7 16.6L10.85 18.8L10.3 19.6Z"/>
    </g>
    <path d="M12 21.4v2.2" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>`,

    /* --- UI --- */
    sliders: `<path d="M4.6 8h14.8"/><path d="M4.6 16h14.8"/>
      <circle cx="9.4" cy="8" r="2.3"/><circle cx="15" cy="16" r="2.3"/>`,
    bolt: `<path d="M13.5 2.6 5.1 13.2h5.4l-1 8.2 8.4-10.6h-5.4l1-8.2Z"/>`,
    clock: `<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.3 2.1"/>`,
    download: `<path d="M12 3.4v10.8"/><path d="M7.7 10.1 12 14.4l4.3-4.3"/>
      <path d="M4.7 17.2v1.2a2.4 2.4 0 0 0 2.4 2.4h9.8a2.4 2.4 0 0 0 2.4-2.4v-1.2"/>`,
    trash: `<path d="M4.2 6.8h15.6"/>
      <path d="M9.5 6.8V5.2a1.4 1.4 0 0 1 1.4-1.4h2.2a1.4 1.4 0 0 1 1.4 1.4v1.6"/>
      <path d="M6.6 6.8 7.4 19a2.1 2.1 0 0 0 2.1 2h5a2.1 2.1 0 0 0 2.1-2l.8-12.2"/>
      <path d="M10.4 10.6v6.2M13.6 10.6v6.2"/>`,
    close: `<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>`,
    check: `<path d="M4.9 12.7 9.7 17.5 19.1 6.5"/>`,
    alert: `<circle cx="12" cy="12" r="8.6"/><path d="M12 7.6v5"/>
      <circle cx="12" cy="16.3" r="1" fill="currentColor" stroke="none"/>`,
    sparkle: `<path d="M12 3.2l1.85 4.95L18.8 10l-4.95 1.85L12 16.8l-1.85-4.95L5.2 10l4.95-1.85L12 3.2Z"/>
      <path d="M18.4 15.4l.75 2 2 .75-2 .75-.75 2-.75-2-2-.75 2-.75.75-2Z"/>`,

    /* --- metody: rysowane obiekty --- */
    dab: `<path d="M12 2.9c1.8 2.15 2.7 3.6 2.7 4.85a2.7 2.7 0 0 1-5.4 0c0-1.25.9-2.7 2.7-4.85Z"/>
      <path d="M8.3 11.7h7.4l-1 5.15a2.15 2.15 0 0 1-2.11 1.75h-1.18a2.15 2.15 0 0 1-2.11-1.75l-1-5.15Z"/>
      <path d="M12 18.6v2.3"/>`,

    vape: `<rect x="8.6" y="9.5" width="6.8" height="11.2" rx="2.6"/>
      <path d="M10.4 9.5V7.3a1.6 1.6 0 0 1 3.2 0v2.2"/>
      <circle cx="12" cy="13.4" r="1.05" fill="currentColor" stroke="none"/>
      <path d="M15.7 6.5c1.15-.95 1.15-2.3 0-3.25"/>
      <path d="M18 8c1.5-1.25 1.5-3.05 0-4.3"/>`,

    vapor: `<rect x="7.7" y="8.5" width="8.6" height="12.2" rx="3.1"/>
      <path d="M10.3 8.5V6.8a1.7 1.7 0 0 1 3.4 0v1.7"/>
      <rect x="9.9" y="11.3" width="4.2" height="3.3" rx="1.1"/>
      <path d="M18.4 7.4c1.05-.9 1.05-2.15 0-3.05"/>`,

    smoke: `<rect x="6.6" y="13.1" width="13.2" height="3.7" rx="1.75"/>
      <path d="M17.1 13.4v3.1"/>
      <circle cx="8.5" cy="14.95" r="1.15" fill="currentColor" stroke="none"/>
      <path d="M9.5 11.3c1.25-1 1.25-2.4 0-3.4"/>
      <path d="M12.7 11c1.6-1.3 1.6-3.1 0-4.4"/>`,

    edible: `<path d="M12 3.6a8.4 8.4 0 1 0 0 16.8 8.4 8.4 0 0 0 0-16.8Z"/>
      <circle cx="9.1" cy="9.9" r="1.15" fill="currentColor" stroke="none"/>
      <circle cx="14.6" cy="8.9" r="1.15" fill="currentColor" stroke="none"/>
      <circle cx="10.4" cy="14.8" r="1.15" fill="currentColor" stroke="none"/>
      <circle cx="15.2" cy="13.9" r="1.15" fill="currentColor" stroke="none"/>
      <circle cx="12.3" cy="11.9" r=".8" fill="currentColor" stroke="none"/>`,

    oil: `<path d="M8.6 11.5h6.8a2 2 0 0 1 2 2v5.4a2 2 0 0 1-2 2H8.6a2 2 0 0 1-2-2v-5.4a2 2 0 0 1 2-2Z"/>
      <path d="M10.4 11.5V9.8h3.2v1.7"/>
      <path d="M9.9 6.3h4.2a1.1 1.1 0 0 1 1.1 1.1v2.4H8.8V7.4A1.1 1.1 0 0 1 9.9 6.3Z"/>
      <path d="M12 3.1v3.2"/>
      <path d="M9.4 16.2h5.2"/>`,
  };

  const SVG_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

  function svgIcon(name, cls) {
    const body = ICONS[name];
    if (!body) return '';
    return `<svg class="${cls || 'ico'}" ${SVG_ATTRS}>${body}</svg>`;
  }

  window.svgIcon = svgIcon;

  function hydrate(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(el => {
      if (el.dataset.iconDone) return;
      el.dataset.iconDone = '1';
      el.insertAdjacentHTML('afterbegin', svgIcon(el.dataset.icon, el.dataset.iconClass || 'ico'));
    });
  }

  window.hydrateIcons = hydrate;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => hydrate());
  else hydrate();
})();
