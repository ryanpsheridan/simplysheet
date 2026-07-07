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
- Social crawlers (Facebook, iMessage, Slack, etc.) can't render SVG for link previews, so `BaseHead.astro` points `og:image`/`twitter:image` at a PNG counterpart of the article's SVG (same filename, `.png` instead of `.svg`). `scripts/generate-og-images.mjs` rasterizes every `card-v2-*.svg` in `public/images/` to a matching `.png` and runs automatically via the `prebuild` npm script — no manual step needed, but if you add a new article's SVG in this session (without running `npm run build`), also run `node scripts/generate-og-images.mjs` so the PNG exists for local testing/sharing before the next real build.

## Writing Style

- Avoid em dashes. Use a period, comma, or colon instead — em dashes used heavily read as AI-generated. A stray one or two is fine; a paragraph shouldn't have more than one.
- Bold 2–5 sentences per article for emphasis (`**text**` in markdown), reserved for the single strongest, most quotable sentence in a section — a thesis statement or the line that resonates most. Don't bold whole paragraphs or more than one sentence in a row. `.prose strong` is styled at `--weight-medium` (500), not full bold, so it reads as emphasis rather than shouting.

## When a New Article Is Submitted

Every time an article is provided, automatically do all of the following:

1. **Create the article file** in `src/content/articles/` as `.md` (or `.mdx` if it embeds a component).
2. **Generate one SVG image** and save it in `public/images/` as `card-v2-{slug}.svg`, following the SVG construction rules below. The same file is used for both the homepage hero background and the card thumbnail — there is no separate hero/card pair.
   - **Always verify** the generated SVG renders correctly before committing. Open or screenshot it to check the gradient, glow placement, and grain all look right.
   - **Run `node scripts/generate-og-images.mjs`** afterward to rasterize the new SVG to a matching PNG — this is what social sharing previews (`og:image`/`twitter:image`) use, since crawlers can't render SVG. Commit the generated PNG alongside the SVG.
3. **Include the image path in frontmatter (same path for both fields)**:
   ```yaml
   image: '/images/card-v2-{slug}.svg'
   cardImage: '/images/card-v2-{slug}.svg'
   ```
4. **Use a unique color scheme** for each article's SVGs. Do not reuse an existing article's palette. See the color registry below.
5. **Verify all internal article links** actually exist by cross-referencing slugs in `src/content/articles/`. Remove or unlink any references to articles that don't exist.
6. **Assign the correct tag** in frontmatter so the product cards at the bottom of the article are relevant.
7. **Update related articles cross-links** — review existing articles and add natural internal links to/from the new article where topically relevant. Internal cross-linking improves both user navigation and SEO crawlability. The "Related articles" section at the bottom of each page is auto-generated (4 most recent), but in-body links between related topics are more valuable.
8. **Add natural template page links in body text** — where the article's topic connects to a product (e.g. an article about paying off debt mentioning a [debt payoff tracker](/spreadsheets/debt-payoff-tracker/)), weave in 1–2 internal links to the relevant `/spreadsheets/` pages. These should read as helpful tool suggestions, not sales pitches. Always link to the internal template page, never directly to Etsy — the template page has its own Etsy CTA. This creates an article → template page → Etsy funnel that keeps users on-site longer and builds internal link equity. If the link deserves a visual promo card mid-article (not just a plain text link), use the `<ProductPromo />` component — see "Product Promo Component" below. **Never hand-type product card HTML into an article** — that's what caused broken images in the past.
9. **Include `schema` in frontmatter** with `@type: Article`, `headline`, and `description` for structured data.
10. **After merging to main**, remind the user to submit the new article URL for Google indexing at: https://search.google.com/search-console — use the URL Inspection tool and paste the full article URL (e.g. `https://www.simplysheetdesign.com/articles/{slug}/`), then click **Request Indexing**. If the article also has a standalone tool page, remind them to index that URL too.

## SVG Color Registry — Category Hue Families

Each article's background gradient hue is drawn from a family tied to its primary tag, so articles in the same category read as visually related. Look up the article's first tag below to pick the family, then still vary the exact hue, lightness, gradient direction, and glow accent so the result is unique — never reuse another article's exact palette, even within the same family. This rule applies to new articles going forward only; the existing per-article palettes in the table below are unaffected and stay as historical reference for what's already taken.

