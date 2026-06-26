# SimplySheet — Claude Code Instructions

## Project Overview

Astro-based personal finance content site. Articles in `src/content/articles/` (`.md` or `.mdx`). Design tokens in `src/styles/tokens.css`. Google Fonts loaded in `src/components/BaseHead.astro`.

## When a New Article Is Submitted

Every time an article is provided, automatically do all of the following:

1. **Create the article file** in `src/content/articles/` as `.md` (or `.mdx` if it embeds a component).
2. **Generate two SVG images** and save them in `public/images/`:
   - `article-{slug}.svg` — abstract gradient hero image (960x540). Uses blurred ellipse blobs, grain texture overlay, and floating semi-transparent white shapes. No text or UI elements.
   - `card-{slug}.svg` — card thumbnail (960x540). Same gradient background as the hero, but includes a white card with a simple UI mockup relevant to the article topic (progress bars, category rows, etc.).
3. **Include both image paths in frontmatter**:
   ```yaml
   image: '/images/article-{slug}.svg'
   cardImage: '/images/card-{slug}.svg'
   ```
4. **Use a unique color scheme** for each article's SVGs. Do not reuse an existing article's palette. See the color registry below.
5. **Verify all internal article links** actually exist by cross-referencing slugs in `src/content/articles/`. Remove or unlink any references to articles that don't exist.
6. **Assign the correct tag** in frontmatter so the product cards at the bottom of the article are relevant.

## SVG Color Registry

Each article has a unique gradient palette. Check this list before picking colors for a new article:

| Article slug | Background | Accent |
|---|---|---|
| `50-30-20-budget-rule` | #E3F2FD | #196EDD (blue) |
| `awareness-vs-automation` | #E0F2F1 | #00897B (teal) |
| `budgeting-styles` | #F3E5F5 | #7E57C2 (purple) |
| `couples-budgeting` | #F3E5F5 | #7E57C2 (purple) |
| `where-is-my-money-going` | #FFF3E0 | #E86A33 (orange) |
| `budgeting-with-irregular-income` | #E8F5E9 | #2D9D78 (green) |
| `debt-snowball-vs-avalanche` | #E8EDF2 | #2C3E50 (slate) |
| `debt-payoff` | #EDE7F6 | #7E57C2 (purple) |
| `emergency-fund-sizing` | #E8EAF6 | #5C6BC0 (indigo) |
| `why-most-budgets-fail` | #FFF8E1 | #F9A825 (amber) |

## Article Page Structure

Every article page renders in this order (handled by `src/layouts/ArticleLayout.astro`):

1. Article content
2. Related articles (3 most recent, excluding current)
3. FAQ section (if `faq` array exists in frontmatter)
4. Two recommended product cards (selected by article tag)

## Product Card Tag Mapping

The article's `tags` field determines which two Etsy products appear at the bottom. Defined in `ArticleLayout.astro`:

| Tag | Product 1 | Product 2 |
|---|---|---|
| `expense-tracking` | Budget Template | Savings Goals Tracker |
| `couples-budgeting` | Couples Budget | Budget Template |
| `debt-payoff` | Debt Payoff Tracker | Budget Template |
| `savings-goals` | Savings Goals Tracker | Budget Template |
| `irregular-income` | Budget Template | Savings Goals Tracker |
| `net-worth` | Budget Template | Savings Goals Tracker |
| `budgeting-styles` | Budget Template | Couples Budget |

When adding a new tag, update the `tagProductMap` in `ArticleLayout.astro` and the `TAG_MAP` in both `src/pages/index.astro` and `src/pages/articles/index.astro`.

## Available Tags

Defined in `TAG_MAP` on `src/pages/index.astro` and `src/pages/articles/index.astro`:

- `expense-tracking` — Expense Tracking
- `couples-budgeting` — Couples Budgeting
- `debt-payoff` — Debt Payoff
- `savings-goals` — Savings Goals
- `irregular-income` — Irregular Income
- `net-worth` — Net Worth
- `budgeting-styles` — Budgeting Styles

## Homepage

- The featured article is pinned by slug in `src/pages/index.astro`: `const featuredSlug = '50-30-20-budget-rule'`. Do not change unless explicitly told to.

## Typography

- Body font: **Inter** (`--font-sans` in `tokens.css`)
- Heading font: **Urbanist** (`--font-heading` in `tokens.css`)
- Both loaded via Google Fonts in `BaseHead.astro`

## Calculator Components

When building new calculators, follow the pattern in `src/components/BudgetCalculator.astro`:

- Generate a unique ID: `const id = Math.random().toString(36).slice(2, 10)`
- Use `<script is:inline define:vars={{ id }}>` for client-side JS
- Pill button pattern (`.calc-months-btn`, `.calc-split-btn`) for toggle selections
- `formatCurrency` / `formatInput` helper functions for currency display
- CTA button: `<a href="..." class="btn btn-primary calc-cta">...</a>` (full-width)
- Place on Tools page (`src/pages/tools/`) and add to the tools index grid

## Content Schema

Defined in `src/content.config.ts`. Key optional fields:

- `image` — article hero SVG path
- `cardImage` — card thumbnail SVG path
- `tags` — array of tag slugs
- `faq` — array of `{ question, answer }` objects
- `relatedProduct` — `{ name, url }` (currently unused in layout)

## Design Tokens

Use CSS variables from `src/styles/tokens.css` for all styling. Key tokens:

- Colors: `--color-text`, `--color-text-secondary`, `--color-bg`, `--color-border`, etc.
- Spacing: `--space-xs` through `--space-2xl`
- Typography: `--text-body`, `--text-h1` through `--text-h3`, `--text-small`
- Weights: `--weight-normal`, `--weight-medium`, `--weight-semibold`, `--weight-bold`
