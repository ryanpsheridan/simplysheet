# SimplySheet — Claude Code Instructions

## Project Overview

Astro-based personal finance content site. Articles in `src/content/articles/` (`.md` or `.mdx`). Design tokens in `src/styles/tokens.css`. Google Fonts loaded in `src/components/BaseHead.astro`.

## Product Images — Right-Aligned Hero vs. Centered Thumbnails

There are two product image assets per template, and they are **not interchangeable**:

- `heroImage`/`lightImage` (`featured budget thumbnail-*-right-positioned-v2.png`) are **pre-cropped at their right edge** — the laptop mockup deliberately runs off the right side of the PNG. This crop only reads as intentional when pinned flush against its container's right edge:
  ```css
  padding: 1.5rem 0 1.5rem 1.5rem; /* no right padding */
  ```
  ```css
  object-fit: contain;
  object-position: right center;
  ```
  **Never "center" this image or add right padding** — that floats the bare crop edge mid-panel with a gray gap to its right, which looks broken (this exact regression has shipped before). This treatment is reserved for the single featured hero on each product's own page: `.product-image` in `TemplateLayout.astro`. Do not use `heroImage`/`lightImage` anywhere else.

- `midImage`/`midImageLight` (`featured budget thumbnail-*-v2.png`, no `-right-positioned` suffix) are **full, uncropped mockups** meant to be centered. Every other surface that shows a product thumbnail — anywhere on the site except that one product-page hero — uses `midImage` with:
  ```css
  object-fit: contain;
  object-position: center;
  ```
  Surfaces using this treatment: `.template-thumb` in `TemplateLayout.astro` (the "More spreadsheets" grid) and in `pages/spreadsheets/index.astro`; `.home-row-thumb--product` in `styles/global.css` (via `SpreadsheetsToolsRows.astro`, homepage); `.resource-thumb` in `pages/articles/[...page].astro`; `.article-promo-thumb`, `.product-card-thumb`, and `.product-thumb` in `styles/global.css` (all three `ProductPromo.astro` variants). If a new surface needs a product thumbnail, use `midImage` centered — reach for the right-positioned hero treatment only for that one product-page hero.

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

## Click Tracking — `data-cta`

Two GA4 click handlers live in `BaseHead.astro`, and which one fires is decided by the link's host:

- **Etsy links** → `etsy_outbound_click`, with `link_label` taken from `data-cta` (or the link text as a fallback). Hrefs are never rewritten, so Etsy's own params stay intact.
- **Everything else carrying `data-cta`** (`<a>` or `<button>`) → `cta_click`, with the attribute's value as `cta_id`.

Etsy links are explicitly skipped by the second handler so one click can't be counted twice. A `<button data-cta>` has no `href`, so the handler only runs the Etsy-host check when `link.href` exists — buttons always fall through to `cta_click`.

- To track a new on-site link or button, add `data-cta="..."` and nothing else — no wiring required.
- **Name a CTA for what it is, not what it says.** `nav_cta`, not `find_your_budget_style`. Rewording a button then doesn't split its history in GA4.
- **Every distinct surface gets its own `cta_id`, down to the individual item where one exists.** Nav links, footer links, pagination arrows, article/template/tool cards, and product promo CTAs are each tagged per-instance (with a `:<id>` suffix) rather than sharing one generic tag for the whole group — that's what makes "which button" answerable from GA4 instead of just "was any button in this area clicked."
- Convention in use, grouped by surface:
  - **Header nav**: `nav_link:<id>` (desktop bar), `nav_menu_link:<id>` (mobile panel, kept separate so the two surfaces can be compared), `nav_cta` (header button).
  - **Footer**: `footer_link:<id>` (per nav item), `footer_promo_banner`, `footer_etsy_link`.
  - **Pagination** (`Pagination.astro`): `pagination_prev`, `pagination_page:<n>`, `pagination_next`.
  - **Topic/tag filters** (`TopicFilterTabs.astro`): `topic_filter_tab:<slug>` (`all` for the unfiltered tab).
  - **Product promos** (`ProductPromo.astro`, every variant): `product_promo_cta:<slug>:<variant>`, `product_promo_thumb:<slug>:<variant>`, `product_promo_card:<slug>`, `product_promo_mini:<slug>`.
  - **Calculators**: `calc_product_link:<templateSlug>` for the `.calc-product-link` funnel CTA every calculator/assessment carries.
  - **Article listing/cards**: `articles_grid_item:<id>` (`ArticleGrid.astro`, both the static and client-rendered paths), `article_related_link:<id>`, `article_share_button`, `article_share_email`.
  - **Template pages** (`TemplateLayout.astro`): `template_hero_cta:<id>`, `template_footer_cta:<id>`, `template_bundle_cta:<id>:<name>`, `template_reviews_cta:<id>`, `template_related_article:<id>`, `template_more_spreadsheets_card:<id>`.
  - **Tool pages**: `tool_thumb_card:<toolId>` (homepage/about tool grid), `calculator_more_tools_item:<toolId>`, `calculator_more_tools_view_all`, `calculator_related_article:<id>` (`CalculatorLayout.astro`).
  - **Homepage** (`index.astro`, `SpreadsheetsToolsRows.astro`): `index_hero_primary_cta`, `index_hero_secondary_cta`, `index_hero_article:<id>`, `index_latest_article_card:<id>`, `index_latest_view_all`, `index_quiz_banner_cta`, `index_about_brief_cta`, `home_tools_row_view_all`, `home_spreadsheets_row_item:<id>`, `home_spreadsheets_row_view_all`.
  - Everything else not yet broken out this way still follows `<page>_<element>` (e.g. `spreadsheets_index_etsy_link`, `articles_index_explore_all_cta`).
- The header logo and footer logo are deliberately untracked — a logo click is "go home", not a choice between destinations, and it would swamp the nav numbers. In-article table-of-contents anchors are also untracked — they're internal wayfinding within a page a visitor is already on, not a destination choice.
- Note the ordering trap this fixed: the Etsy handler returns early for every non-Etsy host, so before the second handler existed, `data-cta` on an internal link recorded nothing at all. If you add a third handler, check it doesn't sit behind an early return meant for a different link type.

## Etsy Links — Share & Save Domain + UTM Tracking

Every user-clickable link to Etsy, anywhere on the site, must follow these rules (helper and rationale live in `src/consts.ts`):

