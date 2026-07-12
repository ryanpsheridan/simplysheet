# Content Roadmap

Internal planning doc (not routed, never appears on the live site). It's the
source of truth for the next batches of content so any session — including a
fresh chat with no prior context — can pick up a batch and build it correctly.

## Strategy in one line

Stop piling onto Expense Tracking (already mature). Build out the thin and
empty clusters until every category has ~5–8 genuinely useful articles. That
earns topical authority faster than chasing raw article count, and it supports
the products already for sale.

### Current cluster depth (as of this doc)

| Cluster | State |
|---|---|
| Expense Tracking | Mature (6–7 articles) |
| Debt Payoff | Emerging (2) |
| Savings Goals | Emerging (2: emergency-fund-sizing, sinking-funds-explained) |
| Couples Budgeting | Thin (1: couples-budgeting) |
| Irregular Income | Thin (1–2) |
| Budgeting Styles | Thin (1) |
| Net Worth | **Empty (0)** — yet has a product (net-worth-tracker), a tag, and product-card mapping |

### Longer-term target (a ratio to aim for, not a quota to rush)

Couples 6 · Net Worth 5 · Debt Payoff 6 · Savings Goals 6 · Expense Tracking 7
· Irregular Income 5 · Budgeting Styles 5. Complete clusters; don't pad.

### Lane discipline

Stay inside budgeting / money management for ordinary households: couples
budgeting, debt payoff, savings planning, irregular income, net worth. Avoid
investing, taxes, retirement, credit repair — competitive and disconnected
from the products.

## Working rules for every batch

- Build on the designated feature branch; **never auto-publish**. Publishing =
  the user merging when they're ready. Batches are spaced out over days.
- Each batch is one self-contained commit that **passes `npm run lint:content`**
  before hand-off.
- Follow `CLAUDE.md` exactly — especially the "When a New Article Is Submitted"
  10-step flow (unique SVG from an unused palette in the color registry,
  grid-snapped wireframe, `node scripts/generate-og-images.mjs` to make the OG
  PNG, correct tag, `ProductPromo` component never hand-typed HTML, no manual
  "Related:" block at the end).
- `.mdx` (not `.md`) for any article that embeds a component (calculator or
  `ProductPromo`).

## Batches

### Batch 1 — Couples split-bills article + Bill Split Calculator (one unit)

Build the article and the calculator together — the calculator embeds inside
the article (which forces `.mdx`) and also ships as a standalone tool page, so
they're one deliverable, not two.

- **Article:** "How Couples Split Bills Fairly When They Earn Different Incomes"
  - Tag: `couples-budgeting` (product cards → Couples Budget + Budget Template).
  - Topic is mechanics of splitting (proportional vs 50/50 vs income-based). It
    is distinct from the existing `couples-budgeting` article (that one is about
    money *conflict* / shared visibility) — cross-link to it, don't overlap.
  - Weave in 1–2 internal links to `/spreadsheets/couples-budget-spreadsheet/`.
- **Calculator: Bill Split Calculator** (new tool)
  - Component in `src/components/`, following `BudgetCalculator.astro` patterns
    (unique id, `is:inline` + `define:vars`, pill buttons, `formatCurrency`).
  - Standalone tool page in `src/pages/tools/` — slug must contain "calculator"
    (e.g. `couples-bill-split-calculator`), using `CalculatorLayout.astro`.
  - Add to the `TOOLS` registry in `src/data/tools.ts`.
  - **GRAYSCALE — do not color one partner.** A proportional split is a
    comparison between two equally valid incomes; per CLAUDE.md's calculator
    color rules, coloring one partner green implies they're "right." Keep both
    partner bars grayscale; at most one neutral `--color-accent-info` for the
    shared total. (Contrast: 50/30/20's green-for-savings is a real judgment;
    this isn't.)
  - Product CTA is a quiet left-aligned text link *outside* the calculator box
    (`calc-product-link` pattern), not a `btn btn-primary` inside it.

### Batch 2 — Net Worth pillar

- **Article:** "How to Calculate Your Net Worth (With Examples)"
  - Tag: `net-worth`. Fills the empty cluster that already has a product.
  - This is the pillar/hub for the net-worth cluster; link to
    `/spreadsheets/net-worth-tracker/`.
  - Structure it so a net-worth calculator (assets − liabilities) can slot in
    later without a rewrite — that's the obvious next tool, not built this wave.

### Batch 3 — Joint vs Separate Accounts

- **Article:** "Joint Accounts vs Separate Accounts: Which Is Better for Couples?"
  - Tag: `couples-budgeting`. Compounds the couples cluster.
  - Cross-link the existing couples article's "Does combining finances
    automatically fix this?" section rather than re-arguing account structure.

### Batch 4 — Negative net worth

- **Article:** "Is a Negative Net Worth Normal in Your 20s and 30s?"
  - Tag: `net-worth`. Question-style phrasing with strong AI-Overview potential.
  - Link back to the Batch 2 pillar; link to `/spreadsheets/net-worth-tracker/`.

## Future tool opportunities (not scheduled)

- Net-worth calculator (assets − liabilities) as the companion to Batch 2.

## Definition of done (per batch)

1. Article file created in `src/content/articles/` with complete frontmatter
   (unique title/description, `image` + `cardImage` same path, correct tags,
   `faq`, `schema`).
2. Unique SVG at `public/images/card-v2-{slug}.svg` (unused palette) + OG PNG
   generated.
3. Any new tool: component + standalone tool page + `tools.ts` entry, embedded
   in its article.
4. Internal cross-links added both directions where relevant.
5. `npm run lint:content` passes with no errors.
6. Committed to the feature branch. Not merged — the user publishes.
