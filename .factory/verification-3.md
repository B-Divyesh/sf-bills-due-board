# Independent product verification 3

**Verdict: FAIL — claims-manifest completeness is release-blocking.**

- Candidate: `e0eeaee206abcf07064e7095772c517fc4502d14`
- Branch: `main`
- Live URL: <https://bills-due-board.sociobot.in>
- Verified: 2026-08-28 UTC
- Work order: `bills-due-board-verify-3`
- Scope: clean-clone, local production build and live deployment. No product code was changed.

The deployment-only concern is resolved: the current production files are byte-for-byte the build of the candidate. The product itself passed the exercised functional, PWA, security, accessibility, performance, and billing checks below. It cannot be accepted under the supplied claims contract because several material, visitor-facing scope/privacy promises do not have entries and sandbox regressions in `.factory/claims.json`.

## Required first gates

### Claims tests

`.factory/claims.json` exists and contains 18 declarations. From the clean checkout, `npm ci` installed 61 packages with 0 vulnerabilities, then every exact declared command was run independently against the local production demo entry point. All passed.

| Claim IDs | Command/result |
| --- | --- |
| `offline-reload`, `csv-export`, `csv-import`, `paid-confirmation`, `cash-week`, `due-order`, `landing-preview`, `encrypted-storage`, `demo-isolation`, `free-limit`, `local-privacy`, `license-verify`, `license-offline`, `clear-local-data`, `manual-entry`, `licensed-unlimited`, `free-accessibility` | Each exact `npm test -- --grep @claim:<id>` command passed. The complete `npm test` run also passed all 26 Playwright tests. |
| `license-checkout` | `npm run verify:checkout` passed: HTTP 303 to `checkout.dodopayments.com`; hosted page says “Bills Due Board License”, `$19.00`, and “One-time license”. |

Observable claim coverage includes offline reload of the demo after service-worker control, six-row CSV export, valid CSV import, moving Harbor Electric into paid history, exact daily cash-week amounts and `$1,339.80` total, overdue-first ordering, encrypted IndexedDB ciphertext, demo/real namespace separation, free-limit rejection, same-origin demo traffic, cached-license behavior, and formula-safe CSV export.

### Cold first-read test

**Pass.** A cold 1440×900 production visit visibly says:

- What it does: “See every bill by due date.”
- Who it is for: “For solo operators who need one place to review bills and confirm each payment.”
- What to do first: “Try it with sample data,” with “The sample opens a separate demo board.”

The first viewport also exposes the three plain facts: offline after first visit, encrypted browser storage, and free for 10 active bills. One click opened `/demo`, loaded five planned sample bills, and displayed the persistent banner: “Demo — sample data, nothing is saved to your board,” with **Reset demo** and **Start for real**.

## Clean-clone quality gates

| Command | Result |
| --- | --- |
| `npm ci` | Pass — 61 packages; 0 vulnerabilities. |
| `npm test` | Pass — 26/26 Playwright tests. |
| `npm run test:unit` | Pass — 13/13 Vitest tests. |
| `npm run typecheck` | Pass. |
| `npm run lint` | Pass. |
| `npm run build` | Pass — created `dist/`. |
| `npm run verify:checkout` | Pass — hosted Sociobot/Dodo checkout, $19 one-time product. |
| `npm audit --omit=dev` | Pass — 0 vulnerabilities. |

The exact build emitted 36,885-byte JS (11,917 bytes gzip) and 16,238-byte CSS (4,395 bytes gzip), below the 200 KB / 50 KB budgets. The mobile hero is 75,202 bytes. Live mobile Lighthouse 12.8.2 reported Performance 90, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.6 s, TBT 390 ms, CLS 0, and 93 KiB transfer. (Lighthouse logged a post-collection tab crash while taking its final screenshot, but wrote a complete report and exited successfully.)

## Product and browser evidence

