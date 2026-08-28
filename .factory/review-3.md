# Adversarial first-read review 3 — Bills Due Board

**Reviewed:** 2026-08-28 UTC

**Live URL:** <https://bills-due-board.sociobot.in>

**Source commit:** `6924877e751e9ba4d446cb8ecffe70b6f58a7aff`

**Verdict: PASS**

No finding remains. There are zero blocking findings, zero minor findings, and no untested claim.

## Findings

None.

## Cold first read

I opened `/` in new browser contexts at **390 × 844** and **1440 × 900**, without prior storage or scrolling. Both returned HTTP 200 with no console error, cross-origin request, or horizontal overflow.

- **What it does, in my words:** lists planned bills by due date and lets me record each payment.
- **For whom:** solo operators who review bills beside another finance tool.
- **What I should click first:** **Try it with sample data** to see a separate populated board. **Add your first bill** is the direct real-data alternative.

The exact first-screen text that supplied those answers was “See every bill by due date,” “For solo operators who need one place to review bills and confirm each payment,” “Try it with sample data,” and “The sample opens a separate demo board.” All were visible before scrolling at 390 px and desktop. The phone also showed all three facts before the artwork. The first-read gate passes.

## Copy audit

Counts are whitespace-separated words; the decorative separator in the version line is not a word. Navigation, headings, actions, alt text, captions, and footer copy are included because the supplied plain-words criteria apply to all interface text. Dynamic vendors, dates, and amounts are records rather than sentences. No item exceeds 22 words, uses a banned marketing adjective, introduces inconsistent terminology, or uses a metaphor or mood heading.

### Landing page

| Exact copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass — direct action |
| Bills Due Board | 3 | Pass — product name |
| Demo | 1 | Pass — route name |
| My board | 2 | Pass — route name |
| Privacy | 1 | Pass — route name |
| Terms | 1 | Pass — route name |
| Bills by due date | 4 | Pass — direct section label |
| See every bill by due date | 6 | Pass — job headline |
| For solo operators who need one place to review bills and confirm each payment. | 14 | Pass — audience and outcome |
| Try it with sample data | 5 | Pass — result-naming action |
| Add your first bill | 4 | Pass — result-naming action |
| The sample opens a separate demo board. | 7 | Pass — `demo-isolation` |
| Works offline after the first visit | 6 | Pass — `offline-reload` |
| Records use encrypted browser storage | 5 | Pass — `encrypted-storage` |
| Free for 10 active bills | 5 | Pass — `free-limit` |
| An abstract seven-day calendar shows planned bills by their due dates. | 11 | Pass — useful image alt text |
| Each planned bill stays listed until you mark it paid. | 10 | Pass — `due-order`, `paid-confirmation` |
| Bills due in the next seven days | 7 | Pass — direct section heading |
| The board sorts planned bills by date. | 7 | Pass — `due-order` |
| Overdue items stay first until you mark them paid. | 9 | Pass — `due-order` |
| Next seven days | 3 | Pass — data label |
| 3 planned bills | 3 | Pass — `landing-preview` data label |
| How to track planned bills | 5 | Pass — direct section heading |
| Add planned bills | 3 | Pass — direct step heading |
| Type one bill or import a CSV file from your current tool. | 12 | Pass — `manual-entry`, `csv-import` |
| Review the cash week | 4 | Pass — direct step heading |
| See the total due on each of the next seven days. | 11 | Pass — `cash-week` |
| Confirm payment | 2 | Pass — direct step heading |
| Choose the paid date. | 4 | Pass — `paid-confirmation` |
| The bill then moves into paid history. | 7 | Pass — `paid-confirmation` |
| What this board does not do | 6 | Pass — direct section heading |
| This is a planning record. | 5 | Pass — product boundary |
| Marking a bill paid does not move money or post to an accounting ledger. | 14 | Pass — `payment-initiation` |
| No bank credentials | 3 | Pass — `bank-credentials` |
| No payment initiation | 3 | Pass — `payment-initiation` |
| No tax or accounting advice | 5 | Pass — `tax-advice` |
| No automatic account sync | 4 | Pass — `account-sync` |
| Price and license | 3 | Pass — direct section heading |
| The free board holds 10 active bills. | 7 | Pass — `free-limit` |
| A license removes that limit. | 5 | Pass — `licensed-unlimited` |
| CSV import, export, offline use, and accessibility stay free. | 9 | Pass — declared claims |
| $19 once | 2 | Pass — `license-checkout` |
| Buy a license | 3 | Pass — result-naming action |
| A list of planned bills by due date. | 7 | Pass — plain product description |
| Built by Param Factory | 4 | Pass — attribution link |
| v1.0.5 · Works offline | 3 | Pass — `offline-reload` |

### README

