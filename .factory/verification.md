# Independent product verification

**Verdict: FAIL**

- Candidate: `8734d03f2989f1e1d932be9a44db5cc7f671ed0e`
- Branch: `main`
- Live URL: <https://bills-due-board.sociobot.in>
- Verified: 2026-08-28 14:31 UTC
- Work order: `bills-due-board-verify-1`

The static deployment is live and byte-for-byte matches the candidate build. The earlier deployment-only concern is therefore resolved. Release is still blocked by a broken live purchase path, silent financial-input corruption, cross-tab data loss, a failing repository test command, and incomplete claim coverage.

## Mandatory first gates

### First-read test

**Pass.** In a cold 1440×900 browser the first screen says:

- What it does: “See every bill by due date.”
- Who it is for: “For solo operators who need one place to review bills and confirm each payment.”
- What to click first: “Try it with sample data,” next to “The sample opens a separate demo board.”

The action is visible in the initial viewport. One click opened `/demo`, immediately showed five planned bills and one paid bill, and displayed the persistent “Demo — sample data, nothing is saved to your board” banner with **Reset demo** and **Start for real**. Evidence: `qa-artifacts/live-first-read-desktop.png` and `qa-artifacts/live-demo-after-one-click.png`.

### Claim tests

The untouched clone had no installed dependencies, so the literal claim commands initially could not resolve `@playwright/test`. After the required clean-clone bootstrap (`npm ci`, 61 packages, 0 vulnerabilities), every exact command in `.factory/claims.json` passed independently through the local production demo entry point.

| Claim ID | Result | Observable test evidence |
| --- | --- | --- |
| `offline-reload` | Pass | Service worker controlled `/demo`; offline reload retained Harbor Electric. |
| `csv-export` | Pass | Download contained the required header and six sample rows. |
| `csv-import` | Pass | Valid Cedar Print row appeared and import success was announced. |
| `paid-confirmation` | Pass | Harbor Electric moved to paid history after confirmation. |
| `cash-week` | Pass | Seven day cells rendered with non-zero sample data. |
| `due-order` | Pass | Five planned vendors were in date order with Overdue first. |
| `encrypted-storage` | Pass | IndexedDB held ciphertext and no clear Harbor Electric field/value. |
| `demo-isolation` | Pass | Starting the real board showed an empty queue and no sample vendor. |
| `free-limit` | Pass | An 11-active-bill import was rejected atomically. |
| `local-privacy` | Pass | The tested demo flow made no cross-origin request. |
| `license-verify` | Pass | Mocked valid token was stored, URL-cleaned, verified once, and shown active. |

Each ID appears exactly once as `@claim:<id>` in `tests/product.spec.ts`.

## Clean-clone checks

| Command | Result |
| --- | --- |
| `npm ci` | Pass — 61 packages; 0 audit vulnerabilities. |
| `npm test` | Pass — 13/13 Playwright tests in 24.2 s. |
| `npm run test:unit` | **Fail** — Vitest collects `tests/product.spec.ts`; Playwright aborts with “Playwright Test did not expect test() to be called here.” No unit tests run. |
| `npx tsc --noEmit` | Pass. |
| `npm run build` | Pass — exact production command produced `dist/`. |
| `npm audit --omit=dev` | Pass — 0 vulnerabilities. |

No lint script is present.

## Deployment identity and browser policies

The live build matches the candidate produced locally:

| Artifact | SHA-256 (local and live) |
| --- | --- |
| `index.html` | `1988989969de5d4363380f49068d59a87d38057ef8df56c8d4b6aabb201bb8d4` |
| `assets/index-DauB45_G.js` | `ac0044a36105003599a8b94b49edc1d526bdd433289fd36be51bf1710de974fc` |
| `assets/index-p-kKefKB.css` | `9f4beb9b8d08f90dbe13c5a0528be6c95f7f4914803157bbec78d9d5a5eb8e5d` |
| `sw.js` | `5a2180808fbebec793690a5b38691b58e90c4dc5b0fc19ea2c77004f89c8549a` |
| `manifest.webmanifest` | `b18fd13c49acd1bec0692761b12fd896eaa253f39f0043a5eb4c929f02fc34e9` |

`/`, `/demo`, `/board`, `/privacy`, `/terms`, metadata, icons, images, offline page, and explicit 404 page all returned 200. HTML and service worker use `public, must-revalidate, max-age=30`; hashed JS/CSS and `/assets/*` use one-year immutable caching. Live responses include HSTS, CSP, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation/payment restrictions. CSP allows only self-hosted scripts/styles/images plus the Sociobot verification connection. No third-party font or script request was observed.

The factory URL verifier passed: HTTP 200, title present, `lang=en`, one H1, one main landmark, no missing image alt, no unlabeled button, and no console error. Evidence: `qa-artifacts/verify-url-live/verify.json`.

## End-to-end behavior

Normal flows passed on the live site:

- Added a bill through a 390 px keyboard-only flow, including the native date field; it persisted after reload.
- Imported a valid CSV after a malformed-CSV error and saw the recovery row.
- Exported all demo rows, reviewed the exact seven-day sample total (`$1,339.80`), confirmed payment, reviewed paid history, and exercised the free limit.
- Manual blank-vendor and unsafe attachment-link errors were specific and remained in the dialog.
- Demo and real IndexedDB namespaces were isolated; records were ciphertext at rest.

Boundary/invalid testing did not pass overall; see high-severity findings.

## Accessibility and responsive review

