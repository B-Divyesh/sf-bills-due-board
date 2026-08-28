# Bills Due Board — repair handoff

**Status: deployed and verified.**

- Repair base: `77f4af5c45c6b52aac9fff721d3d972e348440e5`
- Product: `bills-due-board` (`pwa-offline`, static deployment)
- Work order: `bills-due-board-repair-1`

## Repairs

- The registered Sociobot checkout now starts a hosted payment session. `npm run verify:checkout` checks the real endpoint without following it and observed `303 → checkout.dodopayments.com` on 2026-08-28.
- Form and CSV parsing reject blank/zero amounts, fractions of a cent, impossible ISO dates, unknown statuses, unsafe links, and malformed paid dates. Values must be positive whole cents.
- Saves now take a browser Web Lock, reload the latest encrypted document inside that lock, and apply the operation to it. A `BroadcastChannel` refreshes the other open tab after a successful save.
- Vitest is restricted to `tests/unit/**/*.test.ts`; the Playwright suite is no longer collected by `npm run test:unit`.
- The claim manifest now covers manual entry, local privacy/no third parties, daily license verification, licensed capacity, free accessibility, and exact cash-week sample amounts. Every claim has exactly one tagged Playwright test.
- Invalid license results remain visible after reload. CSV exports prefix formula-like text cells with an apostrophe. The maskable icon is a real 512×512 PNG. Static routes explicitly rewrite known SPA routes and send unknown routes through the 404 response override.
- All controls now have a 46px minimum target to preserve a measured 44px baseline after layout rounding; bill actions wrap at 200% text size on 390px screens.

## Regression coverage

- `tests/unit/data-validation.test.ts`: financial/date/status validation, CSV formula neutralization, maskable-icon dimensions, 404 configuration, and claim-to-test mapping.
- `tests/product.spec.ts`: exact daily cash-week amounts; keyboard mobile manual entry; invalid form and CSV inputs; stale two-tab writes with `BroadcastChannel` disabled; unlimited licensed imports; unlicensed accessibility; invalid license persistence; formula-safe download; mobile targets and 200% reflow.
- `scripts/verify-checkout.mjs`: live checkout endpoint must return 302/303 to the hosted Dodo checkout.

## Local verification (2026-08-28)

```text
npm ci                         PASS — 61 packages, 0 vulnerabilities
npm run test:unit              PASS — 10 tests
npm run typecheck              PASS
npm run lint                   PASS
npm test                       PASS — 20 Chromium tests
npm run build                  PASS — dist/ produced
npm audit --omit=dev           PASS — 0 vulnerabilities
npm run verify:checkout        PASS — 303 → checkout.dodopayments.com
```

The Playwright suite covers desktop plus 390px mobile, keyboard form use, axe serious/critical findings on the core routes, offline demo reload, storage isolation/encryption, privacy request observation, and service-worker registration. The current production bundle is 36,123 bytes JS (11,730 gzip) and 15,935 bytes CSS (4,320 gzip); the mobile hero is 75,202 bytes.

## Live deployment verification (2026-08-28)

- Deployed `4ca9920dd29adbf76c33c11ea7fdd93d8b238286` with `/opt/fleet/lib/deploy-static.sh bills-due-board dist`; Azure deployment ID `65e4d0f1-ef7b-4380-bc24-d56515031cc0` completed successfully.
- The live home HTML SHA-256 is `2960ffb7fa62ede34ca015ba18dfb83cb9b25eb6cf896d1b6e0bcc7521b0b947`, exactly matching `dist/index.html`; it loads `assets/index-CsCQ_-SB.js`.
- Factory URL verification passed: HTTP 200, title, `lang=en`, one H1 and main landmark, no missing image alt or unlabeled buttons, and no console errors. Evidence: `.factory/qa-artifacts/repair-live/verify.json` and its desktop/mobile screenshots.
- Live `/not-a-real-route` returns HTTP 404 and `Page not found — Bills Due Board`. The live shell uses `must-revalidate, max-age=30`; hashed JS uses one-year immutable caching. CSP, HSTS, nosniff, strict-origin referrer policy, and the camera/microphone/geolocation/payment Permissions-Policy are present.
- Live 390px demo keyboard entry and offline reload both passed with `scrollWidth: 390` and no console errors. Live axe serious/critical counts were zero for `/`, `/demo`, `/board`, `/privacy`, `/terms`, and `/not-a-real-route`.
- Lighthouse 12.8.2, live mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.4 s, CLS 0. Evidence: `.factory/qa-artifacts/repair-live/lighthouse-mobile.json`.
- `npm run verify:checkout` passed after deployment: HTTP 303 to `checkout.dodopayments.com`.

## Run and deploy

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run lint
npm run build
npm run verify:checkout
```

The deployment artifact remains `dist/` with `index.html` at its root. Push `main` to use the existing static deployment configuration. Demo is `/demo`; it uses `demo:bills-due-board:v1` and is discarded on leaving or reset.

## Known gaps

None known.