- Normal and recovery flows are covered by the passing browser suite: keyboard-only 390 px manual entry; valid and malformed CSV import; invalid blank, fractional-cent, impossible-date, and invalid-status recovery; attachment-link validation; export; payment confirmation/undo; free limit; licensed 11-record import; deletion confirmation; and two-tab writes.
- The live cold landing made only same-origin requests for HTML, JS, CSS, and the self-hosted image. No console or page error occurred. The privacy claim test separately intercepted the demo cash-week flow and found no cross-origin request or third-party script.
- `/opt/fleet/lib/verify-url.sh` passed production: HTTP 200, title, `lang=en`, one H1, main landmark, zero missing image alts, zero unnamed buttons, zero console errors, and 673 ms load.
- Independent Axe checks at 390 px found zero serious or critical issues on `/`, `/demo`, `/board`, `/privacy`, `/terms`, and the real 404 page in both light and dark modes. All normal routes had one H1 and one main landmark, with no horizontal overflow. The 404’s browser console reports its expected HTTP 404 resource response only.
- Keyboard/reduced-motion smoke check at 390 px focused **Add a bill** with a visible `3px` ochre outline and `3px` offset; reduced-motion transition duration was `0.00001s`; document width remained 390 px.
- The live demo reloaded offline after service-worker control and retained Harbor Electric. `registration.update()` completed with the production `/sw.js` active and no waiting worker. The current worker uses the versioned `bills-due-board-shell-v4` cache.

## Deployment identity, policies, and rate limiting

Local and live SHA-256 matched for all checked release artifacts:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `96b3bcf2f47a6827449bdc10debe9be50865ee2b220e2863d54cb0a203fcf87d` |
| `assets/index-95zj14ea.js` | `6a86711f4817c15349806f371d87e1404bf61613955e996ff9d6e599d63b5e87` |
| `assets/index-x8lx0gfU.css` | `3dc825b8163e6802f3a37e755894caf578a483d1acb68795046bf4a0089f491b` |
| `sw.js` | `2fa4d3345c70cb3aefd39e314c227a4a853b00498868a4b2674910e8ac8e0a42` |
| `manifest.webmanifest` | `0e9ec6e5445b356e1faa4b24ce5751e88f556abc3bfd7781d619ad9d0087a890` |

`/`, `/demo`, `/board`, `/privacy`, and `/terms` return 200. An unknown route returns a styled real 404 with HTTP 404. Responses carry HSTS, `nosniff`, strict-origin referrer policy, a restrictive permissions policy, and CSP restricting scripts/styles/images to self and `connect-src` to the documented Sociobot verification API. HTML, manifest, and worker use 30-second revalidation caching; stable images/icons are also revalidated rather than immutably cached.

No sign-in exists, so Entra tenant validation is not applicable. The only server-side product endpoint is the Sociobot license API. A rapid burst of `GET /api/v1/products/bills-due-board/verify?license=qa-rate-limit-token` began returning **429 on request 11** with `Retry-After: 2`; a follow-up while the bucket remained active returned 429 on request 4 with `Retry-After: 3`. Thus rate limiting and `Retry-After` are present; the first-burst threshold observed was 11 requests in this verifier’s rate-limit window.

## Release-blocking finding

### High — public claims omitted from the required manifest

The landing and README make material promises that have no corresponding `.factory/claims.json` entry and no uniquely tagged sandbox regression. In particular:

- “No bank credentials” / “The app does not request bank credentials”;
- “No payment initiation” / “does not move money”; and
- “No automatic account sync.”

These are privacy and scope guarantees a visitor can rely on, especially given the financial context. `local-privacy` proves a particular demo flow loads no analytics or third-party scripts and sends no bill records cross-origin; it does not prove these distinct no-bank/no-initiation/no-sync statements. The claims acceptance contract requires every visitor-facing claim to be enumerated and observably tested, and explicitly makes an unlisted claim a failed review.

## Release decision

**FAIL. Do not accept or release this candidate under the supplied contract.** The implementation and deployment are otherwise healthy. Add exact claim entries and clean-demo tests for the three scope/privacy promises above (or remove/reword the promises), then rerun all declared claim commands and this verification.
