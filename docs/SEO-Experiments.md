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

**Status:** awaiting deploy · **Opened:** 2026-09-01

### Hypothesis

`/tools/bill-split-calculator/` was accumulating impressions from the ambiguous
`bill split calculator` head term, whose dominant search intent is splitting a
restaurant check with tax and tip, rather than from the income-based/fair-share
cluster the page actually serves. Its title tag led with that head term, and
`/tools/group-bill-split-calculator/` led with the identical string, so the two
pages also competed with each other for it.

Repositioning the couples page onto the qualified term should shed unqualified
impressions and improve ranking on income/couples queries.

### Confidence at open: MEDIUM

Verified directly: the head-term SERP is restaurant/tip-dominated; every winner
in the income cluster leads its title with a qualifier; both our pages led with
the same string.

**Not verified:** that head-term impressions were *disproportionate*. No
Search Console query data was available when this experiment was designed, and
Vercel Web Analytics is not enabled on the project. The core impression-share
claim rests on inference, not measurement.

Counter-hypothesis held open: the income cluster is dominated by high-authority
finance domains (credit unions, Ellevest, HerMoney, BECU). Domain authority on a
~10-week-old site may be the binding constraint, not targeting. If so this change
does little, and that is a legitimate outcome.

### Baseline (GSC period ending 2026-09-01, pre-change)

| Metric | Baseline |
|---|---|
| Impressions | 2,195 |
| Clicks | 4 |
| CTR | ~0.18% |
| Average position | 13.9 |
| Fixed-cohort income/couples queries | **TO BE FILLED from GSC export before merge** |

Site first deployed ~2026-06-23. Page ~6 weeks old at baseline.

### The change

Commit `e38135f`. Titles, H1s, and meta description only — no URL, content,
calculator, or schema changes.

- Couples page title: `Bill Split Calculator — Split Bills Fairly by Income`
  → `Income-Based Bill Split Calculator for Couples`
- Couples H1: → `Bill Split Calculator for Couples with Different Incomes`
- Group page title: `Bill Split Calculator — Split a Restaurant or Group Bill Evenly`
  → `Restaurant Bill Splitter — Split a Check with Tax and Tip`
- Group H1: → `Restaurant & Group Bill Splitter`
- Added a disambiguation link to the group calculator, and surfaced it in
  related tools.

### Primary metric: fixed-cohort query position

Track the **named income/couples queries present in the baseline export**, and
follow those same queries over time. Do NOT track the bucket average.

Reason: if the change works, Google will surface the page for *new* income
queries, which enter at poor positions and drag a bucket average down. A working
change would read as a failure. New queries entering the cluster are logged
separately as a secondary positive signal.

Secondary: clicks from the cohort; `calc_product_link:couples-budget-spreadsheet`
GA4 events (traffic reaching the product page).

### Metrics to explicitly ignore

- **Total page impressions.** Expected to fall. That is the change working.
- **Page-level average position.** Will improve mechanically once low-ranking
  head-term impressions stop. Arithmetic, not ranking.
- **Page-level CTR.** At position ~14 CTR is dominated by page-two burial, not
  snippet relevance. It is not informative until the page is inside the top 10.

### Null result (pre-committed)

If the fixed cohort has not improved by the decision date, conclude the
constraint is **domain authority, not targeting**. Stop on-page optimization of
this page entirely. Do not retitle again, extend the content, or rebuild the
calculator. The strategic question becomes authority, and this page is done.

### Decision date

Do not judge before 6 weeks post-deploy. Decide at **8–12 weeks post-deploy**
(~late Nov 2026 for a September deploy).

### Frozen until decision date

`/tools/bill-split-calculator/`, `/tools/group-bill-split-calculator/`, and
`/articles/how-to-split-bills-with-different-incomes/`.

Also held for the duration, per the original constraint: **no new calculators**
until this experiment reports. Determining what limits this page is the whole
point; building more before it answers forecloses the finding.

### Known, deliberately deferred

- Tool page and article overlap on the same cluster with the same embedded
  calculator and partly overlapping FAQ. Real, but consolidating mid-experiment
  would confound it.
- No roommate/rent coverage (`roommate` appears zero times sitewide). Largest
  volume gap in the cluster, but lower commercial relevance than couples.
- Calculator takes one lump bill total and exactly two people; competitors
  support itemized expenses and N people.