| Tag | Hue family |
|---|---|
| `expense-tracking` | Blue |
| `couples-budgeting` | Magenta / pink |
| `debt-payoff` | Deep burgundy / wine |
| `savings-goals` | Green |
| `irregular-income` | Orange / amber |
| `net-worth` | Teal |
| `budgeting-styles` | Purple / violet |

## SVG Color Registry

Each article has a unique two-tone palette: a dark, saturated gradient background plus a contrasting set of glow colors. Check this list before picking colors for a new article — don't reuse a background hue family *or* a glow hue family that's already taken:

| Article slug | Background gradient | Glow colors | Dark vignette |
|---|---|---|---|
| `50-30-20-budget-rule` | #0B3D91 → #1565C0 (blue) | #4FC3F7, #80D8FF, #18FFFF (cyan) | #0D47A1 |
| `awareness-vs-automation` | #00352C → #00695C (dark teal) | #29B6F6, #81D4FA, #00E5FF (blue/cyan) | #002018 |
| `budgeting-styles` | #3B1070 → #6A1B9A (purple) | #F06292, #F8BBD0, #EC407A (pink) | #22073F |
| `couples-budgeting` | #7B0D3F → #C2185B (magenta) | #90CAF9, #B3E5FC, #18FFFF (blue/cyan) | #4A0625 |
| `debt-snowball-vs-avalanche` | #081620 → #1C3A52 (navy) | #90CAF9, #E1F5FE, #7C4DFF (blue/violet) | #040B10 |
| `how-to-pay-off-debt` | #1A0E4D → #512DA8 (deep purple) | #F48FB1, #F8BBD0, #EC407A (pink) | #0D0726 |
| `emergency-fund-sizing` | #0D1155 → #283593 (indigo) | #4FC3F7, #B3E5FC, #18FFFF (cyan/blue) | #070830 |
| `why-most-budgets-fail` | #3E0A2E → #7A1656 (magenta) | #64B5F6, #BBDEFB, #00E5FF (blue/cyan) | #1A0512 |
| `how-to-make-a-budget-work-on-a-fixed-income` | #04261B → #0E6B4A (green) | #4FC3F7, #B3E5FC, #18FFFF (blue/cyan) | #021712 |
| `budgeting-with-irregular-income` | #0F3D13 → #2E7D32 (green) | #F06292, #F8BBD0, #EC407A (pink) | #082209 |
| `sinking-funds-explained` | #073B4C → #0E7C86 (teal) | #7C4DFF, #B39DDB, #40C4FF (violet/blue) | #041F27 |
| `track-expenses-before-budgeting` | #1B1464 → #3D2C8D (indigo/purple) | #F06292, #F8BBD0, #EC407A (pink) | #0D0938 |
| `where-is-my-money-going` | #0A2472 → #1E3A8A (blue) | #7C4DFF, #B39DDB, #536DFE (violet/blue) | #050E33 |
| `budget-biweekly-paycheck` | #3A1900 → #8A4A00 (amber/orange) | #26C6DA, #80DEEA, #00E0D0 (cyan/teal) | #2A1400 |
| `track-expenses-without-burnout` | #0A2E4D → #146B9C (blue) | #FFB74D, #FFE0B2, #FFD54F (amber/gold) | #04182A |

## SVG Construction Rules

Every article uses a single SVG, `card-v2-{slug}.svg`, `width="960" height="540" viewBox="0 0 960 540"`, used for **both** `image` and `cardImage`. Follow this spec exactly to keep images consistent across all articles.

### How the image displays on the homepage

On the homepage, the six secondary article cards use this SVG as a full-bleed background. A white text overlay (`.article-card-body`) is **centered** within the card with equal margin on all sides, and the gradient/glow peek through around **all edges**. This means:

- Spread the gradient and glow circles across the full canvas so something is visible around all four edges of the centered white overlay.
- Every article must have an `image` field in frontmatter (same path as `cardImage`). A missing image means no background, which breaks the card layout.
- After creating a new article's SVG, screenshot the homepage to verify the card looks right — glow visible around all edges, white body centered within the card.

