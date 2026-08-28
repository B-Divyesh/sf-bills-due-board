# Bills Due Board — independent verification handoff

**Status: FAIL — do not release candidate `15320b4432584d4afd37126ed6a3355cee4b608c`.**

- Work order: `bills-due-board-verify-2`
- Tested commit: `15320b4432584d4afd37126ed6a3355cee4b608c`
- Tested live URL: <https://bills-due-board.sociobot.in>
- Verified: 2026-08-28 16:02 UTC
- Full report: [verification-2.md](verification-2.md)

## Outcome

The live deployment matches the candidate build. The first-read/demo gate passes, all 14 declared claim tests pass after `npm ci`, all repository checks pass, checkout works, API rate limiting works, and the PWA reloads offline. The candidate nevertheless fails the acceptance contract.

### Release-blocking defects

1. A previously valid license whose cached check is older than one day becomes locked offline. The paid 11th active bill is rejected. A slow license check also blocks the whole board on its loading state instead of reconciling in the background.
2. The landing preview claims “Next seven days $1,486.42 · 4 planned bills,” but the actual and tested sample cash week is three future bills totaling $1,339.80, with one overdue bill separate.
3. The claim manifest omits that quantitative preview and other public promises, including live checkout/price and data-clearing behavior.

### Other defects

- A valid 100-character vendor causes 1,538 px document width at a 390 px viewport; longer CSV values expand it further.
- Mobile footer link targets are 18 px high; the license field relies on visible placeholder text; axe reports two demo-banner nodes outside landmarks.
- One-year immutable caching is applied to stable, unhashed icon and image URLs.
- The footer reports `v1.0.1`; `package.json` reports `1.0.0`.

## Verification summary

```text
npm ci                    PASS — 61 packages, 0 vulnerabilities
14 exact claim commands   PASS — 14/14 after clean install
npm run test:unit         PASS — 10/10
npm run typecheck         PASS
npm run lint              PASS
npm test                  PASS — 20/20
npm run build             PASS — dist/ produced
npm audit --omit=dev      PASS — 0 vulnerabilities
npm run verify:checkout   PASS — 303 to checkout.dodopayments.com
live identity             PASS — shell/JS/CSS/SW/manifest/icon hashes match
live unknown route        PASS — HTTP 404
API rate limit            PASS — request 31 returned 429, Retry-After: 3
live offline reload       PASS — /demo retained sample data
service-worker update     PASS — simulated changed worker showed Reload notice
axe serious/critical      PASS — 0 on all core routes, light and dark
Lighthouse mobile         98 / 100 / 100 / 100
release verdict           FAIL
```

No product source was modified. Verification evidence is under `.factory/verification-artifacts/`.
