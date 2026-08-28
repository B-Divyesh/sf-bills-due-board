import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('offline demo reload @claim:offline-reload', async ({ page, context }) => {
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Plan bills. Confirm payments.' })).toBeVisible();
  await expect(page.getByText('Harbor Electric')).toBeVisible();
});

test('exports every sample bill @claim:csv-export', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString('utf8');
  expect(csv.split(/\r?\n/)).toHaveLength(7);
  expect(csv).toContain('vendor,amount,due_date,category,attachment,notes,status,paid_date');
  expect(csv).toContain('Harbor Electric,184.62');
});

test('imports a valid CSV @claim:csv-import', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  await page.locator('#csv-import').setInputFiles({
    name: 'bills.csv', mimeType: 'text/csv',
    buffer: Buffer.from('vendor,amount,due_date,category,attachment,notes,status,paid_date\nCedar Print,51.20,2030-04-12,Supplies,,Proof copies,planned,'),
  });
  await expect(page.getByText('Cedar Print')).toBeVisible();
  await expect(page.getByText('Imported 1 bill.')).toBeVisible();
});

test('confirms payment and moves it to history @claim:paid-confirmation', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  const row = page.locator('[data-bill-id]').filter({ hasText: 'Harbor Electric' });
  await row.getByRole('button', { name: 'Mark paid' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm this payment' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm paid' }).click();
  await expect(page.getByText('Harbor Electric marked paid.')).toBeVisible();
  await page.getByText(/Paid history/).click();
  await expect(page.locator('.paid-row').filter({ hasText: 'Harbor Electric' })).toBeVisible();
});

test('shows the seven day total @claim:cash-week', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  await page.getByRole('tab', { name: 'Cash week' }).click();
  await expect(page.getByRole('heading', { name: 'Cash needed by day' })).toBeVisible();
  await expect(page.locator('.cash-day')).toHaveCount(7);
  const amounts = await page.locator('.cash-day strong').allTextContents();
  expect(amounts.some((amount) => amount !== '$0.00')).toBeTruthy();
});

test('sorts planned bills by due date @claim:due-order', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  const names = await page.locator('.bill-row .bill-name strong').allTextContents();
  expect(names).toEqual(['Harbor Electric', 'Northline Packaging', 'Mira Workspace', 'Cloudpost Mail', 'Ridgeway Insurance']);
  await expect(page.locator('.queue-group').first().getByRole('heading', { name: 'Overdue' })).toBeVisible();
});

test('uses encrypted storage @claim:encrypted-storage', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  const stored = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:bills-due-board:v1');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const document = await new Promise<{ ciphertext: ArrayBuffer; vendor?: string }>((resolve, reject) => {
      const request = database.transaction('documents').objectStore('documents').get('bills');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return { ciphertextBytes: document.ciphertext.byteLength, clearVendor: document.vendor ?? '', serialized: JSON.stringify(document) };
  });
  expect(stored.ciphertextBytes).toBeGreaterThan(100);
  expect(stored.clearVendor).toBe('');
  expect(stored.serialized).not.toContain('Harbor Electric');
});

test('keeps demo changes out of the real board @claim:demo-isolation', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'Your queue is clear' })).toBeVisible();
  await expect(page.getByText('Harbor Electric')).toHaveCount(0);
});

test('free board rejects an eleventh active bill @claim:free-limit', async ({ page }) => {
  await page.goto('/board');
  await expect(page.getByRole('heading', { name: 'Your queue is clear' })).toBeVisible();
  const rows = Array.from({ length: 11 }, (_, index) => `Vendor ${index + 1},${index + 1}.00,2030-01-${String(index + 1).padStart(2, '0')},Utilities,,,planned,`);
  await page.locator('#csv-import').setInputFiles({ name: 'eleven.csv', mimeType: 'text/csv', buffer: Buffer.from(`vendor,amount,due_date,category,attachment,notes,status,paid_date\n${rows.join('\n')}`) });
  await expect(page.getByText('This import would pass the free limit of 10 active bills. Mark bills paid or add a license.')).toBeVisible();
  await expect(page.getByText('Vendor 1')).toHaveCount(0);
});

test('demo sends no cross-origin requests @claim:local-privacy', async ({ page }) => {
  const crossOrigin: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') crossOrigin.push(request.url()); });
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  await page.getByRole('tab', { name: 'Cash week' }).click();
  expect(crossOrigin).toEqual([]);
});

test('verifies a returned license and stores the result @claim:license-verify', async ({ page }) => {
  let verifyRequest = '';
  let verifyCount = 0;
  await page.route('https://api.sociobot.in/api/v1/products/bills-due-board/verify?license=*', async (route) => {
    verifyCount += 1;
    verifyRequest = route.request().url();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/board?license=sample-license-token');
  await expect(page.getByText('Your license is active. Your board has no active-bill limit.')).toBeVisible();
  expect(verifyRequest).toContain('license=sample-license-token');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:bills-due-board'))).toBe('sample-license-token');
  expect(page.url()).not.toContain('license=');
  await page.reload();
  await expect(page.getByText('Your license is active. Your board has no active-bill limit.')).toBeVisible();
  expect(verifyCount).toBe(1);
  await expect(page.getByRole('link', { name: 'Buy a license' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/bills-due-board/checkout');
});

test('core pages have accessible structure', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('manual entry works at mobile width with the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/board');
  await page.getByRole('button', { name: 'Add a bill' }).first().focus();
  await page.keyboard.press('Enter');
  await page.getByLabel('Vendor').fill('Maple Water');
  await page.getByLabel('Amount in USD').fill('42.10');
  await page.getByLabel('Due date').fill('2030-02-10');
  await page.getByRole('button', { name: 'Save bill' }).click();
  await expect(page.getByText('Maple Water')).toBeVisible();
});
