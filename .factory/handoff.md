# Bills Due Board — build handoff

Work order: `bills-due-board-build-1`

Completed: 28 August 2026

Build: `v1.0.0`

## What shipped

- A responsive Vite and TypeScript PWA at `/`, with real board, demo, privacy, terms, offline fallback, and styled 404 routes.
- Manual bill entry and editing with vendor, amount, due date, category, attachment link, and notes.
- CSV import and export, including clear row and header errors.
- Due-date groups for overdue, next seven days, and later.
- A seven-day cash view with daily amounts.
- Explicit paid confirmation, paid date, paid history, delete confirmation, and an eight-second undo action.
- AES-GCM encrypted bill documents in IndexedDB. Demo and real records use separate databases.
- A one-click demo with six relative-date sample bills, reset, and start-for-real controls.
- A service worker with a versioned shell cache, offline navigation, and update notice.
- A $19 one-time paid tier. The free tier supports 10 active bills. Returned licenses are stored, verified through Sociobot, cached for one day, and restorable by paste.
- Original generated hero art, responsive WebP derivatives, Open Graph art, app icons, and documented provenance.
- Metadata, manifest, sitemap, robots rules, security headers, privacy terms, MIT license, and product documentation.

## Verification

Commands run from `/work/repo`:

```sh
npm install
npm test
npm run build
npm audit --omit=dev
```

Results:

- Playwright: 13 passed. All 11 entries in `.factory/claims.json` have exactly one tagged test.
- Axe through Playwright: no serious or critical findings on `/`, `/demo`, `/privacy`, or `/terms`.
- Factory URL verifier: passed with no console errors; title, `lang`, one `h1`, `main`, image alt text, and button labels present.
- Offline: `/demo` reloaded with its sample queue after `context.setOffline(true)`.
- Production build: passed; `dist/index.html` exists.
- Initial application JS: 34.29 KB raw, 11.19 KB gzip.
- Initial CSS: 15.76 KB raw, 4.29 KB gzip.
- Mobile hero image: 74 KB WebP. Desktop hero image: 155 KB WebP.
- `npm audit --omit=dev`: 0 vulnerabilities.

Lighthouse 12.8.2, local production preview, mobile defaults:

| Category or metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First Contentful Paint | 0.9 s |
| Largest Contentful Paint | 2.0 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |

Evidence is in `.factory/evidence/`. The copy audit is in `.factory/copy-audit.md`.

## Known gaps and release steps

- Amounts use USD in v1. Currency selection is the clearest next addition for international users.
- Attachment support stores links, not uploaded file contents.
- Browser encryption prevents plain-text IndexedDB records. It is not a passphrase vault because the browser profile also stores the non-exportable key.
- The factory must register `bills-due-board` in the Sociobot billing service before the buy link can complete a live checkout.
- The app does not post payments to a ledger or sync bank data. This is an intentional product boundary.

## Deploy

Run `npm run build` and deploy `./dist`. Do not deploy the repository root. The static host should honor `staticwebapp.config.json` for SPA fallback and security headers.
