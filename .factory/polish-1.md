# Perfection-loop polish 1

**Work order:** `bills-due-board-polish-1`  
**Reviewed candidate:** `feffaeb1f0e63f4fbafe2bcdf0a664235039c0b9`  
**Review commit:** `3c3bf87e282c3123c52c999ec99628edab18af46`  
**Deployed product commit:** `b8689c591734b69783d992a9ea006bca20eafb93`  
**Live URL:** <https://bills-due-board.sociobot.in>  
**Result:** PASS — no review finding remains.

No earlier `.factory/review-*.md` or `.factory/polish-*.md` existed before this round. All three findings in `.factory/review-1.md` were required and repaired.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Rebuilt `public/404.html` with canonical, Open Graph, Twitter, theme, manifest, favicon/apple-touch metadata; added Terms to the header; added Privacy, Terms, Param Factory, and version to the footer; preserved the designed page and HTTP 404. The offline fallback received the same legal shell. | `static 404 has complete metadata, legal navigation, and accessible structure`; `gives the static 404 complete metadata and legal links`; local and live `.factory/qa-artifacts/polish-1-*/qa.json` report HTTP 404, full metadata, all footer links, and zero Axe violations. Screenshots: `polish-1-local/not-found-mobile.png`, `polish-1-live/not-found-mobile.png`. Live check: <https://bills-due-board.sociobot.in/not-a-real-route>. |
| F-1-2 | Added the `tax-advice` entry to `.factory/claims.json`. Its clean-demo browser test adds a tax-category record and proves the board returns only the entered record and date/amount view, produces no advice output, and makes no network request. | `records tax-category bills without producing tax or accounting advice @claim:tax-advice`; standalone clean-clone command `npm test -- --grep @claim:tax-advice` passed. Live `.factory/qa-artifacts/polish-1-live/qa.json` records `taxAdviceBoundary: true`, no cross-origin requests, and no browser errors. |
| F-1-3 | Replaced “local-first PWA” with “web app that keeps its bill records on this device,” and “encrypted IndexedDB document” with “encrypted browser storage.” The visible footer now says “Works offline.” | `.factory/copy-audit.md` records the repaired sentences with 7–12 words and no banned terms. `rg 'local-first PWA|encrypted IndexedDB' README.md` returns no matches. |

## Controller acceptance checks

- First screen: “See every bill by due date,” the named solo-operator sentence, the one-click sample action, adjacent outcome note, and three tested facts remain visible. Live evidence: `polish-1-live/cold-home-mobile.png`.
- Demo: both `/demo` and `/?demo=1` open the sample board directly. The query route now has the Demo title/canonical, banner, reset, and Start for real. Demo and real data use separate encrypted browser databases. Evidence: `keeps demo changes out of the real board @claim:demo-isolation`, `polish-1-live/one-click-demo-mobile.png`, and live `qa.json`.
- Routes: `/`, `/demo`, `/board`, `/privacy`, and `/terms` have unique titles, descriptions, canonicals, one H1, one main landmark, Open Graph art, H1 focus, and working Back navigation. The mobile header exposes Demo, My board, Privacy, and Terms without overflow, including at 200% text size.
- Claims: `.factory/claims.json` contains 22 claims. Every listed command passed individually from clean clone `/tmp/bills-due-board-final.frw0fR`; the registry test confirms one and only one `@claim:<id>` test per browser claim.
- Privacy and offline: the live demo flow made no cross-origin request, loaded no third-party script, produced no browser error, and reloaded the seeded queue offline with the offline status visible. Screenshot: `polish-1-live/offline-demo-mobile.png`.
- Catalog: `.factory/catalog-description.txt` is a verb-first, 93-character sentence.

## Verification evidence

- Clean clone: `npm ci`; all 22 claim commands; `npm test` (31/31); `npm run test:unit` (15/15); `npm run typecheck`; `npm run lint`; `npm run build`; `npm audit --omit=dev` — all passed.
- Build budgets: initial JS 37,901 bytes raw / 12.20 kB gzip; CSS 16,404 bytes raw / 4.40 kB gzip; mobile hero 75,202 bytes.
- Local Static Web Apps: unknown path returned 404; route/demo/offline/privacy/browser checks passed; Lighthouse scored Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Live: deployment `f7bb1dea-787a-4b62-95d8-27d285a41a55`; cold QA passed at 390 × 844; factory URL verification had no console errors; Lighthouse scored 100/100/100/100, FCP 0.95 s, LCP 1.40 s, TBT 31 ms, CLS 0.
- Live/local SHA-256 matched for `index.html`, JavaScript, CSS, and `sw.js`. Hashed bundles return one-year immutable caching; HTML and the service worker revalidate after 30 seconds.
- Hosted checkout still returns the registered Dodo $19 one-time license page through Sociobot.

Evidence folders: `.factory/qa-artifacts/polish-1-local/` and `.factory/qa-artifacts/polish-1-live/`.

## Remaining work

None found.
