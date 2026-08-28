import './styles.css';
import { billsToCsv, csvToBills } from './csv';
import { demoBills, loadBills, resetDemoStorage, saveBills, updateBills } from './db';
import type { Bill, LicenseState } from './types';
import { isCalendarDate, isHttpLink, parseCurrencyAmount } from './validation';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) throw new Error('The app could not start. Reload this page.');
const app = appRoot;

const BUILD_ID = 'v1.0.5';
const PRODUCT_SLUG = 'bills-due-board';
const BUY_URL = `https://api.sociobot.in/api/v1/products/${PRODUCT_SLUG}/checkout`;
const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
const LICENSE_CACHE_KEY = `${LICENSE_KEY}:verdict`;
const FREE_ACTIVE_LIMIT = 10;
let renderSequence = 0;
let toastTimer = 0;
let boardChannel: BroadcastChannel | null = null;

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function cleanPath(pathname: string): string {
  const path = pathname.replace(/\/+$/, '') || '/';
  return path === '/index.html' ? '/' : path;
}

function isDemoRoute(): boolean {
  return cleanPath(location.pathname) === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
}

function pageTitle(path: string): string {
  if (path === '/') return 'Bills Due Board — See bills by due date';
  if (path === '/demo') return 'Demo — Bills Due Board';
  if (path === '/board') return 'Your bills — Bills Due Board';
  if (path === '/privacy') return 'Privacy — Bills Due Board';
  if (path === '/terms') return 'Terms — Bills Due Board';
  return 'Page not found — Bills Due Board';
}

function routeMeta(path: string): void {
  document.title = pageTitle(path);
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = `https://bills-due-board.sociobot.in${path === '/' ? '/' : path}`;
  const title = pageTitle(path);
  const description = path === '/demo'
    ? 'Try a separate Bills Due Board sample with six realistic bills.'
    : path === '/board'
      ? 'Keep planned bills by due date and confirm each payment on this device.'
      : path === '/privacy'
        ? 'Read how Bills Due Board stores bill records and checks licenses.'
        : path === '/terms'
          ? 'Read the terms for using Bills Due Board and its one-time license.'
          : path === '/'
            ? 'List planned bills by due date, review the next cash week, and confirm each payment on this device.'
            : 'The requested Bills Due Board page was not found.';
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', canonical?.href ?? location.href);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
}

function header(path: string, demo: boolean): string {
  const current = (href: string) => path === href ? ' aria-current="page"' : '';
  return `<header class="site-header">${demo ? `<div class="demo-banner"><div class="shell"><strong>Demo — sample data, nothing is saved to your board</strong><button type="button" id="reset-demo">Reset demo</button><a href="/board" data-link>Start for real</a></div></div>` : ''}
      <div class="shell header-row">
        <a class="wordmark" href="/" data-link aria-label="Bills Due Board home"><span class="wordmark-mark" aria-hidden="true"></span><span>Bills Due Board</span></a>
        <nav class="site-nav" aria-label="Main navigation">
          <a href="/demo" data-link${current('/demo')}>Demo</a>
          <a href="/board" data-link${current('/board')}>My board</a>
          <a href="/privacy" data-link${current('/privacy')}>Privacy</a>
          <a href="/terms" data-link${current('/terms')}>Terms</a>
        </nav>
      </div>
    </header>
    <p class="offline-banner" id="offline-banner" role="status"${navigator.onLine ? ' hidden' : ''}>You are offline. Your board still works on this device.</p>`;
}

function footer(): string {
  return `<footer class="site-footer"><div class="shell footer-row">
    <div><strong>Bills Due Board</strong><p class="footer-note">A list of planned bills by due date.</p></div>
    <div><div class="footer-links"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></div><p class="footer-note">${BUILD_ID} · Works offline</p></div>
  </div></footer>`;
}

