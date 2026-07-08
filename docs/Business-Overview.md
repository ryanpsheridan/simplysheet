# Business Overview

Simply Sheet Design is a personal-finance content site (`simplysheetdesign.com`) that funnels organic search traffic toward a small line of budgeting spreadsheets sold on Etsy. It's a solo, founder-led business run by Ryan Sheridan, who built the original spreadsheet for his own budgeting six years ago and brought ~12 years of UX/visual design experience to turn it into a product.

## Etsy products

All products are sold through the Etsy shop **SimplySheetDesign**, each as a Google Sheets + Excel file, in dark and light theme variants (separate Etsy listings per theme). See `Products.md` for full detail per template; summary:

| Product | Price | SKU | Tag |
|---|---|---|---|
| Budget Spreadsheet (best seller) | $14.99 | `2025BT1` | `expense-tracking` |
| Couples Budget Spreadsheet | $16.99 | `2025JBS` | `couples-budgeting` |
| Debt Payoff Tracker | $9.99 | `2026SDT1` | `debt-payoff` |
| Savings Goals Tracker | $9.99 | `2026SFT` | `savings-goals` |
| Net Worth Tracker | $9.99 | `2026NWT` | `net-worth` |
| Credit Card Tracker | $9.99 | `CCTDARK` | `debt-payoff` |

Two Etsy bundles also exist (Budget + Debt Payoff, Budget + Savings Goals) at a discount versus buying separately.

## Revenue model

- **One-time purchase, no subscriptions.** Every product is a single Etsy purchase (a downloadable/copyable spreadsheet file), not a recurring SaaS charge. "You own your data — no subscriptions, no ads, no company shutting down" is a stated selling point (see the Budget Spreadsheet FAQ).
- **Content-to-commerce funnel.** The site itself carries no ads and sells nothing directly — it exists to rank in Google/AI search results for budgeting questions, build trust through free tools and articles, and route readers to the relevant `/spreadsheets/{slug}/` page, which carries its own Etsy CTA. Articles never link straight to Etsy.
- **Free tools as top-of-funnel.** Calculators (50/30/20, emergency fund, sinking fund, debt snowball/avalanche, biweekly paycheck, expense-tracking readiness) and a budgeting-style quiz give visitors immediate value and a reason to return, without a purchase requirement.
- **Cross-sell via bundles and "more spreadsheets."** Template pages surface bundle offers and other templates (`otherTemplates` on `TemplateLayout.astro`) to increase average order value and repeat purchase.
- **Cost structure is minimal.** No physical shipping (`doesNotShip: true` in the Product schema), no per-unit cost — the product is one-time design + build effort, then indefinite resale.

## Long-term goals

- Organic Google/AI-answer-engine discovery is the explicitly stated top priority (see `CLAUDE.md`) — every content and layout decision is expected to serve SEO/AEO.
- Grow the product line by identifying budgeting sub-problems the current line doesn't cover well (the line has already expanded from one budget spreadsheet to six templates covering couples, debt, savings, net worth, and credit cards).
- Build durable trust and authority as a personal-finance resource through direct, practical, non-salesy content — the founder narrative ("About") is used deliberately to differentiate from anonymous budgeting-app companies.
- Deepen internal linking and cross-promotion between articles, tools, and templates so the site compounds in SEO value over time rather than each article existing in isolation.

## Target audience

People trying to get their personal finances under control who are put off by complicated, subscription-based budgeting apps. Recurring audience segments visible across the article catalog and template line:

- Budgeting beginners looking for a simple starting framework (50/30/20 rule, "why most budgets fail," how to track expenses before budgeting).
- Couples managing money jointly (dual income, shared vs. personal expenses, bill-splitting).
- People actively paying off debt (credit cards, loans — snowball vs. avalanche strategy).
- People with irregular or non-fixed income (freelancers, self-employed, biweekly/fixed-income workers).
- People wanting visibility into net worth or emergency-fund sizing rather than active debt problems.

## Brand positioning

- **Simplicity over feature bloat.** The founder narrative explicitly frames competitors as either poorly designed or overloaded with tabs trying to solve every problem at once; Simply Sheet Design positions itself as "solve one problem really well, make it look clean, make it feel simple."
- **Design-forward.** Visual polish (dark/light themes, consistent card layouts, custom SVG art per article) is treated as a differentiator, backed by the founder's design background.
- **Founder-led and personally tested.** Products originated from the founder's own real budgeting practice and were refined via direct user feedback (friends/family, then Etsy reviews) rather than built abstractly.
- **Ownership over subscription.** Spreadsheets, not apps — buy once, own the file, no data lock-in.
- **Practical, not preachy.** Content voice avoids moralizing about money; it gives direct, usable frameworks and acknowledges when a rule (e.g. 50/30/20) won't fit someone's situation.
