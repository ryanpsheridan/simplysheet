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

for (const svg of svgs) {
	const pngName = svg.replace(/\.svg$/, '.png');
	await sharp(path.join(imagesDir, svg)).png().toFile(path.join(imagesDir, pngName));
	console.log(`Generated ${pngName}`);
}