| Exact copy | Words | Result |
| --- | ---: | --- |
| Bills Due Board | 3 | Pass — product name |
| See every bill by due date, then confirm each payment. | 10 | Pass — job statement |
| Bills Due Board is for solo operators who need a short list of bills due beside their finance tool. | 19 | Pass — audience and situation |
| It is a web app that keeps its bill records on this device. | 13 | Pass — `local-privacy` |
| It is not an accounting ledger or payment service. | 9 | Pass — `payment-initiation` |
| Live site: https://bills-due-board.sociobot.in | 3 | Pass — link label |
| One-click demo: https://bills-due-board.sociobot.in/demo | 3 | Pass — link label |
| What it does | 3 | Pass — direct heading |
| Adds planned bills by form or CSV import. | 8 | Pass — `manual-entry`, `csv-import` |
| Sorts unpaid bills into overdue, next seven days, and later. | 10 | Pass — `due-order` |
| Shows the amount due on each of the next seven days. | 11 | Pass — `cash-week` |
| Confirms a paid date and keeps paid history. | 8 | Pass — `paid-confirmation` |
| Exports every bill as CSV. | 5 | Pass — `csv-export` |
| Stores bill records in encrypted browser storage. | 7 | Pass — `encrypted-storage` |
| Reloads offline after the first online visit. | 7 | Pass — `offline-reload` |
| The demo uses a separate storage database. | 7 | Pass — `demo-isolation` |
| It does not read or write the real board. | 9 | Pass — `demo-isolation` |
| The automated claim tests verify these statements from a fresh browser context. | 12 | Pass — test documentation |
| Free and paid use | 4 | Pass — direct heading |
| The free board holds 10 active bills. | 7 | Pass — `free-limit` |
| CSV import, CSV export, offline use, and accessibility remain free. | 10 | Pass — declared claims |
| A $19 one-time license removes the active-bill limit. | 8 | Pass — `license-checkout`, `licensed-unlimited` |
| Checkout and license verification use the Sociobot billing API. | 9 | Pass — `license-checkout`, `license-verify` |
| The factory registers the product before release, so this repository contains no provider keys or product ID. | 17 | Pass — developer release note confirmed by source scan |
| Run locally | 2 | Pass — direct heading |
| Requirements: Node.js 20 or newer and npm. | 7 | Pass — developer instruction |
| Open http://localhost:5173/demo for the sample workspace. | 6 | Pass — developer instruction |
| Test and build | 3 | Pass — direct heading |
| Playwright 1.58.2 is pinned. | 4 | Pass — confirmed in package files |
| The worker image already provides its Chromium browser. | 8 | Pass — worker instruction |
| The exact production build command is npm run build. | 9 | Pass — developer instruction |
| It writes dist/index.html and the static PWA files under dist/. | 10 | Pass — observed build result |
| Each public claim and its tagged test lives in .factory/claims.json. | 10 | Pass — registry documentation |
| Run one claim with: | 4 | Pass — developer instruction |
| CSV format | 2 | Pass — direct heading |
| Required columns are vendor, amount, and due_date. | 7 | Pass — format documentation |
| Dates use YYYY-MM-DD. | 3 | Pass — format documentation |
| Optional columns are category, attachment, notes, status, and paid_date. | 9 | Pass — format documentation |
| Valid status values are planned and paid. | 7 | Pass — format documentation |
| Privacy and limits | 3 | Pass — direct heading |
| The app does not request bank credentials or initiate payments. | 10 | Pass — `bank-credentials`, `payment-initiation` |
| Bill records remain in browser storage unless you export them. | 10 | Pass — `local-privacy`, `csv-export` |
| A license token is sent to Sociobot for verification at most once per day. | 14 | Pass — `license-verify` |
| See the in-app /privacy and /terms pages. | 7 | Pass — direct instruction |
| Clearing site data removes the board and saved license from that browser. | 12 | Pass — `clear-local-data` |
| Deploy | 1 | Pass — direct heading |
| Deploy the contents of dist/ as a static site. | 9 | Pass — developer instruction |
| staticwebapp.config.json supplies SPA routing, security headers, and a short revalidation policy for stable assets. | 14 | Pass — deployment documentation confirmed in source |
| The factory owns DNS, billing registration, and deployment. | 8 | Pass — ownership boundary |
| License | 1 | Pass — direct heading |
| MIT. | 1 | Pass — license statement |
| See LICENSE. | 2 | Pass — direct link instruction |

Terminology stays consistent: **planned bill**, **bill list/board**, **cash week**, **paid history**, **demo**, **license**, and **attachment link**. “Board” names the product/workspace while “bill list” names its records; the uses do not conflict. Every button uses a verb and names its result.

## Demo and sandbox

One click on **Try it with sample data** opened `/demo` and immediately showed the working board, not an explainer. It contained five planned bills and one paid bill with realistic vendors, an overdue Harbor Electric bill, and `$1,339.80` due in the next seven days.

The persistent banner says “Demo — sample data, nothing is saved to your board” and exposes **Reset demo** and **Start for real**. I marked Harbor Electric paid, reset, and confirmed it returned as planned. **Start for real** opened an empty `/board`; Harbor Electric was absent. Browser database inspection showed only `demo:bills-due-board:v1` before exit and only `bills-due-board:v1` after exit because the demo database was discarded. Source inspection confirms every bill read and write chooses one of these separate database names.

