# Simply Sheet Design — Editorial Thumbnail System

The rule stack for article thumbnail images. Every new article thumbnail is generated from these rules so the whole library reads as one design system. **Status: in testing** — v2 candidates live on `/style-guide` ("Thumbnail Style Comparison" section). Once approved, this section replaces the "SVG Construction Rules" workflow in `CLAUDE.md` for card images.

## Design philosophy

These are not illustrations of the article. They are editorial compositions that establish a consistent visual identity — inspired by the visual language of Stripe, Linear, Vercel, Notion, Arc, and Apple marketing pages. Calm, sophisticated, minimal, premium, timeless. Intentionally designed, not generated.

## Hard bans

Never include: fake spreadsheets, fake dashboards, fake browser windows or app UI, unreadable/tiny text, any text at all, random icons, stock illustration styles, people, hands, money imagery, dollar signs, clip art, literal scenes, visual clutter. If an element isn't necessary, remove it.

## The three layers

Every image contains exactly three layers — nothing more.

**Layer 1 — Atmosphere.** A soft gradient background (linear, 135°, two close-value stops) plus a subtle radial white light from the top-left (opacity ~0.5 fading to 0 by 60%) and a very subtle grain (`feTurbulence` fractalNoise, baseFrequency 0.9, mapped to ~0.045 alpha black). No hard edges.

**Layer 2 — One geometric composition.** A single abstract arrangement: stacked rounded rectangles, capsules, circles, concentric rings, offset cards, floating bars, modular blocks. One primary composition per image. Large rounded corners, one soft drop shadow (`feDropShadow`, dy 12–14, stdDeviation 14–18, flood-opacity 0.10–0.14, flood color = a deep tone of the palette).

**Layer 3 — One subtle financial motif.** The composition itself usually *is* the motif — it hints at the topic, never explains it. Plus at most **one** secondary supporting element (a faint ring, a low-opacity circle or capsule) at opacity 0.08–0.16.

## Motif library

| Topic | Motif options |
|---|---|
| Budgeting | balanced columns, organized panels, modular cards |
| Saving / sinking funds | grouped horizontal capsules, stacked containers, partially completed ring |
| Debt | descending blocks, staircase, narrowing shapes |
| Expense tracking | segmented bar, clean horizontal bars |
| Net worth | upward flowing line, layered gradients |
| Emergency fund | concentric rings, protected core |
| Irregular income | varying rhythm, wave pattern, uneven spacing |
| Couples / comparison | two overlapping circles, paired panels |

## Composition rules

- Generous whitespace — everything breathes. Composition occupies roughly the middle 60% of the canvas.
- One dominant focal point, one secondary supporting element, nothing else.
- Balanced visual weight; avoid symmetry unless intentional (rings may be centered-ish but offset left or right).
- Consistent top-left light source across every image.

## Color system

One palette per article, keyed to topic. All colors muted, low saturation, softly blended — never neon, never harsh.

| Topic | Palette | Background stops | Shape tones (deep → pale) |
|---|---|---|---|
| Budgeting | Slate / Blue / Mist | `#EAEEF4 → #D9E1EA` | `#5C7392`, `#93A9C2`, `#C6D2DF` |
| Saving | Emerald / Mint / Teal | `#E6EFEA → #D6E4DC` | `#4F7D68`, `#6E9A84`, `#97B8A6` |
| Debt | Coral / Terracotta / Amber | `#F6EDE6 → #EEDFD2` | `#B26A50`, `#C98A6E`, `#DBA98C`, `#E9C8B2` |
| Emergency fund | Forest / Green / Sage | `#E9EFE7 → #D9E3D6` | `#5F7D5D`, `#6D8A6B` |
| Expense tracking | Indigo / Violet | `#EBEAF2 → #DDDCE9` | `#5D628F`, `#8489B3`, `#ACB0CE`, `#CFD1E4` |
| Irregular income | Stone / Sky | `#EDECE8 → #DFE1DF` | `#5F7D96`, `#8AA2B5`, `#A9B9C6`, `#C4CDD4` |
| Investing / net worth | Indigo / Violet / Blue | derive: bg L≈93%, shapes S≤35% | — |
| Productivity / habits | Soft gray / Stone / Sky | derive: bg L≈93%, shapes S≤35% | — |

For a new topic, derive a palette with the same values: background stops around 92–94% lightness with a gentle hue shift between them; shape tones in 3–4 steps from a deep anchor (~L 45–50%, S 25–35%) to a pale step (~L 80–85%).

## Anti-repetition rule

Each new thumbnail introduces a **different geometric composition** while staying inside the system. Never repeat the same layout, shape arrangement, or motif more than once every 10 articles. Cohesion comes from color, spacing, proportion, and visual language — not from reusing compositions. Check the registry below before designing.

## Composition registry

Log every shipped thumbnail here. Check it before designing a new one.

| Article slug | Composition | Palette |
|---|---|---|
| `50-30-20-budget-rule` | Balanced columns (3, proportional 50/30/20) | Slate / Mist |
| `emergency-fund-sizing` | Concentric rings, solid core | Forest / Sage |
| `how-to-pay-off-debt` | Descending blocks (4, shrinking) | Terracotta / Coral |
| `budgeting-with-irregular-income` | Varying-rhythm vertical capsules on one axis | Stone / Sky |
| `sinking-funds-explained` | Grouped horizontal capsules, staggered fills | Emerald / Mint |
| `where-is-my-money-going` | Segmented horizontal bar + drifting segment | Indigo / Violet |

## Technical spec

- SVG, `width="960" height="540" viewBox="0 0 960 540"` (16:9)
- File name: `card-editorial-{slug}.svg` in `public/images/`
- Flat vector aesthetic with subtle depth: gradient bg + radial light + one shadow + grain, nothing else
- Large rounded corners (rx ≥ 17 on capsules, ≥ 22 on blocks/panels)
- No text, no labels, no logos, no branding
- Comment on line 2 of the file recording composition + palette, e.g. `<!-- Editorial system · Composition: balanced columns · Palette: slate/blue/mist (budgeting) -->`

## Verification

After generating, always render the SVG in a browser and screenshot it — check that shapes sit inside the canvas, shadows aren't clipped (`filter` regions need expanded x/y/width/height), and the image still reads clearly at card size (~320px wide). Then view it next to existing thumbnails to confirm it reads as part of the same system.
