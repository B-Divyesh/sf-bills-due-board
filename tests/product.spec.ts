import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function addBill(page: import('@playwright/test').Page, vendor: string, amount = '42.10'): Promise<void> {
  await page.getByRole('button', { name: 'Add a bill' }).first().click();
  await page.getByLabel('Vendor').fill(vendor);
  await page.getByLabel('Amount in USD').fill(amount);
  await page.getByLabel('Due date').fill('2030-02-10');
  await page.getByRole('button', { name: 'Save bill' }).click();
  await expect(page.getByText(vendor)).toBeVisible();
}

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
  expect(amounts).toEqual(['$0.00', '$426.80', '$0.00', '$875.00', '$0.00', '$38.00', '$0.00']);
  await expect(page.locator('.cash-total')).toContainText('$1,339.80');
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

test('demo uses no analytics or third-party scripts and sends no bill records away @claim:local-privacy', async ({ page }) => {
  const crossOrigin: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') crossOrigin.push(request.url()); });
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  await page.getByRole('tab', { name: 'Cash week' }).click();
  expect(crossOrigin).toEqual([]);
  const scripts = await page.locator('script[src]').evaluateAll((elements) => elements.map((element) => (element as HTMLScriptElement).src));
  expect(scripts.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('requests bill details but no bank credentials @claim:bank-credentials', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();

  const controls = await page.locator('input, select, textarea').evaluateAll((elements) => elements.map((element) => {
    const control = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const label = control.id ? document.querySelector(`label[for="${CSS.escape(control.id)}"]`)?.textContent?.trim() ?? '' : '';
    return { name: control.getAttribute('name') ?? '', type: control.getAttribute('type') ?? control.tagName.toLowerCase(), label };
  }));
  const requestedLabels = controls.map((control) => control.label).filter(Boolean);
  expect(requestedLabels).toEqual(['Vendor', 'Amount in USD', 'Due date', 'Category', 'Attachment link', 'Notes', 'Paid date']);

  const credentialPattern = /bank|routing|account|iban|swift|card|cvv|pin|password/i;
  expect(controls.filter((control) => credentialPattern.test(`${control.name} ${control.type} ${control.label}`))).toEqual([]);
});

test('paid confirmation stays local and cannot initiate a payment @claim:payment-initiation', async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { __paymentApiCalls?: number }).__paymentApiCalls = 0;
    Object.defineProperty(window, 'PaymentRequest', {
      configurable: true,
      value: class {
        constructor() {
          (window as Window & { __paymentApiCalls?: number }).__paymentApiCalls = ((window as Window & { __paymentApiCalls?: number }).__paymentApiCalls ?? 0) + 1;
          throw new Error('PaymentRequest must not be used by Bills Due Board.');
        }
      },
    });
  });
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();

  const actionRequests: string[] = [];
  page.on('request', (request) => actionRequests.push(request.url()));
  const row = page.locator('[data-bill-id]').filter({ hasText: 'Harbor Electric' });
  await row.getByRole('button', { name: 'Mark paid' }).click();
  await expect(page.getByText('This records your confirmation only. It does not move money.')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm paid' }).click();
  await expect(page.getByText('Harbor Electric marked paid.')).toBeVisible();
  await page.getByText(/Paid history/).click();
  await expect(page.locator('.paid-row').filter({ hasText: 'Harbor Electric' })).toBeVisible();

  expect(actionRequests).toEqual([]);
  expect(await page.evaluate(() => (window as Window & { __paymentApiCalls?: number }).__paymentApiCalls)).toBe(0);
});

test('keeps edits local without automatic account sync @claim:account-sync', async ({ page }) => {
  const crossOriginRequests: string[] = [];
  const sockets: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') crossOriginRequests.push(request.url());
  });
  page.on('websocket', (socket) => sockets.push(socket.url()));

  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  await addBill(page, 'Local Paper Supply');
  await page.waitForTimeout(750);
  await page.reload();
  await expect(page.getByText('Local Paper Supply')).toBeVisible();

  expect(crossOriginRequests).toEqual([]);
  expect(sockets).toEqual([]);
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

