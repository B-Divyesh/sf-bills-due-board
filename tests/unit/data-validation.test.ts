import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { billsToCsv, csvToBills } from '../../src/csv';
import type { Bill } from '../../src/types';
import { isCalendarDate, parseCurrencyAmount } from '../../src/validation';
import viteConfig from '../../vite.config';

describe('financial input validation', () => {
  it('rejects blank, zero, negative, fractional-cent, and non-numeric amounts', () => {
    for (const value of ['', ' ', '0', '0.00', '-1', '0.001', 'twelve']) {
      expect(parseCurrencyAmount(value), value).toBeNull();
    }
    expect(parseCurrencyAmount('12')).toBe(12);
    expect(parseCurrencyAmount('12.3')).toBe(12.3);
    expect(parseCurrencyAmount('12.34')).toBe(12.34);
  });

  it('accepts only real ISO calendar dates', () => {
    expect(isCalendarDate('2030-02-28')).toBe(true);
    expect(isCalendarDate('2030-02-31')).toBe(false);
    expect(isCalendarDate('2030-13-01')).toBe(false);
    expect(isCalendarDate('02/28/2030')).toBe(false);
  });

  it.each([
    ['blank amount', 'Blank Amount,,2030-02-10,Utilities,,,planned,', 'invalid amount'],
    ['fractional cents', 'Tiny Amount,0.001,2030-02-10,Utilities,,,planned,', 'invalid amount'],
    ['impossible date', 'Bad Date,10.00,2030-02-31,Utilities,,,planned,', 'invalid due date'],
    ['unknown status', 'Void Bill,10.00,2030-02-10,Utilities,,,void,', 'invalid status'],
  ])('rejects CSV rows with %s', (_name, row, message) => {
    const csv = `vendor,amount,due_date,category,attachment,notes,status,paid_date\n${row}`;
    expect(() => csvToBills(csv)).toThrow(message);
  });
});

describe('CSV export safety', () => {
  it('neutralizes spreadsheet formulas in text cells', () => {
    const now = new Date().toISOString();
    const bill: Bill = {
      id: 'formula', vendor: '=1+1', amount: 10, dueDate: '2030-02-10', category: '+cmd',
      attachment: '', notes: '@SUM(A1:A2)', status: 'planned', paidAt: '', createdAt: now, updatedAt: now,
    };
    const csv = billsToCsv([bill]);
    expect(csv).toContain("'=1+1,10.00,2030-02-10,'+cmd,,");
    expect(csv).toContain("'@SUM(A1:A2)");
    expect(csv.split('\r\n')[1]).not.toMatch(/^[=+\-@\t\r]/);
  });
});

describe('release configuration', () => {
  it('ships a square 512px maskable icon', () => {
    const png = readFileSync('public/icons/icon-maskable-512.png');
    expect(png.toString('ascii', 1, 4)).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(512);
    expect(png.readUInt32BE(20)).toBe(512);
  });

  it('returns the real 404 page for unknown static routes', () => {
    const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
      routes: Array<{ route: string; statusCode?: number }>;
      responseOverrides: Record<string, { rewrite: string }>;
    };
    expect(config.routes.at(-1)).toEqual({ route: '/*', statusCode: 404 });
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });

  it('does not mark stable icon or artwork URLs as immutable', () => {
    const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
      routes: Array<{ route: string; headers?: Record<string, string> }>;
    };
    for (const route of config.routes.filter((entry) => entry.route === '/assets/*' || entry.route === '/icons/*')) {
      expect(route.headers?.['cache-control']).not.toContain('immutable');
      expect(route.headers?.['cache-control']).toContain('must-revalidate');
    }
  });

  it('caches only generated content-hashed bundles as immutable for one year', () => {
    const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
      routes: Array<{ route: string; headers?: Record<string, string> }>;
    };
    const immutable = config.routes.find((entry) => entry.route === '/immutable/*');
    const stableAssets = config.routes.find((entry) => entry.route === '/assets/*');

    expect(viteConfig.build?.assetsDir).toBe('immutable');
    expect(immutable?.headers?.['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(config.routes.indexOf(immutable!)).toBeLessThan(config.routes.indexOf(stableAssets!));
    expect(stableAssets?.headers?.['cache-control']).toBe('public, must-revalidate, max-age=30');
    expect(config.routes.filter((entry) => entry.headers?.['cache-control']?.includes('immutable')))
      .toEqual([immutable]);
  });

  it('versions the service-worker shell cache when stable assets are refreshed', () => {
    const worker = readFileSync('public/sw.js', 'utf8');
    expect(worker).toContain("const CACHE_NAME = 'bills-due-board-shell-v5'");
    expect(worker).toContain('(?:assets|immutable)');
    expect(worker).toContain("keys.filter((key) => key !== CACHE_NAME)");
  });

  it('uses the same release version in package and fallback pages', () => {
    const version = JSON.parse(readFileSync('package.json', 'utf8')).version as string;
    expect(version).toBe('1.0.3');
    for (const page of ['public/404.html', 'public/offline.html']) {
      expect(readFileSync(page, 'utf8')).toContain(`v${version}`);
    }
  });

  it('maps every public claim to exactly one tagged regression test', () => {
    const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string; test: string }>;
    const browserTests = readFileSync('tests/product.spec.ts', 'utf8');
    for (const claim of claims) {
      const expectedBrowserCommand = `npm test -- --grep @claim:${claim.id}`;
      const source = claim.test === expectedBrowserCommand ? browserTests : readFileSync('scripts/verify-checkout.mjs', 'utf8');
      expect([expectedBrowserCommand, 'npm run verify:checkout']).toContain(claim.test);
      expect(source.match(new RegExp(`@claim:${claim.id}(?![-\\w])`, 'g')) ?? [], claim.id).toHaveLength(1);
    }
  });
});
