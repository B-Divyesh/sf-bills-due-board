# Bills Due Board — repair 3 handoff

**Status: repaired locally; production deployment verification follows the repair commit.**

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

Each new claim has exactly one manifest record and exactly one `@claim:<id>` browser test. The researched brief, product UI, PWA payload, storage behavior, pricing, and every previously passing behavior are unchanged.

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

- Vite emitted 36.89 KB JS (11.98 KB gzip) and 16.24 KB CSS (4.37 KB gzip), below the 200 KB and 50 KB budgets.
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

Pending the committed repair deployment. After deployment this section will record the deployed commit, response policy, artifact identity, live accessibility, privacy, offline/update, and route checks.

## Known gaps

None in the repaired product. The pending item is deployment and live verification, not implementation.
