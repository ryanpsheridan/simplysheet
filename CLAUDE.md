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
  Surfaces using this treatment: `.card-media--contain` in `styles/global.css`, which is every `ProductCard` on the site (homepage bento, `/spreadsheets/`, the template page's "More spreadsheets" and bundle cards, the articles index, About, the 404, and `ProductPromo`'s `card` variant); `.stage-img` in `pages/index.astro` (the homepage showcase); and `.article-promo-thumb` / `.product-thumb` in `styles/global.css` (`ProductPromo`'s `interstitial` and `row` variants). If a new surface needs a product thumbnail, use `ProductCard` (or `midImage` centered): reach for the right-positioned hero treatment only for that one product-page hero.

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
- Social crawlers (Facebook, iMessage, Slack, etc.) can't render SVG for link previews, so `BaseHead.astro` points `og:image`/`twitter:image` at a PNG counterpart of the article's SVG (same filename, `.png` instead of `.svg`). `prebuild` runs `scripts/generate-article-cards.mjs` (writes every `card-v3-*.svg`) and then `scripts/generate-og-images.mjs` (rasterizes each to a matching `.png`), so a real build needs no manual step. If you add a new article in this session without running `npm run build`, run both scripts so the SVG and PNG exist for local testing and sharing.

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
  - **Article listing/cards**: `articles_grid_item:<id>` (`ArticleGrid.astro`; search results clone the same server-rendered cards, so they carry it too), `article_related_link:<id>`, `article_share_button`, `article_share_email`.
  - **Articles index extras** (`articles/[...page].astro`): `articles_index_product_card:<slug>` (the four product cards under the grid, which now link to the internal template pages), `articles_index_all_spreadsheets` (their section link), `articles_index_explore_all_cta` (the Etsy banner). This replaced `articles_index_resource_card:<name>`, which linked those cards straight to Etsy and keyed them by display name.
  - **Spreadsheets index** (`spreadsheets/index.astro`): `spreadsheets_index_card:<slug>` (these cards were untracked before the redesign), `spreadsheets_index_etsy_link`.
  - **Template pages** (`TemplateLayout.astro`): `template_hero_cta:<id>`, `template_footer_cta:<id>`, `template_bundle_cta:<id>:<name>`, `template_reviews_cta:<id>`, `template_related_article:<id>`, `template_more_spreadsheets_card:<id>`.
  - **Tool pages**: `tool_thumb_card:<toolId>` (`ToolCard`'s default, used by the tools index and About grids), `calculator_more_tools_item:<toolId>`, `calculator_more_tools_view_all`, `calculator_related_article:<id>` (`CalculatorLayout.astro`).
  - **Homepage** (`index.astro`): `index_hero_cta:spreadsheets`, `index_hero_cta:tools`, `index_showcase:<templateSlug>`, `index_spreadsheets_card:<templateSlug>`, `index_spreadsheets_view_all`, `index_tools_item:<toolId>`, `index_tools_view_all`, `index_featured_article`, `index_latest_article_card:<id>`, `index_latest_view_all`, `index_about_brief_cta`, `index_quiz_banner_cta`. The redesign retired `index_hero_featured_article` (now `index_featured_article`, since the card is no longer in the hero) and the `home_*_row_*` ids.
  - **About** (`about.astro`): `tool_thumb_card:<toolId>`, `home_tools_row_view_all`, `home_spreadsheets_row_item:<id>`, `home_spreadsheets_row_view_all` (names predate the homepage redesign, when these were shared homepage/About rows; kept so About's history doesn't split).
  - **404 page** (`404.astro`): `not_found_home_cta`, `not_found_card:<id>` (one per recovery card, `tools` and the featured template's slug), `not_found_quick_link:<id>`. Worth watching as a group: a spike in one destination says what people are actually failing to find.
  - **Style guide** (`style-guide.astro`, noindex): every live component demo carries `style_guide` (or `style_guide:<toolId>`), so any clicks there are easy to filter out.
  - Everything else not yet broken out this way still follows `<page>_<element>`.
- Card components take the full `data-cta` value as their `cta` prop (`ProductGrid` takes a `ctaPrefix` and appends `:<slug>`), so the id is always chosen by the page, never baked into the component. Keep an existing id when a surface is redesigned but still does the same job, so its GA4 history stays continuous.
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
2. **Draw the article's wireframe** as `scripts/article-cards/wireframes/{slug}.svg`, following the Wireframe Overlay System below, in `currentColor` only. That fragment is the only hand-made part of the card image; see "Article Card Images" below.
   - **Generate the card**: `node scripts/generate-article-cards.mjs` writes `public/images/card-v3-{slug}.svg` (it also runs in `prebuild`), then `node scripts/generate-og-images.mjs` rasterizes it to the matching PNG that social previews (`og:image`/`twitter:image`) use, since crawlers can't render SVG. Commit the wireframe, the SVG, and the PNG.
   - **Always verify** the result before committing: open or screenshot it and check the wireframe is grid-snapped, themed to the topic, and doesn't cut off mid-canvas, and that it reads well at card size on the homepage and `/articles/`.
3. **Include the image path in frontmatter (same path for both fields)**:
   ```yaml
   image: '/images/card-v3-{slug}.svg'
   cardImage: '/images/card-v3-{slug}.svg'
   ```
4. **Pick the first tag deliberately**: it chooses the card's hue family, and the generator varies the exact hue, angle, and bloom per slug, so no palette needs choosing by hand and none can collide.
5. **Generate the narration audio**: `GOOGLE_TTS_API_KEY=... node scripts/generate-audio-narration.mjs {slug}` (see "Article Audio Narration" below). The player then shows up automatically — no per-article code needed.
6. **Verify all internal article links** actually exist by cross-referencing slugs in `src/content/articles/`. Remove or unlink any references to articles that don't exist.
7. **Assign the correct tag** in frontmatter so the product cards at the bottom of the article are relevant.
8. **Update related articles cross-links**: review existing articles and add natural internal links to/from the new article where topically relevant. Internal cross-linking improves both user navigation and SEO crawlability. The "Related articles" section at the bottom of each page is auto-generated (4 articles, those sharing a tag first), but in-body links between related topics are more valuable.
9. **Add natural template page links in body text** — where the article's topic connects to a product (e.g. an article about paying off debt mentioning a [debt payoff tracker](/spreadsheets/debt-payoff-tracker/)), weave in 1–2 internal links to the relevant `/spreadsheets/` pages. These should read as helpful tool suggestions, not sales pitches. Always link to the internal template page, never directly to Etsy — the template page has its own Etsy CTA. This creates an article → template page → Etsy funnel that keeps users on-site longer and builds internal link equity. If the link deserves a visual promo card mid-article (not just a plain text link), use the `<ProductPromo />` component — see "Product Promo Component" below. **Never hand-type product card HTML into an article** — that's what caused broken images in the past.
10. **Consider whether a reader poll fits** — not required for every article, but worth adding when the topic has a natural multi-way choice (a set of styles, methods, or preferences) and the article isn't already using a calculator or assessment. See "Reader Polls" below for how to add one.
11. **Include `schema` in frontmatter** with `@type: Article`, `headline`, and `description` for structured data.
12. **After merging to main**, remind the user to submit the new article URL for Google indexing at: https://search.google.com/search-console — use the URL Inspection tool and paste the full article URL (e.g. `https://www.simplysheetdesign.com/articles/{slug}/`), then click **Request Indexing**. If the article also has a standalone tool page, remind them to index that URL too.

## Article Card Images

Every article has one card image, `public/images/card-v3-{slug}.svg` (960×540), used for both `image` and `cardImage`: the article's own hero, every article card, and (as the PNG) its social preview. The whole look lives in one script, `scripts/generate-article-cards.mjs`; an article contributes only its wireframe and its first tag.

- **The look (v3)**: a light field in the tag's hue family (a two-stop gradient corner to corner), a white highlight bloom in one corner and a saturated bloom in the opposite one, the same faint concentric rings as the page heroes in a third corner, and the article's wireframe in ink (`#081122`). No grain, no blur filters. It matches the site chrome instead of sitting on it as a dark tile.
- **Hue families** (first tag → base hue): `expense-tracking` blue (212°), `couples-budgeting` magenta/pink (330°), `debt-payoff` rose/wine (350°), `savings-goals` green (148°), `irregular-income` amber (34°), `net-worth` teal (176°), `budgeting-styles` violet (256°). A new tag needs an entry in `FAMILY` in the script, or it falls back to a neutral blue.
- **Per-article variation is derived, not chosen**: hue jitter (±10° inside the family), gradient direction, and bloom/ring corners all come from a hash of the slug. Two articles in a family never render identically, and the output is byte-stable between runs, so `prebuild` never produces a diff.
- **Wireframes** live in `scripts/article-cards/wireframes/{slug}.svg`: a standalone 960×540 SVG drawn in `currentColor` only (plus `url(#areaFade)` for under-curve fills, which the generator defines in ink). They follow the Wireframe Overlay System below. The existing eighteen were lifted unchanged from the v2 files.
- **To change the look** for every article at once, edit the generator and rerun it. Never hand-edit a `card-v3-*.svg`; it is overwritten on the next build.
- **Rasterizing**: `generate-og-images.mjs` renders `card-v3-*.svg` as lossless full-colour PNGs (~70 KB; smaller than a palette encode for these clean gradients and free of its banding). `og-default.svg`, which still has grain, keeps the palette encode.
- **Archive**: the previous dark mesh cards (`card-v2-*.svg` and their PNGs) stay in `public/images/` and are shown on `/style-guide/` under Archive, alongside the older gradient-overlay card and the unshipped tool UI thumbnails. Nothing live links to them. Their spec (saturated per-article gradient, four blurred glow circles, grain, a blurred ring motif, the wireframe in white, and a per-article palette registry) is retired; if they are ever revived, the files themselves are the reference.

## Wireframe Overlay System

Every article card's content is its wireframe: an ultra-thin vector chart glyph, grid-snapped and themed to the article's topic, drawn in `currentColor` in `scripts/article-cards/wireframes/{slug}.svg` (the generator renders it in ink over the tinted field). It is a hairline drawing, never a fill-heavy illustration. The coordinates, layouts, and weights below are unchanged from the v2 cards; only the colour moved from white to `currentColor`.

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
<g stroke="currentColor" stroke-width="0.75" opacity="0.15">
  <rect x="144" y="108" width="672" height="324" fill="none" vector-effect="non-scaling-stroke"/>
  <line x1="368" y1="108" x2="368" y2="432" vector-effect="non-scaling-stroke"/>
  <line x1="592" y1="108" x2="592" y2="432" vector-effect="non-scaling-stroke"/>
  <line x1="144" y1="216" x2="816" y2="216" vector-effect="non-scaling-stroke"/>
  <line x1="144" y1="324" x2="816" y2="324" vector-effect="non-scaling-stroke"/>
</g>
```

**2. Full Horizontal Bleed** — all horizontal lines span the full canvas width (0–960) while the vertical columns stay centered at 70% width. For progression/timeline topics (the x-axis represents an ongoing period that extends beyond the frame):
```xml
<g stroke="currentColor" stroke-width="0.75" opacity="0.15">
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
<g stroke="currentColor" stroke-width="0.75" opacity="0.15">
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
<circle cx="…" cy="…" r="6" fill="currentColor" opacity="0.3"/>
<circle cx="…" cy="…" r="2" fill="currentColor" opacity="1"/>
```
Scale down to `r="5"/"1.6"` opacity `0.25`/`0.8` for secondary/less-important points (a chart's start, vs. its emphasized end).

### Stroke and fill hierarchy

- **Primary lines** (the main trend/data path): `stroke-width="1.5"`, opacity `0.9`–`0.95`.
- **Secondary/comparison lines**: `stroke-width="1"`, opacity `0.4`–`0.5`, or `stroke-dasharray="4,4"`.
- **Grid lines** (the structural layout, not the data): `stroke-width="0.75"`, opacity `0.15`.
- **Area fills** under a primary trend line use `fill="url(#areaFade)"` (the generator defines it) and must close back along the chart's own meaningful baseline axis: never drop to the bottom of the safe zone or canvas. For a curve whose baseline sits mid-canvas (an oscillating income wave around its own zero-line, not the box floor), close the fill path back along that specific y-value so the fill only ever represents "area between the curve and its axis," nothing more.
- **Every stroked element** — grid lines, data paths, ring/circle outlines — carries `vector-effect="non-scaling-stroke"` so line weight stays crisp at any render size. Filled shapes (background, glow, motif, markers) don't need it.

### Verifying a new wireframe

After drafting, run `node scripts/generate-article-cards.mjs && node scripts/generate-og-images.mjs` and view the result to confirm: nothing floats off-grid, no line cuts off mid-canvas, the matrix (if used) has no lane bridging, and the drawing stays a hairline on the field rather than a heavy chart.

## Article Page Structure

Every article page renders in this order (handled by `src/layouts/ArticleLayout.astro`):

1. Article content
2. Related articles (4, tag matches first, as compact `ArticleCard`s)
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
  - `"card"`: renders the shared `ProductCard`, meant to sit inside a `<div class="product-cards">` wrapper alongside one sibling card for a 2-up grid. Use only when you specifically want two products side by side; otherwise prefer `"interstitial"`.
  - `"row"` — used internally by `ArticleLayout.astro` for the automatic end-of-article recommendations; don't use this variant directly in article bodies (it relies on being part of a list of recommended products for its spacing/border logic).
- The `interstitial` and `row` thumbnails (`.article-promo-thumb`, `.product-thumb`) use the same media treatment as `ProductCard`: `--radius-card`, the `--gradient-media` field, a gentle zoom on hover.
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
- `src/components/ArticleGrid.astro` renders the static, crawlable grid for the current page (shared `ArticleCard`s in a `.card-grid`) plus a search/sort toolbar. Search and non-default sort span every page, so they switch to a client view built from *all* articles in scope (all articles, or all for the current tag): those cards are server-rendered with the same `ArticleCard` into an inert `<template>`, and the script filters, orders, and clones them. There is no client-side copy of the card markup to keep in sync (there used to be, and it drifted). Clearing search and resetting sort to "Newest first" restores the original static markup exactly.
- Both listing routes open with `PageHero` (breadcrumbs and `TopicFilterTabs centered` inside it). The centered tabs wrap onto centered lines on desktop and become one scrolling row on phones; they use auto margins rather than `justify-content: center` there, because a centered row that overflows clips its first tabs out of scroll reach.
- `src/components/Pagination.astro` is the reusable numbered pager (prev/next arrows, active page as a filled circle). Takes `currentPage`, `lastPage`, `basePath`.
- Both listing route types emit `CollectionPage` and `ItemList` JSON-LD for AEO/structured data.
- If you add a new tag to `ALL_TAGS`, a new archive page is generated automatically at build time — no other wiring needed.

## Homepage

- The featured article is pinned by slug in `src/pages/index.astro` (`const featuredSlug = '...'`), currently `how-to-split-bills-with-different-incomes`. The owner has approved choosing whichever article performs best for that spot, so it can be changed when Search Console data supports a better pick. Base the choice on data (impressions, position, and which product the article funnels to), not preference, and update this line when it changes.

### Layout

A centered, CTA-led page with long vertical rhythm, modeled on the layouts of cap.so. It replaced a two-column hero (headline left, featured article right) and label-left row grids. The page is almost entirely shared components (see "Design System"); only the showcase stage, the numbered steps, the tools preview stage, and the about note are homepage-specific markup in `src/pages/index.astro`.

Section order, top to bottom:

1. **`PageHero size="hero"`**: centered H1, standfirst, two CTAs (`btn-primary btn-arrow` to `/spreadsheets/`, `btn-secondary` to `/tools/`), a three-item proof line, the faint rings behind it. The hero carries calls to action now; the earlier "no CTA in the hero" decision was superseded by this redesign at the owner's request.
2. **Showcase stage** (`.stage`, in the hero's `after` slot): three fanned mockups on `--gradient-glow`: the Budget Spreadsheet's dark `midImage` in front, the Debt Payoff and Savings Goals `midImageLight` behind. All `midImage` assets, centered. The `<img>` tags carry `width`/`height`, so `.stage-img` needs `height: auto`; without it the 1200px attribute wins and the laptops render off the panel.
3. **Spreadsheets**: `SectionHead` + `ProductGrid layout="bento"`.
4. **How it works**: centered `SectionHead` + three numbered step cards, on a surface band.
5. **Free tools**: `ToolCard variant="row"` list beside a dark preview stage that shows the illustration of whichever row has hover or focus (script at the bottom of the page). The stage is `aria-hidden` and dropped below 960px.
6. **Articles**: the pinned featured article as `ArticleCard variant="feature"`, then `latest = rest.slice(0, 6)` as grid cards without descriptions (keep it a multiple of 3). Surface band.
7. **About note**: centered, with the scroll-lit word effect.
8. **FAQ**: `Faq layout="split"` on a surface band; it emits the page's FAQPage JSON-LD. Keep the answers consistent with the template pages' own FAQs.
9. **Closing**: `CtaBanner` to the budgeting-style quiz.

- No eyebrows on this page: Cap puts small caps labels above every heading, but the site's eyebrow rules (rare, `.eyebrow-badge` only) win.
- Heading ranks: section headings are `h2`, card titles `h3`.

## Design System

Every page is assembled from a small set of shared pieces. The rule: **a new page or section should need no new card, grid, or section CSS of its own.** If it seems to, add a modifier to the shared piece (so every page gets it) rather than a one-off. `/style-guide/` renders every piece below live, reads token values from `tokens.css` at build time, and is the place to check a change.

### Layout primitives (`global.css`)

- **`.band`**: a full-bleed section with `--space-band` vertical padding; `.band--surface` raises it onto `--color-bg-surface` with hairline borders; `.band--flush-top` drops its top padding to continue the band above (a grid right under a `PageHero`). Pages alternate plain and surface bands; that alternation, not rules, is what separates chapters.
- **`.band-inner`**: holds content to `--max-width-content` (72rem). **`.band-main`** goes on the `<main>` of a band page, neutralizing the global `main` width and padding.
- **`.rings`**: the masked concentric rings behind page heroes.
- **`.card-grid`** (3 columns, 2 at 960px, 1 at 600px), with `--2`, `--4`, and `--bento` (12 columns; each card's `--span`; every card's media one fixed height so a narrow and a wide card stay level).
- **`.content-block`** / **`.content-block-title`** / **`.content-block-foot`**: the closing chapters of a reading page (FAQ, related articles, more tools, recommended products): a rule, air, one heading size. Identical on articles, calculators, and template pages. **`.card-list`** stacks cards in a narrow column.
- **`.text-link`**: the quiet underlined "All articles →" link for section heads and list feet.

### Card anatomy (`global.css`)

One anatomy for every card: `.card` > `.card-media` (+ `--contain` for product mockups on `--gradient-media`, `--art` for tool line art on `--gradient-ink`) + `.card-body` > `.card-title` / `.card-desc` / `.card-meta` / `.card-link`. Modifiers: `.card--framed` (raised white card, hairline edge, media inset by `--space-xs` with a concentric `--radius-inset`), `.card--row` (media beside the body; stacks at 600px). `--card-lines` sets the description clamp.

These rules are global, not scoped, on purpose: `ArticleGrid` clones cards on the client, and cards render inside `.prose` (the two-up product promos). Card text rules are written as `.card .card-x` (0,2,0) so they beat `.prose p` / `.prose h3` (0,1,1).

### Components (`src/components`)

- **`PageHero`**: the centered opener on every top-level page. `size="hero"` (homepage, `--text-hero`) or `"page"` (`--text-display`). Takes `crumbs` (rendered centered via `Breadcrumbs centered`). Slots: `before` (badge, glyph), default (buttons, `TopicFilterTabs centered`), `after` (the homepage stage). Used by the homepage, `/articles/` and tag archives, `/spreadsheets/`, `/tools/`, About, and the 404.
- **`SectionHead`**: the `h2` that opens a band, in `--text-section`, with optional description and `.text-link`. `align="split"` (default) or `"center"`.
- **`ArticleCard`**: `variant="grid"` (listings), `"feature"` (the one pinned article; framed row), `"compact"` (small thumbnail row for "Related articles"; stays a row on phones). Build its data with `toArticleCard()` from `src/utils/articles.ts`, which is also where `getSortedArticles()` and `getRelatedArticles()` live.
- **`ProductCard`** / **`ProductGrid`**: every product card is framed, with the uncropped `midImage` centered on the tint field and an optional `.badge-overlay`. Pass `template` and it reads everything from the collection; any field can be overridden, and extra attributes pass through to the `<a>` (the template page's bundle cards use this for their Etsy links and the theme toggle's `data-dark-url`/`data-light-url`). `ProductGrid` lays out a list of templates as `layout="bento"` (spans 5/7, 7/5, 6/6; tuned for six products, so revisit `BENTO_SPANS` if the catalogue grows) or `"grid"` (`columns` 2/3/4).
- **`ToolCard`**: `variant="card"` (line art on the ink stage; tools index, About) or `"row"` (list row with a Calculator/Assessment badge; homepage, calculator "More free tools"). Rows carry `data-tool` for pairing with a preview stage.
- **`Faq`**: the only FAQ. Renders the accordion and its FAQPage JSON-LD together (pass `schema={false}` only for demos), slug ids per question so `#question-slug` links open on arrival, animated collapse, a ring-and-plus icon. `layout="stack"` (reading columns; pass `class="content-block"`) or `"split"` (bands). `html` renders answers as trusted HTML (calculator pages).
- **`CtaBanner`**: the closing call to action on `--gradient-brand`; ink text only. `external` swaps the arrow disc for an external-link glyph and opens a new tab.
- **`Toc`** / **`ReadingProgress`**: the sticky "On this page" rail with scroll-spy (default slot under the list for the mini promo) and the phone-width progress bar, shared by the article and calculator layouts.
- Helpers in `src/consts.ts`: `templateName()` (drops the "for Google Sheets & Excel" suffix on cards; it was an inline regex in seven places) and `readTime()`. `toolId()` is in `src/data/tools.ts`.

Placement rules for a parent that needs to position a child component's root (e.g. aligning `.content-block` sections under a TOC grid) use `:global(...)`: Astro's attribute scoping does not reach a child component's elements.

## Typography

Two typefaces: **Manrope Variable** (`--font-sans`, aliased as `--font-heading`) for headings and UI text, and **DM Sans Variable** (`--font-body`) for reading copy — plus the "Simply Sheets" wordmark, which stays on the site's older typeface, Aspekta Variable, via a dedicated `--font-logo` token. Hierarchy comes from size, tracking, and leading first, weight second — never from reaching for a third family.

- Both are self-hosted: `public/fonts/ManropeVF.woff2` (weights 200–800, ~25 KB) and `public/fonts/DMSansVF.woff2` (weights 300–700, ~36 KB), both mirrored locally from Google Fonts. Their `@font-face` rules live in `src/styles/fonts.css`, which `global.css` imports and Astro inlines into every page; `BaseHead.astro` preloads both files.
- OFL 1.1 licensed, licences shipped at `public/fonts/Manrope-OFL-LICENSE.txt` and `public/fonts/DMSans-OFL-LICENSE.txt`. Keep them there.
- The site doesn't load fonts from Google Fonts' own CDN — even though both originate there, they're mirrored into `public/fonts/` and served self-hosted like Aspekta was, for the same reason: the browser finds the file while parsing the HTML instead of after a round trip to a third-party stylesheet. Don't swap this for a `<link>` to `fonts.googleapis.com`.
- **`--font-body` is applied exactly once**, on `body` in `global.css`. Everything that doesn't explicitly set its own `font-family` — `.prose` paragraphs, card descriptions, FAQ answers, plain `<p>`/`<span>` text — inherits DM Sans from there. Every element that explicitly declares `font-family: var(--font-sans)` or `var(--font-heading)` (buttons, labels, nav, calculator UI, and every `h1`–`h6` via the shared rule below) stays on Manrope regardless of what `body` is set to. When adding a new component, reading-copy text needs no font-family declaration at all — just let it inherit; UI/label text should declare `var(--font-sans)` explicitly the way existing components do.
- `--font-logo` (`"Aspekta Variable", system-ui, -apple-system, sans-serif`) is used in exactly two places — `.site-logo` in `Header.astro` and `.footer-logo-link` in `Footer.astro` — both wrapping the literal "Simply Sheets" wordmark text next to the SVG mark. Its `@font-face` rule stays in `fonts.css` alongside the other two, and its licence file (`public/fonts/Aspekta-OFL-LICENSE.txt`) stays in place, even though nothing else on the site renders in it. Don't point any other element at `--font-logo`.
- `scripts/fetch-fonts.mjs` (an earlier, different Inter + DM Sans mirroring script that generated `fonts.css`) was removed when the site first consolidated onto Aspekta — don't reintroduce a generated `fonts.css`, edit it directly.
- Weight discipline: body sits at `--weight-normal` (400), headings (`h1`–`h6` in `global.css`) at `--weight-semibold` (600) — this is the default for every heading site-wide; don't override it back down to `--weight-medium` on individual heading classes (a `.hero-title`/`.home-row-title`/`.product-name`-style local override was exactly this bug, fixed once already — check any new heading-tag CSS doesn't reintroduce a `font-weight` that fights the shared rule). `--weight-medium` remains the emphasis step for UI text (buttons, nav, labels) that isn't a heading tag. Reaching for `--weight-bold`/700+ is almost always the wrong fix; make the type bigger or tighten its tracking instead.
- Tracking is a real hierarchy tool here, not a rounding detail: `--tracking-hero` (-0.035em) for `--text-hero` only, `--tracking-tight` (-0.024em) for display and section heads, `--tracking-snug` (-0.02em) for headings and buttons, `--tracking-normal` (0) for body, `--tracking-caps` (0.06em) for uppercase eyebrows. Never set body copy at positive tracking.
- Three headline steps above the h1–h4 scale: `--text-hero` (the homepage H1 only), `--text-display` (every other page hero), `--text-section` (the `h2` that opens a band, via `SectionHead`, `Faq layout="split"`, and `CtaBanner`). A page never shows two competing headline sizes above the fold.

### Reading copy vs. UI text

`--text-read` and `--text-body` are both 16px on desktop and diverge on mobile — 18px vs. 16px. Which one to reach for is a question about what the text *is*:

- **`--text-read`** — prose meant to be read in paragraphs: article bodies (`.prose`), calculator intros, FAQ answers. It steps up on a phone, where the column is a third as wide and held further from the eye than the screen size suggests.
- **`--text-body`** — everything else at that size, including text that also has to fit a box: buttons, nav, card titles. It stays at 16px on mobile, where growing costs layout rather than buying legibility.

A paragraph inside a component is reading copy even though it lives in a component. `.debt-subtitle` in `DebtCalculator.astro` is the example: it makes the same kind of point as the article paragraph above it, so it takes `--text-read` and moves with it.

- **Don't hand-roll the bump.** `@media (max-width: 600px) { font-size: 1.125rem }` was written out in four separate places before this token existed, and two of them had already drifted: the template page's FAQ answers never got it at all, and the calculator layout's copy was dead — the `.faq-a` base rule was declared *after* the media query at equal specificity, so source order silently won. A token can't drift that way.
- **The small end of the scale also moves on mobile**, in the `@media (max-width: 600px)` block at the bottom of `tokens.css`: `--text-small` 15→16px and `--text-xs` 14→15px. This is what keeps calculators in step — they're built almost entirely out of those two tokens, and before the block existed their labels and captions rendered at desktop sizes inside enlarged body copy (a 15px calculator intro directly beneath an 18px paragraph making the same point). The ramp stays in order: read (18) > body (16) = small (16) > xs (15). `--text-small` landing exactly on `--text-body` is intended; pushing it past body would invert the scale.

## Eyebrows

The overline label above a heading is the shared `.eyebrow` class in `global.css`, always paired with `.eyebrow-badge` — the same grey pill as `.badge` (`--color-bg-emphasis` fill, `--radius-full`, sentence case), not the uppercase-caps tinted pill this used to be. Never hand-roll one.

- This went through two revisions: `.eyebrow` originally rendered a tinted uppercase pill (sky/lavender depending on what the label pointed at); that was replaced with `.eyebrow-plain` (quiet muted caps, no background) as a UI fix; `.eyebrow-plain` was then replaced with `.eyebrow-badge` because the grey `.badge` pill (see "Best Seller") read better than plain caps. `.eyebrow-plain` no longer exists — don't reintroduce it or a bare `.eyebrow` with neither modifier.
- `.eyebrow-badge` is applied everywhere `.eyebrow` is: `<p class="eyebrow eyebrow-badge">…</p>`, on all four sitewide call sites (`ProductPromo`'s interstitial and mini labels, the template page's reviews label, the quiz's related-article label).
- The `--eyebrow-tint` knob (sky vs. lavender) and the two tint tokens (`--tint-sky`, `--tint-lavender`) still exist in `tokens.css` for anything else that needs a light background fill, but `.eyebrow-badge` ignores `--eyebrow-tint` entirely (it sets its own `background: var(--color-bg-emphasis)`), so don't bother passing it to an eyebrow.
- `.eyebrow-badge` sets `color: var(--color-text)`, `font-size: 0.8125rem`, `font-weight: var(--weight-medium)`, `text-transform: none` — it deliberately mirrors `.badge`'s exact values rather than duplicating a second set of pill constants, so if `.badge`'s look ever changes, update `.eyebrow-badge` to match by hand (there's no shared mixin).
- The base `.eyebrow` class still supplies layout only: `display: flex` + `width: fit-content` (not `inline-flex`) so the eyebrow owns its own line rather than letting the next sibling wrap up beside it, plus `align-self: start` / `justify-self: start` so a flex/grid parent's `stretch` default doesn't pull it across the column, plus the bottom margin. Keep both classes on every eyebrow — `.eyebrow` for layout, `.eyebrow-badge` for the look.
- If a local rule needs to adjust an eyebrow, keep it to layout (margins). Astro's scoped styles outrank the global `.eyebrow`/`.eyebrow-badge` classes, so restating color, size, or padding in a component's `<style>` silently wins and re-breaks it.

## Badges

`.badge` in `global.css` is the **only** chip on the site: product badges ("Best Seller"), article tag pills, platform tags ("Google Sheets"), resource labels. Emphasis fill, primary text, pill radius, 13px.

- There were seven near-identical definitions of this before they were consolidated, drifting apart on radius, fill, weight, and text tone — the same "Best Seller" rendered square and grey on the homepage and as a rounded pill on `/spreadsheets/`. Don't add an eighth. A new badge is warranted only when it is genuinely a different *thing*, not when it appears on a different page.
- `.badge-overlay` is the one variant: for a chip floating on a product thumbnail. The thumbnail box is the pale `--gradient-media` field, so the standard emphasis fill would vanish against it: the overlay uses a surface fill plus a real border, and carries its own absolute positioning.
- **Local rules may set layout only** (margins, `align-self`). Anything visual belongs in `.badge`. Astro's scoped styles outrank it, so a component that restates `background`, `font-size`, or `border-radius` silently wins and re-forks the badge — which is exactly how the seven came about.
- Both render paths for article tags emit `.badge`: `TagPills.astro` and the client-rendered search results in `ArticleGrid.astro`. If you change one, the other already matches by construction — don't reintroduce a mirrored copy of the chip styles.
- `.compare-badge` in `DebtCalculator.astro` is deliberately *not* a `.badge`. It's an inline qualifier inside a dense comparison row ("Highest rate first"), not a label chip on a card, and a full pill would bloat that row — so it keeps the square chip and the tighter padding. It does match `.badge`'s 13px, though: it was 11px, which made it the smallest text on the page, and on mobile it sat directly under an 18px paragraph and read as unreadable fine print rather than as deliberately quiet. Its row (`.compare-meta`) wraps, because the method name plus two variable-width chips does not fit one line at 320px.

### Badges vs. eyebrows

They are different things and should not both appear on the same element:

- A **badge** is a factual attribute of the item ("Best Seller", "Excel", a tag).
- An **eyebrow** is an editorial pointer, saying why the thing below is here.

`ProductPromo`'s interstitial variant enforces this: when an article passes a `label`, the eyebrow renders and the template's generic `badge` stands down, because the article's framing is the more specific of the two. Stacking both is what the eyebrow-plus-badge pileup looked like before.

Eyebrows are deliberately rare — four places sitewide. They're visually identical to a badge now (`.eyebrow-badge` mirrors `.badge`'s pill), so the distinction that matters is purely semantic: reach for a badge when the label is a factual attribute, an eyebrow when it's editorializing about what's below it. Don't let the shared look tempt you into using one component's class for the other's job — `.badge` on something that should own its own line above a heading loses `.eyebrow`'s layout guarantees.

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
- Every standalone tool page uses `src/layouts/CalculatorLayout.astro` (mirrors the article layout: sticky TOC left rail with a `ProductPromo variant="mini"` link beneath it, content centered). The page passes `title`, `metaTitle`, `description`, `breadcrumbLabel`, `kind` (`calculator`/`assessment`), `toc` (section anchors), `faq` (renders collapsible Q&A + `FAQPage` JSON-LD), `tags` (drives the auto related-articles list), `productSlug`/`productLabel` (rail mini link + end-of-page interstitial), and `relatedToolUrls` (the "More free tools" grid, drawn from the registry in `src/data/tools.ts`). The calculator component goes in `slot="calculator"`; below it, 3–4 short `<h2 id="...">` content sections (~400–700 words total, question-style headings, natural internal links to articles and `/spreadsheets/` pages). The layout emits `WebApplication` + `BreadcrumbList` JSON-LD automatically; the FAQPage JSON-LD comes from the shared `Faq` component (with `html`, since answers may contain links). "More free tools" is a list of `ToolCard variant="row"` and "Related articles" a list of compact `ArticleCard`s, both as `.content-block` sections, exactly as on article pages.
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

- `image`: article card SVG path, `/images/card-v3-{slug}.svg` (see "Article Card Images"; same file as `cardImage`)
- `cardImage`: same file as `image`; `generate-article-cards.mjs` reads the `{slug}` from it to find the wireframe
- `tags` — array of tag slugs
- `faq` — array of `{ question, answer }` objects
- `relatedProduct` — `{ name, url }` (currently unused in layout)

## Design Tokens

Use CSS variables from `src/styles/tokens.css` for all styling. Key tokens:

- Colors: `--color-text`, `--color-text-secondary`, `--color-bg`, `--color-border`, etc.
- Spacing: `--space-xs` through `--space-2xl`; `--space-band` is a band's vertical padding
- Layout: `--max-width` (header, 80rem), `--max-width-content` (band content, 72rem), `--max-width-narrow` (reading column, 42rem)
- Radius: `--radius-card` for every card and its media, `--radius-inset` for media inset inside a framed card (concentric with the card), `--radius-xl` for stages and banners, `--radius-full` for pills
- Gradients, all from the two brand tints: `--gradient-glow` (showcase stage), `--gradient-media` (behind product mockups), `--gradient-brand` (`CtaBanner`, ink text only), `--gradient-ink` (tool illustration stages)
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
