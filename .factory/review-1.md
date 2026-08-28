# Adversarial first-read review 1 — Bills Due Board

**Reviewed:** 2026-08-28 UTC  
**Live URL:** https://bills-due-board.sociobot.in  
**Verdict: FAIL**

The site is clear and immediately tryable on a 390 px phone and desktop. The demo is isolated and useful. All declared claims passed. The three findings below prevent PASS because this review requires zero findings.

## Findings

### F-1-1 — Minor — the static 404 is not the complete site route

- **Evidence:** A cold request to /not-a-real-route returned the designed 404 with title, description, and one H1, but no canonical URL, Open Graph/Twitter tags, or apple-touch icon. Its header has Home, Demo, My board, and Privacy. Its footer is only “A due-date queue for planned bills. · v1.0.3”; it has no Privacy or Terms link, and Terms is also missing from the header.
- **Why it matters:** A visitor reaching a stale URL loses the consistent legal navigation. The route is publicly addressable but lacks normal route metadata.
- **Fix:** Give public/404.html the same legal links and Param Factory footer as app routes, add Terms to its header, and add canonical, OG/Twitter, manifest, theme-color, and apple-touch metadata using existing product art. Preserve HTTP 404 and the return-home action.

### F-1-2 — Minor — the tax/advice boundary is an unlisted claim

- **Location / quote:** Landing **Clear boundaries**: “No tax or accounting advice.” Terms: “Bills Due Board is a planning tool. It does not move money, post ledger entries, or provide tax or accounting advice.”
- **Why it matters:** This is a visitor-reliance product boundary. .factory/claims.json declares and tests adjacent bank-credential, payment-initiation, and account-sync boundaries, but contains no observable test for advice.
- **Fix:** Remove the assertion from public copy, or add a tax-advice claim with one tagged clean-demo test that verifies the boundary rather than merely checking for a label.

### F-1-3 — Minor — README uses unexplained storage/app jargon

- **Location / quote:** “It is a local-first PWA, not an accounting ledger or payment service.” and “Stores bill records in an encrypted IndexedDB document.”
- **Why it matters:** “PWA” and “IndexedDB” do not explain the outcome to a solo operator. The supplied plain-words rule explicitly includes README.
- **Fix:** Use: “It is a web app that keeps its bill records on this device. It is not an accounting ledger or payment service.” and “Stores bill records in encrypted browser storage.” Keep implementation terms in developer-only deployment notes.

## Cold first read

Fresh no-scroll contexts at 390 × 844 and 1440 × 900 both returned 200 with no console or page errors.

- **What it does:** Lists planned bills by due date, highlights the next seven days of cash, and records bills as paid.
- **For whom:** “For solo operators who need one place to review bills and confirm each payment.”
- **First click:** “Try it with sample data.” Its adjacent note says, “The sample opens a separate demo board.”

The first screen therefore passes the clarity test. Its job-focused headline is six words; the sample action is prominent, explained, and usable without setup.

## Copy audit

Counts are whitespace-separated words. Sentence-like UI labels and alt text are included; changing dynamic sample dates or amounts does not change the conclusion. Nothing exceeds 22 words.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| A clear queue before the ledger | 6 | Pass |
| See every bill by due date | 6 | Pass |
| For solo operators who need one place to review bills and confirm each payment. | 14 | Pass |
| The sample opens a separate demo board. | 7 | Pass |
| Works offline after the first visit. | 6 | offline-reload |
| Records use encrypted browser storage. | 5 | encrypted-storage |
| Free for 10 active bills. | 5 | free-limit |
| Paper bill slips arranged around a circular seven-day planning wheel. | 10 | Pass (alt) |
| Each slip joins the queue until you confirm payment. | 9 | Pass |
| The queue | 2 | Pass (label) |
| Know what needs cash next | 5 | Pass |
| The board sorts planned bills by date. | 7 | due-order |
| Overdue items stay first until you mark them paid. | 9 | due-order |
| Next seven days | 3 | Pass (data label) |
| 3 planned bills | 3 | landing-preview |
| How it works | 3 | Pass (label) |
| Keep the payment decision visible | 5 | Pass |
| Add planned bills | 3 | Pass |
| Type one bill or import a CSV file from your current tool. | 12 | csv-import |
| Review the cash week | 4 | Pass |
| See the total due on each of the next seven days. | 11 | cash-week |
| Confirm payment | 2 | Pass |
| Choose the paid date. | 4 | paid-confirmation |
| The bill then moves into paid history. | 7 | paid-confirmation |
| Clear boundaries | 2 | Pass (label) |
| A board, not a bank | 5 | Pass |
| This is a planning record. | 5 | Pass |
| Marking a bill paid does not move money or post to an accounting ledger. | 14 | payment-initiation |
| No bank credentials | 3 | bank-credentials |
| No payment initiation | 3 | payment-initiation |
| No tax or accounting advice | 5 | **F-1-2** |
| No automatic account sync | 4 | account-sync |
| One-time license | 2 | Pass (label) |
| Keep an unlimited active queue | 5 | licensed-unlimited |
| The free board holds 10 active bills. | 7 | free-limit |
| A license removes that limit. | 5 | licensed-unlimited |
| CSV import, export, offline use, and accessibility stay free. | 9 | declared claims |
| $19 once. | 2 | license-checkout |
| A due-date queue for planned bills. | 6 | Pass |
| Artwork is generated. | 3 | Pass (asset provenance) |

