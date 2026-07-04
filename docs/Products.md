# Products

All products are Google Sheets + Excel spreadsheets sold on Etsy (shop **SimplySheetDesign**), each available in dark and light theme (separate Etsy listings per theme, toggled client-side on the product page). Product data lives in `src/content/templates/*.md` (the collection is still internally named `templates` in `src/content.config.ts`), one file per product, rendered by `src/layouts/TemplateLayout.astro`. Public product pages live at `/spreadsheets/{slug}/` (the route was renamed from `/templates/` — the `src/pages/templates/` folder is now `src/pages/spreadsheets/`; `ProductPromo.astro` builds its links as `` `/spreadsheets/${slug}/` ``). `tags` on each template determine which two products `ArticleLayout.astro` recommends at the bottom of an article with a given tag — see the mapping at the end of this doc.

## Budget Spreadsheet
`src/content/templates/budget-spreadsheet.md` · `$17.99` · SKU `2025BT1` · badge: **Best Seller** · tag: `expense-tracking`

**Features:** monthly income/expense tracking with category breakdowns, real-time progress bars, daily expense log with auto-categorization, monthly overview dashboard, pre-built customizable categories, Google Sheets + Excel.

**Who it's for:** anyone starting from zero who wants a single, straightforward monthly budget — the general-purpose, entry-level product and current best seller. It's the anchor product both bundles are built around (Budget + Debt Payoff, Budget + Savings Goals).

**When articles should recommend it:** the default/fallback recommendation — shown alongside almost every other tag (`expense-tracking`, `irregular-income`, `net-worth`, `debt-payoff`, `savings-goals`, `budgeting-styles` all include it as one of the two picks in `tagProductMap`). Recommend it in any article about getting started with budgeting, tracking daily spending, or applying a percentage framework like 50/30/20.

## Couples Budget Spreadsheet
`src/content/templates/couples-budget-spreadsheet.md` · `$20.99` · SKU `2025JBS` · tag: `couples-budgeting`

**Features:** dual income tracking, shared vs. personal expense categories, bill splitting, combined savings goal tracking, visual joint-finance dashboard, Google Sheets + Excel.

**Who it's for:** couples/partners managing money together — anyone with two incomes who needs to see both a shared and an individual picture, regardless of whether both partners actively manage the sheet.

**When articles should recommend it:** any article tagged `couples-budgeting` or `budgeting-styles` (paired with the Budget Spreadsheet in `tagProductMap`). Natural fit for content about splitting bills, joint finances, or comparing budgeting approaches for two-income households.

## Debt Payoff Tracker
`src/content/templates/debt-payoff-tracker.md` · `$9.99` · SKU `2026SDT1` · tag: `debt-payoff` · bundled with Budget Spreadsheet

**Features:** tracks 30+ individual debts, visual progress bars per balance, monthly payment logging with running totals, total debt overview, interest tracking, snowball vs. avalanche toggle, Google Sheets + Excel.

**Who it's for:** anyone actively paying down multiple debts (credit cards, student loans, car loans, personal/medical loans) who wants to see payoff progress and decide between the avalanche (highest APR first) or snowball (smallest balance first) strategy.

**When articles should recommend it:** any `debt-payoff`-tagged article (paired with the Budget Spreadsheet), especially content about payoff strategy (avalanche vs. snowball) or "how to pay off debt" — the debt-payoff-tracker's own body copy links out to the debt-snowball-vs-avalanche article and calculator, so the relationship runs both ways.

## Savings Goals Tracker
`src/content/templates/savings-goals-tracker.md` · `$9.99` · SKU `2026SFT` · tag: `savings-goals` · bundled with Budget Spreadsheet

**Features:** tracks multiple simultaneous savings goals, visual progress bars, contribution logging, target amount + optional deadline per goal, overview dashboard, Google Sheets + Excel.

**Who it's for:** anyone building toward one or more specific savings targets — emergency fund, vacation, down payment, holiday spending — including "sinking fund" use cases (goal-based savings with a timeline). Functionally this is a sinking-fund tracker as well.

**When articles should recommend it:** any `savings-goals`-tagged article (paired with the Budget Spreadsheet), and content about emergency fund sizing or sinking funds specifically — even though those articles aren't necessarily tagged `savings-goals` today, the product is the natural fit and a good candidate for an in-body `ProductPromo` link.

## Net Worth Tracker
`src/content/templates/net-worth-tracker.md` · `$9.99` · SKU `2026NWT` · tag: `net-worth`

**Features:** tracks all assets and liabilities by category, monthly net worth snapshots, trend chart over time, automatic net worth calculation, joint-household support, Google Sheets + Excel.

**Who it's for:** people who want a full financial-picture view over time rather than a single active problem (debt or a savings goal) — often a next step after someone already has budgeting/debt basics under control and wants to track wealth trajectory.

**When articles should recommend it:** any `net-worth`-tagged article (paired with the Budget Spreadsheet). Good fit for content about long-term financial tracking, wealth-building, or "beyond budgeting" topics.

## Credit Card Tracker
`src/content/templates/credit-card-tracker.md` · `$9.99` · SKU `CCTDARK` · tag: `debt-payoff`

**Features:** tracks multiple credit cards, balance/limit tracking, per-card and overall utilization percentage, configurable utilization threshold (default 30%), payment due-date tracking, monthly payment logging, Google Sheets + Excel.

**Who it's for:** people focused specifically on credit card health and utilization/credit-score management — distinct from the Debt Payoff Tracker, which focuses on paying down balances over time rather than utilization and due dates. Its own FAQ notes the two are complementary and can be used side by side.

**When articles should recommend it:** shares the `debt-payoff` tag with the Debt Payoff Tracker, so `tagProductMap` currently surfaces Debt Payoff Tracker + Budget Spreadsheet for that tag by default — consider recommending the Credit Card Tracker specifically (via an in-body `ProductPromo`) in any article that's about credit utilization, credit score, or managing multiple cards rather than payoff strategy generally.

## Tag → product recommendation map

Defined in `tagProductMap` (`src/layouts/ArticleLayout.astro`) — this determines the two automatic end-of-article product cards for a given article tag:

| Article tag | Product 1 | Product 2 |
|---|---|---|
| `expense-tracking` | Budget Spreadsheet | Savings Goals Tracker |
| `couples-budgeting` | Couples Budget Spreadsheet | Budget Spreadsheet |
| `debt-payoff` | Debt Payoff Tracker | Budget Spreadsheet |
| `savings-goals` | Savings Goals Tracker | Budget Spreadsheet |
| `irregular-income` | Budget Spreadsheet | Savings Goals Tracker |
| `net-worth` | Budget Spreadsheet | Savings Goals Tracker |
| `budgeting-styles` | Budget Spreadsheet | Couples Budget Spreadsheet |

The Credit Card Tracker and Net Worth Tracker aren't wired into every relevant slot above by default (e.g. `net-worth` doesn't surface the Net Worth Tracker itself) — when writing a new article, don't rely solely on the automatic tag mapping if a more specific product exists; add an explicit in-body `ProductPromo` link instead. When adding a new tag, update `tagProductMap` in `ArticleLayout.astro` and the matching `TAG_MAP` in both `src/pages/index.astro` and `src/pages/articles/index.astro`.
