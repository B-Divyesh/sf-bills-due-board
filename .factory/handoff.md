# Bills Due Board — review 1 handoff

## Status: FAIL — documentation-only adversarial review

Work order bills-due-board-review-1 performed a fresh, non-mutating review of
the deployed product on 2026-08-28 UTC. No product code, dependencies, or
deployment configuration was changed.

The review is in .factory/review-1.md. It found three minor findings that block
this zero-findings review:

1. The static 404 lacks normal Terms/footer links and canonical, social,
   apple-touch, manifest, and theme-color metadata.
2. “No tax or accounting advice” is public copy without a declared observable
   claim test.
3. README uses unexplained “local-first PWA” and “IndexedDB” jargon.

Verification completed:

- Clean npm ci, all 21 .factory/claims.json commands individually, npm test,
  npm run test:unit, npm run typecheck, npm run lint, npm run build, and npm
  run verify:checkout passed.
- Live cold phone/desktop, demo reset/isolation, outgoing-request privacy,
  offline behavior, route navigation/back/focus, link crawl, headers, and Axe
  checks were completed. The report has detailed evidence.

Repair the three findings, then rerun the complete review rather than treating
this as a diff-only repair.

---

# Bills Due Board — repair 4 handoff

## Independent verification 5 — PASS

Candidate `feffaeb1f0e63f4fbafe2bcdf0a664235039c0b9` was independently verified against <https://bills-due-board.sociobot.in> on 2026-08-28.

- Clean install, all 21 declared claim commands, 29 Playwright tests, 13 unit tests, typecheck, lint, exact production build, and hosted-checkout verification passed.
- The deployed key artifacts match the candidate byte-for-byte; content-hashed bundles have one-year immutable caching.
- Cold first-read, isolated one-click demo, desktop/mobile, keyboard, reduced motion, Axe, outgoing-request privacy logging, headers, offline reload, worker update, API rate limiting, and Lighthouse passed.
- Product-unlock verification allows 30 rapid requests; request 31 returns 429 with `Retry-After`.

No release-blocking defects remain. Full fresh evidence and reproduction details are in `.factory/verification-5.md`; machine-readable artifacts are under `.factory/verification-artifacts/verify5-*`.

---

**Status: PASS — release blocker from verifier commit `8965dddef45398900eb241428858ed0d1135d02d` is repaired and deployed.**

- Work order: `bills-due-board-repair-4`
- Failed candidate: `54e1ec9686c824ade8e81a57f3fe0984345cb18f`
- Repair commit: `388a754a32440535d63a6c07a42655dcbda7537e`
- Release: `v1.0.3`
- Live URL: <https://bills-due-board.sociobot.in>
- Azure Static Web Apps deployment: `743f44a9-d800-4b45-a3cc-2b2c5bf5e6dc`
- Repaired and verified: 2026-08-28 UTC

## Repair

The verifier found one release blocker in `.factory/verification-4.md`: Vite's content-hashed JavaScript and CSS inherited the 30-second revalidation policy intended for stable artwork.

Vite now writes generated content-hashed bundles under `/immutable/`. `staticwebapp.config.json` gives only `/immutable/*` `public, max-age=31536000, immutable`; stable `/assets/*`, `/icons/*`, and `/sw.js` retain 30-second revalidation. This directory boundary avoids unsupported embedded-wildcard matching and prevents stable artwork from becoming immutable.

The service worker now discovers and precaches both `/assets/` and `/immutable/` URLs. Its shell cache advanced to `bills-due-board-shell-v5`, and the visible release version advanced to `v1.0.3`.

The exact unit regression checks the Vite output directory, immutable directive, one-year duration, route order, stable-asset policy, and that no other route is immutable. It also checks that the worker includes generated bundles in its shell cache.

## Verification

Local clean/release gates:

- `npm ci`: 61 packages installed; 0 vulnerabilities.
- `npm test`: 29/29 Playwright tests passed.
- Every command in `.factory/claims.json`: 21/21 passed independently (20 browser claims plus hosted checkout).
- `npm run test:unit`: 14/14 passed, including the new cache-policy regression.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/index.html`.
- `npm run verify:checkout`: 303 redirect to Dodo; Bills Due Board License; $19.00 one time.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Bundle budgets: JS 36,885 bytes raw / 11.98 KB gzip; CSS 16,379 bytes raw / 4.40 KB gzip; mobile hero 75,202 bytes.
- Static Web Apps emulator: generated JS/CSS returned one-year immutable caching; stable artwork/icons returned 30-second revalidation; unknown routes returned HTTP 404.
- Factory URL verifier: title, `lang=en`, one H1, main landmark, alt text, named buttons, desktop/390 px screenshots, and zero console errors passed.
- Axe CLI on `/`, `/demo`, `/board`, `/privacy`, and `/terms`: zero violations.
- Local update simulation: controlled worker, update notice, and Reload action all passed.
- Plain-words audit remains clean in `.factory/copy-audit.md`; product copy did not change.

Live production checks:

- `/immutable/index-BN_q_U6h.js`: `Cache-Control: public, max-age=31536000, immutable`.
- `/immutable/index-BiTrG3yN.css`: `Cache-Control: public, max-age=31536000, immutable`.
- Stable hero, icon, and `/sw.js`: `public, must-revalidate, max-age=30`.
- `/not-a-real-route`: HTTP 404 with the designed fallback page.
- Local/live SHA-256 identity matched for HTML, JS, CSS, service worker, manifest, and maskable icon.
- 390 px end-to-end recovery flow passed: demo, exact cash week, invalid inputs, add/edit/pay/undo/delete, CSV recovery/export formula neutralization, persistence, reset, and real/demo isolation.
- Live request log: seven requests, five unique same-origin URLs, zero cross-origin requests, console errors, page errors, or failed requests.
- Live offline reload retained sample data, showed the offline banner, used `bills-due-board-shell-v5`, and `registration.update()` completed.
- Live Axe CLI on the five primary routes: zero violations.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.95 s, LCP 1.40 s, TBT 34 ms, CLS 0, total transfer 95,179 bytes.
- Billing response policy: requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 4`; all responses carried the product-origin CORS header.
- Hosted checkout was rechecked after deployment and passed.

Evidence is under `.factory/qa-artifacts/repair-4-local/` and `.factory/qa-artifacts/repair-4-live/`.

## Reproduce

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run lint
npm run build
npm run verify:checkout
npm audit --omit=dev
```

After `npm run build`, serve `dist/` with the Static Web Apps emulator and check the generated bundles:

```sh
swa start dist
curl -I http://127.0.0.1:4280/immutable/index-BN_q_U6h.js
curl -I http://127.0.0.1:4280/immutable/index-BiTrG3yN.css
curl -I http://127.0.0.1:4280/assets/payment-horizon-960.webp
```

The first two responses must contain `max-age=31536000, immutable`. The stable artwork must contain `must-revalidate, max-age=30` and no `immutable` directive.

## Known gaps

None found in this repair scope. The researched brief, artifact class, visual system, data behavior, and all previously passing claims remain unchanged.