### Required structure

1. **`<defs>`** — reuse this exact boilerplate in every SVG (only the gradient colors change):
   ```xml
   <linearGradient id="bg" x1="…%" y1="…%" x2="…%" y2="…%">
     <stop offset="0%" stop-color="#…"/>
     <stop offset="100%" stop-color="#…"/>
   </linearGradient>
   <filter id="blurXL" x="-100%" y="-100%" width="300%" height="300%">
     <feGaussianBlur stdDeviation="65"/>
   </filter>
   <filter id="blurL" x="-100%" y="-100%" width="300%" height="300%">
     <feGaussianBlur stdDeviation="38"/>
   </filter>
   <filter id="blurM" x="-100%" y="-100%" width="300%" height="300%">
     <feGaussianBlur stdDeviation="24"/>
   </filter>
   <filter id="grain">
     <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" result="noise"/>
     <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0"/>
   </filter>
   ```
   Vary `x1/y1/x2/y2` on the gradient per article so the light direction isn't identical every time.
2. **Background rect** — `<rect width="960" height="540" fill="url(#bg)"/>`.
3. **Four glow circles**, in this order, each a fresh color per article (see registry above):
   - Glow 1: r 210–250, opacity 0.7, `filter="url(#blurXL)"`, `style="mix-blend-mode:screen"`.
   - Glow 2: r 155–190, a lighter/pastel tint of glow 1's hue, opacity 0.5, `blurXL`, `screen`.
   - Glow 3: r 80–95, a vivid/neon accent, opacity 0.32, `filter="url(#blurL)"`, `screen`.
   - Dark vignette: r 55–230, a near-black tint of the background's darkest stop, opacity 0.45, `blurXL`, **no** blend mode.
   - Positions should be scattered toward different corners/edges (not stacked in the center) so the glow reads across the whole canvas.
4. **Grain overlay** — `<rect width="960" height="540" filter="url(#grain)" style="mix-blend-mode:overlay" opacity="0.4"/>`.
5. **Decorative motif** — one `<g filter="url(#blurM)">` group of plain white circles/rings (fills and/or strokes, opacity roughly 0.1–0.6) forming a simple abstract shape loosely themed to the article topic (e.g. concentric rings for a "target/goal" article, scattered dots for "tracking"). No text, no UI mockup, no rectangles — circles and rings only.

There is no white card and no UI mockup in this style — that was the old spec and no live article uses it anymore.

## Article Page Structure

Every article page renders in this order (handled by `src/layouts/ArticleLayout.astro`):

1. Article content
2. Related articles (4 most recent, excluding current)
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

`ALL_TAGS`/`TAG_MAP` are defined once in `src/consts.ts` and imported everywhere they're needed (homepage, articles listing, tag archive pages, `ArticleLayout.astro`). When adding a new tag, add it there and update the `tagProductMap` in `ArticleLayout.astro`.

## Product Promo Component

`src/components/ProductPromo.astro` is the **only** way to render a product promo anywhere in an article — including the end-of-article row (used automatically by `ArticleLayout.astro`) and any promo you add inside an article body. It looks up the product by slug from the `templates` collection (`src/content/templates/`), so name, description, badge, and image always match the template page — never hand-type this data or its HTML.

