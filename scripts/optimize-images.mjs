// Recompresses the site's raster images in place.
//
//     node scripts/optimize-images.mjs            # apply
//     node scripts/optimize-images.mjs --dry-run  # measure only
//
// Run after adding or replacing a product mockup or an inline article image.
//
// Two groups, each with a different encoder and a different reason:
//
//   featured *.png          product mockups, exported from the design tool with
//                           no compression pass. Re-encoded through libvips,
//                           which shrinks them ~68%.
//   inline-article-*.jpg    spreadsheet screenshots. Re-encoded with mozjpeg at
//                           quality 92 — that captures ~70% of the saving at
//                           roughly half the deviation of quality 80, which
//                           matters here because these images contain text the
//                           reader is meant to be able to read.
//
// On fidelity: neither pass is bit-exact. libvips premultiplies alpha when
// encoding RGBA, which perturbs anti-aliased edges; JPEG is lossy by
// definition and these inputs are already JPEG, so re-encoding compounds a
// generation. Both were measured before being adopted, and every file is
// checked against a threshold here rather than trusted:
//
//   - dimensions must be unchanged (a change would reflow every layout)
//   - mean per-channel deviation must stay under MAX_MEAN_DELTA
//
// Measured effect on rendered pages: 114 of 150 full-page screenshots differ,
// 98% of affected pixels by only ±1-2, none beyond ±19/255. Invisible in
// side-by-side viewing, but not identical — which is why this is a separate,
// deliberate step rather than part of the build.
//
// If you need provably identical pixels instead, oxipng recompresses the PNGs
// losslessly for a 13% saving; that was the previous behaviour of this script.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = path.resolve(process.cwd(), 'public/images');
const MIN_SAVING = 0.1;
const MAX_MEAN_DELTA = 2.0;
const dryRun = process.argv.includes('--dry-run');

const GROUPS = [
	{
		label: 'product mockups',
		match: /^featured .*\.png$/,
		encode: (img) => img.png({ compressionLevel: 9, effort: 10 }),
		// Composited over the panel colour these are displayed on, so the
		// measurement reflects what a visitor actually sees rather than raw
		// RGBA in regions the page never shows.
		background: '#F2F2F2',
	},
	{
		label: 'inline article images',
		match: /^(inline-article-image-.*|budgeting-50-30-20-rule)\.jpg$/,
		encode: (img) => img.jpeg({ quality: 92, mozjpeg: true }),
		background: null,
	},
];

async function deviation(a, b, background) {
	const raw = (input) => {
		const img = sharp(input);
		return (background ? img.flatten({ background }) : img).raw().toBuffer();
	};
	const [x, y] = await Promise.all([raw(a), raw(b)]);
	let sum = 0;
	let max = 0;
	for (let i = 0; i < x.length; i++) {
		const d = Math.abs(x[i] - y[i]);
		sum += d;
		if (d > max) max = d;
	}
	return { mean: sum / x.length, max };
}

const all = await readdir(IMAGES_DIR);
let before = 0;
let after = 0;
let rewritten = 0;
let failed = 0;

for (const group of GROUPS) {
	const files = all.filter((f) => group.match.test(f)).sort();
	if (!files.length) continue;
	console.log(`\n${group.label} (${files.length} files)`);

	for (const name of files) {
		const file = path.join(IMAGES_DIR, name);
		const original = await readFile(file);
		const meta = await sharp(original).metadata();
		const encoded = await group.encode(sharp(original)).toBuffer();
		const check = await sharp(encoded).metadata();

		before += original.length;

		if (check.width !== meta.width || check.height !== meta.height) {
			console.error(`  FAIL ${name}: ${meta.width}x${meta.height} -> ${check.width}x${check.height}`);
			after += original.length;
			failed++;
			continue;
		}
		if (1 - encoded.length / original.length < MIN_SAVING) {
			console.log(`  keep ${name} (already compressed)`);
			after += original.length;
			continue;
		}

		const dev = await deviation(original, encoded, group.background);
		if (dev.mean > MAX_MEAN_DELTA) {
			console.error(`  FAIL ${name}: mean deviation ${dev.mean.toFixed(2)} exceeds ${MAX_MEAN_DELTA}`);
			after += original.length;
			failed++;
			continue;
		}

		if (!dryRun) await writeFile(file, encoded);
		after += encoded.length;
		rewritten++;
		console.log(
			`  ${name}  ${(original.length / 1024).toFixed(0)}K -> ${(encoded.length / 1024).toFixed(0)}K` +
				`  (-${(100 * (1 - encoded.length / original.length)).toFixed(0)}%)` +
				`  mean ${dev.mean.toFixed(2)} max ${dev.max}`,
		);
	}
}

console.log(
	`\n${dryRun ? '[dry run] ' : ''}${rewritten} rewritten, ${failed} failed threshold: ` +
		`${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB ` +
		`(-${(100 * (1 - after / before)).toFixed(0)}%)`,
);
process.exit(failed ? 1 : 0);
