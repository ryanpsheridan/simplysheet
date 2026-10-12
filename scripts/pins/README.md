# Pinterest posting playbook

Goal: one single-image (or video) pin every day at 9:00 am CT, posted through Metricool (blogId 7380070, Pinterest account simplysheetdesign, timezone America/Chicago). `queue.json` logs every pin so nothing repeats.

## Content sources (use real facts only)
- Calculators: `src/data/tools.ts` lists them. Use the worked examples in the matching article or tool page, or plain arithmetic from the stated rule. Never invent product features or numbers.
- Articles: `src/content/articles/`. Turn one idea into one image: a comparison, a worked example, a short set of steps. Put the rest of the story in the pin title and description.
- Products: `src/content/templates/` (Etsy listings, dark and light). The link must match the theme shown in the image. Laptop mockups always use the dark frame.
- Mix rule: in every run of six pins, three are product pins, two are calculator or tool pins, one is an article pin. Product pins alternate between a feature or how-it-works angle (one real feature, one image) and a product overview, and rotate through all six templates (budget, couples, debt payoff, savings goals, net worth, credit card) rather than repeating one. Use animation (video) for calculators when typing a number and showing a result tells the story.
- Product pin assets: read-only access to the Etsy repo `ryanpsheridan/etsy` (add it with add_repo, access read) (mockups in `brand/assets/mockups`, screenshots in `assets/screenshots/<product>/`, copy rules in `listings/MESSAGING.md`). Never write to that repo or touch Etsy listings. Never invent product features: describe only what the screenshots, listing copy and template pages show. Laptop mockups always use the dark frame. Link to the listing whose theme (dark or light) matches the image.
- Review: each week, adjust the mix toward whichever pin type earns the most outbound clicks (see the Monday stats email), keeping at least one of each type per six pins.

## Making a pin
1. Write `scripts/pins/specs/<slug>.json` (layouts `calc` and `compare`, see `make_pin.py`). Add `--video` for an mp4 of a `calc` spec.
2. `python3 scripts/pins/make_pin.py scripts/pins/specs/<slug>.json` writes `public/images/pins/<slug>.png`. Use `CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome` if needed.
3. Look at the PNG. Check: no widow words in headlines, nothing overlapping, math correct, sentence case, no all-caps, no em dashes.
4. Commit and push to `main`. Metricool can fetch the file right away from `https://raw.githubusercontent.com/ryanpsheridan/simplysheet/main/public/images/pins/<file>` (the site deploy can lag, so use this URL).
5. Create the Metricool post (`createScheduledPost`, provider pinterest, `autoPublish: true`, `draft: false`, 9:00 am CT, the next free day after the last queued pin).
6. Add the entry to `queue.json` and push.

## Styles
Five monochromatic themes: forest (main, the default), sky, charcoal, sand, lavender (set `"theme"` in the spec). Use forest for about half of all pins and rotate the other four across the rest, never the same theme twice in a row overall, and never the same theme twice in a row within a board. Check `queue.json` (each entry records its board and theme) before choosing a theme, and record the board and theme for every new pin. Layouts: `calc`, `compare`, `cover` (article photo on top, themed panel below), `product` (dark laptop mockup from `scripts/pins/assets/mockups/<product>-dark.png` on a themed frame; link to the dark listing). Metricool needs `publicationDate` inside `info` as well as the `date` argument.

## Pin fields
- Title: keyword-first and plain, under 100 characters.
- Description: carries the story, 2 to 4 sentences, real numbers only. No em dashes, no exclamation marks, no "perfect for" or "designed for", no "not just X".
- Alt text: describes what the image shows.
- Link: article pins go to the site article, calculator pins to the tool page, both with `?utm_source=pinterest&utm_medium=social&utm_campaign=<slug>&utm_content=pin-1`. Product pins go to the `simplysheetdesign.etsy.com/listing/<id>` URL with the same UTMs.

## Boards (pass the exact name or the id)
- Monthly budget templates: 1035898420480430069
- Savings goals and sinking funds: 1035898420480430070
- Finance Calculators: 1035898420480430074
- Debt payoff trackers and tips: 1035898420480430072
- Couples budgeting and shared finances: pass the name (couples budget, bill split, couples articles)
- Budgeting tips and habits: 1035898420480430152 (tracking, why budgets fail, income articles)
- Net worth tracking: 1035898420480430153 (net worth tracker pins)

## Guardrails
- Never touch Etsy listings. Never edit or delete other posts.
- Carousels do not publish as carousels through Metricool, so every pin is one image or one video.
