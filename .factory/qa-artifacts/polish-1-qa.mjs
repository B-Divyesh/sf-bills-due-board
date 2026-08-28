import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const [baseUrl, outputDirectory] = process.argv.slice(2);
if (!baseUrl || !outputDirectory) throw new Error('Usage: node polish-1-qa.mjs <base-url> <output-directory>');
await fs.mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
const requests = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => pageErrors.push(String(error)));
page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}`));
page.on('request', (request) => requests.push(request.url()));

const check = (condition, message) => { if (!condition) throw new Error(message); };
const routeEvidence = [];
const routes = ['/', '/demo', '/board', '/privacy', '/terms'];

await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
check(await page.locator('h1').textContent() === 'See every bill by due date', 'Landing headline is wrong.');
check(await page.getByRole('link', { name: 'Try it with sample data' }).isVisible(), 'Sample action is not visible.');
await page.screenshot({ path: path.join(outputDirectory, 'cold-home-mobile.png'), fullPage: true });
await page.getByRole('link', { name: 'Try it with sample data' }).click();
await page.waitForURL('**/demo');
check(await page.getByText('Demo — sample data, nothing is saved to your board').isVisible(), 'Demo banner is missing.');
check(await page.getByText('Harbor Electric').isVisible(), 'Demo sample is missing.');
await page.screenshot({ path: path.join(outputDirectory, 'one-click-demo-mobile.png'), fullPage: true });

await page.goto(`${baseUrl}/?demo=1`, { waitUntil: 'networkidle' });
check(await page.title() === 'Demo — Bills Due Board', 'Query demo title is wrong.');
check(await page.locator('link[rel="canonical"]').getAttribute('href') === 'https://bills-due-board.sociobot.in/demo', 'Query demo canonical is wrong.');
const harborRow = page.locator('[data-bill-id]').filter({ hasText: 'Harbor Electric' });
await harborRow.getByRole('button', { name: 'Mark paid' }).click();
await page.getByRole('button', { name: 'Confirm paid' }).click();
await page.getByRole('button', { name: 'Reset demo' }).click();
await page.locator('[data-bill-id]').filter({ hasText: 'Harbor Electric' }).waitFor({ state: 'visible' });
await page.getByRole('link', { name: 'Start for real' }).click();
await page.waitForURL('**/board');
check(await page.getByText('Harbor Electric').count() === 0, 'Demo data leaked into the real board.');

for (const route of routes) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  const metadata = await page.evaluate(() => ({
    title: document.title,
    h1: [...document.querySelectorAll('h1')].map((heading) => heading.textContent?.trim()),
    main: document.querySelectorAll('main').length,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
  }));
  check(metadata.title && metadata.h1.length === 1 && metadata.main === 1, `${route} lacks the page skeleton.`);
  check(metadata.description && metadata.canonical && metadata.ogImage, `${route} lacks metadata.`);
  check(axe.violations.length === 0, `${route} has Axe violations.`);
  routeEvidence.push({ route, ...metadata, axeViolations: axe.violations.length });
}

await page.goto(`${baseUrl}/`);
await page.getByRole('link', { name: 'Terms' }).first().click();
check(await page.evaluate(() => document.activeElement === document.querySelector('h1')), 'Route change did not focus the H1.');
await page.goBack();
check(await page.evaluate(() => document.activeElement === document.querySelector('h1')), 'Back navigation did not focus the H1.');

const notFoundResponse = await page.goto(`${baseUrl}/not-a-real-route`, { waitUntil: 'networkidle' });
check(notFoundResponse?.status() === 404, 'Unknown route did not keep HTTP 404.');
const notFoundAxe = await new AxeBuilder({ page }).analyze();
const notFound = await page.evaluate(() => ({
  title: document.title,
  canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
  ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
  twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
  manifest: document.querySelector('link[rel="manifest"]')?.getAttribute('href'),
  appleTouch: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href'),
  legalLinks: [...document.querySelectorAll('footer a')].map((link) => link.textContent?.trim()),
}));
check(notFound.canonical && notFound.ogImage && notFound.twitterCard && notFound.manifest && notFound.appleTouch, '404 metadata is incomplete.');
check(notFound.legalLinks.includes('Privacy') && notFound.legalLinks.includes('Terms') && notFound.legalLinks.some((label) => label?.startsWith('Built by Param Factory')), '404 footer links are incomplete.');
check(notFoundAxe.violations.length === 0, '404 has Axe violations.');
await page.screenshot({ path: path.join(outputDirectory, 'not-found-mobile.png'), fullPage: true });

const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const offlinePage = await offlineContext.newPage();
await offlinePage.goto(`${baseUrl}/demo`, { waitUntil: 'networkidle' });
await offlinePage.evaluate(async () => { await navigator.serviceWorker.ready; });
await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
await offlineContext.setOffline(true);
await offlinePage.reload({ waitUntil: 'domcontentloaded' });
check(await offlinePage.getByText('Harbor Electric').isVisible(), 'Sample board did not reload offline.');
check(await offlinePage.getByText('You are offline. Your board still works on this device.').isVisible(), 'Offline status is missing.');
await offlinePage.screenshot({ path: path.join(outputDirectory, 'offline-demo-mobile.png'), fullPage: true });
await offlineContext.close();

const origin = new URL(baseUrl).origin;
const crossOriginRequests = [...new Set(requests.filter((url) => new URL(url).origin !== origin))];
const unexpectedConsoleErrors = consoleErrors.filter((message) => !message.includes('status of 404 (Not Found)'));
check(crossOriginRequests.length === 0, `Unexpected cross-origin requests: ${crossOriginRequests.join(', ')}`);
check(unexpectedConsoleErrors.length === 0 && pageErrors.length === 0 && failedRequests.length === 0, `Browser errors occurred: ${JSON.stringify({ unexpectedConsoleErrors, pageErrors, failedRequests })}`);

const evidence = {
  baseUrl,
  checkedAt: new Date().toISOString(),
  firstScreen: { headline: 'See every bill by due date', oneClickDemo: true },
  queryDemo: { title: 'Demo — Bills Due Board', reset: true, isolatedFromRealBoard: true },
  routes: routeEvidence,
  routeFocusAndBack: true,
  notFound: { status: notFoundResponse.status(), ...notFound, axeViolations: notFoundAxe.violations.length },
  offlineReload: true,
  crossOriginRequests,
  consoleErrors: unexpectedConsoleErrors,
  expected404ConsoleNotice: consoleErrors.length - unexpectedConsoleErrors.length,
  pageErrors,
  failedRequests,
};
await fs.writeFile(path.join(outputDirectory, 'qa.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
await context.close();
await browser.close();
