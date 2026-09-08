# 🌿 THC Dziennik

Prosta aplikacja **PWA** do zapisywania czasów przyjmowania THC — do samokontroli i redukcji.
Bez backendu, bez konta, bez zależności w runtime: statyczne pliki, a dane zostają na urządzeniu.

**Działa tu:** https://megabomb420.github.io/thc-dziennik/

## Funkcje

- Zapis sesji jednym kliknięciem (albo z własną godziną)
- Metody: Dab · Vape · Dry herb vape · Palenie · Edibles · Olejek/Tincture — każda z własną grafiką i kolorem
- Opcjonalna ilość (g/mg) i notatka (nastrój, powód)
- Statystyki: sesje dziś, czas od ostatniej, średni odstęp, wykres 7 dni
- Dzienny limit sesji z paskiem postępu (tryb redukcji)
- Eksport danych do JSON
- Działa offline, instalowalna jako PWA, dane tylko lokalnie (localStorage)
- Zachowuje się jak apka, nie strona: brak zoomu (pinch i double-tap), brak gumowania przy scrollu, karty płynnie wjeżdżają podczas przewijania
- **Dwa języki:** angielski domyślnie, polski do wyboru w ustawieniach (przełącza się od razu, razem z datami i nazwami dni)

## Grafika

Wszystkie ikony to **inline SVG** w `icons.js` — żadnych emoji, ikon-fontów ani zewnętrznych plików graficznych. `svgIcon('vape')` zwraca gotowy `<svg>`, a elementy z atrybutem `data-icon="nazwa"` są uzupełniane przy starcie strony. Ikony dziedziczą kolor (`currentColor`) i skalują się razem z rozmiarem tekstu.

Każda metoda ma własny kolor akcentu (bursztyn, cyjan, zieleń, pomarańcz, róż, fiolet), który trafia na ikonę, podświetlenie wybranej metody i kafelek wpisu w historii.

Znakiem aplikacji jest **liść marihuany** (7 listków). Z tej samej geometrii powstają ikony PWA w `icons/` (192 / 512 / maskable).

## Języki

Cały tekst interfejsu żyje w `i18n.js` (`STRINGS.en`, `STRINGS.pl`) i jest pobierany przez `t('klucz')`. Statyczny HTML ma atrybuty `data-i18n` / `data-i18n-placeholder` / `data-i18n-title` / `data-i18n-aria`, a dynamiczne części (metody, statystyki, wykres, historia) przerysowuje `window.onLangChange`. Wybór języka zapisuje się w `settings.lang`; daty i skróty dni idą za lokalizacją (`en-GB` / `pl-PL`).

## Struktura

| Plik | Rola |
|---|---|
| `index.html` | szkielet widoku, modale, rejestracja service workera |
| `style.css` | motyw, tło (orbity, aurora, gwiazdy), style kart i ikon |
| `i18n.js` | słowniki EN/PL, `t()`, `setLang()`, lokalizacja dat i dni |
| `icons.js` | zestaw ikon SVG + `svgIcon()` + hydratacja `data-icon` |
| `app.js` | logika: wpisy, statystyki, wykres, historia, ustawienia |
| `fx.js` | efekty na canvasie: dym, świetliki, eksplozje, ripple, tilt |
| `sw.js` | offline (network-first + cache), prekechenie plików |
| `manifest.webmanifest` | metadane PWA i ikony |

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

albo dowolny statyczny serwer, np. `python -m http.server` lub `npx serve .`

Service worker wymaga adresu `http(s)` — przez `file://` aplikacja wczyta się, ale nie zadziała offline.

## Deploy

Czysta statyczna strona — leci na GitHub Pages (gałąź `main`, katalog główny). Po pushu sprawdź wersję w stopce i nazwę `CACHE` w `sw.js`, żeby upewnić się, że nowy shell się rozpropagował.

## Dokumentacja techniczna

Bieżący stan, decyzje produktowe i punkt wznowienia: [`HANDOFF.md`](./HANDOFF.md).
