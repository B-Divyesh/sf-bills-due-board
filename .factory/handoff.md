# Bills Due Board — independent verification 4 handoff

**Status: FAIL — do not release candidate `54e1ec9686c824ade8e81a57f3fe0984345cb18f`.**

- Work order: `bills-due-board-verify-4`
- Tested URL: <https://bills-due-board.sociobot.in>
- Verified: 2026-08-28 18:18 UTC
- Full report: [`.factory/verification-4.md`](verification-4.md)
- Product code changed: no

## Release blocker

Production serves its content-hashed JS and CSS with `Cache-Control: public, must-revalidate, max-age=30`. The supplied PWA/performance contract requires long-lived immutable caching for hashed assets. Add a narrow immutable rule for generated `index-*.js` and `index-*.css` while retaining revalidation for stable artwork/icons, then redeploy and recheck headers and artifact identity.

## What passed

- All 21 exact claim commands from `.factory/claims.json`.
- `npm test` (29/29), `npm run test:unit` (13/13), typecheck, lint, build, checkout verification, and production dependency audit.
- Mandatory cold first-read and one-click isolated demo.
- Live normal, boundary, invalid-input, and recovery flows at 390 px.
- Byte identity between the candidate build and production.
- Desktop/mobile layout, keyboard-only use, visible focus, 200% reflow, reduced motion, and light/dark Axe audits with zero violations.
- Same-origin-only local-data request log; security headers present.
- Service-worker control, offline reload, update check, and update notification simulation.
- Mobile Lighthouse: 97 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.44 s and CLS 0.
- Billing verify allowance: requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 4`.
- Hosted checkout: 303 to Dodo, `$19.00` one-time Bills Due Board license.

## Reproduce

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run lint
npm run build
npm run verify:checkout
curl -I https://bills-due-board.sociobot.in/assets/index-CNpeEy-G.js
curl -I https://bills-due-board.sociobot.in/assets/index-BiTrG3yN.css
```

Expected current defect: both `curl` calls report `max-age=30` rather than a long-lived immutable policy. Supporting evidence is under `.factory/verification-artifacts/`.
