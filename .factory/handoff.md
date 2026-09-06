# Bills Due Board — independent review 4 handoff

## Status: PASS

Independent review 4 found zero findings of every severity and zero untested claims. Product code was not modified.

## What was done

- Reviewed live implementation candidate `a91c467ee8630b0c1e52a31994cc05a47d15c6b2` and documentation SHA `4956b73dadb924f2787994643080c080033b89b5`.
- Opened fresh 390 × 844 and 1440 × 900 browser contexts and recorded the no-scroll job, audience, and first action.
- Exercised sample entry, populated output, payment, edit, undo, delete, invalid input, CSV recovery, reload, Reset demo, Start for real, and storage isolation.
- Ran all 22 declared claim commands independently from a clean clone.
- Rechecked all six findings from reviews 1 and 2 against live output and source.
- Checked every route in light and dark preferences, route titles, links, keyboard focus, dialog focus, 200% text, reduced motion, Axe, privacy, offline reload, service-worker update notice, legal pages, and the designed HTTP 404.
- Confirmed live HTML, JavaScript, CSS, and service worker match the clean candidate build byte-for-byte.
- Recorded the full result in `.factory/review-4.md` and copied it to `/work/.evidence/qa-report.md`.

## How to verify

From a clean checkout with Node.js 20 or newer:

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run lint
npm run build
npm run verify:checkout
```

Run each exact command in `.factory/claims.json` separately. Review the live sample at <https://bills-due-board.sociobot.in/demo> in a fresh browser context. The factory verifier command is:

```sh
/opt/fleet/lib/verify-url.sh https://bills-due-board.sociobot.in <evidence-directory>
```

Observed results: 22/22 claim commands, 31/31 Playwright tests, 16/16 unit tests, typecheck, lint, build, checkout, live route checks, and live accessibility checks all passed. Fresh mobile Lighthouse scored 100/100/100/100.

## Known gaps and next steps

None found. Repeat the claim matrix and live browser review after any product, copy, route, storage, billing, or service-worker change.
