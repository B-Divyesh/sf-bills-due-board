# Bills Due Board — visual thesis

## Direction

**Generative geometry: the payment horizon.** Bills are time-bound promises, so the visual system turns dates into a measured field of stamped circles, ledger lines, and clipped paper shapes. The geometry is ordered rather than decorative: concentric rings suggest time closing in, while square corners and ruled baselines retain the honesty of a paper payables list. The product should look like a small operator's well-kept desk, not accounting software or a generic dashboard.

## Palette

Light is the primary treatment because this is a review surface used during working hours. Dark mode keeps the same ink-and-paper relationship.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| paper | `#F4EEDF` | `#171A18` | page |
| paper-raised | `#FFF9ED` | `#232823` | sheets and controls |
| ink | `#18241F` | `#F6F0E3` | primary text |
| ink-muted | `#536159` | `#B6C0B7` | secondary text |
| rule | `#B9B2A0` | `#586159` | lines and borders |
| due | `#B53A2D` | `#FF8A76` | overdue and urgent marks |
| ochre | `#A96300` | `#FFC36A` | due soon and focus |
| mint | `#176B56` | `#67D6AF` | paid and positive actions |
| cobalt | `#214BC0` | `#8FACFF` | links and selected states |

All body combinations meet 4.5:1 contrast. Status always includes words and geometry, never color alone.

## Type

- Display: `Georgia`, then a local serif stack. Its sturdy figures and editorial weight make dates feel deliberate.
- Body and controls: `Arial`, then a system sans stack. It stays compact and legible on small screens.
- Amounts and dates use tabular figures. No web fonts are downloaded, so first paint stays fast and private.

## Spacing and shape

- Base unit: 4 px. Common gaps: 8, 12, 16, 24, 32, 48, 72 px.
- Content width: 1180 px. Reading copy stays under 70 characters.
- Cards are paper slips with 2 px ink rules and one clipped corner. Buttons are compact stamps with 2 px outlines.
- The primary board uses a continuous ruled surface. Bills are grouped by date before borders are added.

## Interaction grammar

- Adding a bill slides a paper slip from the form toward the queue in 220 ms.
- Marking paid compresses its concentric due ring into a solid mint dot, then moves the slip to Paid.
- The seven-day cash view draws one bar per day from the baseline.
- Focus uses a 3 px ochre ring with 3 px clearance.
- `prefers-reduced-motion: reduce` removes translation and animated drawing; state changes are immediate with a short opacity crossfade.

## Original asset plan and prompt sheet

The hero is an abstract still life of paper bill slips orbiting a seven-day date wheel. It clarifies the product's due-date queue without putting required text inside the image. Product icons and status marks are hand-authored SVG geometry.

**Prompt sheet:** overhead editorial still life, seven cream paper rectangles arranged as an orderly radial calendar, concentric date rings, dark forest-green ink lines, one vermilion urgency mark, one cobalt alignment mark, muted ochre accents, warm recycled paper texture, crisp hard side light, shallow tactile relief, exact geometric composition, no people, no currency symbols, no readable text, no letters, no logos, no watermark, no gradient blobs, no glossy 3D, no generic office stock photography.

**Generated source:** `assets/src/payment-horizon.png`, generated 2026-08-28 with the factory Azure image model (`factory-image`) from the prompt above. Original generated asset; no third-party source material. Reviewed for text artifacts, logos, seams, and unintended symbols. Shipping derivatives are compressed WebP files in `public/assets/`.

The Open Graph image is composed locally from the same generated art and product palette. App icons are original vector geometry rendered locally.

## Why it fits

This product is an attention layer, not a ledger. The date wheel makes upcoming pressure visible; the paper rules keep planned bills distinct from cleared transactions. The system feels calm enough for weekly review and sharp enough for an overdue bill.
