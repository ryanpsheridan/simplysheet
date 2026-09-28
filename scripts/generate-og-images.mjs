// Rasterizes the live article cards (public/images/card-v3-*.svg, written by
// generate-article-cards.mjs just before this in `prebuild`) and the default
// OG image to matching .png files. The archived card-v2-*.svg set keeps the
// PNGs it already has; nothing links to them any more.
// Social platforms (Facebook, iMessage, Slack, etc.) don't render SVG for
// og:image/twitter:image previews, so BaseHead.astro points those tags at
// the PNG counterpart instead of the on-page SVG.
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const imagesDir = path.resolve(import.meta.dirname, '../public/images');

const files = await readdir(imagesDir);
const svgs = files.filter(
	(f) => (f.startsWith('card-v3-') || f === 'og-default.svg') && f.endsWith('.svg'),
);

// Two encodes, chosen by what the image is made of. og-default.svg is a dark
// mesh with a grain overlay, which a full RGBA PNG stores very inefficiently
// (850 KB–1 MB); a quantized palette cuts that by ~75% and the grain masks any
// banding. The v3 article cards are clean gradients with no grain, where the
// opposite holds: lossless full colour comes out smaller (~70 KB) than the
// palette encode and avoids the blocky quantization a palette leaves in their
// lightest corners. These are never loaded by a visitor (og:image is fetched
// by social crawlers only), so this is deploy weight, not page weight.
const GRAIN_PNG = { palette: true, quality: 90, effort: 10 };
const CLEAN_PNG = { compressionLevel: 9, effort: 10 };

for (const svg of svgs) {
	const pngName = svg.replace(/\.svg$/, '.png');
	await sharp(path.join(imagesDir, svg)).png(svg.startsWith('card-v3-') ? CLEAN_PNG : GRAIN_PNG).toFile(path.join(imagesDir, pngName));
	console.log(`Generated ${pngName}`);
}