function landingPage(): string {
  const preview = demoBills().filter((bill) => bill.status === 'planned' && dayDistance(bill.dueDate) >= 0 && dayDistance(bill.dueDate) <= 6);
  const previewTotal = preview.reduce((sum, bill) => sum + bill.amount, 0);
  const overdue = demoBills().find((bill) => bill.status === 'planned' && dayDistance(bill.dueDate) < 0);
  return `<main id="main">
    <section class="hero"><div class="shell hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Bills by due date</p>
        <h1 tabindex="-1">See every bill by due date</h1>
        <p>For solo operators who need one place to review bills and confirm each payment.</p>
        <div class="hero-actions"><a class="button primary" href="/demo" data-link>Try it with sample data</a><a class="button" href="/board" data-link>Add your first bill</a><span class="action-note">The sample opens a separate demo board.</span></div>
        <ul class="facts" aria-label="Product facts"><li>Works offline after the first visit</li><li>Records use encrypted browser storage</li><li>Free for 10 active bills</li></ul>
      </div>
      <figure class="hero-art">
        <picture><source media="(max-width: 700px)" srcset="/assets/payment-horizon-960.webp"><img src="/assets/payment-horizon-1440.webp" width="1440" height="960" alt="An abstract seven-day calendar shows planned bills by their due dates." fetchpriority="high" decoding="async"></picture>
        <figcaption class="art-caption">Each planned bill stays listed until you mark it paid.</figcaption>
      </figure>
    </div></section>
    <section class="preview-section" aria-labelledby="preview-title"><div class="shell"><h2 id="preview-title">Bills due in the next seven days</h2><p class="section-intro">The board sorts planned bills by date. Overdue items stay first until you mark them paid.</p>
      <div class="preview-board" aria-label="Sample due-date board"><div class="preview-rail">Next seven days<strong data-preview-total>${formatMoney(previewTotal)}</strong><p data-preview-count>${preview.length} planned ${preview.length === 1 ? 'bill' : 'bills'}</p></div><div class="preview-list">
        ${overdue ? `<div class="preview-row"><span class="preview-date">${escapeHtml(formatDate(overdue.dueDate))}</span><span><span class="preview-status">Overdue</span><br><strong>${escapeHtml(overdue.vendor)}</strong></span><strong>${formatMoney(overdue.amount)}</strong></div>` : ''}
        ${preview.map((bill) => `<div class="preview-row"><span class="preview-date">${escapeHtml(formatDate(bill.dueDate))}</span><span>${escapeHtml(bill.vendor)}</span><strong>${formatMoney(bill.amount)}</strong></div>`).join('')}
      </div></div>
    </div></section>
    <section class="steps" aria-labelledby="steps-title"><div class="shell"><h2 id="steps-title">How to track planned bills</h2><div class="steps-grid">
      <article class="step"><span class="step-number">01</span><h3>Add planned bills</h3><p>Type one bill or import a CSV file from your current tool.</p></article>
      <article class="step"><span class="step-number">02</span><h3>Review the cash week</h3><p>See the total due on each of the next seven days.</p></article>
      <article class="step"><span class="step-number">03</span><h3>Confirm payment</h3><p>Choose the paid date. The bill then moves into paid history.</p></article>
    </div></div></section>
    <section class="boundaries" aria-labelledby="boundaries-title"><div class="shell two-column"><div><h2 id="boundaries-title">What this board does not do</h2><p>This is a planning record. Marking a bill paid does not move money or post to an accounting ledger.</p></div><ul class="not-list"><li>No bank credentials</li><li>No payment initiation</li><li>No tax or accounting advice</li><li>No automatic account sync</li></ul></div></section>
    <section class="pricing" aria-labelledby="price-title"><div class="shell"><div class="price-sheet"><div><h2 id="price-title">Price and license</h2><p>The free board holds 10 active bills. A license removes that limit. CSV import, export, offline use, and accessibility stay free.</p><p class="price">$19 <small>once</small></p></div><a class="button primary" href="${BUY_URL}">Buy a license</a></div></div></section>
  </main>`;
}

function boardPage(demo: boolean): string {
  return `<main id="main" class="board-page"><div class="shell">
    <div class="board-head"><div><p class="eyebrow">${demo ? 'Sample workspace' : 'Your private bill list'}</p><h1 tabindex="-1">Plan bills. Confirm payments.</h1><p class="board-summary" id="board-summary">Loading your bills…</p></div>
      <div class="board-tools" id="board-tools" hidden>
        <button class="primary" type="button" id="add-bill">Add a bill</button>
        <button class="secondary" type="button" id="import-csv">Import CSV</button><input id="csv-import" type="file" accept=".csv,text/csv" aria-label="Choose a CSV file to import">
        <button class="secondary" type="button" id="export-csv">Export CSV</button>
      </div></div>
    <div id="storage-error" class="storage-error" role="alert" hidden></div>
    <div id="board-content" aria-live="polite"><p>Opening encrypted browser storage…</p></div>${dialogs()}
    ${demo ? '' : licensePanel()}
  </div></main>`;
}

function licensePanel(): string {
  return `<section class="license-panel" aria-labelledby="license-title"><p class="eyebrow">Board capacity</p><h2 id="license-title">Free for 10 active bills</h2><p id="license-message" aria-live="polite">A $19 one-time license removes the active-bill limit.</p><div class="license-row"><a class="button primary" href="${BUY_URL}">Buy a license</a><div class="license-token-field"><label for="license-token">License token</label><input id="license-token" type="text" autocomplete="off" placeholder="Paste your license token"></div><button class="secondary" type="button" id="verify-license">Activate license</button></div></section>`;
}

function privacyPage(): string {
  return `<main id="main" class="legal-page"><div class="shell"><p class="eyebrow">Last updated 28 August 2026</p><h1 tabindex="-1">Your bills stay in your browser</h1><p>Bills Due Board stores bill records in an encrypted browser database on this device. The demo uses a separate database.</p><h2>What stays local</h2><p>Bill names, amounts, dates, notes, categories, and attachment links remain in browser storage. We do not run analytics or load third-party scripts.</p><h2>License checks</h2><p>If you add a license, the app sends that token to Sociobot once per day. It sends no bill records. Sociobot and Dodo are the merchant of record for purchases.</p><h2>Your choices</h2><p>Export a CSV copy at any time. Clear this site's browser data to remove local records and the stored license from this device.</p><h2>Contact</h2><p>Questions can be sent to <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></div></main>`;
}

