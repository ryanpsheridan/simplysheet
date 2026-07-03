# Simply Sheet Design — Editorial Thumbnail System

The rule stack for article thumbnail images. Every new article thumbnail is generated from these rules so the whole library reads as one design system. **Status: in testing** — v2 candidates live on `/style-guide` ("Thumbnail Style Comparison" section). Once approved, this section replaces the "SVG Construction Rules" workflow in `CLAUDE.md` for card images.

## Design philosophy

Every image should look like it belongs on the homepage of Stripe or Linear — not inside a finance application. These are art-directed editorial compositions, not illustrations of the article and not icons of the topic. Shapes are sculpture, not interface components. Calm, sophisticated, minimal, premium, timeless.

## Hard bans

Never include: fake spreadsheets, dashboards, browser windows or app UI, progress bars, charts, any text, icons, stock illustration styles, people, hands, money imagery, dollar signs, clip art, literal scenes, visual clutter. **No iconographic compositions** — do not "draw the topic" (no rings for protection, no descending bars for debt, no progress bars for saving). If an element isn't necessary, remove it.

## Mood, not motif

The article title influences the *mood* of the composition; it never literally represents the topic.

| Topic | Don't draw | Instead, create |
|---|---|---|
| Emergency fund | circles / shields | something that feels **stable** — mass anchored low, a horizon at rest |
| Debt | descending bars | **tension that resolves** — a diagonal settling into level |
| Saving / sinking funds | progress bars | **expansion** — forms growing outward from an anchor |
| Budgeting | pie charts / columns | **order and proportion** — layered panels in measured steps |
| Irregular income | wavy line charts | **uneven rhythm** — repetition at varying heights and intervals |
| Expense tracking | segmented bars | **dispersion** — a mass with fragments drifting away |
| Net worth | up-and-right arrows | **quiet ascent** — layers rising through the frame |
| Couples | two of anything | **balance between equals** — paired forms sharing weight |

## Visual language

Every image is built from these moves — this is what makes the set recognizable:

- **One hero geometric form occupying 50–70% of the canvas**, always **cropped off at least one edge** so the composition continues beyond the frame.
- **Dramatic scale differences** between the hero and any supporting forms.
- **Overlapping translucent acrylic panels** — fills at opacity 0.25–0.6 layered over each other and the background.
- **Subtle depth through blur and opacity** — one soft-blurred echo behind or beside the hero (`feGaussianBlur` stdDeviation 8–22), farthest elements palest and softest.
- **Negative space dominates** — at least a third of the canvas is atmosphere only.
- **Visual rhythm through repetition and spacing** — when a form repeats, vary its height, opacity, and interval; never metronomic.
- **Soft bloom** — one large heavily blurred pale ellipse (stdDeviation ~70, opacity 0.5–0.65) lighting one region, consistent with a top-corner light source.
- **Very subtle paper grain** over everything.
- No hard edges, no strokes/outlines, no drop shadows — depth comes from layering, not shadowing.

## Layer order

1. **Atmosphere** — linear gradient background (135°, 2–3 close-value stops with a subtle hue shift) + one bloom ellipse.
2. **Depth echo** — a blurred, low-opacity repeat of the hero form, offset behind it.
3. **Hero form** — the dominant sculpture, near-opaque (0.9–0.95), cropped by the frame.
4. **Translucent layers / supporting forms** — 1–3 acrylic panels or fragments, each more transparent than the last.
5. **Grain** — full-canvas `feTurbulence` fractalNoise, baseFrequency 0.9, mapped to ~0.04 alpha black.

## Color system

One palette per article, keyed to topic. All colors muted, low saturation, softly blended — never neon, never harsh. Translucency does much of the mixing: deep tones at 0.3–0.5 opacity over the light background create the mid-tones.

| Topic | Palette | Background stops | Form tones (deep → pale) |
|---|---|---|---|
| Budgeting | Slate / Blue / Mist | `#ECF0F5 → #D5DEE9` | `#5C7392`, `#93A9C2`, `#C6D2DF` |
| Saving | Emerald / Mint / Teal | `#EAF2ED → #D1E1D7` | `#4F7D68`, `#6E9A84`, `#97B8A6` |
| Debt | Coral / Terracotta / Amber | `#F7EFE8 → #EAD8C8` | `#B26A50`, `#C98A6E`, `#DBA98C` |
| Emergency fund | Forest / Green / Sage | `#ECF1EA → #D3DFD0` | `#5F7D5D`, `#6D8A6B` |
| Expense tracking | Indigo / Violet | `#EDECF4 → #D7D6E6` | `#5D628F`, `#8489B3`, `#ACB0CE` |
| Irregular income | Stone / Sky | `#EFEEEA → #DBDFDE` | `#5F7D96`, `#8AA2B5`, `#A9B9C6`, `#C4CDD4` |
| Investing / net worth | Indigo / Violet / Blue | derive | — |
| Productivity / habits | Soft gray / Stone / Sky | derive | — |

For a new topic, derive a palette with the same values: background stops around 92–95% lightness with a gentle hue shift; form tones in 2–4 steps from a deep anchor (~L 45–50%, S 25–35%) to a pale step (~L 75–85%).

## Anti-repetition rule

Each new thumbnail introduces a **different composition** while staying inside the system. Never repeat the same layout, hero form, or compositional idea more than once every 10 articles. Cohesion comes from color, spacing, proportion, translucency, and the shared visual language — not from reusing compositions. Check the registry before designing.

## Composition registry

Log every shipped thumbnail here. Check it before designing a new one.

| Article slug | Mood | Composition | Palette |
|---|---|---|---|
| `50-30-20-budget-rule` | Order, proportion | Layered acrylic panels stepping down, cropped top-left | Slate / Mist |
| `emergency-fund-sizing` | Stability | Horizon dome cropped by the bottom, translucent band at rest on the crest | Forest / Sage |
| `how-to-pay-off-debt` | Tension resolving | Diagonal band settling into a level band, both cropped off-frame | Terracotta / Coral |
| `budgeting-with-irregular-income` | Uneven rhythm | Mist columns at varying heights/intervals, cropped by the bottom | Stone / Sky |
| `sinking-funds-explained` | Quiet expansion | Nested forms growing out of the bottom-left corner | Emerald / Mint |
| `where-is-my-money-going` | Dispersion | Large cropped mass with fragments drifting toward the light | Indigo / Violet |

## Technical spec

- SVG, `width="960" height="540" viewBox="0 0 960 540"` (16:9)
- File name: `card-editorial-{slug}.svg` in `public/images/`
- Large rounded corners on every form (rx ≥ 46 on bands/capsules, ≥ 130 on large panels — superellipse feel)
- Blur filters need expanded regions (`x="-40%" y="-40%" width="180%" height="180%"` or larger) so nothing clips
- No text, no labels, no logos, no branding, no strokes, no drop shadows
- Comment on line 2 of the file recording mood + composition + palette, e.g. `<!-- Editorial system · Mood: stability · Composition: horizon dome · Palette: forest/sage -->`

## Verification

After generating, always render the SVG in a browser and screenshot it. Check: the hero is genuinely cropped by the frame, negative space dominates, translucent overlaps read cleanly, nothing looks like an icon or a UI element, and the image still reads at card size (~320px wide). Then view it in a grid next to existing thumbnails — the set must read as one design system.
