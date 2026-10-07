// Writes public/images/article-{slug}.jpg (1280x720) for every entry in
// src/data/article-photos.json that doesn't have a file yet.
//
//     node scripts/generate-article-photos.mjs            # fetch what's missing
//     node scripts/generate-article-photos.mjs --force    # refetch everything
//
// Each entry is an Unsplash photo: `photo` is the id in its images.unsplash.com
// URL (https://images.unsplash.com/photo-{photo}), `page` its unsplash.com/photos
// id, and `photographer`/`username` the credit. The photo is cropped to 16:9 by
// Unsplash's own imgix endpoint (entropy crop keeps the busy part of the frame),
// then recompressed here. The file is self-hosted: nothing on the live site
// loads from Unsplash. Uses curl rather than fetch so it honours the proxy
// settings of restricted environments.
import { readFile, writeFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const photos = JSON.parse(await readFile(path.join(root, 'src/data/article-photos.json'), 'utf8'));
const force = process.argv.includes('--force');

for (const [slug, p] of Object.entries(photos)) {
	const out = path.join(root, 'public/images', `article-${slug}.jpg`);
	if (!force) {
		try {
			await access(out);
			continue;
		} catch {}
	}
	const url = `https://images.unsplash.com/photo-${p.photo}?w=1600&h=900&fit=crop&crop=entropy&q=85&fm=jpg`;
	const raw = execFileSync('curl', ['-sSfL', '-m', '60', url], { maxBuffer: 5e7 });
	const jpg = await sharp(raw).resize(1280, 720, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
	await writeFile(out, jpg);
	console.log(`article-${slug}.jpg  ${(jpg.length / 1024).toFixed(0)} KB  (${p.photographer})`);
}
