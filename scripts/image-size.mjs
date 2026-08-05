// Build-time intrinsic dimension lookup for files under public/.
//
// Used to give <img> tags width/height so the browser can reserve space before
// the bytes arrive. Results are memoised, since the same image is referenced
// from several pages and a build should probe each file once.
import path from 'node:path';
import sharp from 'sharp';

// Resolved from cwd rather than import.meta.dirname: this module is imported
// both directly by Node (the rehype plugin, during markdown processing) and
// through Vite's SSR transform (from TemplateLayout's frontmatter), and Vite
// does not provide import.meta.dirname — it silently yielded undefined there,
// so every lookup returned null and no dimensions were emitted. Astro always
// builds from the project root.
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const cache = new Map();

/**
 * @param {string} src Absolute site path, e.g. "/images/example.jpg"
 * @returns {Promise<{width: number, height: number} | null>} null when the file
 *   is remote, missing, or a format sharp cannot probe — callers should leave
 *   the image untouched rather than guess, since a wrong ratio is worse than
 *   no attribute at all.
 */
export async function intrinsicSize(src) {
	if (typeof src !== 'string' || !src.startsWith('/')) return null;
	if (cache.has(src)) return cache.get(src);

	let result = null;
	try {
		const { width, height } = await sharp(path.join(PUBLIC_DIR, decodeURIComponent(src))).metadata();
		if (width && height) result = { width, height };
	} catch {
		// Not probeable; fall through to null.
	}
	cache.set(src, result);
	return result;
}