function termsPage(): string {
  return `<main id="main" class="legal-page"><div class="shell"><p class="eyebrow">Last updated 28 August 2026</p><h1 tabindex="-1">Terms for using this board</h1><p>Bills Due Board is a planning tool. It does not move money, post ledger entries, or provide tax or accounting advice.</p><h2>Your records</h2><p>You control the records stored in your browser. Keep your own CSV backups. Clearing site data removes records from that device.</p><h2>One-time license</h2><p>A $19 license removes the limit of 10 active bills for this product. Sociobot and Dodo handle checkout, refunds, and license revocation.</p><h2>Service limits</h2><p>The software is provided as is under the MIT License. You remain responsible for checking dates, amounts, and actual payment status.</p><h2>Contact</h2><p>Questions can be sent to <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p></div></main>`;
}

function notFoundPage(): string {
  return `<main id="main" class="legal-page"><div class="shell"><p class="eyebrow">404 · page not found</p><h1 tabindex="-1">This page is not available</h1><p>The link may have changed. Return to the main page to review your bills.</p><a class="button primary" href="/" data-link>Return home</a></div></main>`;
}

async function render(): Promise<void> {
  const sequence = ++renderSequence;
  const path = cleanPath(location.pathname);
  const demo = isDemoRoute();
  const routePath = demo ? '/demo' : path;
  if (!demo && path !== '/board') { boardChannel?.close(); boardChannel = null; }
  routeMeta(routePath);
  const content = demo ? boardPage(true) : path === '/' ? landingPage() : path === '/board' ? boardPage(false) : path === '/privacy' ? privacyPage() : path === '/terms' ? termsPage() : notFoundPage();
  app.innerHTML = `${header(routePath, demo)}${content}${footer()}<div class="sr-only" aria-live="polite" id="route-announcer"></div>`;
  bindGlobalNavigation();
  if (demo || path === '/board') await setupBoard(demo, sequence);
  if (sequence === renderSequence) {
    const heading = document.querySelector<HTMLElement>('h1');
    heading?.focus({ preventScroll: true });
    const announcer = document.querySelector<HTMLElement>('#route-announcer');
    if (announcer) announcer.textContent = heading?.textContent ?? document.title;
  }
}

function bindGlobalNavigation(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => {
    link.addEventListener('click', async (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (isDemoRoute() && new URL(link.href).pathname !== '/demo') {
        try { await resetDemoStorage(); } catch { /* The demo database is isolated even if cleanup is blocked. */ }
      }
      history.pushState({}, '', link.href);
      window.scrollTo(0, 0);
      void render();
    });
  });
  document.querySelector('#reset-demo')?.addEventListener('click', async () => {
    try { await resetDemoStorage(); showToast('Demo reset to the original sample.'); await render(); }
    catch (error) { showToast(error instanceof Error ? error.message : 'The demo could not reset.'); }
  });
}

function toDate(value: string): Date { return new Date(`${value}T12:00:00`); }
function todayString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}
function dayDistance(date: string): number {
  const start = toDate(todayString()).getTime();
  return Math.round((toDate(date).getTime() - start) / 86400000);
}
function formatDate(date: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  return new Intl.DateTimeFormat(undefined, options).format(toDate(date));
}
function formatMoney(amount: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount);
}
function safeLink(value: string): string {
  try { const url = new URL(value); return isHttpLink(value) ? url.href : ''; }
  catch { return ''; }
}

