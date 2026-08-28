# Bills Due Board — review 2 handoff

## Status: FAIL

This was an independent, non-code adversarial review of the deployed product at <https://bills-due-board.sociobot.in> on 2026-08-28 UTC. No product code was modified.

## What was done

- Wrote `.factory/review-2.md` with the complete first-read, copy, demo, claims, history, routing, accessibility, and leverage review.
- Tested the live site cold at 390 px and desktop; exercised the one-click demo, Reset demo, Start for real, route focus, Back navigation, 404, metadata, link crawl, Axe, and request logging.
- Read every earlier review, polish, and handoff file. All three F-1 findings were confirmed fixed live and in code.
- In clean clone `/tmp/bills-due-board-review-2.N3O0ZD`, ran `npm ci`, each of the 22 commands declared in `.factory/claims.json`, `npm test` (31/31), `npm run test:unit` (15/15), `npm run typecheck`, and `npm run build`.

## Remaining work

Three minor copy findings remain, so the verdict is FAIL:

1. F-2-1: Replace six landing slogan/metaphor headings and the art caption with direct, out-of-context section labels.
2. F-2-2: Remove “Artwork is generated.” from public footer copy or register and test it as a claim.
3. F-2-3: Replace README’s accounting jargon “payable queue” with “list of bills due.”

See `.factory/review-2.md` for exact quotes, rationale, and proposed rewrites.

## How to verify

```sh
npm ci
npm test
npm run test:unit
npm run typecheck
npm run build
```

For the sample board, run `npm run dev` and open `http://localhost:5173/demo`.
