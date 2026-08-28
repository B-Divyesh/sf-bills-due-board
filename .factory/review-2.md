# Adversarial first-read review 2 — Bills Due Board

**Reviewed:** 2026-08-28 UTC  
**Live URL:** <https://bills-due-board.sociobot.in>  
**Verdict: FAIL**

The product is clear and usable on a cold 390 px visit, and its isolated sample board works. This review still fails because three copy findings remain. They are ordered by severity; no blocking finding was found.

## Findings

### F-2-1 — Minor — six landing headings and the artwork caption use slogans or metaphors instead of naming the section

- **Locations / exact text:** hero eyebrow, “A clear queue before the ledger”; preview eyebrow and heading, “The queue” / “Know what needs cash next”; How it works heading, “Keep the payment decision visible”; Clear boundaries heading, “A board, not a bank”; pricing heading, “Keep an unlimited active queue”; hero-art caption, “Each slip joins the queue until you confirm payment.”
- **Why this fails:** These are not useful out of context to a first-time visitor or screen-reader heading list. “Ledger,” “queue,” “slip,” and “payment decision” make the visitor translate product language. The supplied plain-words contract requires headings to name their section and forbids metaphor or mood copy.
- **Concrete fix:** Use “Bills by due date” for the hero eyebrow; “Bills due in the next seven days” for the preview heading (remove “The queue”); “How to track planned bills” for the steps heading; “What this board does not do” for boundaries; “Price and license” for pricing; and “Each planned bill stays listed until you mark it paid.” for the caption. These are direct labels, preserve the visual direction, and explain the content without product lore.

### F-2-2 — Minor — an asset-provenance statement is an unlisted public claim

- **Location / exact text:** landing footer: “Artwork is generated.”
- **Why this fails:** A visitor can rely on this factual provenance statement, but `.factory/claims.json` has no `artwork-generated` entry or observable test. The claims contract requires every claim-like public sentence to be listed and tested; source provenance in `design.md` is not a runtime claim test.
- **Concrete fix:** Remove the sentence from public footer copy and retain the detailed provenance in `.factory/design.md`, or add an `artwork-generated` registry entry with a deterministic test that verifies the shipped image provenance record. The former is the clearer visitor-facing option.

### F-2-3 — Minor — README uses unexplained accounting jargon

- **Location / exact text:** README opening: “Bills Due Board is for solo operators who need a small payable queue beside their finance tool.”
- **Why this fails:** “Payable queue” is accounting jargon and asks a cold visitor to infer that it means a due-date list. The plain-words review explicitly includes README copy.
- **Concrete fix:** Replace it with: “Bills Due Board is for solo operators who need a short list of bills due beside their finance tool.”

## Cold first read

Fresh browser contexts at **390 × 844** and **1440 × 900** loaded `/` with HTTP 200, no console/page errors, and no cross-origin requests.

- **What it does:** It lists planned bills by due date, shows upcoming cash needs, and lets the visitor record a payment as paid.
- **For whom:** “For solo operators who need one place to review bills and confirm each payment.”
- **First click:** **Try it with sample data**. The adjacent text, “The sample opens a separate demo board,” states the result.

The first screen therefore answers all three required questions. The primary action is visible before scrolling at 390 px. This is not a blocking clarity failure.

## Copy audit

Counts are whitespace-separated. Static navigation, labels, buttons, art text, and footer copy are included; generated dates, vendor names, and amounts are data rather than sentences. `F-2-1` through `F-2-3` mark the only flags.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| Bills Due Board | 3 | Pass |
| Demo | 1 | Pass |
| My board | 2 | Pass |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| A clear queue before the ledger | 6 | F-2-1 |
| See every bill by due date | 6 | Pass |
| For solo operators who need one place to review bills and confirm each payment. | 14 | Pass |
| Try it with sample data | 5 | Pass — result-naming action |
| Add your first bill | 4 | Pass — result-naming action |
| The sample opens a separate demo board. | 7 | demo-isolation |
| Works offline after the first visit | 6 | offline-reload |
| Records use encrypted browser storage | 5 | encrypted-storage |
| Free for 10 active bills | 5 | free-limit |
| Paper bill slips arranged around a circular seven-day planning wheel. | 10 | Pass — alt text |
| Each slip joins the queue until you confirm payment. | 9 | F-2-1 |
| The queue | 2 | F-2-1 |
| Know what needs cash next | 5 | F-2-1 |
| The board sorts planned bills by date. | 7 | due-order |
| Overdue items stay first until you mark them paid. | 9 | due-order |
| Next seven days | 3 | Pass — data label |
| 3 planned bills | 3 | landing-preview |
| How it works | 3 | Pass — section label |
| Keep the payment decision visible | 5 | F-2-1 |
| Add planned bills | 3 | Pass |
| Type one bill or import a CSV file from your current tool. | 12 | manual-entry, csv-import |
| Review the cash week | 4 | Pass |
| See the total due on each of the next seven days. | 11 | cash-week |
| Confirm payment | 2 | Pass |
| Choose the paid date. | 4 | paid-confirmation |
| The bill then moves into paid history. | 7 | paid-confirmation |
| Clear boundaries | 2 | Pass — section label |
| A board, not a bank | 5 | F-2-1 |
| This is a planning record. | 5 | Pass |
| Marking a bill paid does not move money or post to an accounting ledger. | 14 | payment-initiation |
| No bank credentials | 3 | bank-credentials |
| No payment initiation | 3 | payment-initiation |
| No tax or accounting advice | 5 | tax-advice |
| No automatic account sync | 4 | account-sync |
| One-time license | 2 | Pass — section label |
| Keep an unlimited active queue | 5 | F-2-1 |
| The free board holds 10 active bills. | 7 | free-limit |
| A license removes that limit. | 5 | licensed-unlimited |
| CSV import, export, offline use, and accessibility stay free. | 9 | csv-import, csv-export, offline-reload, free-accessibility |
| $19 once | 2 | license-checkout |
| Buy a license | 3 | Pass — result-naming action |
| A due-date queue for planned bills. | 6 | Pass |
| Artwork is generated. | 3 | F-2-2 |
| Built by Param Factory | 4 | Pass — external attribution |
| v1.0.4 · Works offline | 3 | offline-reload |