async function setupBoard(demo: boolean, sequence: number): Promise<void> {
  const errorBox = document.querySelector<HTMLDivElement>('#storage-error');
  try {
    let bills = await loadBills(demo);
    if (demo && bills.length === 0) { bills = demoBills(); await saveBills(true, bills); }
    if (sequence !== renderSequence) return;
    document.querySelector<HTMLElement>('#board-tools')!.hidden = false;
    let view: 'due' | 'cash' = 'due';
    const licenseSnapshot = demo ? null : currentLicenseState();
    let license = demo ? { unlocked: true, message: 'Demo capacity has no limit.' } : licenseSnapshot!.state;
    boardChannel?.close();
    boardChannel = new BroadcastChannel(`bills-due-board:${demo ? 'demo' : 'real'}`);

    const redraw = (): void => {
      const content = document.querySelector<HTMLDivElement>('#board-content');
      const summary = document.querySelector<HTMLParagraphElement>('#board-summary');
      if (!content || !summary) return;
      const planned = bills.filter((bill) => bill.status === 'planned').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      const withinWeek = planned.filter((bill) => dayDistance(bill.dueDate) >= 0 && dayDistance(bill.dueDate) <= 6);
      const overdue = planned.filter((bill) => dayDistance(bill.dueDate) < 0);
      summary.textContent = planned.length ? `${planned.length} planned ${planned.length === 1 ? 'bill' : 'bills'} · ${formatMoney(withinWeek.reduce((sum, bill) => sum + bill.amount, 0))} due in the next seven days` : 'No planned bills yet.';
      content.innerHTML = boardMarkup(bills, view);
      bindBoardContent();
      const licenseMessage = document.querySelector('#license-message');
      if (licenseMessage) licenseMessage.textContent = license.message;
      if (overdue.length) summary.textContent += ` · ${overdue.length} overdue`;
    };

    const persist = async (change: (latest: Bill[]) => Bill[]): Promise<boolean> => {
      try {
        bills = await updateBills(demo, change);
        boardChannel?.postMessage('changed');
        if (errorBox) errorBox.hidden = true;
        return true;
      } catch (error) {
        if (errorBox) { errorBox.hidden = false; errorBox.textContent = `${error instanceof Error ? error.message : 'Bills were not saved.'} Export a CSV copy, then check browser storage settings.`; }
        return false;
      }
    };

    boardChannel.addEventListener('message', async () => {
      try { bills = await loadBills(demo); redraw(); showToast('This board was updated in another tab.'); }
      catch { /* The persistent storage error remains available on the active tab. */ }
    });

    const bindBoardContent = (): void => {
      document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => button.addEventListener('click', () => { view = button.dataset.view === 'cash' ? 'cash' : 'due'; redraw(); }));
      document.querySelector('.view-tabs')?.addEventListener('keydown', (event) => {
        if (!(event instanceof KeyboardEvent) || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault(); view = view === 'due' ? 'cash' : 'due'; redraw(); document.querySelector<HTMLButtonElement>(`[data-view="${view}"]`)?.focus();
      });
      document.querySelector<HTMLButtonElement>('[data-add-empty]')?.addEventListener('click', () => document.querySelector<HTMLButtonElement>('#add-bill')?.click());
      document.querySelectorAll<HTMLButtonElement>('[data-paid-id]').forEach((button) => button.addEventListener('click', () => openPaidDialog(button.dataset.paidId ?? '')));
      document.querySelectorAll<HTMLButtonElement>('[data-edit-id]').forEach((button) => button.addEventListener('click', () => openBillDialog(button.dataset.editId ?? '')));
      document.querySelectorAll<HTMLButtonElement>('[data-delete-id]').forEach((button) => button.addEventListener('click', () => openDeleteDialog(button.dataset.deleteId ?? '')));
    };

    const openBillDialog = (id = ''): void => {
      const existing = bills.find((bill) => bill.id === id);
      const dialog = document.querySelector<HTMLDialogElement>('#bill-dialog');
      const form = document.querySelector<HTMLFormElement>('#bill-form');
      const title = document.querySelector('#bill-dialog-title');
      const error = document.querySelector<HTMLParagraphElement>('#bill-form-error');
      if (!dialog || !form || !title || !error) return;
      title.textContent = existing ? 'Edit this bill' : 'Add a planned bill';
      form.reset(); error.textContent = '';
      (form.elements.namedItem('bill-id') as HTMLInputElement).value = existing?.id ?? '';
      (form.elements.namedItem('vendor') as HTMLInputElement).value = existing?.vendor ?? '';
      (form.elements.namedItem('amount') as HTMLInputElement).value = existing ? String(existing.amount) : '';
      (form.elements.namedItem('due-date') as HTMLInputElement).value = existing?.dueDate ?? todayString();
      (form.elements.namedItem('category') as HTMLInputElement).value = existing?.category ?? 'Utilities';
      (form.elements.namedItem('attachment') as HTMLInputElement).value = existing?.attachment ?? '';
      (form.elements.namedItem('notes') as HTMLTextAreaElement).value = existing?.notes ?? '';
      dialog.showModal();
      (form.elements.namedItem('vendor') as HTMLInputElement).focus();
    };

    const openPaidDialog = (id: string): void => {
      const bill = bills.find((item) => item.id === id);
      const dialog = document.querySelector<HTMLDialogElement>('#paid-dialog');
      if (!bill || !dialog) return;
      dialog.querySelector<HTMLElement>('#paid-vendor')!.textContent = bill.vendor;
      dialog.querySelector<HTMLElement>('#paid-amount')!.textContent = formatMoney(bill.amount);
      (dialog.querySelector<HTMLInputElement>('#paid-id')!).value = id;
      (dialog.querySelector<HTMLInputElement>('#paid-date')!).value = todayString();
      dialog.showModal();
      dialog.querySelector<HTMLInputElement>('#paid-date')?.focus();
    };

    const openDeleteDialog = (id: string): void => {
      const bill = bills.find((item) => item.id === id);
      const dialog = document.querySelector<HTMLDialogElement>('#delete-dialog');
      if (!bill || !dialog) return;
      dialog.querySelector<HTMLElement>('#delete-vendor')!.textContent = bill.vendor;
      (dialog.querySelector<HTMLInputElement>('#delete-id')!).value = id;
      dialog.showModal();
      dialog.querySelector<HTMLButtonElement>('#confirm-delete')?.focus();
    };

    document.querySelector('#add-bill')?.addEventListener('click', () => {
      const activeCount = bills.filter((bill) => bill.status === 'planned').length;
      if (!license.unlocked && activeCount >= FREE_ACTIVE_LIMIT) { document.querySelector('#license-title')?.scrollIntoView({ behavior: 'smooth' }); showToast('The free board holds 10 active bills. Mark one paid or add a license.'); return; }
      openBillDialog();
    });
    document.querySelector('#export-csv')?.addEventListener('click', () => downloadCsv(bills));
    document.querySelector('#import-csv')?.addEventListener('click', () => document.querySelector<HTMLInputElement>('#csv-import')?.click());
    document.querySelector<HTMLInputElement>('#csv-import')?.addEventListener('change', async (event) => {
      const input = event.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      try {
        const imported = csvToBills(await file.text());
        const newActive = imported.filter((bill) => bill.status === 'planned').length;
        const activeCount = bills.filter((bill) => bill.status === 'planned').length;
        if (!license.unlocked && activeCount + newActive > FREE_ACTIVE_LIMIT) throw new Error(`This import would pass the free limit of ${FREE_ACTIVE_LIMIT} active bills. Mark bills paid or add a license.`);
        const saved = await persist((latest) => {
          const currentActive = latest.filter((bill) => bill.status === 'planned').length;
          if (!license.unlocked && currentActive + newActive > FREE_ACTIVE_LIMIT) throw new Error(`This import would pass the free limit of ${FREE_ACTIVE_LIMIT} active bills. Mark bills paid or add a license.`);
          return [...latest, ...imported];
        });
        if (!saved) throw new Error(errorBox?.textContent?.replace(' Export a CSV copy, then check browser storage settings.', '') || 'The CSV could not be saved.');
        redraw(); showToast(`Imported ${imported.length} ${imported.length === 1 ? 'bill' : 'bills'}.`);
      } catch (error) { showToast(error instanceof Error ? error.message : 'The CSV could not be imported. Check the file and try again.'); }
      input.value = '';
    });

    document.querySelector<HTMLFormElement>('#bill-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget as HTMLFormElement;
      const formData = new FormData(form);
      const id = String(formData.get('bill-id') ?? '');
      const vendor = String(formData.get('vendor') ?? '').trim();
      const amount = parseCurrencyAmount(String(formData.get('amount') ?? ''));
      const dueDate = String(formData.get('due-date') ?? '');
      const attachment = String(formData.get('attachment') ?? '').trim();
      const error = document.querySelector<HTMLParagraphElement>('#bill-form-error')!;
      if (!vendor) { error.textContent = 'The bill needs a vendor. Add the name and save again.'; return; }
      if (amount === null) { error.textContent = 'The amount is not valid. Enter a number above zero with no more than two decimal places.'; return; }
      if (!isCalendarDate(dueDate)) { error.textContent = 'The bill needs a real due date. Choose one and save again.'; return; }
      if (attachment && !safeLink(attachment)) { error.textContent = 'The attachment link must start with http:// or https://.'; return; }
      const now = new Date().toISOString();
      const wasEditing = Boolean(id);
      const newId = id || crypto.randomUUID();
      const saved = await persist((latest) => {
        const previous = latest.find((bill) => bill.id === id);
        if (!license.unlocked && !previous && latest.filter((bill) => bill.status === 'planned').length >= FREE_ACTIVE_LIMIT) {
          throw new Error(`The free board holds ${FREE_ACTIVE_LIMIT} active bills. Mark one paid or add a license.`);
        }
        const next: Bill = { id: newId, vendor, amount, dueDate, category: String(formData.get('category') ?? 'Uncategorised'), attachment, notes: String(formData.get('notes') ?? '').trim(), status: previous?.status ?? 'planned', paidAt: previous?.paidAt ?? '', createdAt: previous?.createdAt ?? now, updatedAt: now };
        return previous ? latest.map((bill) => bill.id === id ? next : bill) : [...latest, next];
      });
      if (!saved) return;
      document.querySelector<HTMLDialogElement>('#bill-dialog')?.close(); redraw(); showToast(wasEditing ? 'Bill changes saved.' : 'Bill added to your list.');
    });

    document.querySelector<HTMLFormElement>('#paid-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const id = String(formData.get('paid-id') ?? '');
      const paidAt = String(formData.get('paid-date') ?? '');
      const previous = bills.find((bill) => bill.id === id);
      if (!previous || !paidAt) return;
      if (!isCalendarDate(paidAt)) return;
      if (!await persist((latest) => latest.map((bill) => bill.id === id ? { ...bill, status: 'paid', paidAt, updatedAt: new Date().toISOString() } : bill))) return;
      document.querySelector<HTMLDialogElement>('#paid-dialog')?.close(); redraw();
      showToast(`${previous.vendor} marked paid.`, async () => {
        if (await persist((latest) => latest.map((bill) => bill.id === id ? { ...bill, status: 'planned', paidAt: '', updatedAt: new Date().toISOString() } : bill))) {
          redraw(); showToast('Payment mark undone.');
        }
      });
    });

    document.querySelector<HTMLFormElement>('#delete-form')?.addEventListener('submit', async (event) => {
      event.preventDefault(); const id = String(new FormData(event.currentTarget as HTMLFormElement).get('delete-id') ?? ''); const deleted = bills.find((bill) => bill.id === id); if (!await persist((latest) => latest.filter((bill) => bill.id !== id))) return; document.querySelector<HTMLDialogElement>('#delete-dialog')?.close(); redraw(); showToast(deleted ? `${deleted.vendor} deleted.` : 'Bill deleted.');
    });
    document.querySelectorAll<HTMLButtonElement>('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => button.closest('dialog')?.close()));

    document.querySelector('#verify-license')?.addEventListener('click', async () => {
      const input = document.querySelector<HTMLInputElement>('#license-token'); const token = input?.value.trim() ?? '';
      if (!token) { showToast('Paste your license token, then activate it.'); return; }
      localStorage.setItem(LICENSE_KEY, token); localStorage.removeItem(LICENSE_CACHE_KEY);
      license = { unlocked: false, message: 'Checking this license…' }; redraw();
      try { license = await verifyLicense(token); }
      catch { license = { unlocked: false, message: 'The license could not be checked. Go online and try again.' }; }
      redraw(); showToast(license.message);
    });
    redraw();
    if (!demo && licenseSnapshot?.token && licenseSnapshot.needsVerification) {
      void refreshLicenseInBackground(licenseSnapshot, (state) => { license = state; redraw(); });
    }
  } catch (error) {
    if (errorBox) { errorBox.hidden = false; errorBox.textContent = `${error instanceof Error ? error.message : 'Browser storage did not open.'} Check that private browsing allows IndexedDB, then reload.`; }
    const content = document.querySelector('#board-content'); if (content) content.innerHTML = '<div class="empty-state"><div class="empty-geometry" aria-hidden="true"></div><h2>Your board could not open</h2><p>Check browser storage settings, then reload this page.</p></div>';
  }
}

