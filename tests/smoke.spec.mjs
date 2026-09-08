import { test, expect } from '@playwright/test';

const seed = (page, entries, settings = { goal: 3, lang: 'en' }) =>
  page.addInitScript(([e, s]) => {
    localStorage.setItem('thc_entries_v1', JSON.stringify(e));
    localStorage.setItem('thc_settings_v1', JSON.stringify(s));
  }, [entries, settings]);

test('ładuje się, ma 6 metod i pusty stan', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.method')).toHaveCount(6);
  await expect(page.locator('.empty')).toBeVisible();
  await expect(page.locator('#statToday')).toHaveText('0');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('zapis sesji trafia do historii i statystyk', async ({ page }) => {
  await page.goto('/');
  await page.locator('.method[data-id="edible"]').click();
  await page.fill('#noteInput', 'test note');
  await page.click('#logNow');
  await expect(page.locator('.toast')).toContainText('Saved: Edibles');
  await expect(page.locator('.entry')).toHaveCount(1);
  await expect(page.locator('.entry .e-method')).toHaveText('Edibles');
  await expect(page.locator('#statToday')).toHaveText('1');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('thc_entries_v1')));
  expect(stored).toHaveLength(1);
  expect(stored[0].m).toBe('edible');
});

test('limit dzienny i przekroczenie', async ({ page }) => {
  await seed(page, [{ id: 'a', t: Date.now(), m: 'dab', amount: null, note: null }], { goal: 1, lang: 'en' });
  await page.goto('/');
  await expect(page.locator('#goalText')).toContainText('1/1');
  await page.click('#logNow');
  await expect(page.locator('#goalFill')).toHaveClass(/over/);
  await expect(page.locator('#goalText')).toContainText('Limit exceeded');
});

test('usuwanie wpisu', async ({ page }) => {
  await seed(page, [
    { id: 'a', t: Date.now() - 3600000, m: 'dab', amount: null, note: null },
    { id: 'b', t: Date.now() - 7200000, m: 'vape', amount: null, note: null },
  ]);
  await page.goto('/');
  await expect(page.locator('.entry')).toHaveCount(2);
  await page.locator('.entry .e-del').first().click();
  await expect(page.locator('.entry')).toHaveCount(1);
});

test('język: domyślnie EN, PL w ustawieniach, Anuluj cofa', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#logNow')).toContainText('Log now');
  await page.click('#settingsBtn');
  await page.selectOption('#langInput', 'pl');
  await expect(page.locator('#logNow')).toContainText('Zapisz teraz');
  await page.click('#closeSettings');
  await expect(page.locator('#logNow')).toContainText('Log now');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('thc_settings_v1') || '{}').lang)).toBeUndefined();

  await page.click('#settingsBtn');
  await page.selectOption('#langInput', 'pl');
  await page.click('#saveSettings');
  await page.reload();
  await expect(page.locator('#logNow')).toContainText('Zapisz teraz');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
});

test('modale: Escape zamyka i wraca fokus', async ({ page }) => {
  await page.goto('/');
  await page.click('#settingsBtn');
  await expect(page.locator('#settingsModal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#settingsModal')).toBeHidden();
  await expect(page.locator('#settingsBtn')).toBeFocused();
});

test('notatka nie wstrzykuje HTML (XSS)', async ({ page }) => {
  await page.goto('/');
  await page.fill('#noteInput', '<img src=x onerror="window.__xss=1">');
  await page.click('#logNow');
  await expect(page.locator('.entry')).toHaveCount(1);
  await expect(page.locator('.entry .e-note')).toContainText('<img');
  expect(await page.evaluate(() => window.__xss === 1)).toBe(false);
});

test('uszkodzony localStorage nie wywala aplikacji', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.addInitScript(() => {
    localStorage.setItem('thc_entries_v1', '{to nie json');
    localStorage.setItem('thc_settings_v1', 'też nie');
  });
  await page.goto('/');
  await expect(page.locator('.method')).toHaveCount(6);
  await page.click('#logNow');
  await expect(page.locator('.entry')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('działa offline (service worker + cache)', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.method')).toHaveCount(6);
  await context.setOffline(false);
});
