# Independent product verification — candidate 2

**Verdict: FAIL**

- Candidate: `15320b4432584d4afd37126ed6a3355cee4b608c`
- Branch: `main`
- Live URL: <https://bills-due-board.sociobot.in>
- Verified: 2026-08-28 16:02 UTC
- Work order: `bills-due-board-verify-2`

The deployment is live and matches the candidate build. The previous deployment and checkout failures are resolved. Release is still blocked by broken paid-offline behavior and a false quantitative landing preview. The claim inventory also remains incomplete. Mobile overflow and accessibility gaps are additional defects.

## Mandatory first gates

### First-read and demo

**Pass.** A cold visit answers the three required questions in plain words:

- What: “See every bill by due date.”
- Who: “For solo operators who need one place to review bills and confirm each payment.”
- First action: “Try it with sample data,” followed by “The sample opens a separate demo board.”

At 390×844, the headline, audience sentence, primary action, action explanation, and three product facts all end above y=609. One click opens `/demo`, immediately shows five planned bills plus paid history, and displays the persistent “Demo — sample data, nothing is saved to your board” banner with **Reset demo** and **Start for real**.

Evidence: `verification-artifacts/live-cold-desktop.png`, `live-cold-mobile.png`, and `live-demo-after-one-click.png`.

### Claim tests

The literal commands were attempted first on the untouched clone and could not resolve `@playwright/test`, as dependencies were not installed. After the required clean bootstrap (`npm ci`: 61 packages, 0 vulnerabilities), every exact `.factory/claims.json` command was rerun independently against the production demo entry point and passed.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `offline-reload` | Pass | `/demo` retained its sample queue after the browser was put offline and reloaded. |
| `csv-export` | Pass | Download had the required header and all six sample rows. |
| `csv-import` | Pass | A valid Cedar Print row appeared. |
| `paid-confirmation` | Pass | Harbor Electric moved to paid history. |
| `cash-week` | Pass | The seven amounts were exactly `$0.00`, `$426.80`, `$0.00`, `$875.00`, `$0.00`, `$38.00`, `$0.00`; total `$1,339.80`. |
| `due-order` | Pass | Five planned vendors were date ordered with Overdue first. |
| `encrypted-storage` | Pass | IndexedDB contained ciphertext and no clear vendor field/value. |
| `demo-isolation` | Pass | The real board contained no demo vendor. |
| `free-limit` | Pass | An 11-active-bill import was rejected atomically. |
| `local-privacy` | Pass | The tested demo flow made same-origin requests only. |
| `license-verify` | Pass | A mocked valid token was stored, URL-cleaned, verified once, and cached across reload. |
| `manual-entry` | Pass | A bill was added at 390 px through keyboard-operable controls. |
| `licensed-unlimited` | Pass | A mocked valid license accepted 11 active bills. |
| `free-accessibility` | Pass | Unlicensed core controls stayed enabled; axe found no serious/critical issue. |

Each claim ID occurs exactly once as `@claim:<id>` in `tests/product.spec.ts`. Passing the listed tests does not cure the unlisted and contradictory public claims described below.

## Clean-checkout gates

| Command | Result |
| --- | --- |
| `npm ci` | Pass — 61 packages, 0 vulnerabilities. |
| `npm run test:unit` | Pass — 10/10 Vitest tests. |
| `npm run typecheck` | Pass. |
| `npm run lint` | Pass. |
| `npm test` | Pass — 20/20 Chromium tests in 43.7 s. |
| `npm run build` | Pass — exact production command produced `dist/`. |
| `npm audit --omit=dev` | Pass — 0 vulnerabilities. |
| `npm run verify:checkout` | Pass — HTTP 303 to `checkout.dodopayments.com`. |

## Deployment identity and routing

The following local production artifacts matched live SHA-256 bytes:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `2960ffb7fa62ede34ca015ba18dfb83cb9b25eb6cf896d1b6e0bcc7521b0b947` |
| `assets/index-CsCQ_-SB.js` | `2339c2bc2af2a0c3b281792bf9f4493e3a1fb06642ef7ed7de981ff4f65b3c3d` |
| `assets/index-DFVRl_l_.css` | `1c6e4fcab3f943077908343d011219966fea80f471925ca841658c13d70ddca4` |
| `sw.js` | `6331b150ebbda33c88bbd9799a77800867d633491cbdf847622c92004f3bf996` |
| `manifest.webmanifest` | `0e9ec6e5445b356e1faa4b24ce5751e88f556abc3bfd7781d619ad9d0087a890` |
| `icons/icon-maskable-512.png` | `dd49bd2d4f764160c8901642c8f97cf6a84407e4949b5df9c1ed941726ced8a3` |

`/`, `/demo`, `/board`, `/privacy`, and `/terms` return 200. An unknown route returns a real 404 with the designed not-found page. The live factory URL verifier reports HTTP 200, title, `lang=en`, one H1, a main landmark, no missing image alt, no unlabeled button, and no console errors. Evidence: `verification-artifacts/verify-url/verify.json`.

## End-to-end and adversarial behavior

Passed live:

- Manual entry, edit affordances, payment confirmation, undo, paid history, delete cancellation, confirmed deletion, refresh persistence, demo reset, and demo/real isolation.
- Invalid CSV amount rejected; a valid recovery import then succeeded. Unsafe `javascript:` attachment input was rejected, and a valid HTTPS link then saved.
- Export after adding a record contained the header and seven records.
- A complete 390 px workflow reached **Add a bill**, entered vendor, amount, and native date, and activated **Save bill** using Tab, typing, and Enter only.
- Dialog focus opened on the relevant input and returned to the opener after Escape. Visible focus computed to a 3 px ochre outline with a 3 px offset.
- No console errors, page errors, failed resources, or cross-origin requests occurred during the tested local-data flow.

