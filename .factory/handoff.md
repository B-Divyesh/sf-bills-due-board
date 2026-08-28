# Bills Due Board — repair handoff

**Status: locally verified; live deployment verification follows the pushed commit.**

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

None in the local repair. The final live URL/response-policy/identity evidence is recorded in the follow-up deployment commit.
