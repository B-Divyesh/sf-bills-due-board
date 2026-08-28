# Bills Due Board — repair 3 handoff

**Status: repaired, verified, pushed, and deployed.**

- Work order: `bills-due-board-repair-3`
- Repair base/report: `913218ddc8d8d2e3f1a4bf03e4dd6c334e2d261b`
- Reported candidate: `e0eeaee206abcf07064e7095772c517fc4502d14`
- Independent report: [`.factory/verification-3.md`](verification-3.md)
- Artifact: static, local-first PWA (`dist/`)
- Production URL: <https://bills-due-board.sociobot.in>

## Release blocker repaired

The verifier found three visitor-facing scope/privacy promises that were absent from the required claims manifest. Before repair, each required command below exited 1 with `Error: No tests found`, and all three IDs were absent from `.factory/claims.json`.

- `bank-credentials` now enumerates “The app does not request bank credentials.” Its fresh-demo regression inventories every form control and accessible label, asserts the complete expected bill-field set, and rejects bank, routing, account, IBAN, SWIFT, card, CVV, PIN, or password fields.
- `payment-initiation` now enumerates “Marking a bill paid does not initiate a payment or move money.” Its fresh-demo regression instruments `PaymentRequest` and all network traffic around confirmation, then proves the bill changes only in local paid history with zero API calls or requests.
- `account-sync` now enumerates “The app does not automatically sync financial accounts.” Its fresh-demo regression instruments cross-origin traffic and WebSockets, adds a bill, waits, reloads, and proves local persistence with zero external requests or socket connections.

Each new claim has exactly one manifest record and exactly one `@claim:<id>` browser test. The researched brief, product workflow, storage behavior, pricing, and every previously passing behavior are unchanged.

The comprehensive live target audit also found that the focused skip link measured 42 px high and legal-page email links measured 17 px high. Both now use a 44 px minimum target, with regression coverage on the 390 px viewport. This accessibility hardening does not change product behavior.

## Verification evidence

Clean bootstrap and complete gates:

```text
npm ci                         PASS — 61 packages, 0 vulnerabilities
21 exact claim commands        PASS — 20 tagged Chromium commands plus hosted checkout
npm test                       PASS — 29/29 Chromium tests
npm run test:unit              PASS — 13/13 Vitest tests
npm run typecheck              PASS
npm run lint                   PASS
npm run build                  PASS — dist/ produced
npm run verify:checkout        PASS — 303 to Dodo; $19.00 one-time Bills Due Board license
npm audit --omit=dev           PASS — 0 vulnerabilities
```

Production-build and browser evidence:

- Vite emitted 36.89 KB JS (11.98 KB gzip) and 16.38 KB CSS (4.40 KB gzip), below the 200 KB and 50 KB budgets.
- `/opt/fleet/lib/verify-url.sh` against `http://127.0.0.1:4173/` passed in 591 ms: HTTP 200, correct title, `lang=en`, one H1, one main landmark, zero missing image alts, zero unnamed buttons, and zero console errors.
- Playwright covers desktop and 390 px mobile, keyboard-only manual entry, dialog operation, 44 px targets, 200% text reflow, long-value wrapping, error recovery, two-tab writes, privacy, license states, and formula-safe export.
- Playwright Axe found zero violations on `/`, `/demo`, `/board`, `/privacy`, and `/terms`. The unlicensed board retains accessible core controls.
- Offline reload after service-worker control retained the demo queue. The cached-license offline regression and service-worker update behavior remain covered.
- Privacy regressions found no analytics, third-party scripts, bill-record egress, payment requests, cross-origin account-sync traffic, or sockets in their instrumented demo flows.
- Local mobile Lighthouse 12.8.2: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.6 s, TBT 20 ms, CLS 0. Lighthouse logged a post-capture tab crash but wrote a complete valid report, matching the known verifier behavior.
- Evidence is under [`.factory/qa-artifacts/repair-3-local/`](qa-artifacts/repair-3-local/), including desktop/mobile screenshots, URL-verifier output, and the Lighthouse JSON.

## How to run

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run lint
npm run build
npm run verify:checkout
npm run preview
```

Use `/demo` for the isolated sample workspace. It stores encrypted sample data in `demo:bills-due-board:v1`; the real board stays in `bills-due-board:v1`.

## Deployment and live checks

- Repair commits: `491ef95` (claims and exact regressions) and `8aaca6b` (44 px target hardening), both pushed to `origin/main`.
- Deployed 2026-08-28 UTC to the configured Azure Static Web Apps production resource `sf-bills-due-board`; the custom domain is <https://bills-due-board.sociobot.in>.
- `/`, `/demo`, `/board`, `/privacy`, and `/terms` return HTTP 200. An unknown route returns the styled fallback with HTTP 404.
- The live root, hashed JS, hashed CSS, `sw.js`, and `manifest.webmanifest` are byte-identical to local `dist/`:

```text
index.html                       b2a6694fd8f1fb979b5b2a0b4c0bcef7838934b307061ce7e1ee08a3d5695d64
assets/index-CNpeEy-G.js         0d32925b54a4429fad746cda72fce1a70239746c657e50b68013abd290be4e1d
assets/index-BiTrG3yN.css        da0186fc96f13cb14b8afa118da51542b286168525128b5de1c722c56fc9d49d
sw.js                            2fa4d3345c70cb3aefd39e314c227a4a853b00498868a4b2674910e8ac8e0a42
manifest.webmanifest             0e9ec6e5445b356e1faa4b24ce5751e88f556abc3bfd7781d619ad9d0087a890
```

- Production `verify-url.sh` passed in 602 ms with the expected title, `lang=en`, one H1, one main, complete alt text, named buttons, and zero console errors. Evidence is in [`.factory/qa-artifacts/repair-3-live/`](qa-artifacts/repair-3-live/).
- A 12-case live matrix covered all normal routes plus the real 404 at 1440×900 and 390×844. Normal routes had zero console/page/request errors, zero serious/critical Axe issues, zero cross-origin requests, and zero horizontal overflow. The only small-element exception is the intentionally hidden 1×1 file input operated by the visible 46 px **Import CSV** button.
- The live 390 px keyboard path focused **Add a bill** with a 3 px ochre outline, opened the dialog with Enter, moved focus to Vendor, saved a bill, and retained it after reload. Focused skip and legal email targets now measure exactly 44 px. At 200% text size, horizontal overflow remained zero.
- Reduced-motion live rendering reports the expected `0.00001s` animation duration. The active service worker is `/sw.js`, its cache is `bills-due-board-shell-v4`, `registration.update()` completes, and an offline reload retains both Harbor Electric and the offline status banner without errors.
- Live responses include HSTS, restrictive CSP, `nosniff`, strict-origin referrer policy, and a permissions policy disabling camera, microphone, geolocation, and payment. HTML and the worker use 30-second revalidation caching.
- The final Sociobot checkout check still redirects to the Dodo-hosted Bills Due Board page showing `$19.00` and “One-time license.” No deployment token or provider secret is present in the tree; the CLI-created credential cache was deleted after deployment.

## Known gaps

None known.
