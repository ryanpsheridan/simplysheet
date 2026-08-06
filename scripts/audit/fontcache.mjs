// Local mirror of the Google Fonts the site loads.
//
// Chromium inside the audit sandbox cannot reach fonts.googleapis.com
// (ERR_CONNECTION_RESET), so screenshots would otherwise render in fallback
// fonts. That is survivable when both sides of a comparison are captured under
// the same conditions, but it makes the self-hosting change unverifiable: the
// baseline would render fallback, the candidate would render the real files,
// and the resulting whole-page diff would drown out any genuine regression.
//
// Node can reach Google (the outbound proxy allows it) even though the browser
// cannot, so the CSS and every woff2 it references are fetched here and served
// back to the page via request interception. Both sides then render with the
// real fonts and the pixel comparison means something.
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// The CSS Google returns depends on User-Agent; a modern Chrome string is what
// yields woff2 rather than legacy formats.
const CHROME_UA =
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

const key = (url) => createHash('sha1').update(url).digest('hex').slice(0, 16);

/**
 * Fetch the site's font CSS and every woff2 it references into `dir`.
 * @returns {Promise<Map<string, {file: string, type: string}>>} url -> cached file
 */
export async function primeFontCache(dir, cssUrls) {
	mkdirSync(dir, { recursive: true });
	const manifestPath = path.join(dir, 'manifest.json');
	if (existsSync(manifestPath)) {
		return new Map(Object.entries(JSON.parse(readFileSync(manifestPath, 'utf8'))));
	}

	const cache = new Map();
	for (const cssUrl of cssUrls) {
		const res = await fetch(cssUrl, { headers: { 'user-agent': CHROME_UA } });
		if (!res.ok) throw new Error(`Font CSS fetch failed (${res.status}): ${cssUrl}`);
		const css = await res.text();
		const cssFile = path.join(dir, `${key(cssUrl)}.css`);
		writeFileSync(cssFile, css);
		cache.set(cssUrl, { file: cssFile, type: 'text/css' });

		const fontUrls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)].map((m) => m[1]))];
		for (const fontUrl of fontUrls) {
			const fr = await fetch(fontUrl, { headers: { 'user-agent': CHROME_UA } });
			if (!fr.ok) throw new Error(`Font file fetch failed (${fr.status}): ${fontUrl}`);
			const file = path.join(dir, `${key(fontUrl)}.woff2`);
			writeFileSync(file, Buffer.from(await fr.arrayBuffer()));
			cache.set(fontUrl, { file, type: 'font/woff2' });
		}
	}

	writeFileSync(manifestPath, JSON.stringify(Object.fromEntries(cache), null, 2));
	return cache;
}

/** Serve any cached Google Fonts request from disk instead of the network. */
export async function serveCachedFonts(ctx, cache) {
	await ctx.route('https://fonts.googleapis.com/**', async (route) => {
		const hit = cache.get(route.request().url());
		if (!hit) return route.abort();
		await route.fulfill({ status: 200, contentType: hit.type, body: readFileSync(hit.file) });
	});
	await ctx.route('https://fonts.gstatic.com/**', async (route) => {
		const hit = cache.get(route.request().url());
		if (!hit) return route.abort();
		await route.fulfill({ status: 200, contentType: hit.type, body: readFileSync(hit.file) });
	});
}

/** Every Google Fonts stylesheet URL referenced by the built site. */
export function fontCssUrlsFrom(html) {
	return [...new Set([...html.matchAll(/href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&')))];
}