function boardMarkup(bills: Bill[], view: 'due' | 'cash'): string {
  const planned = bills.filter((bill) => bill.status === 'planned').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const paid = bills.filter((bill) => bill.status === 'paid').sort((a, b) => b.paidAt.localeCompare(a.paidAt));
  const week = planned.filter((bill) => dayDistance(bill.dueDate) >= 0 && dayDistance(bill.dueDate) <= 6);
  const overdue = planned.filter((bill) => dayDistance(bill.dueDate) < 0);
  const total = planned.reduce((sum, bill) => sum + bill.amount, 0);
  const tabs = `<div class="view-tabs" role="tablist" aria-label="Board view"><button type="button" role="tab" data-view="due" aria-selected="${view === 'due'}">Due dates</button><button type="button" role="tab" data-view="cash" aria-selected="${view === 'cash'}">Cash week</button></div>`;
  return `<div class="board-stats"><div class="stat"><span class="stat-label">Planned total</span><strong>${formatMoney(total)}</strong></div><div class="stat"><span class="stat-label">Next seven days</span><strong>${formatMoney(week.reduce((sum, bill) => sum + bill.amount, 0))}</strong></div><div class="stat"><span class="stat-label">Overdue</span><strong>${overdue.length}</strong></div></div>${tabs}${view === 'due' ? dueView(planned) : cashView(planned)}${paidView(paid)}`;
}

