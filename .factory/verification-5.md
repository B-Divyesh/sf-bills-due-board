# Independent product verification 5

**Verdict: PASS**

- Candidate: `feffaeb1f0e63f4fbafe2bcdf0a664235039c0b9`
- Branch: `main`
- Live URL: <https://bills-due-board.sociobot.in>
- Verified: 2026-08-28 19:04 UTC
- Work order: `bills-due-board-verify-5`
- Scope: clean-clone install, all claims, production build, and independent deployed-PWA QA. Product code was not changed.

## Mandatory first gates

### Cold first-read and one-click demo

**Pass.** At a cold 1440 × 900 live visit, the first screen plainly says what it does (**“See every bill by due date”**), who it is for (**solo operators needing a place to review bills and confirm payments**), and what to do first (**“Try it with sample data”**). The adjacent copy says that the sample opens a separate demo board. The three visible facts cover offline use, encrypted browser storage, and the 10-active-bill free limit.

At 390 px, one click opened `/demo`; the persistent **“Demo — sample data, nothing is saved to your board”** banner, **Reset demo**, and **Start for real** controls were present, and there was no horizontal overflow. Evidence: `verification-artifacts/verify5-live-cold-desktop.png` and `verification-artifacts/verify5-live-demo-mobile.png`.

### Claims

`.factory/claims.json` is present with 21 entries. After clean `npm ci` (61 packages, zero vulnerabilities), every exact command listed there ran through the local production demo entry point and passed. The 20 browser claims also passed in the 29-test Playwright suite. `npm run verify:checkout` was separately rerun: **303 → checkout.dodopayments.com**, `$19` one-time license. A source audit confirms every claim ID has exactly one `@claim:<id>` test.

| Claim group | Result |
| --- | --- |
| Offline, CSV, paid history, cash-week, due-order, landing preview | Pass |
| Encryption, demo isolation, free limit, privacy, bank/payment/sync boundaries | Pass |
| License verification/offline/checkout, clearing local data, manual entry, unlimited license, free accessibility | Pass |

## Clean-checkout gates

| Command | Result |
| --- | --- |
| `npm ci` | Pass — 61 packages, 0 vulnerabilities |
| `npm test` | Pass — 29/29 Playwright tests |
| `npm run test:unit` | Pass — 13/13 Vitest tests |
| `npm run typecheck` / `npm run lint` | Pass |
| `npm run build` | Pass — generated `dist/` |
| `npm run verify:checkout` | Pass |

Coverage includes normal and invalid manual/CSV input and recovery; zero/fractional/blank amounts; impossible dates/statuses; CSV-formula neutralization; payment confirmation; 10/11-item limits; two stale tabs; long mobile data; invalid licenses; and keyboard-only mobile entry.

## Deployment, privacy, accessibility, and PWA

Live `index.html`, generated JS/CSS, service worker, manifest, and maskable icon match this candidate byte-for-byte. The former release blocker is fixed: `/immutable/index-BN_q_U6h.js` and `/immutable/index-BiTrG3yN.css` return `public, max-age=31536000, immutable`; stable files retain revalidation caching.

Fresh desktop and 390 px QA of `/`, `/demo`, `/board`, `/privacy`, `/terms`, and the real HTTP 404 route found no normal-route console/page errors, failed resources, unexpected egress, or horizontal overflow. Axe reported no serious or critical findings on any route. Keyboard focus has a visible 3 px ochre ring, opens on Vendor in the add dialog, and saved data persisted across reload. At 200% text, overflow remained zero. Reduced-motion behavior changes the row animation to `1e-05s`. The hidden 1 × 1 CSV file input is operated by the visible 44 px+ Import CSV control, so is not an exposed touch target.

Cold/demo/cash-week request logs were same-origin only. IndexedDB contains encrypted bill data and demo/real data use separate namespaces. HSTS, restrictive CSP, `nosniff`, strict-origin referrer policy, and a Permissions-Policy disabling camera/microphone/geolocation/payment are live. No sign-in exists, so Entra validation is not applicable.

The live worker (`bills-due-board-shell-v5`) controlled the app; a fresh offline demo reload retained Harbor Electric and displayed the offline banner. `registration.update()` completed, and a controlled production-build update showed **“An update is ready. Reload to use it.”** with the Reload action. Evidence: `verification-artifacts/verify5-live-e2e.json` and `verification-artifacts/verify5-sw-update.json`.

## Endpoint allowance and performance

The product-unlock verify endpoint allowed **30** rapid requests from one client; request **31** returned **429** with **`Retry-After: 2`**. CORS preflight permits the deployed origin and GET. The checkout endpoint returns the hosted Dodo redirect.

Build budgets: JS 36,885 bytes raw / 11,918 gzip; CSS 16,379 raw / 4,423 gzip; mobile hero WebP 75,202 bytes. Fresh mobile Lighthouse 12.8.2 scored **100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO** (FCP 1.0 s, LCP 1.4 s, TBT 0 ms, CLS 0). Evidence: `verification-artifacts/verify5-lighthouse-live-mobile.json`.

## Findings and decision

No high, medium, low, or release-blocking defects found.

**PASS — candidate `feffaeb1f0e63f4fbafe2bcdf0a664235039c0b9` is deployed and satisfies the supplied acceptance contract.**