- **Always use the `simplysheetdesign.etsy.com` domain**, never `www.etsy.com/listing/...` or `www.etsy.com/shop/...`. Only the shop subdomain earns the Etsy Share & Save fee credit — `www.etsy.com` links silently forfeit it (several shipped that way before this rule existed).
- **Every rendered Etsy link carries UTM params** (`utm_source=simplysheetdesign.com&utm_medium=referral`) so Etsy Shop Stats can separate site traffic from social links. UTMs don't affect the Share & Save credit.
- **In `.astro` frontmatter/markup**, never hand-append the params — use `withEtsyTracking(url)` from `src/consts.ts` (and `ETSY_SHOP_URL` for the bare shop link). In inline client scripts (`is:inline`, e.g. quiz/assessment result data) where the helper can't be imported, the full tagged URL is baked into the string literal.
- **Template frontmatter stays clean**: `darkListing`/`lightListing`/bundle URLs in `src/content/templates/` are bare `simplysheetdesign.etsy.com` URLs with no UTMs — `TemplateLayout.astro` tags them at render time. New templates just need the right domain.
- **Articles never link to Etsy directly** — body links and `ProductPromo` components point to internal `/spreadsheets/` pages (see "When a New Article Is Submitted"), so new articles need no Etsy URLs at all. The template page's own CTA carries the tracked link.
- **JSON-LD structured data is the one exception**: schema URLs (`sameAs` on the homepage, the product offer `url` in `TemplateLayout.astro`) stay as clean canonical URLs without UTMs.

## Writing Style

- Avoid em dashes. Use a period, comma, or colon instead — em dashes used heavily read as AI-generated. A stray one or two is fine; a paragraph shouldn't have more than one.
- Don't use bold (`**text**`) for emphasis in article body text.

## When a New Article Is Submitted

Every time an article is provided, automatically do all of the following:

1. **Create the article file** in `src/content/articles/` as `.md` (or `.mdx` if it embeds a component).
2. **Generate one SVG image** and save it in `public/images/` as `card-v2-{slug}.svg`, following the SVG Construction Rules and Wireframe Overlay System below. The same file is used for both the homepage hero background and the card thumbnail — there is no separate hero/card pair.
   - **Always verify** the generated SVG renders correctly before committing. Open or screenshot it to check the gradient, glow placement, and grain look right, and that the wireframe overlay is grid-snapped, themed to the topic, and doesn't cut off mid-canvas.
   - **Run `node scripts/generate-og-images.mjs`** afterward to rasterize the new SVG to a matching PNG — this is what social sharing previews (`og:image`/`twitter:image`) use, since crawlers can't render SVG. Commit the generated PNG alongside the SVG.
3. **Include the image path in frontmatter (same path for both fields)**:
   ```yaml
   image: '/images/card-v2-{slug}.svg'
   cardImage: '/images/card-v2-{slug}.svg'
   ```
4. **Use a unique color scheme** for each article's SVGs. Do not reuse an existing article's palette. See the color registry below.
5. **Generate the narration audio**: `GOOGLE_TTS_API_KEY=... node scripts/generate-audio-narration.mjs {slug}` (see "Article Audio Narration" below). The player then shows up automatically — no per-article code needed.
6. **Verify all internal article links** actually exist by cross-referencing slugs in `src/content/articles/`. Remove or unlink any references to articles that don't exist.
7. **Assign the correct tag** in frontmatter so the product cards at the bottom of the article are relevant.
8. **Update related articles cross-links** — review existing articles and add natural internal links to/from the new article where topically relevant. Internal cross-linking improves both user navigation and SEO crawlability. The "Related articles" section at the bottom of each page is auto-generated (4 most recent), but in-body links between related topics are more valuable.
9. **Add natural template page links in body text** — where the article's topic connects to a product (e.g. an article about paying off debt mentioning a [debt payoff tracker](/spreadsheets/debt-payoff-tracker/)), weave in 1–2 internal links to the relevant `/spreadsheets/` pages. These should read as helpful tool suggestions, not sales pitches. Always link to the internal template page, never directly to Etsy — the template page has its own Etsy CTA. This creates an article → template page → Etsy funnel that keeps users on-site longer and builds internal link equity. If the link deserves a visual promo card mid-article (not just a plain text link), use the `<ProductPromo />` component — see "Product Promo Component" below. **Never hand-type product card HTML into an article** — that's what caused broken images in the past.
10. **Consider whether a reader poll fits** — not required for every article, but worth adding when the topic has a natural multi-way choice (a set of styles, methods, or preferences) and the article isn't already using a calculator or assessment. See "Reader Polls" below for how to add one.
11. **Include `schema` in frontmatter** with `@type: Article`, `headline`, and `description` for structured data.
12. **After merging to main**, remind the user to submit the new article URL for Google indexing at: https://search.google.com/search-console — use the URL Inspection tool and paste the full article URL (e.g. `https://www.simplysheetdesign.com/articles/{slug}/`), then click **Request Indexing**. If the article also has a standalone tool page, remind them to index that URL too.

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
   If the article's wireframe overlay (below) includes an under-curve area fill, also add this gradient to `<defs>`:
   ```xml
   <linearGradient id="areaFade" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15"/>
     <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
   </linearGradient>
   ```
   Vary `x1/y1/x2/y2` on the `bg` gradient per article so the light direction isn't identical every time.
2. **Background rect** — `<rect width="960" height="540" fill="url(#bg)"/>`.
3. **Four glow circles**, in this order, each a fresh color per article (see registry above):
   - Glow 1: r 210–250, opacity 0.7, `filter="url(#blurXL)"`, `style="mix-blend-mode:screen"`.
   - Glow 2: r 155–190, a lighter/pastel tint of glow 1's hue, opacity 0.5, `blurXL`, `screen`.
   - Glow 3: r 80–95, a vivid/neon accent, opacity 0.32, `filter="url(#blurL)"`, `screen`.
   - Dark vignette: r 55–230, a near-black tint of the background's darkest stop, opacity 0.45, `blurXL`, **no** blend mode.
   - Positions should be scattered toward different corners/edges (not stacked in the center) so the glow reads across the whole canvas.
4. **Grain overlay** — `<rect width="960" height="540" filter="url(#grain)" style="mix-blend-mode:overlay" opacity="0.4"/>`.
5. **Decorative motif** — one `<g filter="url(#blurM)">` group of plain white circles/rings (fills and/or strokes, opacity roughly 0.1–0.6) forming a simple abstract shape loosely themed to the article topic (e.g. concentric rings for a "target/goal" article, scattered dots for "tracking"). No text, no UI mockup, no rectangles — circles and rings only.
6. **Wireframe overlay** — a crisp, grid-snapped vector chart glyph layered on top of everything above, themed to the article's topic. See "Wireframe Overlay System" below — this is required on every article's SVG, not optional.

There is no white card and no UI mockup in this style — that was the old spec and no live article uses it anymore.

## Wireframe Overlay System

Every article's SVG carries a second layer on top of the mesh (background, glow, grain, motif): an ultra-thin white vector wireframe — a minimal chart-like glyph, grid-snapped and themed to the article's topic. The mesh stays the hero; the wireframe is a hairline accent, never a fill-heavy illustration.

