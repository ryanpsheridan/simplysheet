// Zero-regression audit harness.
//
//   node scripts/audit/harness.mjs baseline    # capture the reference set
//   node scripts/audit/harness.mjs check       # re-capture and diff against it
//
// Flags:
//   --no-build      reuse the existing dist/ instead of rebuilding
//   --seo-only      skip screenshots (fast; SEO/markup diff only)
//   --routes=a,b    limit to routes whose path contains one of these substrings
//
// Two independent gates, both of which must come back empty:
//   1. SEO/markup  — title, description, canonical, robots, OG/Twitter, heading
//                    outline, JSON-LD, image alts, internal hrefs, data-cta
//                    labels, sitemap URL set, robots.txt, redirect rules.
//   2. Pixels      — full-page screenshots at 1440 / 768 / 390.
//
// SEO facts are read from the server HTML with JavaScript disabled, which is
// what a crawler's first fetch sees. Screenshots are taken with JavaScript on,
// after scrolling the page to force lazy images to load.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { startServer } from './serve.mjs';
import { primeFontCache, serveCachedFonts, fontCssUrlsFrom } from './fontcache.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DIST = path.join(ROOT, 'dist');
const AUDIT = path.join(ROOT, '.audit');
const WIDTHS = [1440, 768, 390];

// Elements whose pixels are inherently nondeterministic, painted over before
// the screenshot. Each is genuinely time-dependent, not merely inconvenient:
//   .reviews-progress-track  the reviews carousel advances it via rAF, so its
//                            width is a function of elapsed milliseconds
//   .reading-progress        scroll-position driven, settles at slightly
//                            different sub-pixel widths per run
//   img[src$=".gif"]         animated GIF; the captured frame varies
// These regions are NOT visually verified. Nothing else is excluded.
const MASK_SELECTORS = ['.reviews-progress-track', '.reading-progress', 'img[src$=".gif"]'];

// Failures caused by this sandbox rather than by the site: Google Tag Manager
// is blocked by the network policy, and Vercel Speed Insights' script only
// exists once deployed. Neither indicates a real page error.
const IGNORED_CONSOLE = [/googletagmanager\.com/, /_vercel\/speed-insights/, /status of 403/, /status of 404/];
const CHROME = process.env.AUDIT_CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const args = process.argv.slice(2);
const mode = args.find((a) => !a.startsWith('--')) ?? 'check';
const noBuild = args.includes('--no-build');
const seoOnly = args.includes('--seo-only');
const routeFilter = args.find((a) => a.startsWith('--routes='))?.slice(9).split(',').filter(Boolean);

if (!['baseline', 'check'].includes(mode)) {
	console.error(`Unknown mode "${mode}". Use "baseline" or "check".`);
	process.exit(2);
}

// ——— Build ———————————————————————————————————————————————————————————

function build() {
	// `npx astro build` rather than `npm run build`: the postbuild hook submits
	// the sitemap to IndexNow, which must never fire from an audit run.
	console.log('· building (astro build, no pre/post hooks)…');
	execFileSync('npx', ['astro', 'build'], { cwd: ROOT, stdio: 'pipe' });
}

// ——— Route discovery ——————————————————————————————————————————————————

function discoverRoutes() {
	const out = [];
	(function walk(dir) {
		for (const entry of readdirSync(dir)) {
			const p = path.join(dir, entry);
			if (statSync(p).isDirectory()) walk(p);
			else if (p.endsWith('.html')) {
				const rel = path.relative(DIST, p).replace(/\\/g, '/');
				out.push(rel === '404.html' ? '/404.html' : `/${rel.replace(/index\.html$/, '')}`);
			}
		}
	})(DIST);
	const routes = out.sort();
	return routeFilter ? routes.filter((r) => routeFilter.some((f) => r.includes(f))) : routes;
}

// ——— Normalisation ————————————————————————————————————————————————————

// Calculator components mint their DOM ids with Math.random() at build time,
// so the same source produces different ids on every build. Collapse them so
// the diff reports real changes instead of fresh randomness.
const RANDOM_ID = /\b[a-z0-9]{8}\b/g;
function normaliseAnchor(href) {
	return href.startsWith('#') ? href.replace(RANDOM_ID, '<id>') : href;
}

