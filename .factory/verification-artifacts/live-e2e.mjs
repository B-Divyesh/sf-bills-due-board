import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

const origin = 'https://bills-due-board.sociobot.in';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const requests = [];
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
page.on('request', request => requests.push(request.url()));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => pageErrors.push(error.message));
page.on('requestfailed', request => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText}`));

const result = {};
const home = await page.goto(origin, { waitUntil: 'networkidle' });
result.home = {
  status: home?.status(),
  headers: await home?.allHeaders(),
  title: await page.title(),
  h1: await page.locator('h1').allTextContents(),
  viewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth })),
};
assert.equal(result.home.status, 200);
assert.equal(result.home.title, 'Bills Due Board — See bills by due date');
assert.deepEqual(result.home.h1, ['See every bill by due date']);
await page.screenshot({ path: '.factory/verification-artifacts/live-cold-mobile.png' });

await page.getByRole('link', { name: 'Try it with sample data' }).click();
await page.waitForURL(`${origin}/demo`);
await page.getByText('Harbor Electric', { exact: true }).waitFor();
assert.equal(await page.getByText('Demo — sample data, nothing is saved to your board', { exact: true }).count(), 1);
assert.equal(await page.getByRole('button', { name: 'Reset demo' }).count(), 1);
assert.equal(await page.getByRole('link', { name: 'Start for real' }).count(), 1);
assert.equal(await page.locator('[data-bill-id]').count(), 5);
assert.match(await page.locator('.paid-section').innerText(), /Paid history \(1\)/);
await page.screenshot({ path: '.factory/verification-artifacts/live-demo-one-click-mobile.png', fullPage: true });

await page.getByRole('tab', { name: 'Cash week' }).click();
assert.deepEqual(await page.locator('.cash-day strong').allTextContents(), ['$0.00', '$426.80', '$0.00', '$875.00', '$0.00', '$38.00', '$0.00']);
assert.match(await page.locator('.cash-total').innerText(), /\$1,339\.80/);
await page.getByRole('tab', { name: 'Due dates' }).click();

await page.getByRole('button', { name: 'Add a bill' }).first().click();
await page.getByRole('button', { name: 'Save bill' }).click();
assert.match(await page.getByRole('alert').innerText(), /needs a vendor/);
await page.getByLabel('Vendor').fill('Boundary Paper');
await page.getByLabel('Amount in USD').fill('0.001');
await page.getByRole('button', { name: 'Save bill' }).click();
assert.match(await page.getByRole('alert').innerText(), /no more than two decimal places/);
await page.getByLabel('Amount in USD').fill('0.01');
await page.getByLabel('Attachment link').fill('javascript:alert(1)');
await page.getByRole('button', { name: 'Save bill' }).click();
assert.match(await page.getByRole('alert').innerText(), /must start with http:\/\/ or https:\/\//);
await page.getByLabel('Attachment link').fill('https://example.com/invoice.pdf');
await page.getByLabel('Notes').fill('Smallest valid amount');
await page.getByRole('button', { name: 'Save bill' }).click();
await page.getByText('Boundary Paper', { exact: true }).waitFor();
const boundaryRow = page.locator('[data-bill-id]').filter({ hasText: 'Boundary Paper' });
assert.equal(await boundaryRow.getByRole('link', { name: /Attachment/ }).getAttribute('href'), 'https://example.com/invoice.pdf');
assert.equal(await boundaryRow.getByRole('link', { name: /Attachment/ }).getAttribute('target'), '_blank');

await boundaryRow.getByRole('button', { name: 'Edit' }).click();
await page.getByLabel('Amount in USD').fill('2.22');
await page.getByLabel('Category').selectOption({ label: 'Supplies' });
await page.getByLabel('Notes').fill('Edited and recovered');
await page.getByRole('button', { name: 'Save bill' }).click();
await expect(boundaryRow).toContainText('$2.22');
await expect(boundaryRow).toContainText('Supplies');

await boundaryRow.getByRole('button', { name: 'Mark paid' }).click();
await page.getByRole('button', { name: 'Keep planned' }).click();
assert.equal(await page.locator('[data-bill-id]').filter({ hasText: 'Boundary Paper' }).count(), 1);
await boundaryRow.getByRole('button', { name: 'Mark paid' }).click();
await page.getByRole('button', { name: 'Confirm paid' }).click();
await page.getByRole('button', { name: 'Undo' }).click();
await page.getByText('Payment mark undone.', { exact: true }).waitFor();
await expect(page.locator('[data-bill-id]').filter({ hasText: 'Boundary Paper' })).toHaveCount(1);

await boundaryRow.getByRole('button', { name: 'Delete' }).click();
await page.getByRole('button', { name: 'Keep bill' }).click();
await expect(page.locator('[data-bill-id]').filter({ hasText: 'Boundary Paper' })).toHaveCount(1);
await boundaryRow.getByRole('button', { name: 'Delete' }).click();
await page.getByRole('button', { name: 'Delete bill' }).click();
await expect(page.locator('[data-bill-id]').filter({ hasText: 'Boundary Paper' })).toHaveCount(0);

await page.locator('#csv-import').setInputFiles({
  name: 'bad.csv', mimeType: 'text/csv',
  buffer: Buffer.from('vendor,amount,due_date\nBroken,,2030-02-31'),
});
await page.getByText(/invalid amount/).waitFor();
await page.locator('#csv-import').setInputFiles({
  name: 'recovered.csv', mimeType: 'text/csv',
  buffer: Buffer.from('vendor,amount,due_date,category,attachment,notes,status,paid_date\n=Recovery Vendor,51.20,2030-04-12,Supplies,,Recovered after invalid input,planned,'),
});
await page.getByText('Imported 1 bill.', { exact: true }).waitFor();
await page.getByText('=Recovery Vendor', { exact: true }).waitFor();
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Export CSV' }).click();
const download = await downloadPromise;
const stream = await download.createReadStream();
const chunks = [];
for await (const chunk of stream) chunks.push(Buffer.from(chunk));
const csv = Buffer.concat(chunks).toString('utf8');
assert.equal(csv.split(/\r?\n/).length, 8);
assert.match(csv, /'\=Recovery Vendor,51\.20/);
result.csv = { rowsIncludingHeader: csv.split(/\r?\n/).length, formulaNeutralized: csv.includes("'=Recovery Vendor") };

await page.reload({ waitUntil: 'networkidle' });
await page.getByText('=Recovery Vendor', { exact: true }).waitFor();
assert.equal(await page.getByText('=Recovery Vendor', { exact: true }).count(), 1);
await page.getByRole('button', { name: 'Reset demo' }).click();
await page.getByText('Demo reset to the original sample.', { exact: true }).waitFor();
await expect(page.locator('[data-bill-id]').filter({ hasText: '=Recovery Vendor' })).toHaveCount(0);
await page.getByText('Harbor Electric', { exact: true }).waitFor();
assert.equal(await page.locator('[data-bill-id]').count(), 5);
await page.getByRole('link', { name: 'Start for real' }).click();
await page.getByRole('heading', { name: 'Your queue is clear' }).waitFor();
assert.equal(await page.getByText('Harbor Electric', { exact: true }).count(), 0);

result.privacy = {
  requestCount: requests.length,
  uniqueRequests: [...new Set(requests)],
  crossOriginRequests: [...new Set(requests.filter(url => new URL(url).origin !== origin))],
  consoleErrors,
  pageErrors,
  failedRequests,
};
assert.deepEqual(result.privacy.crossOriginRequests, []);
assert.deepEqual(consoleErrors, []);
assert.deepEqual(pageErrors, []);
assert.deepEqual(failedRequests, []);
result.outcome = 'PASS';

console.log(JSON.stringify(result, null, 2));
await context.close();
await browser.close();