function dueView(planned: Bill[]): string {
  if (!planned.length) return `<section class="queue" aria-label="Planned bills"><div class="empty-state"><div class="empty-geometry" aria-hidden="true"></div><h2>Your bill list is clear</h2><p>Planned bills will appear here. Add one or import a CSV file.</p><button class="primary" type="button" data-add-empty>Add a bill</button></div></section>`;
  const groups = [
    { title: 'Overdue', items: planned.filter((bill) => dayDistance(bill.dueDate) < 0) },
    { title: 'Next seven days', items: planned.filter((bill) => dayDistance(bill.dueDate) >= 0 && dayDistance(bill.dueDate) <= 6) },
    { title: 'Later', items: planned.filter((bill) => dayDistance(bill.dueDate) > 6) },
  ];
  return `<section class="queue" aria-label="Planned bills">${groups.filter((group) => group.items.length).map((group) => `<section class="queue-group"><h2>${group.title}</h2>${group.items.map(billRow).join('')}</section>`).join('')}</section>`;
}

function billRow(bill: Bill): string {
  const distance = dayDistance(bill.dueDate);
  const statusClass = distance < 0 ? 'overdue' : distance <= 6 ? 'soon' : '';
  const relative = distance < 0 ? `${Math.abs(distance)}d late` : distance === 0 ? 'Today' : distance === 1 ? 'Tomorrow' : formatDate(bill.dueDate);
  const attachment = safeLink(bill.attachment);
  return `<article class="bill-row ${statusClass}" data-bill-id="${escapeHtml(bill.id)}"><div class="due-mark"><span class="due-dot" aria-hidden="true"></span><span>${escapeHtml(relative)}</span></div><div class="bill-name"><strong>${escapeHtml(bill.vendor)}</strong><small>${bill.notes ? escapeHtml(bill.notes) : `Due ${escapeHtml(formatDate(bill.dueDate, { month: 'long', day: 'numeric', year: 'numeric' }))}`}${attachment ? ` · <a href="${escapeHtml(attachment)}" target="_blank" rel="noopener">Attachment <span class="sr-only">(opens in a new tab)</span></a>` : ''}</small></div><span class="bill-amount">${formatMoney(bill.amount)}</span><span class="bill-category">${escapeHtml(bill.category)}</span><div class="bill-actions"><button class="paid-button" type="button" data-paid-id="${escapeHtml(bill.id)}">Mark paid</button><button class="quiet" type="button" data-edit-id="${escapeHtml(bill.id)}">Edit</button><button class="quiet danger" type="button" data-delete-id="${escapeHtml(bill.id)}">Delete</button></div></article>`;
}

