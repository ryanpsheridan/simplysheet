# Wireframe Overlay System (archived)

This system drew the retired v4 collage cards (see "Article Card Images"); it is kept for reference and for regenerating them. New articles do not need a wireframe.

Every article card's content was its wireframe: an ultra-thin vector chart glyph, grid-snapped and themed to the article's topic, drawn in `currentColor` in `scripts/article-cards/wireframes/{slug}.svg` (the generator renders it in ink inside the card's panel). It is a hairline drawing, never a fill-heavy illustration. The coordinates, layouts, and weights below are unchanged from the v2 cards; only the colour moved from white to `currentColor`.

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