// Sort object keys recursively so a key-order change in a JSON-LD block does
// not read as a content change.
function sortKeys(value) {
	if (Array.isArray(value)) return value.map(sortKeys);
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]));
	}
	return value;
}

// ——— Per-page extraction (runs inside the page, JS disabled) ——————————

function extractInPage() {
	const attr = (sel, name) => document.querySelector(sel)?.getAttribute(name) ?? null;
	const metas = {};
	for (const m of document.querySelectorAll('meta[property], meta[name]')) {
		const key = m.getAttribute('property') ?? m.getAttribute('name');
		if (!/^(og:|twitter:|description|robots|title|theme-color|viewport)/.test(key)) continue;
		(metas[key] ??= []).push(m.getAttribute('content'));
	}
	return {
		title: document.querySelector('title')?.textContent ?? null,
		canonical: attr('link[rel="canonical"]', 'href'),
		meta: metas,
		lang: document.documentElement.getAttribute('lang'),
		headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
			level: Number(h.tagName[1]),
			text: h.textContent.replace(/\s+/g, ' ').trim(),
		})),
		jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
		images: [...document.querySelectorAll('img')].map((i) => ({
			src: i.getAttribute('src'),
			alt: i.getAttribute('alt'),
			width: i.getAttribute('width'),
			height: i.getAttribute('height'),
			loading: i.getAttribute('loading'),
			fetchpriority: i.getAttribute('fetchpriority'),
		})),
		hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
		// GA4 reads these as event labels; renaming one silently breaks history.
		ctas: [...document.querySelectorAll('[data-cta]')].map((e) => e.getAttribute('data-cta')).sort(),
		landmarks: {
			main: document.querySelectorAll('main').length,
			header: document.querySelectorAll('header').length,
			nav: document.querySelectorAll('nav').length,
			footer: document.querySelectorAll('footer').length,
		},
		// Visible copy, word for word. A length proxy would miss a same-length
		// edit, and raw textContent picks up inlined <style>/<script> text,
		// so both are excluded and whitespace is normalised.
		// Visible copy. Each text node is trimmed and empties dropped, then the
		// rest joined with a fixed separator — so whitespace *between* tags,
		// which the Astro compiler varies when markup is restructured and which
		// no browser renders, cannot register as a copy change. Text *within* a
		// node keeps its spacing, so a real wording change still shows up.
		// (textContent alone inherits source whitespace; a character count
		// misses same-length edits. Both were tried and rejected.)
		bodyText: (() => {
			const clone = document.body.cloneNode(true);
			for (const el of clone.querySelectorAll('script,style,template,noscript')) el.remove();
			const parts = [];
			for (const node of clone.querySelectorAll('*')) {
				for (const child of node.childNodes) {
					if (child.nodeType !== 3) continue;
					const t = child.nodeValue.replace(/\s+/g, ' ').trim();
					if (t) parts.push(t);
				}
			}
			return parts.join('␟');
		})(),
	};
}

// ——— Site-level facts —————————————————————————————————————————————————