The complete demo flow made no cross-origin request and loaded no third-party script. After the service worker controlled `/demo`, an offline reload restored Harbor Electric and displayed “You are offline. Your board still works on this device.” Demo isolation, privacy, and offline behavior pass.

## Claims

`.factory/claims.json` contains 22 entries. In clean clone `/tmp/bills-due-board-review-3.Lm1sbX` at the reviewed commit, I ran `npm ci` and then every listed `test` command separately. All passed:

| Claim IDs | Result |
| --- | --- |
| `offline-reload`, `csv-export`, `csv-import`, `paid-confirmation`, `cash-week`, `due-order` | PASS |
| `landing-preview`, `encrypted-storage`, `demo-isolation`, `free-limit`, `local-privacy` | PASS |
| `bank-credentials`, `payment-initiation`, `account-sync`, `tax-advice` | PASS |
| `license-verify`, `license-offline`, `license-checkout`, `clear-local-data` | PASS |
| `manual-entry`, `licensed-unlimited`, `free-accessibility` | PASS |

The checkout check observed the expected HTTP 303 to the Dodo-hosted `$19` one-time license page. A source registry test also confirms exactly one `@claim:<id>` test per browser claim. Cross-checking every landing and README statement above found no unlisted product claim and no untested declared claim.

The same clean clone then passed `npm test` (**31/31**), `npm run test:unit` (**16/16**), `npm run typecheck`, `npm run lint`, and `npm run build`. The build produced `dist/`; initial JavaScript is 37.72 kB raw / 12.10 kB gzip and CSS is 16.40 kB raw / 4.40 kB gzip.

## Historical findings

Every earlier review, polish report, and handoff was read. Each finding was checked on the live site and in current source.

| Earlier finding | Current verification | Result |
| --- | --- | --- |
| F-1-1 — incomplete static 404 | Live unknown URL returns HTTP 404 with designed page, complete title/description/canonical/OG/Twitter/favicon/Apple metadata, Home/Demo/My board/Privacy/Terms, legal footer, and Param Factory attribution. `public/404.html` matches. | Fixed |
| F-1-2 — unlisted tax/advice boundary | Landing and Terms retain the direct boundary; `tax-advice` exists in `claims.json`; its clean-demo test passed with a tax record, no advice output, and no request. | Fixed |
| F-1-3 — README “PWA” and “IndexedDB” jargon | Both old phrases are absent. README uses “web app” and “encrypted browser storage.” | Fixed |
| F-2-1 — slogan/metaphor headings and caption | Live and source use “Bills by due date,” “Bills due in the next seven days,” “How to track planned bills,” “What this board does not do,” “Price and license,” and the direct planned-bill caption. Every old phrase is absent. | Fixed |
| F-2-2 — unlisted “Artwork is generated” claim | The public sentence is absent live and in `src/main.ts`; provenance remains in `.factory/design.md`. | Fixed |
| F-2-3 — README “payable queue” jargon | The phrase is absent; README says “short list of bills due.” | Fixed |

No historical finding is half-fixed or regressed.

## Structure, links, accessibility, and identity

- `/`, `/demo`, `/board`, `/privacy`, and `/terms` return 200 with unique plain titles, descriptions, canonicals, OG metadata, social art, favicon, Apple icon, exactly one H1, and one main landmark. The title patterns are correct and the home title is under 60 characters.
- The designed unknown route returns HTTP 404 and provides **Return home**. Header and footer navigation is consistent across routes. Browser Back restored the landing page; in-app navigation moved focus to the destination H1 and updated the polite route announcement.
- Every normal link crawled successfully: app routes and assets returned 200, the external Param Factory site returned 200, checkout returned its expected 303, and `mailto:` links were valid non-HTTP targets. The 404 page's skip-link fragment remains on that intentional 404 response and is not a dead destination.
- Playwright Axe found zero violations on all five app routes and the 404. The factory URL verifier reported `lang=en`, one H1, one main, no missing alt text, no unlabeled buttons, no console errors, and a 724 ms cold load. Automated checks also passed keyboard entry, visible skip/focus behavior, 44 px targets, 200% text reflow, long-content wrapping, and reduced-motion CSS.
- Live response headers include a matching CSP, `frame-ancestors 'none'` as a response header, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- The warm paper palette, ruled board, clipped paper shapes, date-wheel artwork, serif display type, stamp-like controls, and ink marks visibly match `.factory/design.md`. The screen is recognizable from a thumbnail and is not a generic SaaS hero/card template.

## Missed leverage

The brief's useful loop is complete: manual entry, CSV import/export, due-date ordering, seven-day cash view, attachment links, paid confirmation, paid history, and offline local storage are present. A normal user would not expect account sync or an AI step from this explicitly local planning board; either would add financial-data exposure without solving a missing briefed step. There is no decorative AI, provider key, or direct provider integration.

## What would make this perfect

Nothing is left to change under the supplied checklist. Preserve the current direct copy, isolated demo namespace, one-test-per-claim registry, route metadata, and product-specific payment-horizon identity in future releases.
