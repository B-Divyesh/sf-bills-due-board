# Track bills by due date — independent review 4

**Reviewed:** 6 September 2026 UTC  
**Live URL:** <https://bills-due-board.sociobot.in>  
**Implementation candidate:** `a91c467ee8630b0c1e52a31994cc05a47d15c6b2`  
**Documentation SHA reviewed:** `4956b73dadb924f2787994643080c080033b89b5`  
**Verdict: PASS**

There are zero findings of every severity and zero untested claims.

## Findings

None.

## First screen before scrolling

I opened `/` in new browser contexts at 390 × 844 and 1440 × 900. Both returned HTTP 200 with no console error, cross-origin request, or horizontal overflow.

- **Job:** see planned bills by due date and record each payment.
- **Audience:** solo operators who review bills beside another finance tool.
- **First action:** **Try it with sample data**, which opens a separate demo board. **Add your first bill** is the real-data alternative.

The exact visible text was “See every bill by due date,” “For solo operators who need one place to review bills and confirm each payment,” and “Try it with sample data.” The primary sample action ended at 415 px on the phone and 546 px on desktop, so it was fully visible before scrolling. The three facts about offline use, encrypted browser storage, and the 10-active-bill free limit were also visible on the phone.

## Demo and data safety

One click opened `/demo` with five planned bills and one paid bill. The board showed a realistic overdue electric bill, three bills totaling $1,339.80 in the next seven days, a later insurance bill, and paid history.

The persistent banner read “Demo — sample data, nothing is saved to your board” and kept **Reset demo** and **Start for real** visible. I marked a bill paid, cancelled and confirmed other actions, edited and deleted a temporary bill, imported and exported CSV, reloaded, reset the demo, and then selected **Start for real**. Reset restored the original sample. The real board was empty and contained no sample vendor.

The complete live flow made only same-origin requests and loaded no third-party scripts. Browser inspection and the passing isolation claim confirmed separate `demo:bills-due-board:v1` and `bills-due-board:v1` databases. All work used fresh browser contexts, so no existing user data was read or changed.

## Claims

`.factory/claims.json` contains 22 claims. From a fresh clone at the documentation SHA, I ran `npm ci` and then each exact `test` command separately. All 22 passed.

| Claim IDs | Result |
| --- | --- |
| `offline-reload`, `csv-export`, `csv-import`, `paid-confirmation`, `cash-week`, `due-order` | PASS |
| `landing-preview`, `encrypted-storage`, `demo-isolation`, `free-limit`, `local-privacy` | PASS |
| `bank-credentials`, `payment-initiation`, `account-sync`, `tax-advice` | PASS |
| `license-verify`, `license-offline`, `license-checkout`, `clear-local-data` | PASS |
| `manual-entry`, `licensed-unlimited`, `free-accessibility` | PASS |

The checkout command observed the expected HTTP 303 to the Dodo-hosted $19 one-time license page. Every browser claim ID appears exactly once in the Playwright suite; checkout has its dedicated command. Cross-checking the unchanged landing, legal, and README copy against the registry found no unlisted public claim.

## Normal, invalid, boundary, and recovery paths

The live flow passed manual add, edit, cancel, paid confirmation, undo, delete cancellation, delete confirmation, persistence after reload, cash-week totals, attachment links, CSV import, CSV export, and demo reset.

Invalid input checks produced direct recovery instructions for a missing vendor, a three-decimal amount, an unsafe attachment URL, and malformed CSV. A corrected $0.01 bill and corrected CSV then saved successfully. Export neutralized a spreadsheet formula. A forced browser-storage failure showed an alert, “Your board could not open,” and an instruction to check storage settings and reload.

The full local suite also passed the 10/11 active-bill boundary, licensed unlimited import, invalid and stale license states, zero and fractional amounts, impossible dates and statuses, long mobile values, stale-tab writes, and clear-local-data recovery.

## Earlier findings

Every earlier review, polish report, verification report, and handoff was inspected. Each finding was rechecked against live output and current source.