- Requires the article to be `.mdx` (component imports don't work in plain `.md`).
- Import: `import ProductPromo from '../../components/ProductPromo.astro';`
- `slug` — the template's collection id, e.g. `budget-spreadsheet`, `couples-budget-spreadsheet`, `debt-payoff-tracker`, `savings-goals-tracker`, `net-worth-tracker`, `credit-card-tracker`.
- `variant`:
  - `"card"` (default) — vertical card, meant to sit inside a `<div class="product-cards">` wrapper alongside one sibling card for a 2-up grid.
  - `"interstitial"` — single horizontal card with a `label` prop for a short eyebrow line (e.g. `label="Built for two incomes"`).
  - `"row"` — used internally by `ArticleLayout.astro` for the automatic end-of-article recommendations; don't use this variant directly in article bodies.
- If you need a new variant/layout for a promo, add it to this component (with matching CSS in `src/styles/global.css`) rather than writing one-off HTML in an article.

## Available Tags

Defined once in `ALL_TAGS`/`TAG_MAP` in `src/consts.ts`:

- `expense-tracking` — Expense Tracking
- `couples-budgeting` — Couples Budgeting
- `debt-payoff` — Debt Payoff
- `savings-goals` — Savings Goals
- `irregular-income` — Irregular Income
- `net-worth` — Net Worth
- `budgeting-styles` — Budgeting Styles

## Articles Listing & Pagination

The articles hub is statically paginated for SEO/AEO crawlability — there is no client-side "load more."

- `src/pages/articles/[...page].astro` generates `/articles/`, `/articles/2/`, `/articles/3/`, etc. via Astro's `paginate()`, `PAGE_SIZE = 12`.
- `src/pages/articles/tag/[tag]/[...page].astro` generates a real, independently indexable archive page per tag (e.g. `/articles/tag/debt-payoff/`, paginated the same way) instead of the old client-side `?tag=` filter. Each has its own unique title/meta description.
- `src/components/TopicFilterTabs.astro` renders the tag pill nav as real `<a>` links to these archive pages (not JS-driven).
- `src/components/ArticleGrid.astro` renders the static, crawlable grid for the current page plus the search/sort controls. Search and non-default sort switch to a client-rendered view drawn from a lightweight embedded JSON manifest of *all* articles in that scope (all articles, or all articles for the current tag) — since those operations span every page, not just the current one. Clearing search and resetting sort back to "Newest first" restores the original static markup exactly.
- `src/components/Pagination.astro` is the reusable numbered pager (prev/next arrows, active page as a filled circle). Takes `currentPage`, `lastPage`, `basePath`.
- Both listing route types emit `CollectionPage` and `ItemList` JSON-LD for AEO/structured data.
- If you add a new tag to `ALL_TAGS`, a new archive page is generated automatically at build time — no other wiring needed.

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

### Calculator Color System

Calculators and assessments stay grayscale-first, but may use a small, consistent set of semantic accent tokens (defined in `tokens.css`) for progress bars, result icons, and status indicators — never as arbitrary decoration:

- `--color-accent-positive` / `--color-accent-positive-bg` (green) — favorable, on track, more of this is good (e.g. the savings share of a 50/30/20 split, a "ready" assessment result).
- `--color-accent-caution` / `--color-accent-caution-bg` (amber/orange) — discretionary or worth a second look, not bad, just flexible (e.g. "wants" spending, an "almost there" assessment result).
- `--color-accent-critical` / `--color-accent-critical-bg` (red) — needs attention. Use sparingly.
- `--color-accent-info` / `--color-accent-info-bg` (blue) — neutral or essential, no judgment attached (e.g. "needs" spending, a valid alternative path).

Don't apply these to a comparison between two equally valid choices (debt snowball vs. avalanche, the four budgeting styles, etc.) — coloring one option green and the other something else implies it's objectively better when it isn't. Those stay grayscale, or keep their own separate identity colors if they already have them.

The debt snowball vs. avalanche comparison (`DebtCalculator.astro`) uses `--color-debt-avalanche` (blue) for the avalanche bar and keeps the snowball bar grayscale (`--color-debt-snowball` maps to `--color-text-secondary`), defined in `tokens.css`. No green/red judgment implied — just enough distinction to tell the two bars apart.

## Content Schema

Defined in `src/content.config.ts`. Key optional fields:

- `image` — article SVG path (see SVG Construction Rules — same file as `cardImage`)
- `cardImage` — card thumbnail SVG path (same file as `image`)
- `tags` — array of tag slugs
- `faq` — array of `{ question, answer }` objects
- `relatedProduct` — `{ name, url }` (currently unused in layout)

## Design Tokens

Use CSS variables from `src/styles/tokens.css` for all styling. Key tokens:

- Colors: `--color-text`, `--color-text-secondary`, `--color-bg`, `--color-border`, etc.
- Spacing: `--space-xs` through `--space-2xl`
- Typography: `--text-body`, `--text-h1` through `--text-h3`, `--text-small`
- Weights: `--weight-normal`, `--weight-medium`, `--weight-semibold`, `--weight-bold`