test('uses a stale valid license offline and never waits for verification to render the board @claim:license-offline', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:bills-due-board', 'cached-valid-token');
    localStorage.setItem('sb_license:bills-due-board:verdict', JSON.stringify({
      unlocked: true,
      message: 'Your license is active. Your board has no active-bill limit.',
      checkedAt: Date.now() - 2 * 86400000,
    }));
  });
  await page.route('https://api.sociobot.in/api/v1/products/bills-due-board/verify?license=*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await route.abort('internetdisconnected');
  });
  await page.goto('/board');
  await expect(page.getByRole('heading', { name: 'Your queue is clear' })).toBeVisible({ timeout: 1000 });
  await expect(page.locator('#license-message')).toHaveText('Your license is active. Your board has no active-bill limit.');
  const rows = Array.from({ length: 11 }, (_, index) => `Cached Vendor ${index + 1},${index + 1}.00,2030-03-${String(index + 1).padStart(2, '0')},Utilities,,,planned,`);
  await page.locator('#csv-import').setInputFiles({ name: 'eleven.csv', mimeType: 'text/csv', buffer: Buffer.from(`vendor,amount,due_date,category,attachment,notes,status,paid_date\n${rows.join('\n')}`) });
  await expect(page.getByText('Imported 11 bills.')).toBeVisible();
  await expect(page.getByText('Cached Vendor 11')).toBeVisible();
});

test('landing preview derives the current sample cash week @claim:landing-preview', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-preview-total]')).toHaveText('$1,339.80');
  await expect(page.locator('[data-preview-count]')).toHaveText('3 planned bills');
  await expect(page.locator('.preview-list')).toContainText('Harbor Electric');
  await expect(page.locator('.preview-list')).toContainText('Northline Packaging');
  await expect(page.locator('.preview-list')).toContainText('Mira Workspace');
  await expect(page.locator('.preview-list')).toContainText('Cloudpost Mail');
});

test('lists the one-time license price and Sociobot checkout link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.price')).toContainText('$19');
  await expect(page.getByRole('link', { name: 'Buy a license' }).last()).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/bills-due-board/checkout');
});

test('clearing browser storage removes the local board and license @claim:clear-local-data', async ({ page }) => {
  await page.goto('/board');
  await addBill(page, 'Storage Reset Bill');
  await page.evaluate(() => localStorage.setItem('sb_license:bills-due-board', 'device-license'));
  await page.evaluate(async () => {
    localStorage.clear();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('bills-due-board:v1');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your queue is clear' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:bills-due-board'))).toBeNull();
});

test('core pages have accessible structure', async ({ page }) => {
  for (const route of ['/', '/demo', '/board', '/privacy', '/terms']) {
    await page.goto(route);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations).toEqual([]);
  }
});

test('manual entry works at mobile width with the keyboard @claim:manual-entry', async ({ page }) => {
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

test('rejects corrupt financial input from the form and CSV', async ({ page }) => {
  await page.goto('/board');
  await page.getByRole('button', { name: 'Add a bill' }).first().click();
  await page.getByLabel('Vendor').fill('Blank Amount');
  await page.getByLabel('Due date').fill('2030-02-10');
  await page.getByRole('button', { name: 'Save bill' }).click();
  await expect(page.getByRole('alert')).toContainText('number above zero');
  await page.getByLabel('Amount in USD').fill('0.001');
  await page.getByRole('button', { name: 'Save bill' }).click();
  await expect(page.getByRole('alert')).toContainText('two decimal places');
  await page.getByRole('button', { name: 'Cancel' }).click();

  const invalidRows = [
    ['blank.csv', 'Blank Amount,,2030-02-10,Utilities,,,planned,', 'invalid amount'],
    ['fraction.csv', 'Fraction,0.001,2030-02-10,Utilities,,,planned,', 'invalid amount'],
    ['date.csv', 'Bad Date,10.00,2030-02-31,Utilities,,,planned,', 'invalid due date'],
    ['status.csv', 'Void Bill,10.00,2030-02-10,Utilities,,,void,', 'invalid status'],
  ];
  for (const [name, row, message] of invalidRows) {
    await page.locator('#csv-import').setInputFiles({
      name, mimeType: 'text/csv',
      buffer: Buffer.from(`vendor,amount,due_date,category,attachment,notes,status,paid_date\n${row}`),
    });
    await expect(page.locator('#app-toast')).toContainText(message);
  }
  await expect(page.getByText('Blank Amount')).toHaveCount(0);
  await expect(page.getByText('Void Bill')).toHaveCount(0);
});

test('two stale tabs preserve both writes', async ({ context, page }) => {
  await context.addInitScript({ content: `window.BroadcastChannel = class { postMessage() {} addEventListener() {} close() {} };` });
  const second = await context.newPage();
  await page.goto('/board');
  await second.goto('/board');
  await expect(page.getByRole('heading', { name: 'Your queue is clear' })).toBeVisible();
  await expect(second.getByRole('heading', { name: 'Your queue is clear' })).toBeVisible();
  await addBill(page, 'Tab A Bill', '10.00');
  await addBill(second, 'Tab B Bill', '20.00');
  await page.reload();
  await expect(page.getByText('Tab A Bill')).toBeVisible();
  await expect(page.getByText('Tab B Bill')).toBeVisible();
});

test('licensed board accepts more than ten active bills @claim:licensed-unlimited', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/bills-due-board/verify?license=*', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }),
  }));
  await page.goto('/board?license=unlimited-test-token');
  await expect(page.getByText('Your license is active. Your board has no active-bill limit.')).toBeVisible();
  const rows = Array.from({ length: 11 }, (_, index) => `Licensed Vendor ${index + 1},${index + 1}.00,2030-03-${String(index + 1).padStart(2, '0')},Utilities,,,planned,`);
  await page.locator('#csv-import').setInputFiles({ name: 'eleven.csv', mimeType: 'text/csv', buffer: Buffer.from(`vendor,amount,due_date,category,attachment,notes,status,paid_date\n${rows.join('\n')}`) });
  await expect(page.getByText('Imported 11 bills.')).toBeVisible();
  await expect(page.getByText('Licensed Vendor 11')).toBeVisible();
});

