import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';

const origin = 'https://bills-due-board.sociobot.in';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
const requests = [];
page.on('console', (message) => {
  if (message.type() === 'error' && !/Failed to load resource: the server responded with a status of 404/.test(message.text())) errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(String(error)));
page.on('request', (request) => requests.push(request.url()));

async function axe(route) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')).map((item) => item.id);
  if (serious.length) throw new Error(`${route} axe: ${serious.join(', ')}`);
  return results.violations.length;
}

await page.goto(origin, { waitUntil: 'networkidle' });
for (const label of ['Bills by due date', 'Bills due in the next seven days', 'How to track planned bills', 'What this board does not do', 'Price and license']) {
  if (!await page.getByText(label, { exact: true }).isVisible()) throw new Error(`Missing landing label: ${label}`);
}
for (const stale of ['A clear queue before the ledger', 'Know what needs cash next', 'Keep the payment decision visible', 'A board, not a bank', 'Keep an unlimited active queue', 'Artwork is generated.']) {
  if (await page.getByText(stale, { exact: true }).count()) throw new Error(`Stale public copy: ${stale}`);
}
const landing = await axe('/');
await page.screenshot({ path: '.factory/qa-artifacts/polish-2-live/live-cold-mobile.png', fullPage: true });
const landingOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
if (landingOverflow) throw new Error('Landing has mobile horizontal overflow');

await page.getByRole('link', { name: 'Privacy' }).first().click();
await page.waitForFunction(() => document.title === 'Privacy — Bills Due Board');
const focusMoved = await page.locator('h1').evaluate((heading) => document.activeElement === heading);
if (!focusMoved) throw new Error('Route change did not focus the destination H1');
await page.goBack({ waitUntil: 'networkidle' });
if (await page.title() !== 'Bills Due Board — See bills by due date') throw new Error('Back navigation did not restore the landing title');

const start = requests.length;
await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
if (await page.title() !== 'Demo — Bills Due Board') throw new Error('Query demo did not set the Demo title');
if (await page.locator('link[rel="canonical"]').getAttribute('href') !== `${origin}/demo`) throw new Error('Query demo did not set the Demo canonical');
await page.getByText('Demo — sample data, nothing is saved to your board', { exact: true }).waitFor();
await page.getByText('Harbor Electric', { exact: true }).waitFor();
await page.screenshot({ path: '.factory/qa-artifacts/polish-2-live/live-demo-one-click-mobile.png', fullPage: true });
const demoOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
if (demoOverflow) throw new Error('Demo has mobile horizontal overflow');
const demoAxe = await axe('/?demo=1');
const demoEgress = requests.slice(start).filter((url) => new URL(url).origin !== origin);
if (demoEgress.length) throw new Error(`Demo egressed: ${demoEgress.join(', ')}`);
await page.locator('[data-bill-id]').filter({ hasText: 'Harbor Electric' }).getByRole('button', { name: 'Mark paid' }).click();
await page.getByRole('button', { name: 'Confirm paid' }).click();
await page.getByRole('button', { name: 'Reset demo' }).click();
await page.locator('[data-bill-id]').filter({ hasText: 'Harbor Electric' }).waitFor();
await page.getByRole('link', { name: 'Start for real' }).click();
await page.getByRole('heading', { name: 'Your bill list is clear' }).waitFor();
if (await page.getByText('Harbor Electric', { exact: true }).count()) throw new Error('Demo data leaked into the real board');

await page.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => !!navigator.serviceWorker?.controller);
await context.setOffline(true);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.getByText('Harbor Electric', { exact: true }).waitFor();
const offlineShown = await page.getByText('You are offline. Your board still works on this device.', { exact: true }).isVisible();
if (!offlineShown) throw new Error('Offline indicator was not visible');
await context.setOffline(false);

const routeResults = {};
for (const [route, title] of [['/board', 'Your bills — Bills Due Board'], ['/privacy', 'Privacy — Bills Due Board'], ['/terms', 'Terms — Bills Due Board']]) {
  await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  if (await page.title() !== title) throw new Error(`Wrong title for ${route}`);
  if (await page.locator('main').count() !== 1 || await page.locator('h1').count() !== 1) throw new Error(`Bad landmarks for ${route}`);
  routeResults[route] = await axe(route);
}
const response = await page.goto(`${origin}/not-a-real-route`, { waitUntil: 'networkidle' });
if (response?.status() !== 404) throw new Error(`404 status was ${response?.status()}`);
if (await page.title() !== 'Page not found — Bills Due Board') throw new Error('Wrong 404 title');
if (await page.getByRole('link', { name: 'Terms' }).count() < 1) throw new Error('404 Terms link missing');
const notFoundAxe = await axe('/not-a-real-route');
await page.screenshot({ path: '.factory/qa-artifacts/polish-2-live/not-found-mobile.png', fullPage: true });

const report = { landing, demoAxe, routeResults, notFoundAxe, focusMoved, landingOverflow, demoOverflow, offlineShown, errors, demoEgress };
writeFileSync('.factory/qa-artifacts/polish-2-live/live-e2e.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
await browser.close();
if (errors.length) process.exit(1);
