# SEO Strategy

Organic discovery (Google + AI answer engines) is the site's stated top priority — see `CLAUDE.md`, which frames every article, layout, and content change as something that should support it.

## UX principles

These are the standing UX rules that support both readability and SEO/AEO, drawn from how the layouts and homepage are built:

- **Consistent card geometry everywhere.** All article/template cards use the same thumbnail aspect ratio, badge treatment, and a fixed 3-line description clamp (`-webkit-line-clamp: 3` on the homepage cards) so grids never get lopsided — never remove this clamp.
- **One image does two jobs.** Every article's single SVG (`card-v2-{slug}.svg`) serves as both the homepage card background and the article hero — there's no separate hero/thumbnail asset pair to keep in sync, and a missing image breaks the card layout, so every article must set `image`/`cardImage`.
- **Predictable page anatomy.** Every article renders in the same order: content → related articles → FAQ → two recommended product cards. Every product page renders: hero → features → body/how-it-works → bundles (if any) → reviews (if any) → related articles/FAQ → other spreadsheets. Predictability here is both a UX and a crawlability aid.
- **Never hand-type a product card.** All product promotion, anywhere on the site, must go through `ProductPromo.astro` so copy, image, and price never drift from the canonical template page.
- **Simplicity over cleverness in tone.** Per the founder's own "About" narrative, the product philosophy ("solve one problem well, keep it simple") is meant to be reflected in the writing style too — direct, practical, no padding.

## Content philosophy

- Write to match how people actually search and ask questions, not how a textbook would phrase a topic — titles and headings lean toward natural question or how-to phrasing (e.g. "What is the 50/30/20 rule?", "How to pay off debt").
- Be honest about when a framework doesn't apply. Articles explicitly call out edge cases (e.g. the 50/30/20 article has a dedicated section on when the rule breaks down for irregular income, high cost-of-living, heavy debt, or couples) rather than presenting one-size-fits-all advice — this builds trust and naturally generates internal links to the article that does cover that edge case.
- Every article should give the reader something usable even if they never buy a product: a framework, a calculator, or a clear next step.

## Internal linking strategy

- **Cross-link in body text, not just the auto-generated block.** `ArticleLayout.astro` auto-populates a "Related articles" section with the 4 most recently published articles regardless of topic — that's a freshness surface, not a relevance surface. Actual topical relevance has to come from natural in-body links between articles (e.g. the 50/30/20 article links out to the biweekly-paycheck and irregular-income articles inline, at the point where those edge cases come up).
- **Verify before linking.** Cross-reference the slug against `src/content/articles/` before adding any internal link — broken references to articles that don't exist must be removed or unlinked. Watch for orphaned articles (pages nothing else links to) and proactively add links to them.
- **Article → product page → Etsy funnel, never article → Etsy directly.** When an article's topic naturally intersects with a product (e.g. debt payoff content mentioning the debt payoff tracker), link to the internal `/spreadsheets/{slug}/` page. That page carries its own Etsy CTA — this keeps link equity and session time on-site and lets the product page's schema/CTA do the conversion work.
- **Use `ProductPromo` for any visual mid-article promo**, `variant="interstitial"` for a single horizontal card with an eyebrow `label`, `variant="card"` inside a two-up `.product-cards` grid. Plain text links are fine for lighter mentions; reserve the visual promo for genuinely relevant moments.
- **Tag-driven end-of-article recommendations.** `tagProductMap` in `ArticleLayout.astro` selects the two `ProductPromo` "row" cards shown at the bottom of every article, based on the article's `tags`. Assigning the right tag is itself part of the internal-linking/relevance strategy, not just categorization.

## Schema usage

- Every article gets `Article` + `BreadcrumbList` JSON-LD automatically; add an `FAQPage` schema for free any time the article has 2+ genuinely distinct FAQ items by populating the `faq` frontmatter array.
- Every template/product page gets `Product` (with `Offer`, `AggregateRating`, and per-review `Review` schema built straight from the `reviews` frontmatter) + `BreadcrumbList`, and `FAQPage` when `faq` is present.
- Schema is generated from the same frontmatter/content that renders on the page — there's nothing to keep in sync manually. When adding a new field to an article or template that should appear in structured data, add it to the layout's `schema` object, not a separate metadata file.

## Article template

Frontmatter (articles collection, `src/content.config.ts`):

```yaml
title: string            # -> <title> and Article headline
description: string      # -> meta description and Article description
pubDate: date
updatedDate: date?       # optional, adds dateModified to schema
image: string            # SVG path, e.g. /images/card-v2-{slug}.svg
cardImage: string        # same path as image
tags: string[]           # drives end-of-article product recommendations + tag pills
faq:                     # optional array of { question, answer }
relatedProduct:          # optional { name, url } — currently unused by the layout
```

Content rules: `##` for main sections, `###` for subsections, never skip a level. Weave internal links to related articles and 1–2 `/spreadsheets/` links naturally into body copy where topically relevant. Use `.mdx` only if the article embeds a component (a calculator, `ProductPromo`, etc.); otherwise plain `.md`.

## Publishing checklist

Every time a new article is submitted, per `CLAUDE.md`:

1. Create the article file in `src/content/articles/` (`.md`, or `.mdx` if it embeds a component).
2. Generate the single `card-v2-{slug}.svg` in `public/images/`, following the SVG construction rules and color registry in `CLAUDE.md` — verify it renders correctly (open/screenshot it) before committing.
3. Set `image` and `cardImage` in frontmatter to the same SVG path.
4. Pick a color scheme not already used by another article (check the registry).
5. Verify every internal article link resolves to a real slug; remove/unlink anything that doesn't exist.
6. Assign the correct `tags` entry so the right two product cards show at the end of the article.
7. Review existing articles for natural cross-link opportunities to and from the new article.
8. Add 1–2 natural `/spreadsheets/` links in body text where relevant (via `ProductPromo` for a visual promo, plain link otherwise) — never link directly to Etsy from an article.
9. Include `schema`-relevant frontmatter: title, description, and (if applicable) `faq`.
10. After merging to `main`, submit the article URL (and any standalone tool page URL) for indexing — see below.

## Indexing workflow

After a new article (or standalone tool page) merges to `main`:

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Use the URL Inspection tool and paste the full published URL, e.g. `https://www.simplysheetdesign.com/articles/{slug}/`.
3. Click **Request Indexing**.
4. If the article has a companion standalone calculator/tool page, repeat the same URL Inspection + Request Indexing step for that tool's URL.

This is a manual step the assistant should proactively remind the user to do after merge — it isn't automated in the repo.

## AEO optimization guidelines

AI answer engines (and Google's AI-generated answers) favor content structured the way people actually ask questions, so:

- Phrase titles and `headline`/`##` headings as natural questions or how-to statements that match real search phrasing ("How to pay off debt" rather than "Debt payoff", "What is the 50/30/20 rule?" rather than "50/30/20 overview").
- Use the `faq` frontmatter liberally when an article has genuinely distinct sub-questions — `FAQPage` schema is one of the more reliable surfaces for AI engines to lift a direct answer from.
- Front-load a direct, self-contained answer at the start of each `##` section rather than building up to it — answer engines tend to extract the first clear statement under a heading.
- Keep slugs matched to high-volume search phrasing (`how-to-pay-off-debt`, not `debt-payoff`) since slugs and headline text both feed how a page gets represented in search/answer results.
- Explicitly call out edge cases and exceptions in prose (as described under Content Philosophy) — answer engines often surface "when does X not work" style content directly.
