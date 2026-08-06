// Losslessly recompresses the product mockup PNGs in place.
//
// These are the heaviest thing the site serves: 26 files, ~9 MB, and a single
// product page pulls roughly 3 MB of them. They were exported straight from the
// design tool with no compression pass.
//
// Run after adding or replacing a product mockup:
//     node scripts/optimize-product-images.mjs
//
// Uses oxipng, which rewrites only the PNG's compressed data stream — filter
// selection and DEFLATE encoding — and never touches a pixel. Verified
// bit-identical: decoding before and after yields byte-equal RGBA buffers, so
// the rendered result cannot differ. Dimensions and filenames are unchanged, so
// no URL or markup anywhere needs updating.
//
// Why not sharp: re-encoding through libvips shrinks these by 68% rather than
// 14%, but it premultiplies alpha, which perturbs anti-aliased edge pixels.
// Measured across the whole site that showed up as 114 of 150 rendered
// screenshots differing — 98% of the affected pixels by only ±1-2 and none
// above ±19/255, so imperceptible in practice, but not identical. That trade is
// available and worth considering; it is deliberately not taken here without an
// explicit decision, because the brief for this work is that rendered output
// must not change.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const OXIPNG = path.resolve(
	process.cwd(),
	'node_modules/oxipng/bin/oxipng-4.0.3-x86_64-unknown-linux-musl/oxipng',
);
const IMAGES_DIR = path.resolve(process.cwd(), 'public/images');
const PATTERN = /^featured .*\.png$/;

const files = (await readdir(IMAGES_DIR)).filter((f) => PATTERN.test(f)).sort();
if (files.length === 0) {
	console.log('No product mockups matched.');
	process.exit(0);
}

let before = 0;
let after = 0;
let changed = 0;

for (const name of files) {
	const file = path.join(IMAGES_DIR, name);
	const originalSize = (await stat(file)).size;
	const originalPixels = await sharp(await readFile(file)).raw().toBuffer();

	execFileSync(OXIPNG, ['-o', 'max', '--strip', 'safe', '-q', file]);

	// Prove losslessness per file rather than trusting the flag.
	const newPixels = await sharp(await readFile(file)).raw().toBuffer();
	if (!originalPixels.equals(newPixels)) {
		console.error(`FAIL ${name}: pixels changed. Restore from git before committing.`);
		process.exit(1);
	}

	const newSize = (await stat(file)).size;
	before += originalSize;
	after += newSize;
	if (newSize < originalSize) {
		changed++;
		console.log(
			`  ${name}  ${(originalSize / 1024).toFixed(0)}K -> ${(newSize / 1024).toFixed(0)}K` +
				`  (-${(100 * (1 - newSize / originalSize)).toFixed(0)}%)`,
		);
	}
}

console.log(
	`\n${changed} of ${files.length} smaller: ` +
		`${(before / 1024 / 1024).toFixed(2)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB ` +
		`(-${(100 * (1 - after / before)).toFixed(0)}%), pixels verified identical`,
);
