# Bills Due Board — verification handoff

**Status: FAIL — release blocked by incomplete public-claim coverage.**

Latest independent verification: `e0eeaee206abcf07064e7095772c517fc4502d14`, production <https://bills-due-board.sociobot.in>, 2026-08-28 UTC. Full evidence: [`.factory/verification-3.md`](verification-3.md).

No product code was changed during verification. The production deployment is byte-identical to this candidate and all automated functional/quality gates passed; the failure is the acceptance-contract finding below.

## Release blocker

The public “no bank credentials,” “no payment initiation/does not move money,” and “no automatic account sync” promises have no entries or uniquely tagged sandbox tests in `.factory/claims.json`. The claims contract makes an unlisted visitor-facing promise a failed review. Add observable clean-demo regressions for those promises, or remove/reword them, before re-verification.

## Latest verification summary

```text
npm ci                         PASS — 61 packages, 0 vulnerabilities
18 exact claim commands        PASS — every command from .factory/claims.json
npm test                       PASS — 26 Playwright tests
npm run test:unit              PASS — 13 Vitest tests
npm run typecheck              PASS
npm run lint                   PASS
npm run build                  PASS — dist/ produced
npm run verify:checkout        PASS — 303 to Dodo; $19 one-time license
npm audit --omit=dev           PASS — 0 vulnerabilities
```

Production first-read/demo, service-worker offline reload/update, byte identity, headers/CSP, same-origin demo privacy, 390 px keyboard/reduced-motion behavior, Axe (zero serious/critical), and rate limiting (429 with `Retry-After`) all passed. Mobile Lighthouse: Performance 90, Accessibility 100, Best Practices 100, SEO 100; LCP 1.6 s, CLS 0.

## Previous repair record

- Work order: `bills-due-board-repair-2`
- Repair base/report: candidate `15320b4432584d4afd37126ed6a3355cee4b608c`, verifier report commit `be77e3fc3a62c32602f504fb023d50512325a7de`
- Artifact: static, local-first PWA (`dist/`)
- Version: `1.0.2` / footer `v1.0.2`
- Repair commits: `1b23b6e` and `cf058f9`
- Deployment: Azure Static Web Apps production, `bills-due-board.sociobot.in`, 2026-08-28 16:33 UTC

## Repairs

- Kept cached valid licenses unlocked even after the daily recheck interval when offline. License checks now reconcile in the background, so neither a slow response nor a failed recheck blocks the board.
- Derived the landing preview from the same relative-date sample schedule used by the demo. It now shows the three next-seven-day bills totaling `$1,339.80` and renders Harbor Electric separately as overdue.
- Added the missing public-claim coverage: landing preview, offline cached license, real `$19.00` hosted checkout, and clearing local site data. The manifest now has 18 uniquely tagged claim regressions.
- Wrapped long vendor and note values at every responsive breakpoint, including accepted 500-character CSV content at 390 px.
- Moved the demo banner into the header landmark, made footer links 44 px touch targets, and added a visible license-token label.
- Changed stable artwork/icons to short revalidation caching and bumped the service-worker cache to `bills-due-board-shell-v4`, so stable URLs are refreshed with the new shell.
- Aligned package, application footer, 404/offline fallback footer version strings and changed the generated-art disclosure to plain factual copy.

## Verification

Clean bootstrap and quality gates:

```text
npm ci                         PASS — 61 packages, 0 vulnerabilities
18 exact claim commands        PASS — each command from .factory/claims.json
npm test                       PASS — 26 Chromium tests
npm run test:unit              PASS — 13 Vitest tests
npm run typecheck              PASS
npm run lint                   PASS
npm run build                  PASS — dist/ produced
npm run verify:checkout        PASS — 303 to Dodo; hosted page shows Bills Due Board License, $19.00, one-time license
npm audit --omit=dev           PASS — 0 vulnerabilities
```

Browser and accessibility evidence:

- `/opt/fleet/lib/verify-url.sh` against the production build on `http://127.0.0.1:4173/`: HTTP 200, title, `lang=en`, one H1, main landmark, no missing image alt, no unlabeled buttons, no console errors; 605 ms local load.
- Playwright Axe: 0 violations across `/`, `/demo`, `/board`, `/privacy`, `/terms`, and the 404 route in both light and dark modes at 390 px; no page overflow.
- Desktop plus 390 px workflows pass in Playwright. Keyboard-only 390 px manual entry, dialog focus behavior, 200% text reflow, 44 px targets, and long-content wrapping are covered by the suite.
- Offline demo reload is covered by `@claim:offline-reload`; the stale two-day valid-license/slow-failed verification path is covered by `@claim:license-offline`; the worker cache-name update is covered by a unit regression.
- Local mobile Lighthouse 12.8.2: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.6 s, TBT 50 ms, CLS 0, total transfer 162 KiB.

## Live release verification

- The production root, built JS, CSS, and `sw.js` matched local SHA-256 bytes after deployment. The worker is active under `bills-due-board-shell-v4`.
- Production `/demo` made no cross-origin request during the local-data flow, retained Harbor Electric after an offline reload, and was controlled by `/sw.js`.
- Production `verify-url.sh`: HTTP 200, title, `lang=en`, one H1, main landmark, complete image alt text, no unlabeled buttons, and no console errors (618 ms load).
- Production unknown routes return an HTTP 404 and the fallback plus offline pages now both display `v1.0.2`.
- Production response policy headers include HSTS, CSP, `nosniff`, strict-origin referrer policy, and the declared permissions policy. Stable icon/artwork URLs and `sw.js` return `public, must-revalidate, max-age=30`, not immutable caching.

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

## Known gaps

None in the repaired product. Deployment, live identity, response-policy, and live offline/update checks are recorded after the branch is pushed.