- Desktop 1440×900 and mobile 390×844: no normal-width horizontal overflow, console errors, page errors, or failed resource requests.
- Axe on `/`, `/demo`, `/board`, `/privacy`, `/terms`, and the styled not-found view: 0 serious/critical findings. Light and dark schemes also had 0 axe color-contrast findings.
- Semantic checks passed: route-specific titles, `lang=en`, one H1, header/nav/main/footer landmarks, alt text, labels, native dialogs, alerts, skip link, and route announcements.
- Keyboard-only add flow passed. Focus opened on Vendor in the dialog, the Save action was reachable, and designed focus rings computed to 3 px ochre.
- Reduced-motion emulation matched and reduced the bill-row animation to `0.00001 s`.
- Touch target and 200% text-reflow requirements failed; see medium findings.

## Performance and PWA

Production output is within budget:

- Initial JS: 34.29 KB raw / 11.19 KB gzip (budget 200 KB).
- CSS: 15.72 KB raw / 4.29 KB gzip (budget 50 KB).
- Mobile hero WebP: 75,202 bytes (budget 300 KB).

Lighthouse 12.8.2 against the live mobile URL scored 100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO. FCP was 1.0 s, LCP 1.4 s, TBT 40 ms, and CLS 0. Evidence: `qa-artifacts/lighthouse-live-mobile.json`.

PWA checks:

- Chrome reports no installability error and reads the standalone manifest/start URL.
- Live service worker controlled the page with cache `bills-due-board-shell-v2`; `/demo` reloaded offline with sample data and the offline banner.
- `registration.update()` completed live. A controlled local update simulation changed the served worker bytes and produced the in-app “An update is ready” toast with a Reload action.
- The declared maskable icon is malformed; see medium findings.

## Privacy, outbound requests, and billing API

Cold landing, demo review, and the normal local board made same-origin requests only. Bill fields remained in encrypted IndexedDB. A supplied license token was the only tested value sent cross-origin, to the documented Sociobot verification endpoint. No sign-in exists, so Entra tenant validation is not applicable.

Rate limiting passes: a rapid burst to `GET /api/v1/products/bills-due-board/verify` returned 200 for requests 1–30, then 429 on request 31 with `Retry-After: 4`. CORS returned `Access-Control-Allow-Origin: https://bills-due-board.sociobot.in`.

The live checkout does not pass: `GET https://api.sociobot.in/api/v1/products/bills-due-board/checkout` returned HTTP 404 and `{"error":"enabled factory product","status":404}`.

## Findings

### High — release blocking

1. **The advertised purchase path is broken.** “Buy a license” points to the production Sociobot checkout, which returns HTTP 404 instead of checkout. The one-time paid flow cannot complete.

2. **Required financial values are silently coerced or corrupted.** Manual entry accepts a blank Amount as `$0.00`. It also accepts `0.001`, displays/exports `$0.00`, and loses the entered value. CSV import likewise accepts a blank amount as zero, accepts impossible `2030-02-31`, and silently changes an undocumented status such as `void` to `planned`. These records affect due totals without a corrective error. Reproduction: add Vendor + blank Amount + valid date; or import `vendor,amount,due_date\nBlank Amount,,2030-02-10`.

3. **Two open tabs silently lose bills.** Open `/board` in two tabs while empty; add “Tab A Bill” in the first, then “Tab B Bill” in the stale second tab. Reloading shows only Tab B Bill. The whole encrypted document is overwritten with no conflict notice or history.

4. **An advertised repository test command fails.** `npm run test:unit` is present but cannot run because Vitest collects the Playwright suite. This violates the requested all-checks gate even though the main Playwright suite passes.

5. **Public claims are missing from `.factory/claims.json`.** The landing/README/privacy copy additionally promises manual form entry, no analytics or third-party scripts, once-per-day license verification, an unlimited licensed queue, and free accessibility. These do not have corresponding claim entries with tagged observable tests. The existing cash-week claim test also checks only seven cells plus any non-zero amount, not the promised correct daily amounts. The claims contract defines unlisted or inadequately tested claims as a failing review.

### Medium

1. **Touch targets miss the 44 px baseline.** Live measurements include 42 px primary links, 38 px demo controls, and a 34×34 px mobile home mark. Mobile nav targets are adjacent with no 8 px gap.

2. **200% text sizing loses reflow.** At 390 px with root text doubled, the page becomes 428 px wide and every bill’s Delete control ends around x=428, outside the viewport. This requires horizontal scrolling and fails the no-loss text-resize requirement.

3. **Invalid/revoked license state is not persistently explained.** A real invalid returned token is stored, verified with HTTP 200/`valid:false`, and removed from the URL, but the panel continues to show only the default sales sentence. The invalid-state message is applied only when `license.unlocked` is true.

4. **CSV export permits spreadsheet formula injection.** Importing vendor `=1+1` and exporting produces a row beginning `=1+1,...` without neutralization. Opening exported data in spreadsheet software can evaluate formula-prefixed cells.

5. **The maskable PWA icon dimensions do not match the manifest.** `/icons/icon-maskable-512.png` is declared `512x512` but decodes as `512x444`. Installation remains available through the regular icons, but the maskable icon is invalid.

6. **Unknown routes are soft 404s.** `/not-a-real-route` renders the styled not-found view but returns HTTP 200, so the deployed site does not provide a real 404 response for unknown navigation URLs.

## Positive observations

The first-read/demo gate, primary bill queue, date ordering, cash-week calculation, paid confirmation, encrypted local storage, demo isolation, offline reload, service-worker update notification, responsive visual treatment, dark/light contrast, security headers, bundle budgets, and API rate limiting all performed well. The visual system is product-specific and matches `.factory/design.md`.

## Release decision

**FAIL. Do not release this candidate.** Resolve all high-severity findings, repair the billing registration/checkout, add regression tests for invalid amounts/dates/status and multi-tab writes, reconcile the claim manifest, then rerun the complete verification from a clean clone and the live URL.