Failed live behavior appears under Findings.

## Accessibility and responsive checks

- Desktop 1440×900 and mobile 390×844 normal sample content had no page-level horizontal overflow.
- At 200% root text size, the sample queue still had a 390 px document width and its delete actions remained within x=362.
- Reduced-motion emulation reduced animations and transitions to `0.00001 s`.
- Axe on `/`, `/demo`, `/board`, `/privacy`, `/terms`, and the 404 page, in light and dark schemes, found **0 serious/critical** violations.
- Axe did find one **moderate** `region` violation on `/demo`; the banner text and **Start for real** link sit outside a landmark.
- Valid boundary content and touch targets did not pass overall; see Findings.

## Performance and PWA

Fresh Lighthouse 12.8.2 mobile run against the live home page:

- Performance 98; Accessibility 100; Best Practices 100; SEO 100.
- FCP 1.0 s; LCP 1.5 s; TBT 160 ms; CLS 0; total transfer 162 KiB.
- Initial JS: 36,123 bytes raw / 11,684 gzip (budget 200 KB).
- CSS: 15,935 bytes raw / 4,350 gzip (budget 50 KB).
- Mobile hero: 75,202 bytes (budget 300 KB).

Evidence: `verification-artifacts/lighthouse-live-mobile.json`.

The live manifest parsed with no browser errors and declares standalone mode plus 192, 512, and valid 512 maskable icons. The active service worker controls the origin under cache `bills-due-board-shell-v3`. Live `/demo` reloaded offline with its sample queue and offline notice. `registration.update()` completed. A local production-build simulation that changed the served worker bytes produced the in-app “An update is ready. Reload to use it.” action.

## Privacy, response policy, checkout, and rate limiting

- Landing, demo, and the unlicensed board made same-origin requests only. No analytics, remote script, or remote font was observed.
- IndexedDB records are AES-GCM ciphertext; demo and real data use different database names.
- HTML includes HSTS, CSP, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation/payment restrictions.
- HTML and `sw.js`: `public, must-revalidate, max-age=30`. Hashed JS/CSS: one-year immutable.
- Checkout followed the API's 303 to a live Dodo page showing “Bills Due Board License,” `$19.00`, one-time purchase, and the 10-active-bill limit removal.
- Verify CORS allows the product origin. A fresh rapid burst returned 200 for requests 1–30, then **429 on request 31** with **`Retry-After: 3`**.
- The app has no sign-in; Entra tenant validation is not applicable.

## Findings

### High — release blocking

1. **Paid access is not offline-safe and verification blocks the board.** With a cached valid verdict aged two days, an offline `/board` reload displayed “The license could not be checked,” treated the license as locked, and rejected an 11-bill import. With a verification response delayed five seconds, the board stayed at “Opening encrypted browser storage…” and “Loading your bills…” until the API returned. `currentLicenseState()` awaits verification and discards an expired cached unlock on failure. The paid-unlock contract requires optimistic use of the cached verdict, background reconciliation, and no blocking of the free experience.

2. **The landing preview publishes false cash-week numbers.** On 28 August 2026 it says “Next seven days `$1,486.42` · `4 planned bills`.” The actual sample's next seven days contain Northline, Mira, and Cloudpost for `$1,339.80`; Harbor is overdue and shown separately by the product. The passing cash-week claim test confirms `$1,339.80`. The fixed preview dates will drift further over time.

3. **The public claim inventory is incomplete.** The incorrect landing preview is a quantitative claim with no `.factory/claims.json` entry or test. Other unlisted promises include the `$19` checkout/one-time price, clearing site data removing records and the license, and the landing's no-bank/no-payment/no-sync statements. `npm run verify:checkout` is useful, but it is not declared in the required claim manifest. The claims acceptance contract says an unlisted claim fails review.

### Medium

1. **Valid user content breaks mobile layout.** Importing a 100-character vendor—the same maximum accepted by manual entry—expanded the document from 390 px to **1,538 px**. A 500-character CSV vendor expanded it to **7,579 px**. The vendor and notes lack defensive wrapping, so the queue and controls can be pushed far off-screen. Evidence: `verification-artifacts/mobile-valid-long-vendor-overflow.png`.

2. **The accessibility baseline has gaps despite zero serious/critical axe results.** At 390 px, visible footer links measured only 18 px high, below the required 44 px target. The license token's only visible identification is placeholder text; its bound label is screen-reader-only, contrary to the no-placeholder-as-label rule. Axe also reports the demo banner text and **Start for real** link outside landmarks (`region`, moderate, two nodes).

3. **Immutable caching is applied to unversioned files.** `/icons/*` and all `/assets/*` receive `max-age=31536000, immutable`, but the icon and hero filenames are stable. A service-worker cache-name change cannot reliably fetch replacements already retained by the HTTP cache. This is especially relevant because this repair changed the maskable icon at the same URL. Only content-hashed assets should receive immutable caching.

### Low

1. `package.json` reports `1.0.0` while the product footer reports `v1.0.1`, leaving two product versions for the same candidate.

## Release decision

**FAIL. Do not release candidate `15320b4432584d4afd37126ed6a3355cee4b608c`.** Preserve stale valid licenses optimistically while rechecking in the background; do not await license verification before drawing the board. Correct or derive the landing preview and add every public promise to the claim manifest. Then fix wrapping, target sizes/visible labeling, demo landmarks, and cache versioning before repeating all claim and live verification.
