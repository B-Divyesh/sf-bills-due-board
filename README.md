# Bills Due Board

See every bill by due date, then confirm each payment.

Bills Due Board is for solo operators who need a small payable queue beside their finance tool. It is a local-first PWA, not an accounting ledger or payment service.

Live site: <https://bills-due-board.sociobot.in>

One-click demo: <https://bills-due-board.sociobot.in/demo>

## What it does

- Adds planned bills by form or CSV import.
- Sorts unpaid bills into overdue, next seven days, and later.
- Shows the amount due on each of the next seven days.
- Confirms a paid date and keeps paid history.
- Exports every bill as CSV.
- Stores bill records in an encrypted IndexedDB document.
- Reloads offline after the first online visit.

The demo uses a separate storage database. It does not read or write the real board. The automated claim tests verify these statements from a fresh browser context.

## Free and paid use

The free board holds 10 active bills. CSV import, CSV export, offline use, and accessibility remain free.

A $19 one-time license removes the active-bill limit. Checkout and license verification use the Sociobot billing API. The factory registers the product before release, so this repository contains no provider keys or product ID.

## Run locally

Requirements: Node.js 20 or newer and npm.

```sh
npm install
npm run dev
```

Open `http://localhost:5173/demo` for the sample workspace.

## Test and build

Playwright 1.58.2 is pinned. The worker image already provides its Chromium browser.

```sh
npm test
npm run test:unit
npm run typecheck
npm run lint
npm run build
npm run verify:checkout
```

The exact production build command is `npm run build`. It writes `dist/index.html` and the static PWA files under `dist/`.

Each public claim and its tagged test lives in [`.factory/claims.json`](.factory/claims.json). Run one claim with:

```sh
npm test -- --grep @claim:offline-reload
```

## CSV format

Required columns are `vendor`, `amount`, and `due_date`. Dates use `YYYY-MM-DD`.

Optional columns are `category`, `attachment`, `notes`, `status`, and `paid_date`. Valid status values are `planned` and `paid`.

## Privacy and limits

The app does not request bank credentials or initiate payments. Bill records remain in browser storage unless you export them. A license token is sent to Sociobot for verification at most once per day.

See the in-app `/privacy` and `/terms` pages. Clearing site data removes the board and saved license from that browser.

## Deploy

Deploy the contents of `dist/` as a static site. `staticwebapp.config.json` supplies SPA routing, security headers, and a short revalidation policy for stable assets. The factory owns DNS, billing registration, and deployment.

## License

MIT. See [LICENSE](LICENSE).