### Safe zone

The wireframe is confined to a box that's **70% of canvas width and 60% of canvas height**, centered: `x="144" y="108" width="672" height="324"` (right/bottom edge at `x=816`, `y=432`; canvas center `480,270`). Never let wireframe content spill outside this box except where a grid-bleed rule (below) deliberately extends grid *lines* to the canvas edge — the actual chart content (curves, bars, nodes) still lives inside the box.

### Snap grid

Every start point, end point, and pivot in a path — and every marker — must land on this grid, never float in open space:

- **x:** `144, 256, 368, 480, 592, 704, 816` (main lines at 144/368/592/816, half-steps at 256/480/704)
- **y:** `108, 162, 216, 270, 324, 378, 432` (main lines at 108/216/324/432, half-steps at 162/270/378)

Bezier control points (the parts of a curve that aren't on the path itself) don't need to snap — only points the path actually passes through.

### Three grid layouts — pick one per article

Grid lines must never abruptly cut off mid-canvas or sit flush against one edge with empty space on the other side (an asymmetric left-anchored grid was tried and rejected for exactly this reason). Every article uses one of these three symmetric treatments:

**1. Centered Box (default/preferred)** — fully self-contained, for rules, frameworks, and comparisons:
```xml
<g stroke="#FFFFFF" stroke-width="0.75" opacity="0.15">
  <rect x="144" y="108" width="672" height="324" fill="none" vector-effect="non-scaling-stroke"/>
  <line x1="368" y1="108" x2="368" y2="432" vector-effect="non-scaling-stroke"/>
  <line x1="592" y1="108" x2="592" y2="432" vector-effect="non-scaling-stroke"/>
  <line x1="144" y1="216" x2="816" y2="216" vector-effect="non-scaling-stroke"/>
  <line x1="144" y1="324" x2="816" y2="324" vector-effect="non-scaling-stroke"/>
</g>
```

**2. Full Horizontal Bleed** — all horizontal lines span the full canvas width (0–960) while the vertical columns stay centered at 70% width. For progression/timeline topics (the x-axis represents an ongoing period that extends beyond the frame):
```xml
<g stroke="#FFFFFF" stroke-width="0.75" opacity="0.15">
  <line x1="144" y1="108" x2="144" y2="432" vector-effect="non-scaling-stroke"/>
  <line x1="368" y1="108" x2="368" y2="432" vector-effect="non-scaling-stroke"/>
  <line x1="592" y1="108" x2="592" y2="432" vector-effect="non-scaling-stroke"/>
  <line x1="816" y1="108" x2="816" y2="432" vector-effect="non-scaling-stroke"/>
  <line x1="0" y1="108" x2="960" y2="108" vector-effect="non-scaling-stroke"/>
  <line x1="0" y1="216" x2="960" y2="216" vector-effect="non-scaling-stroke"/>
  <line x1="0" y1="324" x2="960" y2="324" vector-effect="non-scaling-stroke"/>
  <line x1="0" y1="432" x2="960" y2="432" vector-effect="non-scaling-stroke"/>
</g>
```
The chart's actual baseline (the y-value the data grounds to) is usually one of these lines but drawn again as its own more visible line on top: `stroke-width="1"` `opacity="0.35"–"0.45"` (dashed `4,4` if the baseline is a reference/average rather than a hard floor), still spanning `x="0"` to `x="960"`.

**3. Full Vertical Bleed** — all vertical lines span the full canvas height (0–540) while the horizontal rows stay centered at 60% height. For growth-from-origin topics (comparisons that launch from a shared starting point, where the y-axis magnitude matters most):
```xml
<g stroke="#FFFFFF" stroke-width="0.75" opacity="0.15">
  <line x1="144" y1="0" x2="144" y2="540" vector-effect="non-scaling-stroke"/>
  <line x1="368" y1="0" x2="368" y2="540" vector-effect="non-scaling-stroke"/>
  <line x1="592" y1="0" x2="592" y2="540" vector-effect="non-scaling-stroke"/>
  <line x1="816" y1="0" x2="816" y2="540" vector-effect="non-scaling-stroke"/>
  <line x1="144" y1="108" x2="816" y2="108" vector-effect="non-scaling-stroke"/>
  <line x1="144" y1="216" x2="816" y2="216" vector-effect="non-scaling-stroke"/>
  <line x1="144" y1="324" x2="816" y2="324" vector-effect="non-scaling-stroke"/>
  <line x1="144" y1="432" x2="816" y2="432" vector-effect="non-scaling-stroke"/>
</g>
```
Typically paired with an emphasized origin: the left wall (`x="144" y1="0" y2="540"`) and baseline (`y="432" x1="144" x2="816"`) drawn again at `stroke-width="1"` `opacity="0.4"`.

**Choosing a layout** — classify the topic, don't default to whatever looks easiest:
- Rule, framework, single-snapshot comparison, or a multi-option matrix (see below) → **Centered Box**.
- An ongoing timeline, habit, or trend the reader lives inside indefinitely (income arriving, expenses tracked daily, a budget slowly failing) → **Full Horizontal Bleed**.
- Two or more things growing/declining from a shared starting point where the magnitude (not the timeline) is the point (debt shrinking to zero, two payoff strategies diverging) → **Full Vertical Bleed**.

### Categorical Matrix (Centered Box variant, for multi-option topics)

When the topic is "which of these N options/styles/methods," don't draw a continuous line across the canvas — it implies a false progression between unrelated things. Instead divide the Centered Box into 3–4 equal vertical lanes and give each one exactly one small, fully isolated archetype (a bar cluster, a split circle, a smooth arc, a flat line, etc.). For 4 lanes, divider x-positions are `144, 312, 480, 648, 816`. **No path or shape may touch a divider's x-coordinate or cross into an adjacent lane** — inset every glyph with real margin (roughly 30–40px) from both lane edges. Two glyphs from different lanes must never share a coordinate; that reads as a bridge connecting them even if neither actually crosses the line.

### Path geometry

- Trend lines use smooth Cubic (`C`, `S`) or Quadratic (`Q`) Bezier curves — never a jagged hand-drawn zigzag.
- Sharp 90-degree steps are reserved for genuine step-charts (a debt payoff staircase, a manual-tracking staircase) — not used as a substitute for a smooth curve.
- Every on-curve point that represents actual data (not a bezier control handle) snaps to the grid above.

### Data node markers

Every meaningful terminus or vertex uses a compound marker, never a bare dot:
```xml
<circle cx="…" cy="…" r="6" fill="#FFFFFF" opacity="0.3"/>
<circle cx="…" cy="…" r="2" fill="#FFFFFF" opacity="1"/>
```
Scale down to `r="5"/"1.6"` opacity `0.25`/`0.8` for secondary/less-important points (a chart's start, vs. its emphasized end).

### Stroke and fill hierarchy

- **Primary lines** (the main trend/data path): `stroke-width="1.5"`, opacity `0.9`–`0.95`.
- **Secondary/comparison lines**: `stroke-width="1"`, opacity `0.4`–`0.5`, or `stroke-dasharray="4,4"`.
- **Grid lines** (the structural layout, not the data): `stroke-width="0.75"`, opacity `0.15`.
- **Area fills** under a primary trend line use the `areaFade` gradient (defined in `<defs>` above) and must close back along the chart's own meaningful baseline axis — never drop to the bottom of the safe zone or canvas. For a curve whose baseline sits mid-canvas (an oscillating income wave around its own zero-line, not the box floor), close the fill path back along that specific y-value so the fill only ever represents "area between the curve and its axis," nothing more.
- **Every stroked element** — grid lines, data paths, ring/circle outlines — carries `vector-effect="non-scaling-stroke"` so line weight stays crisp at any render size. Filled shapes (background, glow, motif, markers) don't need it.

### Verifying a new wireframe

After drafting, rasterize and view it (`node scripts/generate-og-images.mjs` regenerates the PNG) to confirm: nothing floats off-grid, no line cuts off mid-canvas, the matrix (if used) has no lane bridging, and the mesh gradient still reads as the dominant visual — the wireframe should feel like a hairline accent, not a chart that happens to have a gradient behind it.

## Article Page Structure

Every article page renders in this order (handled by `src/layouts/ArticleLayout.astro`):

1. Article content
2. Related articles (4 most recent, excluding current)
3. FAQ section (if `faq` array exists in frontmatter)
4. Two recommended product cards (selected by article tag)

**Never hand-type a "Related:" links list, horizontal rule, or similar wrap-up block at the end of the article body.** The Related Articles section above is rendered automatically by `ArticleLayout.astro` — a manual one in the markdown just duplicates it directly above the real one. This has shown up before when an article was drafted with outside AI help (ChatGPT, Claude, etc.), which tends to tack on a "Related:" line as a sign-off. When drafting or importing article content, the body should end with the article's own closing paragraph and nothing else — no "Related:", "See also:", "Further reading", or "You might also like" line, and no trailing `---` divider. Internal links belong naturally inline within body paragraphs (see SEO section above), not clustered in a list at the end.

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
  - `"interstitial"` (default choice for in-article use) — the standard style for a single product mention inside an article body. Uncropped product image in a padded box, optional badge, title, description, and a "View template" CTA button — the same visual treatment as the automatic end-of-article row. Takes an optional `label` prop for a short eyebrow line above the badge/title (e.g. `label="Built for two incomes"`).
  - `"card"` — vertical card, meant to sit inside a `<div class="product-cards">` wrapper alongside one sibling card for a 2-up grid. Use only when you specifically want two products side by side; otherwise prefer `"interstitial"`.
  - `"row"` — used internally by `ArticleLayout.astro` for the automatic end-of-article recommendations; don't use this variant directly in article bodies (it relies on being part of a list of recommended products for its spacing/border logic).
- If you need a new variant/layout for a promo, add it to this component (with matching CSS in `src/styles/global.css`) rather than writing one-off HTML in an article.

## Reader Polls

`src/components/Poll.astro` is a lightweight, single-question, click-to-vote poll — a quieter interactive option than a full calculator or assessment for articles that don't call for either. Not every article needs one; use it when the topic has a natural multi-way choice (styles, methods, preferences) and there isn't already a calculator/quiz covering the same ground.

- Requires the article to be `.mdx`. Import: `import Poll from '../../components/Poll.astro';`
- Props: `pollId` (string), `question` (string), `options` (array of `{ key, label }`).
- Votes are tallied for real across all visitors via `/api/poll.js`, a standalone Vercel Serverless Function backed by Upstash Redis (connected through the project's Vercel Storage tab). A visitor's own vote is remembered via `localStorage`, so refreshing shows their locked-in result instead of the question again.
- **Every poll must be registered in the `POLLS` allowlist at the top of `api/poll.js`** (`pollId` mapped to its list of valid option keys) before it will work — the API rejects votes for any `pollId`/option pair not in that list. Adding a `<Poll />` to an article without also adding its entry there will silently fail (shows the "couldn't record your vote" retry message).
- Placement: put it at a natural pause in the article (e.g. after a comparison table, or as a closing capstone once the article has made its case) rather than immediately after another interactive element like a calculator — stacking two interactive widgets back to back reads as cluttered.
- Existing polls: `budgeting-style` (in `budgeting-styles.mdx`) and `debt-payoff-method` (in `debt-snowball-vs-avalanche.mdx`) — check these for the pattern before adding a new one.

## Article Audio Narration

Every article gets a "Listen to this article" player automatically. `ArticleLayout.astro` checks whether `public/audio/{article-id}.mp3` exists and, if so, renders `<AudioNarration src="/audio/{article-id}.mp3" />` right after the share/email row, before the article body. This works for both `.md` and `.mdx` articles since it's wired into the shared layout, not imported per-article — never add `<AudioNarration />` manually inside an article body.

- **Generate the MP3 whenever a new article is added**: `GOOGLE_TTS_API_KEY=... node scripts/generate-audio-narration.mjs {slug}`. The key comes from a Google Cloud project with the Cloud Text-to-Speech API enabled (an API key restricted to just that API — see the project's Google Cloud console). Skips generation if the file already exists; pass `--force` to regenerate.
- The script strips frontmatter, `import` lines, JSX/Astro components (`<BudgetCalculator />`, `<Poll ... />`, `<ProductPromo ... />`, etc. — these are never narrated), markdown tables (read aloud as gibberish, so dropped entirely rather than narrated), images, and markdown formatting, then synthesizes what's left. It unwraps plain HTML tags (e.g. a hand-written `<a href="...">` CTA link) but keeps their inner text.
- **Voice**: `en-US-Studio-O` at `speakingRate: 1.08`, set as constants at the top of the script. Studio voices sound noticeably better for long-form narration than Neural2/WaveNet but aren't in Google's always-free tier — cost is a few cents per article and only incurred once, at generation time, never per pageview (visitors just stream the static MP3).
- The player itself (`src/components/AudioNarration.astro`) is a real `<audio>` element under the hood (accurate duration, native seeking) with custom play/pause and a click-and-drag scrub bar — not browser speech synthesis, which was tried first and dropped for inconsistent/robotic voices and no real mid-sentence seeking.

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

### The hero has a job, and it isn't decoration

It was a headline, a paragraph, and one article tile — no call to action anywhere, on any breakpoint (the header CTA is `display: none` below 860px, so the first tap target on a phone was that article at 428px). It now states the offer, gives two destinations, and backs them with counted facts:

- **The H1 names the product and carries the search terms** ("budget spreadsheets", "Google Sheets", "Excel"). It is the strongest on-page signal after the title tag; a generic line like "A simpler way to manage your personal finances" spends it on nothing. Keep it specific.
- **Two CTAs, pointing at different surfaces.** Primary to `/spreadsheets/`, secondary to `/tools/`. The secondary deliberately does *not* point at the quiz: the header CTA and the quiz banner further down both already do, and a third link would spend the slot on a destination the page sells twice.
- **No stat strip under the buttons.** A counted row of facts (templates, tools, review count, "No subscription") was built and removed — four chips directly beneath two buttons read as more chrome stacked on the page's busiest corner. If proof ever goes back into the hero, make it one real review quote rather than a row of counters, and count any figure from the repo at build time rather than typing it in.
- **`.hero-inner` is `align-items: start`, never `center`.** The text column is far shorter than the article column beside it, so centring split the difference into two equal voids — 318px of nothing across a 513px row.
- **`.hero-text` keeps the flex default `stretch`.** `align-items: start` shrink-wraps every child to fit-content, which makes the mobile rule widening the buttons to 100% resolve against a fit-content parent and silently do nothing.
- **The rail is four uniform rows, not a card over a list**, and it carries no visible label. Each row is a small thumbnail, the headline aligned to it, and the read time, divided by hairlines. The pinned featured article takes the first slot but not a different shape — a large featured gradient there out-shouts the H1, which is finding 3 in the review that prompted this. `latest` therefore starts at `rest.slice(3, 9)` so the same headlines don't appear twice on one screen.
- Headlines clamp to two lines so the rows stay an even stack; the dividers are doing rhythm work that ragged 2-and-4-line rows would undo. On a phone the read time drops beneath the headline instead of holding the right edge, where it cost about a fifth of the column and forced an ellipsis into every row.
- **The rail has no heading and no eyebrow.** A lavender `.eyebrow` pill sat above it and was removed: any visible label there either competes with the rail's own 16px headlines or reads as chrome, and the top hairline already gives the column its edge. The list keeps an `aria-label` so screen readers still announce it. The hero therefore contributes only the `h1`, so the outline runs `h1` → section `h2`s → card `h3`s with nothing skipped.

### Section rhythm

Latest / Free tools / Spreadsheets were four identical label-left grids on one ground, which is what actually read as monotonous — the hero got the blame for a whole-page problem. Spreadsheets now breaks out into a full-bleed `.home-band`, since it is the surface the site sells from.

- The band is **`--color-bg-surface`, not `--color-bg-panel`**. The product thumbs are themselves panel-filled and their Best Seller chip is `.badge-overlay` (a surface fill plus a border), so a panel band would swallow both. A white plane on the warm page ground reads as lifted and needs no overrides.
- `SpreadsheetsToolsRows.astro` takes an `only` prop (`"tools"` / `"spreadsheets"`) so the homepage can wrap one row in that band. About still calls it bare and gets both rows in order.
- Heading ranks: section headings are `h2`, card titles `h3`.

## Typography

Two typefaces: **Manrope Variable** (`--font-sans`, aliased as `--font-heading`) for headings and UI text, and **DM Sans Variable** (`--font-body`) for reading copy — plus the "Simply Sheets" wordmark, which stays on the site's older typeface, Aspekta Variable, via a dedicated `--font-logo` token. Hierarchy comes from size, tracking, and leading first, weight second — never from reaching for a third family.

- Both are self-hosted: `public/fonts/ManropeVF.woff2` (weights 200–800, ~25 KB) and `public/fonts/DMSansVF.woff2` (weights 300–700, ~36 KB), both mirrored locally from Google Fonts. Their `@font-face` rules live in `src/styles/fonts.css`, which `global.css` imports and Astro inlines into every page; `BaseHead.astro` preloads both files.
- OFL 1.1 licensed, licences shipped at `public/fonts/Manrope-OFL-LICENSE.txt` and `public/fonts/DMSans-OFL-LICENSE.txt`. Keep them there.
- The site doesn't load fonts from Google Fonts' own CDN — even though both originate there, they're mirrored into `public/fonts/` and served self-hosted like Aspekta was, for the same reason: the browser finds the file while parsing the HTML instead of after a round trip to a third-party stylesheet. Don't swap this for a `<link>` to `fonts.googleapis.com`.
- **`--font-body` is applied exactly once**, on `body` in `global.css`. Everything that doesn't explicitly set its own `font-family` — `.prose` paragraphs, card descriptions, FAQ answers, plain `<p>`/`<span>` text — inherits DM Sans from there. Every element that explicitly declares `font-family: var(--font-sans)` or `var(--font-heading)` (buttons, labels, nav, calculator UI, and every `h1`–`h6` via the shared rule below) stays on Manrope regardless of what `body` is set to. When adding a new component, reading-copy text needs no font-family declaration at all — just let it inherit; UI/label text should declare `var(--font-sans)` explicitly the way existing components do.
- `--font-logo` (`"Aspekta Variable", system-ui, -apple-system, sans-serif`) is used in exactly two places — `.site-logo` in `Header.astro` and `.footer-logo-link` in `Footer.astro` — both wrapping the literal "Simply Sheets" wordmark text next to the SVG mark. Its `@font-face` rule stays in `fonts.css` alongside the other two, and its licence file (`public/fonts/Aspekta-OFL-LICENSE.txt`) stays in place, even though nothing else on the site renders in it. Don't point any other element at `--font-logo`.
- `scripts/fetch-fonts.mjs` (an earlier, different Inter + DM Sans mirroring script that generated `fonts.css`) was removed when the site first consolidated onto Aspekta — don't reintroduce a generated `fonts.css`, edit it directly.
- Weight discipline: body sits at `--weight-normal` (400), headings (`h1`–`h6` in `global.css`) at `--weight-semibold` (600) — this is the default for every heading site-wide; don't override it back down to `--weight-medium` on individual heading classes (a `.hero-title`/`.home-row-title`/`.product-name`-style local override was exactly this bug, fixed once already — check any new heading-tag CSS doesn't reintroduce a `font-weight` that fights the shared rule). `--weight-medium` remains the emphasis step for UI text (buttons, nav, labels) that isn't a heading tag. Reaching for `--weight-bold`/700+ is almost always the wrong fix; make the type bigger or tighten its tracking instead.
- Tracking is a real hierarchy tool here, not a rounding detail: `--tracking-tight` (-0.024em) for display, `--tracking-snug` (-0.02em) for headings and buttons, `--tracking-normal` (0) for body, `--tracking-caps` (0.06em) for uppercase eyebrows. Never set body copy at positive tracking.

### Reading copy vs. UI text

`--text-read` and `--text-body` are both 16px on desktop and diverge on mobile — 18px vs. 16px. Which one to reach for is a question about what the text *is*:

- **`--text-read`** — prose meant to be read in paragraphs: article bodies (`.prose`), calculator intros, FAQ answers. It steps up on a phone, where the column is a third as wide and held further from the eye than the screen size suggests.
- **`--text-body`** — everything else at that size, including text that also has to fit a box: buttons, nav, card titles. It stays at 16px on mobile, where growing costs layout rather than buying legibility.

A paragraph inside a component is reading copy even though it lives in a component. `.debt-subtitle` in `DebtCalculator.astro` is the example: it makes the same kind of point as the article paragraph above it, so it takes `--text-read` and moves with it.

- **Don't hand-roll the bump.** `@media (max-width: 600px) { font-size: 1.125rem }` was written out in four separate places before this token existed, and two of them had already drifted: the template page's FAQ answers never got it at all, and the calculator layout's copy was dead — the `.faq-a` base rule was declared *after* the media query at equal specificity, so source order silently won. A token can't drift that way.
- **The small end of the scale also moves on mobile**, in the `@media (max-width: 600px)` block at the bottom of `tokens.css`: `--text-small` 15→16px and `--text-xs` 14→15px. This is what keeps calculators in step — they're built almost entirely out of those two tokens, and before the block existed their labels and captions rendered at desktop sizes inside enlarged body copy (a 15px calculator intro directly beneath an 18px paragraph making the same point). The ramp stays in order: read (18) > body (16) = small (16) > xs (15). `--text-small` landing exactly on `--text-body` is intended; pushing it past body would invert the scale.

## Eyebrows

The uppercase overline label above a heading is the shared `.eyebrow` class in `global.css`, always paired with `.eyebrow-plain` — quiet muted caps with no pill background. Never hand-roll one.

- `.eyebrow` alone used to render a tinted pill (sky or lavender, depending on what the label pointed at). That pill treatment was tried across all four call sites and dropped as a UI misstep — a chip that loud for a label wasn't earning its weight. `.eyebrow-plain` is now applied everywhere `.eyebrow` is: `<p class="eyebrow eyebrow-plain">…</p>`. Don't reintroduce a bare `.eyebrow` with no `.eyebrow-plain` — that brings the pill back.
- The `--eyebrow-tint` knob (sky vs. lavender) and the two tint tokens (`--tint-sky`, `--tint-lavender`) still exist in `tokens.css` for anything else that needs a light background fill, but `.eyebrow-plain` ignores `--eyebrow-tint` entirely (it sets `background: none`), so don't bother passing it to an eyebrow anymore.
- `.eyebrow-plain` sets `color: var(--color-text-muted)` — eyebrows are quiet by design now, not `--color-text` the way the pill version was.
- The base `.eyebrow` class still supplies layout: `display: flex` + `width: fit-content` (not `inline-flex`) so the eyebrow owns its own line rather than letting the next sibling wrap up beside it, plus `align-self: start` / `justify-self: start` so a flex/grid parent's `stretch` default doesn't pull it across the column. Keep both classes on every eyebrow — `.eyebrow` for layout, `.eyebrow-plain` for the quiet look.
- Still 11px, deliberately off the reading scale, with the caps tracking that keeps it legible that small — that part is unchanged from the pill version.
- If a local rule needs to adjust an eyebrow, keep it to layout (margins). Astro's scoped styles outrank the global `.eyebrow`/`.eyebrow-plain` classes, so restating color, size, or `text-transform` in a component's `<style>` silently wins and re-breaks it.

## Badges

`.badge` in `global.css` is the **only** chip on the site: product badges ("Best Seller"), article tag pills, platform tags ("Google Sheets"), resource labels. Emphasis fill, primary text, pill radius, 13px.

- There were seven near-identical definitions of this before they were consolidated, drifting apart on radius, fill, weight, and text tone — the same "Best Seller" rendered square and grey on the homepage and as a rounded pill on `/spreadsheets/`. Don't add an eighth. A new badge is warranted only when it is genuinely a different *thing*, not when it appears on a different page.
- `.badge-overlay` is the one variant: for a chip floating on a product thumbnail. The thumbnail box is already `--color-bg-panel`, so the standard emphasis fill would vanish against it — the overlay uses a surface fill plus a real border, and carries its own absolute positioning.
- **Local rules may set layout only** (margins, `align-self`). Anything visual belongs in `.badge`. Astro's scoped styles outrank it, so a component that restates `background`, `font-size`, or `border-radius` silently wins and re-forks the badge — which is exactly how the seven came about.
- Both render paths for article tags emit `.badge`: `TagPills.astro` and the client-rendered search results in `ArticleGrid.astro`. If you change one, the other already matches by construction — don't reintroduce a mirrored copy of the chip styles.
- `.compare-badge` in `DebtCalculator.astro` is deliberately *not* a `.badge`. It's an inline qualifier inside a dense comparison row ("Highest rate first"), not a label chip on a card, and a full pill would bloat that row — so it keeps the square chip and the tighter padding. It does match `.badge`'s 13px, though: it was 11px, which made it the smallest text on the page, and on mobile it sat directly under an 18px paragraph and read as unreadable fine print rather than as deliberately quiet. Its row (`.compare-meta`) wraps, because the method name plus two variable-width chips does not fit one line at 320px.

### Badges vs. eyebrows

They are different things and should not both appear on the same element:

- A **badge** is a factual attribute of the item ("Best Seller", "Excel", a tag).
- An **eyebrow** is an editorial pointer, saying why the thing below is here.

`ProductPromo`'s interstitial variant enforces this: when an article passes a `label`, the eyebrow renders and the template's generic `badge` stands down, because the article's framing is the more specific of the two. Stacking both is what the eyebrow-plus-badge pileup looked like before.

Eyebrows are deliberately rare — four places sitewide. Now that they're quiet muted caps rather than a pill, reach for a badge when the label is a factual attribute rather than editorializing, same as before.

## Table Scroll Affordance

`ArticleLayout` wraps every `.prose table` in a `.table-scroll-wrap` and appends an edge shadow plus a "Swipe to scroll" hint — at **every** viewport width, since the script doesn't check one.

Their CSS therefore has to live outside the `max-width: 600px` block, and visibility is gated on state classes the script sets only when the table genuinely overflows. When those styles were scoped to the mobile block, the hint had no styles at all on desktop and rendered as a stray, permanently visible line of text in the middle of the article. If you touch this, check a desktop article with a table before shipping.

The affordance is a single **scroll rail** — a drawn scrollbar under the table, shown only when `.is-scrollable` is set. It says both *that* there is more and *how much*, because the thumb's width is the visible fraction. Mobile browsers hide the native scrollbar until you're already scrolling, which is too late to advertise that you can.

Edge fades, a "Swipe to scroll" chip, and a one-time nudge animation were each tried and removed. The fades said "there is more" without saying how much; the chip covered the data it pointed at; the nudge was more motion than the job needed.

Three details that are load-bearing:

- **The script wraps `.prose table:not(.calc-table)`.** Calculator tables opt out of scrolling on purpose — they set `display: table` + `table-layout: fixed` so their columns stay aligned inside an article. Wrapping one gave it the wrap's mobile right-bleed while leaving it unable to scroll, producing a table 24px wider than the column, pinned flush to the screen edge with its last header clipped and unreachable.
- **The wrap bleeds to the screen edge; the rail does not.** The table running off the edge is the point; the rail is a control, so it stays inside the text column. That override lives *after* the base `.table-scroll-rail` rule — both are single-class selectors, so source order decides, and the same declaration placed in the earlier mobile block simply lost.
- **The last row carries no bottom rule.** The rail sits just under the table, and a rule on the final row landed directly above it so the two read as one doubled line.

## Buttons

`.btn` plus one variant, defined in `global.css`. Medium weight, pill radius, `:active` scale.

- Variants: `.btn-primary` (ink fill), `.btn-brand` (the sky-blue highlight field — `--color-brand`, ink text), `.btn-secondary` (outline), `.btn-ghost`. Sizes: `.btn-sm`, default, `.btn-lg`.
- `--color-brand` is a **field color, never text.** It is not `--color-accent-info`, which is the link/UI blue that has to pass contrast as text and is far too dark to sit behind ink.
- `.btn-arrow` adds the inverted disc inside the pill's right edge, for buttons that are destinations rather than form controls. The arrow is a masked data URI, not a text glyph — an arrow character in a webfont is a fallback lottery and lands off-centre and off-weight at this size. Each variant supplies its own `--badge-bg`/`--badge-glyph` inverse; a new variant needs both or it falls back to ink-on-page.
- **The disc only hugs the right edge above 960px.** `.btn-arrow` buys that by cutting its own `padding-right` to `--space-xs`, but the `@media (max-width: 960px)` block at the bottom of `global.css` re-declares `.btn`'s `padding` shorthand at equal specificity and later in source order, so below that width the pill goes symmetric again and the disc travels with the label. That's the wanted result at small sizes — don't "fix" it with a padding override.
- **A stretched button still centres its content.** `.btn` is `justify-content: center` and stays that way at full width; `.calc-product-link`, the site's other full-width button, centres its label and trailing arrow as one group for the same reason. Pinning a `.btn-arrow`'s disc to the far edge with `space-between` was tried on the homepage hero and reverted: it left the primary's label hard left while the secondary directly below it stayed centred, so the pair read as two different components.

## Navigation

`Header.astro` is a full-width bar, not a floating pill: sticky in normal flow, flush to the viewport top (never `position: fixed`, which would make every page reserve matching top padding by hand and hide its own first heading if it forgot), translucent white over a `saturate(180%) blur(16px)` backdrop filter, with a single hairline bottom border — no shadow, no rounded corners. `.header-inner` pins the logo/links/CTA row to `--max-width` and centers it, while `.header-shell` itself spans the full viewport width so the border runs edge to edge, Stripe-nav style.

- Desktop (≥860px): logo left, links left-aligned immediately after the logo (`margin-left: var(--space-lg)`), CTA anchored alone on the far right with a spacer track between them — the logo and links read as one cluster, not the links right-aligned against the CTA. Below that the bar is **logo + menu button only** — the CTA is hidden, since the quiz already sits in the dropdown panel and a second pill beside the menu button both squeezed the wordmark and put two competing weights side by side.
- The menu button is a **ring, not a fill**: transparent, a hairline `--color-border` edge, and an ink glyph. It was a solid ink disc, which made it the darkest element on the page sitting on the lightest and read as harsh. Bare bars with no container at all were tried too and dropped — without an edge the glyph stops reading as a control, and it needs a negative margin to sit right, because the 40px box is much wider than the mark inside it. The container still says "this is a button"; the glyph carries the contrast.
- **The ring is an inset box-shadow, never a `border`.** The two bars are absolutely positioned, so they resolve against the button's padding box — which `box-sizing: border-box` shrinks by the border width. A real 1px border drops the glyph a further 1px off centre, in the X state as well. The shadow draws an identical ring and leaves the geometry exactly as it was when the button was filled.
- Its `:hover` is behind `@media (hover: hover)`, unlike the fill it replaced. A stuck hover after a tap was nearly invisible as a slightly lighter ink disc; on a ghost control it leaves a filled panel sitting there.
- The mobile panel is a floating card hung under the bar with a blurred backdrop, not a full-screen takeover — the page stays visible behind it. It has a focus trap, Escape handling, and outside-click close; keep all three if you touch the script.
- **The panel's `left`/`right` match `.header-inner`'s own gutter** (`max(var(--space-md), env(safe-area-inset-*))`), not a plain `0`. Absolute positioning resolves against the *padding box* of the nearest positioned ancestor (`.header-inner`), which is the outer edge of that padding — so `0` ignored the gutter entirely and stretched the panel flush to the screen edges instead of floating inside it.
- **Below 860px the bar auto-hides on scroll**: it slides out on scroll-down (past its own height) and back in on scroll-up, via a `nav-hidden` class toggled by a scroll listener in the component's script, rather than staying permanently docked. It never hides while the dropdown is open. This is mobile-only — the script checks `matchMedia('(max-width: 859.98px)')` before touching the class, and the CSS forces `transform: none` at the desktop breakpoint as a second guard in case the class is still set after a resize. `position: sticky` is what makes this possible: the bar has to already be pinned to the viewport for a transform to bring it back mid-scroll, so don't swap it for `static` while working on this.
- **On open, focus goes to the panel itself** (`tabindex="-1"`, `outline: none`), not to its first link. Focusing the first link drew a focus ring around "Home" on some opens and not others, including after a plain tap: a link can legitimately show a ring, and whether it does after a programmatic `.focus()` is left to each browser's `:focus-visible` heuristic, which varies by engine and by what the user last did. Focusing the dialog is also what a screen reader wants — it announces "Menu, dialog" before the contents rather than jumping straight to "Home, link". The links keep their real rings on Tab. If you re-point this at an element inside the panel, the ring comes back.
- The focus trap's shift-Tab guard has to name the panel explicitly (`active === menu`), because `Node.contains()` counts a node as containing itself — otherwise the just-opened state reads as "already somewhere inside" and shift-Tab escapes the dialog on the first press.
- With the CTA gone from the mobile bar there is room for the full wordmark at every width, down to 320px. If you add anything back to the bar, re-check 320/360/390px for truncation before shipping — it was tight enough to force a mark-only logo the last time something else lived there.
- Under edge-to-edge rendering (an installed PWA, or Android Chrome's default) the page draws behind the system status bar. `viewport-fit=cover` in `BaseHead.astro` is what makes `env(safe-area-inset-*)` report real values; the bar offsets by the top inset, and `body::before` in `global.css` paints a page-coloured shield over that strip so no content ever scrolls up behind the clock and battery. The shield has to be `position: fixed` — padding on `<body>` is part of the document flow and scrolls away, so it only holds content clear at scroll position zero. All of it collapses to nothing in an ordinary browser tab, where every inset is `0px`.
- Never re-set `padding-left`/`padding-right` (or a `padding-inline` shorthand) on `.header-inner` in a media query. It would reset the base rule's `max(--space-md, env(safe-area-inset-*))` back to a plain gutter and let a landscape notch clip the bar.
- `--header-offset` is the clearance below the bar. Sticky rails and `scroll-margin-top` on anchor targets read it — don't hardcode a pixel value, it needs to move in step if the header's height ever changes.

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
- Every standalone tool page uses `src/layouts/CalculatorLayout.astro` (mirrors the article layout: sticky TOC left rail with a `ProductPromo variant="mini"` link beneath it, content centered). The page passes `title`, `metaTitle`, `description`, `breadcrumbLabel`, `kind` (`calculator`/`assessment`), `toc` (section anchors), `faq` (renders collapsible Q&A + `FAQPage` JSON-LD), `tags` (drives the auto related-articles list), `productSlug`/`productLabel` (rail mini link + end-of-page interstitial), and `relatedToolUrls` (the "More free tools" grid, drawn from the registry in `src/data/tools.ts`). The calculator component goes in `slot="calculator"`; below it, 3–4 short `<h2 id="...">` content sections (~400–700 words total, question-style headings, natural internal links to articles and `/spreadsheets/` pages). The layout emits `WebApplication` + `BreadcrumbList` JSON-LD automatically.
- When adding a new tool, also add it to the `TOOLS` registry in `src/data/tools.ts` — the tools index page and every "More free tools" grid read from it
- Product CTAs in calculator and assessment components sit *outside* the calculator container, ~24px below it: a `<div class="calc-cta-divider">` followed by `<a class="calc-product-link">`. Both classes live in `src/styles/global.css`, not in the component's scoped `<style>` — every tool shares one definition, so a new calculator just uses the two classes and inherits the look. The treatment is the secondary/outline button (`btn-secondary` styling): full width on mobile, hugging its text and left aligned from 768px up. It was a quiet blue text link before; don't reintroduce that, and don't make it a filled `btn-primary` either. The tool page's rail link and end-of-page promo carry the rest of the product funnel. CTAs that link to another free tool (e.g. assessment → calculator) stay as buttons inside the container.
- Calculators stay uniform with each other: labels above fields (`.calc-label`, `--text-small`, `--color-text`), bordered 2.75rem `.calc-field` inputs on `--color-bg-surface`, the single `--color-bg-panel` `.calc-highlight` card reserved for the hero result, and supporting numbers as flush label/value rows or a `.calc-table`. Inputs never get wrapped in a gray filled panel, and row controls (hide/remove) belong in the row's own flow — never absolutely positioned over a field. `DebtFreeDateCalculator.astro` is the reference for a multi-row calculator.

### Calculator Color System

Calculators and assessments stay grayscale-first, but may use a small, consistent set of semantic accent tokens (defined in `tokens.css`) for progress bars, result icons, and status indicators — never as arbitrary decoration:

- `--color-accent-positive` / `--color-accent-positive-bg` (green) — favorable, on track, more of this is good (e.g. the savings share of a 50/30/20 split, a "ready" assessment result).
- `--color-accent-caution` / `--color-accent-caution-bg` (amber/orange) — discretionary or worth a second look, not bad, just flexible (e.g. "wants" spending, an "almost there" assessment result).
- `--color-accent-critical` / `--color-accent-critical-bg` (red) — needs attention. Use sparingly.
- `--color-accent-info` / `--color-accent-info-bg` (blue) — neutral or essential, no judgment attached (e.g. "needs" spending, a valid alternative path).

Don't apply these to a comparison between two equally valid choices (debt snowball vs. avalanche, the four budgeting styles, etc.) — coloring one option green and the other something else implies it's objectively better when it isn't. Those stay grayscale, or keep their own separate identity colors if they already have them.

The debt snowball vs. avalanche comparison (`DebtCalculator.astro`) uses `--color-debt-avalanche` (the site's accent blue, `--color-accent-info`) for the avalanche bar and `--color-debt-snowball` (a dedicated slate) for the snowball bar, both defined in `tokens.css`. No green/red judgment implied — just enough distinction to tell the two bars apart. The bars themselves plot total interest paid (shorter is better), with the actual dollar-and-months advantage stated in the copy below them, computed from a small illustrative payoff simulation in the component's script — not a color-coded "winner."

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

### Surfaces are a layering vocabulary

The neutral ramp is warm on surfaces and cool-navy on ink, not pure grayscale — don't mix a literal `#FFF`/`#000`/mid-gray into it. Three surface tokens, and which one to use is a question about depth, not taste:

- `--color-bg` (`#FBFAF9`) — the page itself. Full-bleed sections that should read as "the page" use this.
- `--color-bg-surface` (`#FFFFFF`) — anything raised off the page: cards, the header, overlay panels, chips floating on top of a thumbnail. These read as lifted by being *cleaner* than the warm page behind them rather than by spending a shadow, so a raised element set to `--color-bg` nearly vanishes into its own background.
- `--color-bg-panel` (`#F4F2EE`) — a recessed band or a filled result card, sunk below the page. `--color-bg-emphasis` is the next step down again.

Borders come in three weights: `--color-border-hairline` for subtle dividers, `--color-border` as the default, `--color-border-strong` for emphasized or hover edges.

Every text role has to clear WCAG AA (4.5:1) against `--color-bg`, `--color-bg-surface`, *and* `--color-bg-panel`. That puts a hard floor around `#707070`, which is why the ramp has no `#999`-class step and why `--color-text-muted` is `#5F646F` rather than something lighter. A previous lighter muted tone (`#8A8A8A`) failed AA on all three. Check any new text color against all three surfaces before shipping it.

The two light roles are darker than mere AA compliance requires — secondary `#515764` (worst case 6.48:1) and muted `#5F646F` (5.31:1) — because the earlier pair (`#575D68`/`#666B75`) passed on paper and still read as washed out against the warm page. Don't darken them further without checking `--color-link`: the ramp is short, and one more step closes the gap between secondary and link enough that emphasis stops reading as distinct from body copy.
