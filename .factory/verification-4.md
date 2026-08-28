# Independent product verification 4

**Verdict: FAIL — the deployed hashed bundles violate the required caching policy.**

- Candidate: `54e1ec9686c824ade8e81a57f3fe0984345cb18f`
- Branch: `main`
- Live URL: <https://bills-due-board.sociobot.in>
- Verified: 2026-08-28 18:18 UTC
- Work order: `bills-due-board-verify-4`
- Scope: clean-clone tests and build plus independent production QA. Product code was not changed.

The earlier deployment-only concern is resolved. Production is live and byte-identical to the candidate build. The complete functional and claims suites pass. Release remains blocked because production serves its content-hashed JavaScript and CSS with 30-second revalidation instead of the long-lived immutable policy required by the supplied performance/PWA contract.

## Mandatory first gates

### Claims

`.factory/claims.json` exists and contains 21 entries. After `npm ci` in an isolated checkout pinned to the candidate, every listed command was run separately and passed.

| Claim | Result |
| --- | --- |
| `offline-reload` | Pass |
| `csv-export` | Pass |
| `csv-import` | Pass |
| `paid-confirmation` | Pass |
| `cash-week` | Pass |
| `due-order` | Pass |
| `landing-preview` | Pass |
| `encrypted-storage` | Pass |
| `demo-isolation` | Pass |
| `free-limit` | Pass |
| `local-privacy` | Pass |
| `bank-credentials` | Pass |
| `payment-initiation` | Pass |
| `account-sync` | Pass |
| `license-verify` | Pass |
| `license-offline` | Pass |
| `license-checkout` | Pass — 303 to Dodo checkout; `$19.00` one-time license |
| `clear-local-data` | Pass |
| `manual-entry` | Pass |
| `licensed-unlimited` | Pass |
| `free-accessibility` | Pass |

The claim inventory was cross-checked against the landing page, legal pages, and README. The product promises are represented by the declared tests; no new release-blocking unlisted product claim was found. Per-claim logs are in `.factory/verification-artifacts/claims/`.

### Cold first-read and one-click demo

**Pass at 1440×900 and 390×844.** The first viewport plainly answers:

- What: “See every bill by due date.”
- Who: “For solo operators who need one place to review bills and confirm each payment.”
- First action: “Try it with sample data,” followed by “The sample opens a separate demo board.”

The three facts—offline after first visit, encrypted browser storage, and free for 10 active bills—are also visible. One click opens `/demo` with five planned bills and one paid bill. The persistent banner says “Demo — sample data, nothing is saved to your board” and provides **Reset demo** and **Start for real**. Evidence: `verification-artifacts/live-first-read.json`, `live-first-read-desktop.png`, `live-first-read-mobile.png`, and `live-demo-one-click-mobile.png`.

## Clean-checkout gates

| Command | Result |
| --- | --- |
| `npm ci` | Pass — 61 packages, 0 vulnerabilities |
| `npm test` | Pass — 29/29 Playwright tests |
| `npm run test:unit` | Pass — 13/13 Vitest tests |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass — `dist/` produced |
| `npm run verify:checkout` | Pass |
| `npm audit --omit=dev` | Pass — 0 vulnerabilities |

The production build emitted 36.89 KB raw / 11.98 KB gzip JavaScript and 16.38 KB raw / 4.40 KB gzip CSS. The mobile hero is 75,202 bytes. All are below their 200 KB, 50 KB, and 300 KB limits.

## Deployment identity and routing

The following candidate-build files match production byte for byte:

| File | SHA-256 |
| --- | --- |
| `index.html` | `b2a6694fd8f1fb979b5b2a0b4c0bcef7838934b307061ce7e1ee08a3d5695d64` |
| `assets/index-CNpeEy-G.js` | `0d32925b54a4429fad746cda72fce1a70239746c657e50b68013abd290be4e1d` |
| `assets/index-BiTrG3yN.css` | `da0186fc96f13cb14b8afa118da51542b286168525128b5de1c722c56fc9d49d` |
| `sw.js` | `2fa4d3345c70cb3aefd39e314c227a4a853b00498868a4b2674910e8ac8e0a42` |
| `manifest.webmanifest` | `0e9ec6e5445b356e1faa4b24ce5751e88f556abc3bfd7781d619ad9d0087a890` |
| `icons/icon-maskable-512.png` | `dd49bd2d4f764160c8901642c8f97cf6a84407e4949b5df9c1ed941726ced8a3` |