function cashView(planned: Bill[]): string {
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() + offset);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const amount = planned.filter((bill) => bill.dueDate === key).reduce((sum, bill) => sum + bill.amount, 0);
    return { key, amount };
  });
  const max = Math.max(...days.map((day) => day.amount), 1);
  const total = days.reduce((sum, day) => sum + day.amount, 0);
  return `<section class="cash-view" aria-labelledby="cash-title"><h2 id="cash-title">Cash needed by day</h2><p class="cash-total">${formatMoney(total)} <small>in seven days</small></p><div class="cash-chart" aria-label="Seven-day amount chart">${days.map((day) => { const level = Math.max(0, Math.ceil((day.amount / max) * 10)); return `<div class="cash-day"><div class="cash-bar height-${level}" title="${escapeHtml(formatMoney(day.amount))}"></div><strong>${escapeHtml(formatMoney(day.amount))}</strong><span>${escapeHtml(formatDate(day.key, { weekday: 'short', day: 'numeric' }))}</span></div>`; }).join('')}</div><p>Overdue bills stay in the due-date view. This chart covers today through the next six days.</p></section>`;
}

function paidView(paid: Bill[]): string {
  return `<details class="paid-section"><summary>Paid history (${paid.length})</summary>${paid.length ? `<div class="paid-list">${paid.map((bill) => `<div class="paid-row"><span><span class="paid-check" aria-hidden="true">✓</span> <strong>${escapeHtml(bill.vendor)}</strong><br><small>Paid ${escapeHtml(formatDate(bill.paidAt, { month: 'short', day: 'numeric', year: 'numeric' }))}</small></span><strong>${formatMoney(bill.amount)}</strong><span><button class="quiet" type="button" data-edit-id="${escapeHtml(bill.id)}">Edit</button><button class="quiet danger" type="button" data-delete-id="${escapeHtml(bill.id)}">Delete</button></span></div>`).join('')}</div>` : '<p>Paid bills will appear here after you confirm them.</p>'}</details>`;
}

function dialogs(): string {
  return `<dialog id="bill-dialog" aria-labelledby="bill-dialog-title"><div class="dialog-head"><h2 id="bill-dialog-title">Add a planned bill</h2><button class="quiet" type="button" data-close-dialog aria-label="Close bill form">Close</button></div><form id="bill-form" class="dialog-body" novalidate><input type="hidden" name="bill-id"><div class="form-grid"><div class="field full"><label for="vendor">Vendor</label><input id="vendor" name="vendor" required maxlength="100" autocomplete="organization"></div><div class="field"><label for="amount">Amount in USD</label><input id="amount" name="amount" required type="number" min="0.01" step="0.01" inputmode="decimal"></div><div class="field"><label for="due-date">Due date</label><input id="due-date" name="due-date" required type="date"></div><div class="field"><label for="category">Category</label><select id="category" name="category"><option>Utilities</option><option>Rent</option><option>Supplies</option><option>Software</option><option>Insurance</option><option>Tax</option><option>Uncategorised</option></select></div><div class="field"><label for="attachment">Attachment link</label><input id="attachment" name="attachment" type="url" inputmode="url" placeholder="https://"><p class="field-hint">Add a link to a file you already control.</p></div><div class="field full"><label for="notes">Notes</label><textarea id="notes" name="notes" maxlength="300"></textarea></div></div><p class="form-error" id="bill-form-error" role="alert"></p><div class="dialog-actions"><button class="quiet" type="button" data-close-dialog>Cancel</button><button class="primary" type="submit">Save bill</button></div></form></dialog>
  <dialog id="paid-dialog" aria-labelledby="paid-title"><div class="dialog-head"><h2 id="paid-title">Confirm this payment</h2><button class="quiet" type="button" data-close-dialog aria-label="Close payment form">Close</button></div><form id="paid-form" class="dialog-body"><p><strong id="paid-vendor"></strong> · <span id="paid-amount"></span></p><p>This records your confirmation only. It does not move money.</p><input id="paid-id" type="hidden" name="paid-id"><div class="field"><label for="paid-date">Paid date</label><input id="paid-date" name="paid-date" type="date" required></div><div class="dialog-actions"><button class="quiet" type="button" data-close-dialog>Keep planned</button><button class="primary" type="submit">Confirm paid</button></div></form></dialog>
  <dialog id="delete-dialog" aria-labelledby="delete-title"><div class="dialog-head"><h2 id="delete-title">Delete this bill?</h2><button class="quiet" type="button" data-close-dialog aria-label="Close delete form">Close</button></div><form id="delete-form" class="dialog-body"><p><strong id="delete-vendor"></strong> will be removed from this board.</p><input id="delete-id" type="hidden" name="delete-id"><div class="dialog-actions"><button class="quiet" type="button" data-close-dialog>Keep bill</button><button class="primary danger" id="confirm-delete" type="submit">Delete bill</button></div></form></dialog>`;
}