test('accessibility remains available without a license @claim:free-accessibility', async ({ page }) => {
  await page.goto('/board');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:bills-due-board'))).toBeNull();
  await expect(page.getByRole('button', { name: 'Add a bill' }).first()).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Import CSV' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('invalid license state stays visible', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/bills-due-board/verify?license=*', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'revoked', expires_at: null }),
  }));
  await page.goto('/board?license=revoked-test-token');
  await expect(page.locator('#license-message')).toHaveText('This license is not active. Check the token or buy a new license.');
  await page.reload();
  await expect(page.locator('#license-message')).toHaveText('This license is not active. Check the token or buy a new license.');
});

test('CSV export neutralizes spreadsheet formulas', async ({ page }) => {
  await page.goto('/board');
  await page.locator('#csv-import').setInputFiles({
    name: 'formula.csv', mimeType: 'text/csv',
    buffer: Buffer.from('vendor,amount,due_date,category,attachment,notes,status,paid_date\n=1+1,10.00,2030-02-10,Utilities,,,planned,'),
  });
  await expect(page.getByText('=1+1')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const stream = await (await downloadPromise).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString('utf8').split(/\r?\n/)[1]).toMatch(/^'=1\+1,/);
});

test('mobile targets stay large and content reflows at 200 percent', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await expect(page.getByText('Harbor Electric')).toBeVisible();
  for (const selector of ['.wordmark', '.demo-banner button', '.demo-banner a', '.button', 'button']) {
    const boxes = await page.locator(`${selector}:visible`).evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect(); return { width: box.width, height: box.height };
    }));
    for (const box of boxes) { expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44); }
  }
  await page.addStyleTag({ content: 'html { font-size: 32px !important; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const deleteEdges = await page.getByRole('button', { name: 'Delete' }).evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().right));
  expect(deleteEdges.every((edge) => edge <= 390)).toBe(true);
});

test('long accepted CSV content wraps inside a 390px board', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/board');
  const vendor = 'V'.repeat(500);
  const notes = 'N'.repeat(300);
  await page.locator('#csv-import').setInputFiles({
    name: 'long.csv', mimeType: 'text/csv',
    buffer: Buffer.from(`vendor,amount,due_date,category,attachment,notes,status,paid_date\n${vendor},10.00,2030-02-10,Utilities,,${notes},planned,`),
  });
  await expect(page.getByText(vendor)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('license label and footer links are visible, touch-sized controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/board');
  await expect(page.getByLabel('License token')).toBeVisible();
  const labelBox = await page.locator('label[for="license-token"]').boundingBox();
  expect(labelBox?.height).toBeGreaterThan(0);
  await page.goto('/');
  const footerBoxes = await page.locator('.footer-links a').evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
  expect(footerBoxes.every((height) => height >= 44)).toBe(true);
  await page.locator('.skip-link').focus();
  expect((await page.locator('.skip-link').boundingBox())?.height).toBeGreaterThanOrEqual(44);
  for (const route of ['/privacy', '/terms']) {
    await page.goto(route);
    expect((await page.locator('a[href^="mailto:"]').boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
});
