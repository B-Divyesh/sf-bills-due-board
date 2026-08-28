# Bills Due Board — polish 1 handoff

## Status: PASS

Perfection-loop round 1 repaired every finding in `.factory/review-1.md`, rechecked the cumulative product contract, and deployed release `v1.0.4` to <https://bills-due-board.sociobot.in>.

- Work order: `bills-due-board-polish-1`
- Candidate repaired: `feffaeb1f0e63f4fbafe2bcdf0a664235039c0b9`
- Review commit: `3c3bf87e282c3123c52c999ec99628edab18af46`
- Deployed product commit: `b8689c591734b69783d992a9ea006bca20eafb93`
- Azure deployment: `f7bb1dea-787a-4b62-95d8-27d285a41a55`
- Release: `v1.0.4`
- Completed: 28 August 2026 UTC

## What changed

- The static 404 now has complete route metadata, Terms in its header, and Privacy, Terms, Param Factory, and release details in its footer. Its response remains HTTP 404. The offline fallback uses the same legal shell.
- “No tax or accounting advice” is now declared in `.factory/claims.json` and proven by a tagged black-box test that adds a tax-category bill, checks the exact record view, rejects advice output, and observes zero action requests.
- README replaces “local-first PWA” and “IndexedDB” with plain descriptions of what the user gets.
- `/?demo=1` now opens the isolated sample board directly with its Demo title/canonical, persistent banner, Reset demo, and Start for real. `/demo` remains the primary shareable route.
- Route descriptions and social titles now change with the route. The header provides all four product/legal destinations on mobile and still reflows at 200% text size.
- The catalog description is verb-first and 93 characters. The release and service-worker shell advanced to `v1.0.4` / `bills-due-board-shell-v6`.

The payment-horizon visual system, local encrypted data model, static PWA deployment class, and one-time Sociobot license flow are unchanged.

## How it was verified

A clean clone of the final product commit at `/tmp/bills-due-board-final.frw0fR` passed:

- `npm ci`: 61 packages, 0 vulnerabilities.
- Every command in `.factory/claims.json`: 22/22 passed individually.
- `npm test`: 31/31 Playwright browser tests.
- `npm run test:unit`: 15/15 Vitest tests.
- `npm run typecheck`, `npm run lint`, `npm run build`: passed; `dist/index.html` produced.
- `npm audit --omit=dev`: 0 vulnerabilities.
- `npm run verify:checkout`: 303 to the registered Dodo-hosted $19 one-time license checkout through Sociobot.

Local Static Web Apps verification passed real 404 status, metadata, route focus/Back behavior, demo reset/isolation, 390 px layout, 200% text reflow, privacy request logging, offline reload, and Axe checks on `/`, `/demo`, `/board`, `/privacy`, `/terms`, and the 404. Every Axe result had zero violations. The factory URL verifier recorded a valid title, `lang=en`, one H1, one main landmark, alt text, and no console/page error.

Budgets and local Lighthouse:

- Initial JavaScript: 37,901 bytes raw / 12.20 kB gzip.
- CSS: 16,404 bytes raw / 4.40 kB gzip.
- Mobile hero: 75,202 bytes.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.70 s, TBT 5 ms, CLS 0.

## Live cold verification

After deployment, a new browser context rechecked every finding at the public URL:

- First screen and one-click sample passed at 390 × 844.
- `/demo` and `/?demo=1` showed the persistent sample banner, Reset demo restored the seed, and Start for real opened an empty real board.
- The tax-category scenario returned only the entered record and totals, produced no advice, and made no network request.
- All five routes had unique titles/descriptions/canonicals, one H1/main, Open Graph art, zero Axe violations, and working route focus/Back behavior.
- `/not-a-real-route` returned HTTP 404 with complete canonical/social/install metadata and all required legal/product links.
- Offline reload retained the demo queue and showed the offline status.
- Request logging found zero cross-origin requests, console errors, page errors, or failed requests outside the deliberate 404 response.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.95 s, LCP 1.40 s, TBT 31 ms, CLS 0.
- Local/live SHA-256 matched for HTML, JavaScript, CSS, and the service worker. Hashed assets have immutable one-year caching; HTML and the worker revalidate after 30 seconds.

Evidence and screenshots are in `.factory/qa-artifacts/polish-1-local/` and `.factory/qa-artifacts/polish-1-live/`. The complete finding-to-evidence map is `.factory/polish-1.md`.

## Run it

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/?demo=1` for a clean sample board.

## Reproduce the gates

```sh
npm test
npm run test:unit
npm run typecheck
npm run lint
npm run build
npm run verify:checkout
npm audit --omit=dev
```

## Known gaps

None found.