| Earlier finding | Current evidence | Disposition |
| --- | --- | --- |
| F-1-1 — incomplete 404 metadata and legal shell | A live unknown URL returns a designed HTTP 404 with complete metadata, Home/Demo/My board/Privacy/Terms navigation, legal footer, Param Factory attribution, and a return-home action. | Fixed |
| F-1-2 — unlisted tax/advice boundary | `tax-advice` remains declared; its isolated test passed with a tax record, no advice output, and no request. | Fixed |
| F-1-3 — README storage and app jargon | “local-first PWA” and “encrypted IndexedDB” remain absent; direct browser-storage wording remains. | Fixed |
| F-2-1 — slogan and metaphor headings | All direct replacements remain live, including “Bills due in the next seven days,” “How to track planned bills,” and “Price and license.” | Fixed |
| F-2-2 — unlisted generated-art statement | The public statement remains absent. Provenance stays in `.factory/design.md`. | Fixed |
| F-2-3 — README “payable queue” jargon | The phrase remains absent; README says “short list of bills due.” | Fixed |

No historical finding regressed.

## Accessibility and site structure

Fresh desktop and phone checks covered `/`, `/demo`, `/board`, `/privacy`, `/terms`, and an unknown route. Every page had `lang=en`, one H1, one main landmark, complete image alternatives, no horizontal overflow, and its correct route title. The five normal routes returned 200. The unknown route deliberately returned 404; its single browser resource notice was the expected 404 and not a defect.

Playwright Axe reported zero violations on all routes in both light and dark preferences. The add dialog had an accessible name, focused Vendor on open, trapped native modal focus, closed with Escape, and returned focus to **Add a bill**. Keyboard-only entry saved and persisted a bill. SPA navigation and browser Back focused the new H1 and updated the polite route announcement. Focus used a visible 3 px ring. Controls were at least 44 px; the 1 × 1 CSV input is hidden and operated by the visible 44 px **Import CSV** button. Content reflowed at 200% text size. Reduced motion shortened row animation to `0.00001s`.

All internal links, the Param Factory link, legal email links, and checkout target were valid. Privacy and Terms had distinct titles and working contact paths. The static 404 retained its complete legal shell and zero Axe violations.

## Privacy, offline use, and updates

The live demo request log contained only the product origin. No analytics, remote font, or third-party script loaded. Bill writes remained in encrypted browser storage. The only allowed external runtime path is an explicit license or checkout action to the documented Sociobot API.

After the live service worker controlled `/demo`, a fresh offline reload restored Harbor Electric and displayed the offline status. `registration.update()` completed. A controlled update against the same production build showed “An update is ready. Reload to use it.” and the **Reload** action.

This is a static local-first PWA, not a backend product. Tenant isolation, server restart persistence, and an application 429 path therefore do not apply. The checkout and license endpoints belong to the authorised Sociobot billing integration and were checked without credentials. CLI, library, and desktop installed-artifact checks also do not apply.

## Build, deployment, and performance

The implementation candidate is `a91c467`; later commits through documentation SHA `4956b73` contain reports and evidence only. A clean candidate build matched the live `index.html`, JavaScript, CSS, and `sw.js` byte-for-byte. Hashed bundles use one-year immutable caching; HTML and the service worker revalidate after 30 seconds.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 61 packages, zero vulnerabilities |
| Every command in `.factory/claims.json` | PASS — 22/22 |
| `npm test` | PASS — 31/31 Playwright tests |
| `npm run test:unit` | PASS — 16/16 Vitest tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/index.html` produced |
| `npm run verify:checkout` | PASS — 303 to hosted $19 one-time checkout |
| `/opt/fleet/lib/verify-url.sh` | PASS — 610 ms, no errors, complete basic structure |

The build emitted 37.72 kB JavaScript raw / 12.10 kB gzip and 16.40 kB CSS raw / 4.40 kB gzip. The phone hero is 75.20 kB. All are within the supplied budgets. Fresh mobile Lighthouse scored 100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO, with FCP 0.9 s, LCP 1.4 s, TBT 0 ms, and CLS 0.

## Product scope and missed leverage

The briefed work loop is complete: manual and CSV entry, due-date order, seven-day cash totals, attachment links, explicit paid confirmation, paid history, export, and offline local storage. Account sync or an AI step would add financial-data exposure without filling a missing briefed action. No missed-leverage finding applies.

## Decision

**PASS — zero findings and zero untested claims.**
