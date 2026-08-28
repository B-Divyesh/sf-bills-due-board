# Perfection-loop polish 2

**Work order:** `bills-due-board-polish-2`  
**Candidate reviewed:** `c794118dedbcc5033c6ec5e678b331eb09226ebd`  
**Adversarial review:** `a91fb764f062f89879cca08dec98f968a3abb0e3`  
**Repair commit:** `a91c467ee8630b0c1e52a31994cc05a47d15c6b2`  
**Deployment:** `16e186cb-2a58-4e68-a694-77d18038ea56`  
**Live URL:** <https://bills-due-board.sociobot.in>  
**Result:** PASS — every current and historical review finding is fixed and rechecked.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the repaired static `404.html`: route metadata, canonical, OG/Twitter image, manifest, Apple icon, HTTP 404, Terms in the header, and Privacy, Terms, and Param Factory in the footer. The 404 copy is now also direct: “This page is not available.” | Clean clone: `static 404 has complete metadata, legal navigation, and accessible structure` passed. Live: <https://bills-due-board.sociobot.in/not-a-real-route> returned HTTP 404; `qa.mjs` found zero Axe violations and saved `not-found-mobile.png`. |
| F-1-2 | Retained the declared `tax-advice` boundary and its isolated browser test. It uses a tax-category record and proves the board returns only recorded data and makes no external request. | Clean clone ran `npm test -- --grep @claim:tax-advice` successfully. Live demo privacy check reported `demoEgress: []` in `live-e2e.json`. |
| F-1-3 | Retained the prior README storage wording (“web app” and “encrypted browser storage”) and rewrote the remaining accounting jargon in F-2-3. | `npm run test:unit` passed the direct-copy guard; `README.md` now says “short list of bills due.” |
| F-2-1 | Replaced all six slogan/metaphor headings with “Bills by due date,” “Bills due in the next seven days,” “How to track planned bills,” “What this board does not do,” and “Price and license”; removed the preview eyebrow; rewrote the art caption as “Each planned bill stays listed until you mark it paid.” The 404 and empty state also use “bill list” rather than “queue.” | Clean clone: `npm run test:unit` direct-copy guard passed; `npm test` passed 31/31. Live cold check in `qa.mjs` asserts each label and rejects every old phrase. Screenshot: `live-cold-mobile.png`; live URL: <https://bills-due-board.sociobot.in>. |
| F-2-2 | Removed the public footer assertion “Artwork is generated.” Detailed asset provenance remains in `.factory/design.md`, where it belongs. | Clean clone: `npm run test:unit` asserts the assertion is absent. Live `qa.mjs` rejects the old public sentence; screenshot: `live-cold-mobile.png`. |
| F-2-3 | Replaced “payable queue” in the README with “short list of bills due.” | Clean clone: `npm run test:unit` asserts the direct sentence and rejects `payable queue`. Live product copy has no use of that phrase. |

## Verification

- Fresh clone `/tmp/bills-due-board-polish-2-verified.OWXRWU` at `a91c467` completed `npm ci`, then each of the 22 commands in `.factory/claims.json` independently with `set -euo pipefail`, followed by `npm test` (31/31), `npm run test:unit` (16/16), `npm run typecheck`, `npm run lint`, and `npm run build`.
- Initial assets: JavaScript 37,717 bytes raw / 12.10 kB gzip; CSS 16,404 bytes raw / 4.40 kB gzip. The mobile hero is 75,202 bytes.
- Live cold verification: `/opt/fleet/lib/verify-url.sh` reports title, `lang=en`, one H1, main landmark, alt text, no console errors, and 882 ms load. Evidence: `qa-artifacts/polish-2-live/verify-url/verify.json`.
- Live browser matrix in `qa-artifacts/polish-2-live/qa.mjs`: direct first-screen copy, query-string demo title/canonical/banner, Reset demo, Start for real isolation, service-worker offline reload, route focus/Back behavior, responsive overflow, no demo egress, 404 status/legal route, and Axe all passed. Evidence: `live-e2e.json`, `live-cold-mobile.png`, `live-demo-one-click-mobile.png`, and `not-found-mobile.png`.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 0 ms, CLS 0. Evidence: `qa-artifacts/polish-2-live/lighthouse-mobile.json`.
- Live hashed JavaScript has one-year immutable caching; the service worker revalidates after 30 seconds. The app remains a static, local-first PWA with no new third-party runtime dependency.

## Remaining work

None.