No landing sentence exceeds 22 words. Terminology is otherwise consistent enough to understand: **bill**, **planned bill**, **paid history**, **demo**, and **license**. “Queue” is the unnecessary exception identified in F-2-1.

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| See every bill by due date, then confirm each payment. | 10 | Pass |
| Bills Due Board is for solo operators who need a small payable queue beside their finance tool. | 17 | F-2-3 |
| It is a web app that keeps its bill records on this device. | 12 | local-privacy |
| It is not an accounting ledger or payment service. | 10 | payment-initiation |
| Live site: https://bills-due-board.sociobot.in | 2 | Pass — URL label |
| One-click demo: https://bills-due-board.sociobot.in/demo | 2 | Pass — URL label |
| What it does | 4 | Pass — heading |
| Adds planned bills by form or CSV import. | 8 | manual-entry, csv-import |
| Sorts unpaid bills into overdue, next seven days, and later. | 10 | due-order |
| Shows the amount due on each of the next seven days. | 11 | cash-week |
| Confirms a paid date and keeps paid history. | 8 | paid-confirmation |
| Exports every bill as CSV. | 5 | csv-export |
| Stores bill records in encrypted browser storage. | 7 | encrypted-storage |
| Reloads offline after the first online visit. | 7 | offline-reload |
| The demo uses a separate storage database. | 7 | demo-isolation |
| It does not read or write the real board. | 9 | demo-isolation |
| The automated claim tests verify these statements from a fresh browser context. | 12 | Pass — test documentation |
| Free and paid use | 4 | Pass — heading |
| The free board holds 10 active bills. | 7 | free-limit |
| CSV import, CSV export, offline use, and accessibility remain free. | 10 | csv-import, csv-export, offline-reload, free-accessibility |
| A $19 one-time license removes the active-bill limit. | 8 | licensed-unlimited, license-checkout |
| Checkout and license verification use the Sociobot billing API. | 9 | license-checkout, license-verify |
| The factory registers the product before release, so this repository contains no provider keys or product ID. | 17 | Pass — developer deployment note |
| Run locally | 2 | Pass — heading |
| Requirements: Node.js 20 or newer and npm. | 7 | Pass — developer instruction |
| Open http://localhost:5173/demo for the sample workspace. | 6 | Pass — developer instruction |
| Test and build | 3 | Pass — heading |
| Playwright 1.58.2 is pinned. | 4 | Pass — developer instruction |
| The worker image already provides its Chromium browser. | 8 | Pass — developer instruction |
| The exact production build command is npm run build. | 9 | Pass — developer instruction |
| It writes dist/index.html and the static PWA files under dist/. | 10 | Pass — developer instruction |
| Each public claim and its tagged test lives in .factory/claims.json. | 10 | Pass — developer instruction |
| Run one claim with: | 4 | Pass — developer instruction |
| CSV format | 2 | Pass — heading |
| Required columns are vendor, amount, and due_date. | 7 | Pass |
| Dates use YYYY-MM-DD. | 3 | Pass |
| Optional columns are category, attachment, notes, status, and paid_date. | 9 | Pass |
| Valid status values are planned and paid. | 7 | Pass |
| Privacy and limits | 3 | Pass — heading |
| The app does not request bank credentials or initiate payments. | 10 | bank-credentials, payment-initiation |
| Bill records remain in browser storage unless you export them. | 10 | local-privacy, csv-export |
| A license token is sent to Sociobot for verification at most once per day. | 14 | license-verify |
| See the in-app /privacy and /terms pages. | 7 | Pass |
| Clearing site data removes the board and saved license from that browser. | 12 | clear-local-data |
| Deploy | 1 | Pass — heading |
| Deploy the contents of dist/ as a static site. | 9 | Pass — developer instruction |
| staticwebapp.config.json supplies SPA routing, security headers, and a short revalidation policy for stable assets. | 14 | Pass — developer instruction |
| The factory owns DNS, billing registration, and deployment. | 8 | Pass — developer deployment note |
| License | 1 | Pass — heading |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