function siteFacts(routes) {
	const sitemapFiles = readdirSync(DIST).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'));
	const sitemapUrls = sitemapFiles
		.flatMap((f) => [...readFileSync(path.join(DIST, f), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]))
		.sort();
	const vercel = JSON.parse(readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
	const astroConfig = readFileSync(path.join(ROOT, 'astro.config.mjs'), 'utf8');
	// Redirect stubs Astro emits for its own `redirects` config.
	const stubs = routes
		.filter((r) => {
			const f = path.join(DIST, r.replace(/^\//, ''), 'index.html');
			return existsSync(f) && readFileSync(f, 'utf8').includes('http-equiv="refresh"');
		})
		.map((r) => {
			const html = readFileSync(path.join(DIST, r.replace(/^\//, ''), 'index.html'), 'utf8');
			return { from: r, to: /url=([^"]+)"/.exec(html)?.[1] ?? null };
		});
	return {
		routes,
		sitemapUrls,
		robotsTxt: readFileSync(path.join(DIST, 'robots.txt'), 'utf8'),
		vercelRedirects: vercel.redirects ?? [],
		vercelHeaders: vercel.headers ?? [],
		astroRedirects: /redirects:\s*\{([^}]*)\}/s.exec(astroConfig)?.[1].trim() ?? null,
		metaRefreshStubs: stubs,
	};
}

// ——— Capture ——————————————————————————————————————————————————————————

// Astro's redirect stubs carry <meta http-equiv="refresh">, which fires with or
// without JavaScript and tears down the execution context mid-capture. Neuter
// the attribute so the stub's own tags render and can be read; the refresh
// target itself is captured separately in siteFacts().
async function disableMetaRefresh(ctx) {
	await ctx.route('**/*', async (route) => {
		try {
			const res = await route.fetch();
			const type = res.headers()['content-type'] ?? '';
			if (!type.includes('text/html')) return await route.fulfill({ response: res });
			const body = (await res.text()).replace(/http-equiv="refresh"/gi, 'data-audit-refresh="disabled"');
			return await route.fulfill({ response: res, body });
		} catch {
			// In-flight third-party request (fonts) when the context is closing.
			// Nothing to fulfil; letting it fall through is correct.
		}
	});
}

async function capture(label) {
	const outDir = path.join(AUDIT, label);
	rmSync(outDir, { recursive: true, force: true });
	mkdirSync(path.join(outDir, 'shots'), { recursive: true });

	const routes = discoverRoutes();
	const { server, port } = await startServer(DIST);
	const base = `http://127.0.0.1:${port}`;
	const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--font-render-hinting=none'] });

	const seo = {};
	const consoleErrors = {};

	// Pass 1 — SEO facts from the raw server HTML (JavaScript disabled).
	const staticCtx = await browser.newContext({ javaScriptEnabled: false });
	await disableMetaRefresh(staticCtx);
	for (const route of routes) {
		const page = await staticCtx.newPage();
		await page.goto(base + route, { waitUntil: 'domcontentloaded' });
		const data = await page.evaluate(extractInPage);
		data.hrefs = [...new Set(data.hrefs.map(normaliseAnchor))].sort();
		data.jsonld = data.jsonld.map((raw) => {
			try {
				return JSON.stringify(sortKeys(JSON.parse(raw)));
			} catch {
				return `INVALID_JSON:${raw.slice(0, 200)}`;
			}
		}).sort();
		seo[route] = data;
		await page.close();
	}
	await staticCtx.close();
	writeFileSync(path.join(outDir, 'seo.json'), JSON.stringify(seo, null, 2));
	writeFileSync(path.join(outDir, 'site.json'), JSON.stringify(siteFacts(routes), null, 2));

	// Pass 2 — screenshots and console errors, JavaScript on.
	if (!seoOnly) {
		// Chromium here cannot reach Google Fonts, so without this every capture
		// renders in fallback faces. Mirrored locally and served by
		// interception, so both sides of a comparison show the real type.
		// Scanned across every built page, not just the homepage: the two
		// assessment components pull in a second stylesheet (Material Symbols)
		// that only appears on three routes.
		const fontUrls = [...new Set(routes.flatMap((r) => {
			const file = path.join(DIST, r === '/404.html' ? '404.html' : path.join(r, 'index.html'));
			return existsSync(file) ? fontCssUrlsFrom(readFileSync(file, 'utf8')) : [];
		}))];
		const fontCache = await primeFontCache(path.join(AUDIT, 'fontcache'), fontUrls);
		for (const width of WIDTHS) {
			const ctx = await browser.newContext({
				viewport: { width, height: 900 },
				deviceScaleFactor: 1,
				reducedMotion: 'reduce',
			});
			await disableMetaRefresh(ctx);
			// Registered after the catch-all above: Playwright matches handlers
			// in reverse registration order, so this one must win for font URLs.
			await serveCachedFonts(ctx, fontCache);
			for (const route of routes) {
				const page = await ctx.newPage();
				const errs = [];
				page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
				page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
				await page.goto(base + route, { waitUntil: 'load' });
				// Freeze animation, carets and smooth scroll so the capture is
				// deterministic rather than timing-dependent.
				await page.addStyleTag({
					content: `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
					          html{scroll-behavior:auto!important}`,
				});
				// Force lazy images to decode by walking the page top to bottom.
				await page.evaluate(async () => {
					const step = window.innerHeight;
					for (let y = 0; y < document.body.scrollHeight; y += step) {
						window.scrollTo(0, y);
						await new Promise((r) => setTimeout(r, 60));
					}
					window.scrollTo(0, 0);
					await Promise.all(
						[...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => {
							i.addEventListener('load', r, { once: true });
							i.addEventListener('error', r, { once: true });
						})),
					);
					await new Promise((r) => setTimeout(r, 120));
				});
				const name = `${route.replace(/[/.]/g, '_') || '_root_'}__${width}.png`;
				await page.screenshot({
					path: path.join(outDir, 'shots', name),
					fullPage: true,
					animations: 'disabled',
					mask: MASK_SELECTORS.map((s) => page.locator(s)),
					maskColor: '#FF00FF',
				});
				const real = errs.filter((e) => !IGNORED_CONSOLE.some((re) => re.test(e)));
				if (real.length) (consoleErrors[route] ??= {})[width] = real;
				await page.close();
			}
			await ctx.close();
			console.log(`· captured ${routes.length} routes @ ${width}px`);
		}
	}
	writeFileSync(path.join(outDir, 'console.json'), JSON.stringify(consoleErrors, null, 2));

	await browser.close();
	server.close();
	return { routes, outDir };
}

// ——— Diff —————————————————————————————————————————————————————————————

// Arrays of primitives (hrefs, data-cta values, JSON-LD blocks) are stored
// sorted, so their order carries no meaning — comparing them positionally turns
// one inserted link into a diff on every later index. Compare those as sets and
// report only what actually appeared or vanished. Arrays of objects (the
// heading outline, the image list) stay positional, because there order is
// exactly what we are protecting.
const isPrimitiveArray = (v) => Array.isArray(v) && v.every((x) => x === null || typeof x !== 'object');

function diffJson(a, b, pathPrefix = '', out = []) {
	const keys = [...new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])].sort();
	for (const k of keys) {
		const av = a?.[k];
		const bv = b?.[k];
		const p = pathPrefix ? `${pathPrefix}.${k}` : k;
		const isObj = (v) => v && typeof v === 'object';
		if (isPrimitiveArray(av) && isPrimitiveArray(bv)) {
			const removed = av.filter((x) => !bv.includes(x));
			const added = bv.filter((x) => !av.includes(x));
			if (removed.length) out.push({ path: `${p} [removed]`, baseline: removed, current: null });
			if (added.length) out.push({ path: `${p} [added]`, baseline: null, current: added });
		}
		else if (isObj(av) && isObj(bv)) diffJson(av, bv, p, out);
		else if (JSON.stringify(av) !== JSON.stringify(bv)) {
			out.push({ path: p, baseline: av, current: bv });
		}
	}
	return out;
}

async function pixelDiff(aPath, bPath) {
	const [a, b] = await Promise.all([
		sharp(aPath).flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true }),
		sharp(bPath).flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true }),
	]);
	if (a.info.width !== b.info.width || a.info.height !== b.info.height) {
		return { sizeChanged: `${a.info.width}x${a.info.height} → ${b.info.width}x${b.info.height}` };
	}
	let changed = 0;
	let maxDelta = 0;
	const px = a.info.width * a.info.height;
	const ch = a.info.channels;
	for (let i = 0; i < a.data.length; i += ch) {
		let d = 0;
		for (let c = 0; c < ch; c++) d = Math.max(d, Math.abs(a.data[i + c] - b.data[i + c]));
		if (d > 0) changed++;
		if (d > maxDelta) maxDelta = d;
	}
	return changed ? { changedPixels: changed, pctChanged: +(100 * changed / px).toFixed(4), maxDelta } : null;
}

