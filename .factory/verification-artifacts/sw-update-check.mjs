import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from '@playwright/test';

const root = process.argv[2];
if (!root) throw new Error('Pass the production dist directory.');
let revision = 1;
const types = {
  '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json', '.webp': 'image/webp',
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    let pathname = url.pathname;
    if (pathname === '/' || ['/demo', '/board', '/privacy', '/terms'].includes(pathname)) pathname = '/index.html';
    const file = join(root, pathname.replace(/^\//, ''));
    let body = await readFile(file);
    if (pathname === '/sw.js') body = Buffer.concat([body, Buffer.from(`\n// verification revision ${revision}\n`)]);
    response.writeHead(200, { 'content-type': types[extname(pathname)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('not found');
  }
});

await new Promise((resolve) => server.listen(4194, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto('http://127.0.0.1:4194/', { waitUntil: 'networkidle' });
await page.evaluate(async () => navigator.serviceWorker.ready);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
revision = 2;
const registration = await page.evaluateHandle(async () => navigator.serviceWorker.getRegistration());
await registration.evaluate(async (value) => value?.update());
await page.getByText('An update is ready. Reload to use it.', { exact: true }).waitFor({ timeout: 10000 });
const result = {
  controlled: await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL),
  updateNotice: await page.getByText('An update is ready. Reload to use it.', { exact: true }).count(),
  reloadAction: await page.getByRole('button', { name: 'Reload' }).count(),
};
console.log(JSON.stringify(result, null, 2));
await context.close();
await browser.close();
await new Promise((resolve) => server.close(resolve));
