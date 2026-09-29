// Rasterizes the live article cards (public/images/card-v4-*.svg, written by
// generate-article-cards.mjs just before this in `prebuild`) and the default
// OG image to matching .png files. The archived card-v3-*.svg and
// card-v2-*.svg sets keep the PNGs they already have; nothing links to them.
// Social platforms (Facebook, iMessage, Slack, etc.) don't render SVG for
// og:image/twitter:image previews, so BaseHead.astro points those tags at
// the PNG counterpart instead of the on-page SVG.
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const imagesDir = path.resolve(import.meta.dirname, '../public/images');

const files = await readdir(imagesDir);
const svgs = files.filter(
	(f) => (f.startsWith('card-v4-') || f === 'og-default.svg') && f.endsWith('.svg'),
);

// Every rasterized image here carries film grain (the v4 cards and
// og-default.svg alike), which a full RGBA PNG stores very inefficiently; a
// quantized palette cuts that by ~75% and the grain masks any banding. These
// are never loaded by a visitor (og:image is fetched by social crawlers only),
// so this is deploy weight, not page weight.
const GRAIN_PNG = { palette: true, quality: 90, effort: 10 };

for (const svg of svgs) {
	const pngName = svg.replace(/\.svg$/, '.png');
	await sharp(path.join(imagesDir, svg)).png(GRAIN_PNG).toFile(path.join(imagesDir, pngName));
	console.log(`Generated ${pngName}`);
}