function downloadCsv(bills: Bill[]): void {
  const blob = new Blob([billsToCsv(bills)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `bills-due-board-${todayString()}.csv`; document.body.append(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); showToast(`Exported ${bills.length} ${bills.length === 1 ? 'bill' : 'bills'} to CSV.`);
}

function showToast(message: string, action?: () => void | Promise<void>, actionLabel = 'Undo'): void {
  document.querySelector('#app-toast')?.remove(); window.clearTimeout(toastTimer);
  const toast = document.createElement('div'); toast.className = 'toast'; toast.id = 'app-toast'; toast.setAttribute('role', 'status'); toast.innerHTML = `<span>${escapeHtml(message)}</span>${action ? `<button type="button">${escapeHtml(actionLabel)}</button>` : '<button type="button" aria-label="Dismiss message">Close</button>'}`;
  toast.querySelector('button')?.addEventListener('click', () => { if (action) void action(); toast.remove(); }); document.body.append(toast); toastTimer = window.setTimeout(() => toast.remove(), action ? 8000 : 5000);
}

async function verifyLicense(token: string): Promise<LicenseState> {
  const response = await fetch(`https://api.sociobot.in/api/v1/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('License check failed.');
  const result = await response.json() as { valid: boolean; reason?: string };
  const state = result.valid ? { unlocked: true, message: 'Your license is active. Your board has no active-bill limit.' } : { unlocked: false, message: 'This license is not active. Check the token or buy a new license.' };
  localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ ...state, checkedAt: Date.now() }));
  return state;
}

type LicenseSnapshot = { state: LicenseState; token?: string; needsVerification: boolean; hasCachedVerdict: boolean };

function currentLicenseState(): LicenseSnapshot {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return { state: { unlocked: false, message: 'A $19 one-time license removes the active-bill limit.' }, needsVerification: false, hasCachedVerdict: false };
  try {
    const cached = JSON.parse(localStorage.getItem(LICENSE_CACHE_KEY) ?? 'null') as { unlocked: boolean; message: string; checkedAt: number } | null;
    if (cached && typeof cached.unlocked === 'boolean' && typeof cached.message === 'string' && typeof cached.checkedAt === 'number') {
      return { state: { unlocked: cached.unlocked, message: cached.message }, token, needsVerification: Date.now() - cached.checkedAt >= 86400000, hasCachedVerdict: true };
    }
  } catch { localStorage.removeItem(LICENSE_CACHE_KEY); }
  return { state: { unlocked: false, message: 'Checking your license…' }, token, needsVerification: true, hasCachedVerdict: false };
}

async function refreshLicenseInBackground(snapshot: LicenseSnapshot, apply: (state: LicenseState) => void): Promise<void> {
  if (!snapshot.token) return;
  try { apply(await verifyLicense(snapshot.token)); }
  catch {
    if (!snapshot.hasCachedVerdict) apply({ unlocked: false, message: 'The license could not be checked. Go online and try again.' });
  }
}

function acceptReturnedLicense(): void {
  const url = new URL(location.href); const token = url.searchParams.get('license'); if (!token) return;
  localStorage.setItem(LICENSE_KEY, token); localStorage.removeItem(LICENSE_CACHE_KEY); url.searchParams.delete('license'); history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function setupPwa(): void {
  window.addEventListener('online', () => { const banner = document.querySelector<HTMLElement>('#offline-banner'); if (banner) banner.hidden = true; showToast('You are back online.'); });
  window.addEventListener('offline', () => { const banner = document.querySelector<HTMLElement>('#offline-banner'); if (banner) banner.hidden = false; });
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showToast('An update is ready. Reload to use it.', () => location.reload(), 'Reload'); }); });
  }).catch(() => showToast('Offline setup failed. Reload while online to try again.')));
}

window.addEventListener('popstate', () => void render());
acceptReturnedLicense();
setupPwa();
void render();