The regular icons and mobile hero also matched. `/`, `/demo`, `/board`, `/privacy`, `/terms`, the manifest, offline page, robots file, and sitemap return 200. A random unknown route returns the designed 404 with HTTP 404. Every crawled internal link resolves; the checkout returns 303 and `https://sociobot.in/` returns 200.

## End-to-end and recovery behavior

The live 390 px flow passed:

- Opened the populated demo in one click and showed the exact seven-day amounts and `$1,339.80` total.
- Rejected a missing vendor, fractional-cent amount, unsafe `javascript:` attachment, and malformed CSV; each flow recovered after corrected input.
- Accepted the `$0.01` lower boundary and a valid HTTPS attachment.
- Added, edited, categorized, marked paid, cancelled confirmation, undid payment, cancelled deletion, and confirmed deletion.
- Imported after an invalid file, persisted after reload, exported all rows, and neutralized a formula-prefixed vendor.
- Reset the demo and proved that **Start for real** opens a separate empty real board.
- The full suite also covers impossible dates, invalid status, the free 10-bill boundary, an 11-bill licensed import, 500-character wrapping, and two-tab writes.

The live workflow produced no console errors, page errors, failed requests, or unexpected cross-origin traffic.

## Accessibility and responsive behavior

- Fresh Axe checks on `/`, `/demo`, `/board`, `/privacy`, `/terms`, and the 404 page in both light and dark schemes found **zero violations at any severity**.
- Each route has `lang=en`, one H1, one main landmark, complete image alt text, and named controls.
- Desktop and 390 px layouts have no document-level horizontal overflow. At 200% text size the document remains 390 px wide.
- Visible controls meet the 44 px target. The 1×1 file input is intentionally hidden and operated by the visible 46 px **Import CSV** button.
- Keyboard-only use reaches **Add a bill** with a visible 3 px ochre focus ring; dialog focus starts on Vendor, and the entry persists.
- Reduced-motion emulation matches and reduces row animation to `0.00001s`.

The factory URL verifier also passed: HTTP 200, title, language, one H1, main landmark, alt text, named buttons, and no console error. Evidence: `verification-artifacts/verify-url/verify.json` and `live-matrix.json`.

## Privacy, headers, billing, and request allowance

- The live local-data workflow made seven requests covering five unique same-origin URLs. No analytics, third-party script/font, bill-record egress, socket, or payment API call was observed.
- IndexedDB stores ciphertext rather than clear bill fields. Demo and real records use separate database namespaces.
- HTML carries HSTS, restrictive CSP, `nosniff`, strict-origin referrer policy, and a permissions policy disabling camera, microphone, geolocation, and payment.
- The production checkout redirects to the hosted Dodo page for “Bills Due Board License,” `$19.00`, one time.
- The product-unlock verify endpoint allowed **30** rapid requests from one client. Request **31** returned **429** with **`Retry-After: 4`** and the expected product-origin CORS header. Evidence: `verification-artifacts/rate-limit.json`.
- The product has no sign-in, so Entra authority validation is not applicable.

## PWA and performance

- The live worker controls the origin under `bills-due-board-shell-v4`; `registration.update()` completes.
- A live offline reload retains Harbor Electric and displays the offline status with no errors.
- An isolated production-build update simulation changed the served worker bytes and displayed “An update is ready. Reload to use it.” with a **Reload** action. Evidence: `verification-artifacts/sw-update-check.mjs`.
- Live mobile Lighthouse: Performance **97**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.99 s, LCP 1.44 s, TBT 201 ms, CLS 0, total transfer 165,663 bytes. Evidence: `verification-artifacts/lighthouse-live-mobile.json`.

## Finding

### High — release blocking

1. **Content-hashed bundles do not receive long-lived immutable caching.** Production returns `Cache-Control: public, must-revalidate, max-age=30` for both `/assets/index-CNpeEy-G.js` and `/assets/index-BiTrG3yN.css`. `public/staticwebapp.config.json` applies that policy to every `/assets/*` response. These filenames contain content hashes and should use a one-year immutable policy under the supplied performance/PWA acceptance contract. Stable artwork and icons should keep revalidation caching, but the generated hashed JS/CSS need a narrower immutable route. Evidence: `verification-artifacts/response-headers.txt` and direct response checks at 18:13 UTC.

## Release decision

**FAIL. Do not release candidate `54e1ec9686c824ade8e81a57f3fe0984345cb18f`.** The deployment itself is current and the product passes all functional gates. Add a narrow long-lived immutable cache rule for content-hashed JS/CSS without applying it to stable asset filenames, redeploy, and repeat the header/deployment check.
