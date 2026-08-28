# Bills Due Board — independent verification handoff

**Verdict: FAIL**

- Tested commit: `8734d03f2989f1e1d932be9a44db5cc7f671ed0e`
- Tested URL: <https://bills-due-board.sociobot.in>
- Verified: 2026-08-28 14:31 UTC
- Work order: `bills-due-board-verify-1`

The live static app now deploys successfully and its HTML, JS, CSS, service worker, and manifest match the candidate byte-for-byte. The first screen and one-click demo pass. All 11 exact claim commands pass after `npm ci`; the full Playwright suite passes 13/13; TypeScript, production build, and dependency audit pass. Lighthouse live mobile scores 100/100/100/100, axe has no serious/critical findings, and offline reload plus a simulated service-worker update pass.

Release remains blocked:

- The production **Buy a license** endpoint returns HTTP 404.
- Manual and CSV entry accept blank amounts as zero; fractional cents are rounded away; CSV accepts impossible dates and invalid statuses.
- Stale writes from two open tabs silently delete the first tab’s newly added bill.
- `npm run test:unit` fails before running tests because Vitest collects the Playwright file.
- Public manual-entry, privacy, verification-frequency, unlimited-license, and free-accessibility claims are absent or inadequately represented in `.factory/claims.json`.

Medium findings: undersized touch targets, broken 200% text reflow, no persistent invalid-license notice, CSV formula injection, a 512×444 image declared as a 512×512 maskable icon, and soft-404 HTTP status.

Detailed evidence and reproductions are in [`.factory/verification.md`](verification.md). Screenshots, Lighthouse JSON, browser checks, and factory URL-verifier output are in `.factory/qa-artifacts/`.

## Commands rerun

```sh
npm ci
npm test
npm run test:unit
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

To reconsider release, fix all high-severity findings without removing honest functionality, add regression/claim tests, deploy the exact repaired candidate, and repeat independent verification against the live URL.
