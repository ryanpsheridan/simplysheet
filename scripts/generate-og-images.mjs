// Rasterizes public/images/card-v2-*.svg to matching .png files.
// Social platforms (Facebook, iMessage, Slack, etc.) don't render SVG for
// og:image/twitter:image previews, so BaseHead.astro points those tags at
// the PNG counterpart instead of the on-page SVG.
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const imagesDir = path.resolve(import.meta.dirname, '../public/images');

const files = await readdir(imagesDir);
const svgs = files.filter(
	(f) => (f.startsWith('card-v2-') || f === 'og-default.svg') && f.endsWith('.svg'),
);

// These renders are flat gradients plus a grain overlay, which a full RGBA PNG
// stores very inefficiently — the default encode runs 850 KB–1 MB each. A
// quantized palette cuts that by ~75% with no visible difference, since the
// grain masks any banding. They are never loaded by a visitor (og:image is
// fetched by social crawlers only), so this is deploy weight, not page weight.
const PNG_OPTIONS = { palette: true, quality: 90, effort: 10 };

for (const svg of svgs) {
	const pngName = svg.replace(/\.svg$/, '.png');
	await sharp(path.join(imagesDir, svg)).png(PNG_OPTIONS).toFile(path.join(imagesDir, pngName));
	console.log(`Generated ${pngName}`);
}
