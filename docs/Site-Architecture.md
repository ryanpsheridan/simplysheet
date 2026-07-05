# Site Architecture

## Tech stack

- **Astro** (`astro ^7.0.2`) — static site generation, no SSR adapter configured. Pages are plain `.astro` files; content lives in typed content collections.
- **`@astrojs/mdx`** — enables `.mdx` articles that import and embed interactive components (calculators, quizzes, `ProductPromo`). Plain `.md` is used for articles with no embedded component.
- **`@astrojs/sitemap`** — auto-generates `/sitemap-index.xml`, filtered to exclude `/style-guide`.
- **`@astrojs/rss`** — powers `src/pages/rss.xml.js`.
- **`sharp`** — image processing dependency (Astro's built-in image pipeline).
- **Vercel** — deployment target. `vercel.json` at the repo root sets response headers (CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) applied to all routes; the site is built and served as static output.
- **TypeScript** — `tsconfig.json` present; content collections are schema-typed via `astro:content` + `zod` (`src/content.config.ts`).
- **No client framework** (no React/Vue/Svelte). Interactivity is hand-written vanilla JS via inline `<script>` / `<script is:inline>` blocks scoped per component.
- Google Analytics (GA4, `G-3CSDE2XWTG`) is loaded directly in `BaseHead.astro`.

## Folder structure

```
src/
  content/
    articles/       # article content, .md or .mdx, one file per slug
    templates/       # product data collection, one .md file per Etsy product
  content.config.ts  # zod schemas for the `articles` and `templates` collections
  components/        # reusable .astro components (see below)
  layouts/
    BaseLayout.astro     # generic page shell (Header + slot + Footer)
    ArticleLayout.astro  # article page shell: hero, TOC, related, FAQ, product row
    TemplateLayout.astro # product page shell: hero, features, reviews, bundles, FAQ
  pages/
    index.astro                 # homepage
    about.astro
    404.astro
    style-guide.astro           # internal design reference, excluded from sitemap
    rss.xml.js
    articles/
      index.astro       # article listing/index page
      [...slug].astro   # renders any article via ArticleLayout
    spreadsheets/       # public route: /spreadsheets/{slug}/ (renamed from /templates/)
      index.astro
      [...slug].astro   # renders any product via TemplateLayout
    tools/
      index.astro        # tools listing
      *-calculator.astro  # one standalone page per calculator
    quiz/
      budgeting-style.astro
  styles/
    tokens.css   # design tokens (CSS custom properties)
    global.css   # shared component/section styles, organized by commented section
  consts.ts      # SITE_TITLE, SITE_DESCRIPTION
public/
  images/        # article SVG art (card-v2-{slug}.svg) + product PNGs, favicons
```

## Component conventions

- Components are `.astro` single-file components: frontmatter script, markup, scoped `<style>` at the bottom. No shared component library beyond what's in `src/components/`.
- **Data-driven, not hand-authored HTML.** `ProductPromo.astro` is the only way any product card renders anywhere on the site — it looks up the product by slug from the `templates` collection via `getEntry`, so name/description/badge/image always match the canonical template page. Hand-typing product markup in an article is explicitly disallowed (see `CLAUDE.md`) because it previously caused broken images.
- **Layout components own their own JSON-LD and CSS**, rather than a separate SEO/schema helper — `ArticleLayout.astro` and `TemplateLayout.astro` each build their own `schema` object inline from `Astro.props` and the content collection data, and inject it via `<script type="application/ld+json" set:html={...}>`.
- **Small shared UI atoms**: `TagPills` (renders up to 2 tags from a `tagMap`), `Breadcrumbs` (crumb array, always prepends Home), `FormattedDate`.
- **Calculators follow one pattern** (`BudgetCalculator.astro` is the reference implementation): generate a unique per-instance id with `Math.random().toString(36).slice(2, 8-10)`, use `<script is:inline define:vars={{ id }}>` for client logic so multiple instances of the same calculator can coexist on one page, pill-button toggles for mode/category selection, and a `formatCurrency`/`formatInput` helper for live currency formatting. Every calculator exists both embedded in an article (imported into the `.mdx`) and as its own standalone page under `src/pages/tools/`.
- **Icon selection by heuristic**: `TemplateLayout.astro`'s `featureIcon()` maps a feature-string's keywords (e.g. "progress bar", "dashboard", "goal", "debt") to a hard-coded SVG path fragment, so `templates/*.md` files never need to specify icons manually.
- Conditional classes use Astro's `class:list`.

## Styling system

- All values come from CSS custom properties defined once in `src/styles/tokens.css`: colors (`--color-text`, `--color-bg-panel`, `--color-border`, `--color-btn`, etc.), typography (`--font-sans` = Inter, sizes `--text-xs` through `--text-display`, line-height and letter-spacing scales), a spacing scale (`--space-2xs` through `--space-2xl`, plus a responsive `--space-section`), layout widths (`--max-width` = 1280px, `--max-width-narrow` = 672px), and radii.
- `src/styles/global.css` holds shared, non-component-scoped styles (buttons, product card variants, the article interstitial, arrow-nudge hover effect), organized under `/* ——— Section Name ——— */` comment banners.
- Component-local styles live in the component's own `<style>` block and reference the same tokens — there is no CSS-in-JS or utility-class framework (no Tailwind).
- Standard responsive breakpoints across layouts: `1100px` (TOC sticky rail), `960px`, `768px`, `600px`, `720px` (a few product-page-specific breakpoints).
- A `src/pages/style-guide.astro` page exists as an internal visual reference for tokens/components; it's deliberately excluded from the sitemap and should stay that way.

## SEO components

`src/components/BaseHead.astro` is the single source of truth for `<head>` SEO tags, included by every layout:

- Canonical URL (derived from `Astro.url` + `Astro.site`), `<title>`, meta description.
- Open Graph (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`) and Twitter card tags, image resolved to an absolute URL when provided.
- `noindex` prop to opt a page out of indexing (used for the article `[...slug]` fallback pattern isn't currently used, but the mechanism exists — e.g. utility/preview pages).
- `type` prop switches `og:type` between `website` (default) and `article`.
- Sitemap `<link>`, RSS `<link>`, favicons, Google Search Console verification meta tag, GA4 script.
- Google Fonts (Inter) preconnect + stylesheet.

Astro's sitemap integration (`astro.config.mjs`) generates `/sitemap-index.xml` automatically from all rendered routes, filtering out `/style-guide`.

## Structured data approach

JSON-LD is assembled per-layout as plain objects and injected with `<script type="application/ld+json" set:html={JSON.stringify(schema)} />` — there's no shared schema-builder utility.

- **`ArticleLayout.astro`** emits three schemas: `Article` (`headline`, `description`, `datePublished`, `dateModified` if present, `author: Person` — "Ryan Sheridan", `publisher: Organization`, `mainEntityOfPage`), a `BreadcrumbList` (Home → Articles → article title), and a `FAQPage` (only if the article's `faq` frontmatter array is non-empty), mapping each `{question, answer}` to a `Question`/`acceptedAnswer` pair.
- **`TemplateLayout.astro`** emits a `Product` schema (`name`, `description`, `image`, `sku`, `brand`, `offers` with price/currency/availability/seller/shipping/return-policy), plus `review` and `aggregateRating` built from the template's `reviews` array (always rated 5/5 in the current data), a `BreadcrumbList` (Home → Spreadsheets → product title), and a conditional `FAQPage`.
- Schema data is always derived directly from the same content-collection frontmatter that renders the visible page — there is no separate/duplicated schema source, which keeps visible copy and structured data in sync by construction.
