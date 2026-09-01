# SEO Experiments

A running record of deliberate, measured SEO changes. One entry per experiment.
An experiment is not "a change we made" — it has a hypothesis, a frozen baseline,
a pre-committed metric, a null result, and a decision date fixed in advance.

## Ground rules

- **Freeze the page for the duration.** No title, content, or layout edits to a
  page under test until its decision date. Serial tweaking destroys attribution.
- **Pre-commit the metric.** Decide what counts as success before the data
  arrives, not after.
- **Write down the null result.** An experiment that cannot fail teaches nothing.
- **Capture the baseline before deploying**, not after. Once Google recrawls,
  the pre-change state is unrecoverable.

---

## EXP-001 — Bill Split Calculator intent repositioning

**Status: CLOSED — hypothesis FALSIFIED at baseline, before deploy.**
**Opened 2026-09-01 · Closed 2026-09-01 on Search Console data.**

### What was hypothesised

That the page was accumulating impressions from the ambiguous `bill split
calculator` head term, whose dominant intent is splitting a restaurant check,
rather than from the income/fair-share cluster it serves. Confidence was rated
MEDIUM, with the impression-share claim explicitly flagged as unverified.

### What the data showed (GSC, 2026-06-26 to 2026-08-29, site-wide)

The hypothesis was wrong.

| Check | Result |
|---|---|
| Restaurant/tip/dinner/group-intent queries | **0 impressions** |
| Bare head term `bill split calculator` | **Absent from the export entirely** |
| Nearest head-term row, `split bills calculator` | 3 impressions, position 64.3 |
| Income/fair-share cluster (43 queries) | 165 impressions, 0 clicks, avg position **69.9** |

A head term with real volume would not be anonymized by Google — anonymization
hits rare queries. Its absence is positive evidence that the page receives very
few head-term impressions, not that they are hidden.

### What is actually happening

Visible query rows account for only 1,983 of 6,878 site impressions (28.8%), and
**zero of the 22 clicks.** Reconciling the page's 2,195 impressions at position
13.9 against its visible queries (~165-227 impressions at position ~70) implies
the remaining ~2,000 anonymized impressions sit at an average position of
roughly **6-11 — inside the top 10 — while producing ~4 clicks (~0.2% CTR).**

Top-10 impressions converting at 0.2% is 25-50x below expectation. So there IS
an intent problem, but it is not the one hypothesised. The three visible top-10
queries are all textbook/homework phrasings ("will earns $200 a week. he spends
1/4 of his pay on bills", position 5.8). That is a suggestive but thin sample
(17 impressions) and the composition of the anonymized mass remains unknown.

### The finding that actually matters

The failure is **uniform across the entire site, not specific to this page**:

- Median position across all 471 visible queries: **73.0**
- 394 queries (1,739 impressions) at position 51+; only 16 queries in the top 10,
  totalling 40 impressions, three of which are homework questions
- `50 30 20 budget` — position 87.2 · `what is the 50 30 20 rule` — 86.6
- `splitting bills based on income` — 86.8 · `sinking fund calculator` — 56.6
- `/articles/50-30-20-budget-rule/` — 959 impressions, position 75.9, 0 clicks

A page-level targeting problem shows up on one page. This shows up on every page,
across every topic, which rules targeting out as the explanation.

Impressions are meanwhile **growing strongly, not stagnating**: 922 -> 1,303 ->
2,014 -> 2,639 across four ~16-day windows, roughly 3x in two months, while
clicks stay flat at 4-7. Google is testing the site steadily more and ranking it
no better.

**Conclusion: the binding constraint is site/domain authority, not on-page
targeting or search intent.** Confidence: HIGH.

### Disposition of the change

Commit `e38135f` is kept but **is not an experiment and must not be measured as
one.** Its stated predictions are void: there are no head-term impressions to
shed, so "total impressions will fall, and that is success" was wrong and is
withdrawn.

It is retained on its own smaller merits: the two calculators' title tags no
longer both lead with the identical string, and the couples page now matches the
income phrasing that its real visible queries actually use. Expected ranking
effect: approximately nil, because those queries rank at ~70 and a title does not
close a 60-position gap.

### Lessons for the next experiment

1. **Get the data before designing the experiment.** The whole hypothesis rested
   on an inferred impression mix that one export disproved in minutes.
2. **A missing high-volume query in GSC is evidence of absence**, not of
   anonymization. Anonymization hits the rare tail.
3. **Check whether the symptom is page-specific before proposing a page-level
   fix.** One look at the site-wide median position (73) would have redirected
   this from the outset.
4. CTR at a *page-level* average position is close to uninformative when the
   page's impressions are split between a visible tail at ~70 and an anonymized
   mass at ~8. Blended averages hide exactly the structure that matters.

### Still open, unaddressed by this change

- What the ~2,000 anonymized top-10 impressions actually are. A page-filtered
  GSC export, or the Performance API, would resolve it.
- Authority. Now the primary question, and undefined as a strategy.
- The paycheck cluster is the site's one bright spot and deserves its own look:
  `/tools/biweekly-paycheck-calculator/` (971 impressions, position 13.1, 0.51%
  CTR, best on the site) and `/tools/weekly-paycheck-calculator/` (position 11.9).

### Addendum: page-filtered export (2026-09-01, same day)

A second GSC export filtered to pages containing `bill-split` (both
`/tools/bill-split-calculator/` and `/tools/group-bill-split-calculator/`)
corroborates the closure above rather than reopening it: 43 queries, 126
impressions, 0 clicks. No restaurant/tip intent, no dominant head term, every
income/fair-share query at position 51-98 bar the three homework-phrasing
outliers already noted. Cross-checked against the site-wide export (`salary
split` 14 here vs. 21 site-wide; `split salary` 16 vs. 20) confirms the scope
is real, not a coincidental query-text match.

It also sets a ceiling on what this investigation can resolve with the tools
available: only ~6% of this page grouping's impressions attach to a named
query even when filtered directly to the page (vs. ~29% site-wide) — per-page
query volume trips GSC's anonymization harder than aggregate volume. The
~2,000 impressions estimated earlier at position ~6-11 remain unidentified.
That requires Search Console API access this session does not have; treat it
as a known unknown, not a further finding.