No README sentence exceeds 22 words. F-2-3 is the only README wording flag.

## Demo and sandbox

- `/demo` immediately rendered **Plan bills. Confirm payments.** with five planned sample bills, one paid sample bill, the next-seven-days total, and actionable controls. It is a real populated product screen, not an explainer.
- The persistent banner reads “Demo — sample data, nothing is saved to your board” and includes **Reset demo** and **Start for real**.
- After marking Harbor Electric paid, **Reset demo** restored the seed. **Start for real** opened `/board`, where Harbor Electric was absent. The implementation uses distinct `demo:bills-due-board:v1` and `bills-due-board:v1` IndexedDB names; leaving demo deletes the demo namespace.
- A fresh live `/demo` request log contained only the page, same-origin JavaScript, and same-origin CSS. The complete demo flow produced no cross-origin request, console error, or page error. The offline claim test also passed from its clean demo context.

The demo meets the one-click and isolation requirements; no demo finding is raised.

## Claims and quality gates

`.factory/claims.json` contains 22 entries. From clean clone `/tmp/bills-due-board-review-2.N3O0ZD`, `npm ci` succeeded and every listed command was run individually. All 22 passed, including the hosted-checkout check (`303` to Dodo for a $19 one-time license). No declared claim failed.

Additional clean-clone checks passed:

- `npm test`: 31/31 Playwright tests.
- `npm run test:unit`: 15/15 Vitest tests.
- `npm run typecheck` and `npm run build`; `dist/` was produced. Initial JavaScript is 37.90 kB raw / 12.20 kB gzip.

The only unlisted claim-like visitor sentence found is F-2-2. All other landing and README reliance claims map to one or more declared entries in the audit above.

## History verification

Every prior review/polish/handoff file was read. This repository has one prior review and one polish cycle. Each earlier finding was checked live and in code, rather than accepted from a status label.

| Earlier finding | Live/code verification | Result |
| --- | --- | --- |
| F-1-1 static 404 metadata and legal navigation | `/not-a-real-route` returned a designed HTTP 404 with route title, description, canonical, OG/Twitter image, manifest, apple-touch icon, Privacy, Terms, and Param Factory links; `public/404.html` contains the same. | Fixed |
| F-1-2 unlisted tax/advice boundary | Landing and Terms retain the statement; `claims.json` declares `tax-advice`, and its isolated test passed. | Fixed |
| F-1-3 README storage/app jargon | The prior “local-first PWA” and “encrypted IndexedDB” wording is absent; the repair uses “web app” and “encrypted browser storage.” | Fixed |

No F-1 finding regressed. F-2-3 is a separate remaining instance of accounting jargon.

## Structure, links, accessibility, and visual identity

- At 390 px and desktop, `/`, `/demo`, `/board`, `/privacy`, `/terms`, and the 404 have one `h1`, one `main`, unique appropriate title/description/canonical, favicon, Apple icon, OG/Twitter image, and no horizontal overflow. The unknown route correctly returns HTTP 404; its expected network status is the only browser console entry on that route.
- In-app navigation updates history, restores the expected page with Back, moves focus to the destination `h1`, and uses the polite route announcer. The header and footer carry the required product/legal links. All normal routes, sitemap, robots, manifest, icons, social card, Param Factory link, and checkout endpoint returned successful responses; `mailto:` links were correctly not fetched.
- Live Axe scans at 390 px reported zero violations on every public app route and the 404. Focus styles, skip link, 44 px controls, reduced-motion CSS, and 200% reflow are also covered by passing browser tests.
- The paper-slip/date-wheel image, ruled surfaces, clipped corners, editorial serif, and ink/paper palette are visibly product-specific and match `.factory/design.md`; this is not a generic SaaS card template.

## Missed leverage

The brief implies manual entry, CSV import/export, due-date/cash-week review, attachment links, and paid confirmation. The live board provides those workflows. It does not imply an AI decision, account sync, or other AI-assisted feature that would improve the job without unnecessary financial-data exposure. No embedded provider key or decorative AI feature was found.

## What would make this perfect

Repair F-2-1 through F-2-3: replace the metaphor/mood headings with direct section names, remove or test the generated-art assertion, and replace “payable queue” with “list of bills due.” Then repeat this full cold, demo, claims, history, and structure review. With those changes, the verified product behavior would have no remaining finding.
