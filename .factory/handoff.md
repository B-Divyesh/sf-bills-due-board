# Bills Due Board — polish 2 handoff

## Status: PASS

Repair commit `a91c467ee8630b0c1e52a31994cc05a47d15c6b2` is pushed to `main` and deployed as Azure Static Web App deployment `16e186cb-2a58-4e68-a694-77d18038ea56` at <https://bills-due-board.sociobot.in>.

## What changed

- Rewrote every F-2-1 first-screen and section heading in direct language; changed the image caption and related empty/404 wording to “bill list.” The payment-horizon art, ruled-paper layout, palette, and typography remain unchanged.
- Removed the untestable public claim “Artwork is generated.” Provenance remains in `.factory/design.md`.
- Replaced README “payable queue” with “short list of bills due.”
- Preserved and reconfirmed all F-1 repairs: complete static 404/legal metadata, the declared and tested tax/advice boundary, and plain browser-storage README wording.
- Bumped the release to v1.0.5, PWA start URL to `?v=3`, and the service-worker cache to v7 so installed copies receive the new shell.
- Updated the catalog description to: “Track bills by due date, plan next week's cash, and confirm each payment on your device.” It is verb-first and 88 characters.

See `.factory/polish-2.md` for the complete finding-to-change-to-evidence map.

## Exact verification evidence

- Clean clone `/tmp/bills-due-board-polish-2-verified.OWXRWU`, commit `a91c467`, used `npm ci` and ran all 22 `.factory/claims.json` commands separately under `set -euo pipefail`. Then: `npm test` (31/31), `npm run test:unit` (16/16), `npm run typecheck`, `npm run lint`, and `npm run build` all passed.
- Build output is `dist/`; entry JavaScript is 37,717 bytes raw / 12.10 kB gzip and CSS is 16,404 bytes raw / 4.40 kB gzip.
- `/opt/fleet/lib/verify-url.sh https://bills-due-board.sociobot.in .factory/qa-artifacts/polish-2-live/verify-url` passed: title present, `lang=en`, one H1, main, image alt text, and zero console errors. Its cold load was 882 ms.
- Live `qa-artifacts/polish-2-live/qa.mjs` passed against the deployed domain: direct copy, one-click `?demo=1`, banner/reset/start-real isolation, offline reload, route focus/Back, mobile layout, no demo egress, real 404, and Axe. `live-e2e.json` records zero Axe violations for `/`, `/demo`, `/board`, `/privacy`, `/terms`, and the 404; it also records no errors, no demo egress, and no mobile overflow.
- Live Lighthouse mobile recorded Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 0 ms, CLS 0. See `qa-artifacts/polish-2-live/lighthouse-mobile.json`.

## Run and verify

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run lint
npm run build
```

Run a single declared claim with `npm test -- --grep @claim:offline-reload`. Run the sample locally with `npm run dev`, then open <http://localhost:5173/demo> or <http://localhost:5173/?demo=1>.

## Remaining work

None.
