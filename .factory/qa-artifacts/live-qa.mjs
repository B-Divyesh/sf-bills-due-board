import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const origin = 'https://bills-due-board.sociobot.in';
const browser = await chromium.launch({ headless: true });
const results = {};

async function inspectRoute(path, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const requests = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText}`));
  page.on('request', (request) => requests.push(request.url()));
  const response = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  const visibleTargets = await page.locator('a,button,input,select,textarea,summary').evaluateAll((elements) => elements
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        name: (element.innerText || element.getAttribute('aria-label') || element.getAttribute('name') || '').trim(),
        tag: element.tagName,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
      };
    })
    .filter((target) => target.width < 44 || target.height < 44));
  const structure = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    h1: [...document.querySelectorAll('h1')].map((node) => node.textContent?.trim()),
    main: document.querySelectorAll('main').length,
    landmarks: [...document.querySelectorAll('header,nav,main,footer')].map((node) => node.tagName.toLowerCase()),
    imagesWithoutAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  await context.close();
  return {
    status: response?.status(), structure,
    axeSeriousCritical: axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')).map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })),
    consoleErrors, pageErrors, failedRequests, crossOriginRequests: [...new Set(requests.filter((url) => new URL(url).origin !== origin))],
    sub44Targets: visibleTargets,
  };
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const path of ['/', '/demo', '/board', '/privacy', '/terms', '/not-a-real-route']) {
    results[`${viewport.width}:${path}`] = await inspectRoute(path, viewport);
  }
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${origin}/board`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    for (const name of await indexedDB.databases()) if (name.name) indexedDB.deleteDatabase(name.name);
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle' });
  const focusTrail = [];
  let opened = false;
  for (let index = 0; index < 30; index += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      name: document.activeElement?.textContent?.trim() || document.activeElement?.getAttribute('aria-label') || document.activeElement?.getAttribute('name'),
      outline: getComputedStyle(document.activeElement).outline,
    }));
    focusTrail.push(focused);
    if (focused.name === 'Add a bill') { await page.keyboard.press('Enter'); opened = true; break; }
  }
  const initialDialogFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, id: document.activeElement?.id }));
  await page.keyboard.type('Maple Water');
  await page.keyboard.press('Tab');
  await page.keyboard.type('42.10');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Control+A');
  await page.keyboard.type('02/10/2030');
  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press('Tab');
    const label = await page.evaluate(() => document.activeElement?.textContent?.trim());
    if (label === 'Save bill') {
      await page.keyboard.press('Enter');
      break;
    }
  }
  const saved = await page.getByText('Maple Water', { exact: true }).count();
  await page.reload({ waitUntil: 'networkidle' });
  const persisted = await page.getByText('Maple Water', { exact: true }).count();
  const activeAfterSave = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
  results.keyboard = { opened, initialDialogFocus, saved, persisted, activeAfterSave, focusTrail };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
  results.reducedMotion = await page.evaluate(() => {
    const row = document.querySelector('.bill-row');
    const bar = document.querySelector('.cash-bar');
    const button = document.querySelector('.button');
    return {
      mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      rowAnimationDuration: row ? getComputedStyle(row).animationDuration : null,
      barAnimationDuration: bar ? getComputedStyle(bar).animationDuration : null,
      buttonTransitionDuration: button ? getComputedStyle(button).transitionDuration : null,
    };
  });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
  results.textResize200 = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    bodyHeight: document.body.scrollHeight,
    mainVisible: Boolean(document.querySelector('main')?.getBoundingClientRect().height),
  }));
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const before = await page.evaluate(async () => ({
    controller: navigator.serviceWorker.controller?.scriptURL,
    caches: await caches.keys(),
    registration: (await navigator.serviceWorker.getRegistration())?.active?.scriptURL,
  }));
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration?.update(); });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  const offlineText = await page.getByText('Harbor Electric', { exact: true }).count();
  const offlineBanner = await page.getByText('You are offline. Your board still works on this device.', { exact: true }).count();
  results.pwa = { before, offlineText, offlineBanner, errors };
  await context.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