Buttons name outcomes: **Try it with sample data**, **Add your first bill**, and **Buy a license**. Demo buttons **Reset demo** and **Start for real** are similarly clear. Terminology stays consistent: planned bill, queue, cash week, paid history, demo, and license.

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| See every bill by due date, then confirm each payment. | 10 | Pass |
| Bills Due Board is for solo operators who need a small payable queue beside their finance tool. | 17 | Pass |
| It is a local-first PWA, not an accounting ledger or payment service. | 12 | **F-1-3** |
| Adds planned bills by form or CSV import. | 8 | declared claims |
| Sorts unpaid bills into overdue, next seven days, and later. | 10 | due-order |
| Shows the amount due on each of the next seven days. | 11 | cash-week |
| Confirms a paid date and keeps paid history. | 8 | paid-confirmation |
| Exports every bill as CSV. | 5 | csv-export |
| Stores bill records in an encrypted IndexedDB document. | 8 | **F-1-3** |
| Reloads offline after the first online visit. | 7 | offline-reload |
| The demo uses a separate storage database. | 7 | demo-isolation |
| It does not read or write the real board. | 9 | demo-isolation |
| The automated claim tests verify these statements from a fresh browser context. | 12 | Pass |
| The free board holds 10 active bills. | 7 | free-limit |
| CSV import, CSV export, offline use, and accessibility remain free. | 10 | declared claims |
| A $19 one-time license removes the active-bill limit. | 8 | licensed-unlimited |
| Checkout and license verification use the Sociobot billing API. | 9 | declared claims |
| The factory registers the product before release, so this repository contains no provider keys or product ID. | 17 | Pass (developer note) |
| Requirements: Node.js 20 or newer and npm. | 7 | Pass (developer instruction) |
| Open http://localhost:5173/demo for the sample workspace. | 6 | Pass (developer instruction) |
| Playwright 1.58.2 is pinned. | 4 | Pass (developer instruction) |
| The worker image already provides its Chromium browser. | 8 | Pass (developer instruction) |
| The exact production build command is npm run build. | 9 | Pass (developer instruction) |
| It writes dist/index.html and the static PWA files under dist/. | 10 | Pass (developer instruction) |
| Each public claim and its tagged test lives in .factory/claims.json. | 10 | Pass (developer instruction) |
| Run one claim with: | 4 | Pass (developer instruction) |
| Required columns are vendor, amount, and due_date. | 7 | Pass |
| Dates use YYYY-MM-DD. | 3 | Pass |
| Optional columns are category, attachment, notes, status, and paid_date. | 9 | Pass |
| Valid status values are planned and paid. | 7 | Pass |
| The app does not request bank credentials or initiate payments. | 10 | declared claims |
| Bill records remain in browser storage unless you export them. | 10 | local-privacy |
| A license token is sent to Sociobot for verification at most once per day. | 14 | license-verify |
| See the in-app /privacy and /terms pages. | 7 | Pass |
| Clearing site data removes the board and saved license from that browser. | 12 | clear-local-data |
| Deploy the contents of dist/ as a static site. | 9 | Pass (developer instruction) |
| staticwebapp.config.json supplies SPA routing, security headers, and a short revalidation policy for stable assets. | 14 | Pass (developer instruction) |
| The factory owns DNS, billing registration, and deployment. | 8 | Pass (developer instruction) |
| MIT. | 1 | Pass |
| See LICENSE. | 2 | Pass |

## Demo and sandbox

- /demo immediately showed six realistic bills: five planned and one paid, grouped overdue / next seven days / later, with $1,339.80 due in the next seven days.
- The persistent banner says: “Demo — sample data, nothing is saved to your board,” with **Reset demo** and **Start for real**.
- I marked Harbor Electric paid, waited for five planned bills to become four, reset the demo, and confirmed the original five planned bills plus one overdue returned. **Start for real** opened /board; a fresh real board had no sample records.
- Code and the passing claim test use distinct encrypted IndexedDB namespaces: demo:bills-due-board:v1 and bills-due-board:v1.
- Fresh live /demo request logging showed only same-origin page, JS, and CSS requests. No console/page errors occurred.

## Claims, structure, accessibility, and history

.factory/claims.json has 21 declared claims. From a clean npm ci, every listed command was run individually and passed: 20 tagged Playwright claims plus npm run verify:checkout (303 to Dodo's $19 one-time checkout). npm test passed 29/29, npm run test:unit passed 14/14, and typecheck, lint, and build passed with dist/ produced.

The link crawl returned 200 for every normal route, sitemap, robots, manifest, icons, social card, and the external Param Factory link; checkout returned its expected 303 and the unknown route its expected 404. Live Axe reported zero violations on /, /demo, /board, /privacy, /terms, and the 404. Normal app routes have one H1, main, title, description, canonical, OG art, favicon/apple touch icon, and shared header/footer. Deep links, browser Back, H1 focus, and polite route announcements worked. CSP, referrer policy, content-type, and permissions headers are present.

No earlier .factory/review-*.md or .factory/polish-*.md exists. .factory/handoff.md records no open previous finding ID, so there was no historical finding to reconfirm. The brief's manual/CSV entry, attachment links, cash-week, paid confirmation, and export are present. It does not imply a missing AI feature, sync service, or other leverage feature; no decorative AI or embedded provider key was found.

## What would make this perfect

Repair F-1-1 through F-1-3 and rerun this complete review and clean claim matrix. The product would then retain its clear one-click demo, honest local behavior, and distinct payment-horizon visual identity with no remaining review finding.

