# SimplySheet — Claude Code Instructions

## Project Overview

Astro-based personal finance content site. Articles in `src/content/articles/` (`.md` or `.mdx`). Design tokens in `src/styles/tokens.css`. Google Fonts loaded in `src/components/BaseHead.astro`.

## SEO — Always Top of Mind

The primary goal of this site is organic Google discovery. Every change — new articles, layout updates, content edits — should support that. Specifically:

- Every article must have a unique, descriptive `title` and `description` in frontmatter (these become `<title>` and `<meta name="description">`).
- Use a clear, keyword-relevant slug for the article filename.
- Article content should use a logical heading hierarchy (`##` for main sections, `###` for subsections). Never skip heading levels.
- Internal links between articles improve crawlability — include them naturally in article body text where relevant.
- If the article has FAQ content, include it in the `faq` frontmatter array. This renders as collapsible Q&A with structured markup that search engines can surface.
- The `schema` field in frontmatter provides JSON-LD structured data. Always include it with `@type: Article`, a `headline`, and a `description`.
- All images must have descriptive, keyword-relevant `alt` text — never use empty `alt=""`. For article images, use the article title as alt text.
- Article titles and `headline` in schema should be optimized for both SEO (search engines) and AEO (AI engines / answer engines). Use natural question-style or how-to phrasing that matches what people actually search for.
- Article slugs should match high-volume search phrases when possible (e.g. `how-to-pay-off-debt` instead of `debt-payoff`).
- The site already has a sitemap (`/sitemap-index.xml`), canonical URLs, and Open Graph tags — these are handled automatically by `BaseHead.astro`.

## When a New Article Is Submitted

Every time an article is provided, automatically do all of the following:

1. **Create the article file** in `src/content/articles/` as `.md` (or `.mdx` if it embeds a component).
2. **Generate two SVG images** and save them in `public/images/` following the SVG construction rules below:
   - `article-{slug}.svg` — abstract gradient hero image (960x540). Uses blurred ellipse blobs, grain texture overlay, and floating semi-transparent white shapes. No text or UI elements.
   - `card-{slug}.svg` — card thumbnail (960x540). Same gradient background as the hero, but includes a white card with a simple UI mockup relevant to the article topic (progress bars, category rows, etc.).
   - **Always verify** the generated SVGs render correctly before committing. Open or screenshot them to check that the layout looks right — especially that the white card in card SVGs is properly positioned.
3. **Include both image paths in frontmatter**:
   ```yaml
   image: '/images/article-{slug}.svg'
   cardImage: '/images/card-{slug}.svg'
   ```
4. **Use a unique color scheme** for each article's SVGs. Do not reuse an existing article's palette. See the color registry below.
5. **Verify all internal article links** actually exist by cross-referencing slugs in `src/content/articles/`. Remove or unlink any references to articles that don't exist.
6. **Assign the correct tag** in frontmatter so the product cards at the bottom of the article are relevant.
7. **Update related articles cross-links** — review existing articles and add natural internal links to/from the new article where topically relevant. Internal cross-linking improves both user navigation and SEO crawlability. The "Related articles" section at the bottom of each page is auto-generated (3 most recent), but in-body links between related topics are more valuable.
8. **Include `schema` in frontmatter** with `@type: Article`, `headline`, and `description` for structured data.
9. **Add UTM tracking to every Etsy link** — see the "Etsy UTM Tracking" section below. Every product link must include UTM parameters at the time of writing. No Etsy link should go out untagged.
10. **After merging to main**, remind the user to submit the new article URL for Google indexing at: https://search.google.com/search-console — use the URL Inspection tool and paste the full article URL (e.g. `https://simplysheetdesign.com/articles/{slug}/`), then click **Request Indexing**. If the article also has a standalone tool page, remind them to index that URL too.

## Etsy UTM Tracking

Every Etsy product link on this site **must** include UTM tracking parameters. No Etsy link should ever be published without them.

### UTM parameter convention

- `utm_source=simplysheetdesign_site` — always this value
- `utm_medium=article` — for article pages; use `tool` for calculator/tool pages and quiz pages
- `utm_campaign=<page-slug>` — the slug of the page where the link lives (e.g. `50-30-20-budget-rule`, `emergency-fund-calculator`, `budgeting-style`)

### How to apply