async function check() {
	const baseDir = path.join(AUDIT, 'baseline');
	if (!existsSync(path.join(baseDir, 'seo.json'))) {
		console.error('No baseline found. Run: node scripts/audit/harness.mjs baseline');
		process.exit(2);
	}
	const { outDir } = await capture('current');

	const baseSeo = JSON.parse(readFileSync(path.join(baseDir, 'seo.json'), 'utf8'));
	const currSeo = JSON.parse(readFileSync(path.join(outDir, 'seo.json'), 'utf8'));
	// With --routes, only a subset was captured. Narrow the baseline to match,
	// so unvisited routes don't read as deletions.
	const scopedBase = routeFilter
		? Object.fromEntries(Object.entries(baseSeo).filter(([r]) => r in currSeo))
		: baseSeo;
	const seoDiff = diffJson(scopedBase, currSeo);
	// Site-level facts (sitemap, route list) are only meaningful for a full run.
	const siteDiff = routeFilter
		? []
		: diffJson(
			JSON.parse(readFileSync(path.join(baseDir, 'site.json'), 'utf8')),
			JSON.parse(readFileSync(path.join(outDir, 'site.json'), 'utf8')),
		);

	const shotDiffs = [];
	if (!seoOnly) {
		const currShotNames = new Set(readdirSync(path.join(outDir, 'shots')));
		const baseShots = (existsSync(path.join(baseDir, 'shots')) ? readdirSync(path.join(baseDir, 'shots')) : [])
			.filter((f) => !routeFilter || currShotNames.has(f));
		const currShots = new Set(readdirSync(path.join(outDir, 'shots')));
		for (const f of baseShots) {
			if (!currShots.has(f)) { shotDiffs.push({ shot: f, missing: true }); continue; }
			const d = await pixelDiff(path.join(baseDir, 'shots', f), path.join(outDir, 'shots', f));
			if (d) shotDiffs.push({ shot: f, ...d });
			currShots.delete(f);
		}
		for (const f of currShots) shotDiffs.push({ shot: f, added: true });
	}

	const consoleErrors = JSON.parse(readFileSync(path.join(outDir, 'console.json'), 'utf8'));

	console.log(`\n${'='.repeat(64)}`);
	const report = (name, items, fmt) => {
		if (!items.length) { console.log(`PASS  ${name}: no differences`); return 0; }
		console.log(`FAIL  ${name}: ${items.length} difference(s)`);
		for (const it of items.slice(0, 40)) console.log(`        ${fmt(it)}`);
		if (items.length > 40) console.log(`        … and ${items.length - 40} more`);
		return 1;
	};
	const trunc = (v) => { const s = JSON.stringify(v); return s == null ? 'undefined' : s.length > 110 ? `${s.slice(0, 110)}…` : s; };
	// bodyText holds a whole page of copy; print the neighbourhood of the first
	// divergence rather than dumping both versions in full.
	const around = (a = '', b = '') => {
		let i = 0;
		while (i < a.length && i < b.length && a[i] === b[i]) i++;
		const from = Math.max(0, i - 50);
		return { baseline: `…${a.slice(from, i + 60)}…`, current: `…${b.slice(from, i + 60)}…` };
	};
	const fmtSeo = (d) => {
		const [bl, cur] = d.path.endsWith('bodyText')
			? [around(d.baseline, d.current).baseline, around(d.baseline, d.current).current]
			: [trunc(d.baseline), trunc(d.current)];
		return `${d.path}\n          baseline: ${bl}\n          current : ${cur}`;
	};
	let failed = 0;
	failed += report('SEO / markup', seoDiff, fmtSeo);
	failed += report('Site (sitemap, robots, redirects)', siteDiff, (d) => `${d.path}\n          baseline: ${trunc(d.baseline)}\n          current : ${trunc(d.current)}`);
	if (!seoOnly) failed += report('Screenshots', shotDiffs, (d) => `${d.shot} ${trunc({ ...d, shot: undefined })}`);
	const errRoutes = Object.keys(consoleErrors);
	if (errRoutes.length) { console.log(`WARN  Console errors on ${errRoutes.length} route(s): ${errRoutes.slice(0, 6).join(', ')}`); }
	else console.log('PASS  Console: no errors on any route');
	console.log('='.repeat(64));
	process.exit(failed ? 1 : 0);
}

// ——— Main —————————————————————————————————————————————————————————————

if (!noBuild) build();
if (mode === 'baseline') {
	const { routes, outDir } = await capture('baseline');
	console.log(`\nBaseline captured: ${routes.length} routes → ${path.relative(ROOT, outDir)}`);
	console.log('Re-run with:  node scripts/audit/harness.mjs check');
} else {
	await check();
}
