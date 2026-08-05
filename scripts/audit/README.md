# Zero-regression audit harness

Verifies that a refactor changed nothing a visitor or a crawler can see.

```bash
git checkout main
node scripts/audit/harness.mjs baseline     # capture the reference set (~4 min)

# …make changes…
node scripts/audit/harness.mjs check        # re-capture and diff (~4 min)
```

`check` exits `0` when every gate is clean and `1` when anything differs, so it
can gate a commit or run in CI.

## Flags

| Flag | Effect |
|---|---|
| `--no-build` | Reuse the existing `dist/` instead of rebuilding |
| `--seo-only` | Skip screenshots — markup gate only, ~40s instead of ~4 min |
| `--routes=a,b` | Only routes whose path contains one of these substrings |

`--routes` narrows the baseline to match, so unvisited routes are not reported
as deletions. Site-level facts are only checked on a full run.

## What is verified

**SEO / markup** — read from the server HTML with JavaScript disabled, which is
what a crawler's first fetch sees:

- `<title>`, meta description, canonical, `<meta name="robots">`, `lang`
- Every `og:*` and `twitter:*` tag
- Full heading outline — level, order and text of every `h1`–`h6`
- Every JSON-LD block, parsed and key-sorted so only content changes register
- Every image's `src`, `alt`, `width`, `height`, `loading`, `fetchpriority`
- Every unique `href`
- Every `data-cta` value — GA4 reads these as event labels, so renaming one
  silently breaks reporting history
- Landmark counts (`main`, `header`, `nav`, `footer`)
- `bodyText` — all visible copy, whitespace-normalised, with `<script>` and
  `<style>` text excluded. Catches a same-length word swap, which a
  character-count proxy does not.

**Site** — sitemap URL set, `robots.txt`, `vercel.json` redirects and headers,
the `redirects` block in `astro.config.mjs`, the built route list, and every
meta-refresh redirect stub with its target.

**Pixels** — full-page screenshots at 1440 / 768 / 390, compared per channel.
Any non-zero difference fails; page-height changes are reported separately.

**Console** — errors on every route at every width.

## What is deliberately not verified

Three element types are masked before capture because their pixels are a
function of elapsed time, not of the code:

- `.reviews-progress-track` — the reviews carousel advances it via
  `requestAnimationFrame`, so its width depends on milliseconds since load
- `.reading-progress` — scroll-position driven, settles at different sub-pixel
  widths between runs
- `img[src$=".gif"]` — animated; the captured frame varies

They are painted magenta in every capture. If you change one of these, verify it
by hand — the harness will not.

Two console failures are filtered as sandbox artifacts rather than site bugs:
Google Tag Manager (blocked by network policy in CI) and Vercel Speed Insights
(its script only exists once deployed).

## Notes

- The harness runs `npx astro build`, never `npm run build`, so the `postbuild`
  IndexNow submission cannot fire from an audit run.
- Calculator components mint DOM ids with `Math.random()` at build time, so the
  same source yields different ids every build. Anchor hrefs matching that
  pattern are normalised to `<id>`.
- Output lands in `.audit/` (gitignored, ~108 MB for a full baseline).
- Chromium path defaults to the sandbox's build; override with `AUDIT_CHROME`.