- **Article content** (inline markdown links and frontmatter `relatedProduct.url`): append `?utm_source=simplysheetdesign_site&utm_medium=article&utm_campaign=<article-slug>` to the Etsy URL.
- **Tool / calculator pages**: same pattern but use `utm_medium=tool`.
- **Shared components** (`DebtCalculator.astro`, `EmergencyFundCalculator.astro`): these accept `slug` and `utmMedium` props. Always pass them from the call site so the UTM campaign matches the page where the component appears.
- **ArticleLayout.astro**: product card URLs are automatically tagged using the article's `id` (slug). No manual action needed.
- **Footer, homepage, articles index, about page**: these use hardcoded UTM campaigns (`footer`, `homepage`, `articles`, `about`).
- If a URL already has query parameters, append UTM params with `&` instead of `?`.

### Example

A Debt Payoff Tracker link inside the `how-to-pay-off-debt` article:
```
https://www.etsy.com/listing/4485879930/debt-payoff-tracker-for-google-sheets?utm_source=simplysheetdesign_site&utm_medium=article&utm_campaign=how-to-pay-off-debt
```

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
| `how-to-pay-off-debt` | #EDE7F6 | #7E57C2 (purple) |
| `emergency-fund-sizing` | #E8EAF6 | #5C6BC0 (indigo) |
| `why-most-budgets-fail` | #FFF8E1 | #F9A825 (amber) |

## SVG Construction Rules

Both SVG types use `width="960" height="540" viewBox="0 0 960 540"`. Follow these specs exactly to keep images consistent across all articles.

### How hero images display on the homepage

On the homepage, the six secondary article cards use the hero image (`article-{slug}.svg`) as a full-bleed background. A white text overlay (`.article-card-body`) anchors to the **bottom-right** corner of the card, covering most of the lower-right area. The gradient peeks through at the **top and left edges** only. This means:

- The hero SVG must have its strongest gradient colors and blobs concentrated in the **upper-left portion** of the image, since that's the only part visible behind the white overlay.
- Every article must have an `image` field in frontmatter. A missing image means no gradient background, which breaks the card layout.
- After creating a new article's SVGs, always screenshot the homepage to verify the cards look correct — gradient visible at top-left, white body flush to bottom and right edges.

### Hero image (`article-{slug}.svg`)

- Full-bleed gradient background rect covering 960x540
- 2–3 blurred ellipses using the article's accent color at varying opacities (0.1–0.5), each with `feGaussianBlur` (stdDeviation 45–65)
- 1–2 small accent circles at low opacity (0.06–0.1) with blur
- Optional floating white shapes (rounded rects, circles) at low opacity (0.08–0.14) with blur for depth
- Grain texture overlay: `feTurbulence` fractalNoise (baseFrequency 0.65) blended with `feBlend mode="multiply"` at opacity 0.12
- No text, no UI elements, no white card

### Card image (`card-{slug}.svg`)

- Same gradient background and blurred blobs as the hero (can use slightly different positioning)
- Grain texture overlay (same as hero)
- **White card**: `<rect x="120" y="68" width="720" height="490" rx="10" fill="white"/>` — this is the exact position for every card. The card intentionally extends past the bottom of the viewBox (y 68 + height 490 = 558 > 540) so it appears anchored to the bottom with no bottom margin.
- Inside the white card, build a simple UI mockup relevant to the article topic:
  - Use `font-family="system-ui, -apple-system, sans-serif"` for all text
  - Header text at y ~108, content starting below
  - Use the article's accent color for progress bars, highlights, or indicators
  - Keep inner content padded: x from 164 to 796, y from ~108 to ~460
  - Use `#2A2522` for primary text, `#8A817C` for secondary/muted text, `#F0EDEA` for dividers and track backgrounds
- All UI content must stay within the visible viewBox (above y=540). The white card bleeds past the bottom, but text and elements should not.

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
- The six secondary article cards truncate descriptions to **3 lines** with ellipsis (`-webkit-line-clamp: 3`) so all cards stay the same height. Do not remove this.

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
- Every calculator must exist in **two places**: embedded in the relevant article (via `.mdx` import) and as a **standalone tool page** in `src/pages/tools/` with its own SEO-optimized slug, title, and description
- Tool page slugs should include "calculator" (e.g. `emergency-fund-calculator`) since that's what people search for
- The standalone page should include breadcrumbs, a short intro, the calculator component, and a callout linking to the related article

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
