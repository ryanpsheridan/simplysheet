// Builds every article's card image (public/images/card-v4-{name}.svg) from
// two inputs, so the style lives in exactly one place:
//
//   1. the article's wireframe, scripts/article-cards/wireframes/{name}.svg,
//      a grid-snapped chart glyph drawn in currentColor (see CLAUDE.md,
//      "Wireframe Overlay System"), and
//   2. the article's first tag, which picks a hue family below.
//
// {name} comes from the article's `cardImage` frontmatter
// (/images/card-v4-{name}.svg). Everything else is derived from a hash of the
// name: the exact hue, which collage layout the colour blocks take, their
// sizes, and where the halftone sits. Two articles in a family never render
// identically, and the output is byte-for-byte stable between runs (no diff
// churn in prebuild).
//
// The v4 look is the site's print-collage texture (the homepage hero stage
// and closing card): a warm paper ground, two colour blocks in the tag's hue
// family, a halftone printed on one of them, and film grain over the lot.
// The wireframe sits in ink on a clean off-white panel running off the
// bottom edge, like a crop of a screen. (It had traffic-light dots, which
// were dropped: on every thumbnail they read as chrome, not content.)
// Earlier sets (card-v3-*, card-v2-*) are left untouched and archived on
// /style-guide/.
//
// Runs in `prebuild`, before generate-og-images.mjs rasterizes the result.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

const root = path.resolve(import.meta.dirname, '..');
const articlesDir = path.join(root, 'src/content/articles');
const wireframesDir = path.join(root, 'scripts/article-cards/wireframes');
const imagesDir = path.join(root, 'public/images');

const INK = '#292929';
const PAPER = '#ECEAE2';
const WINDOW = '#FBFBF8';

// The panel the wireframe sits in: 63% of the canvas wide, so a band of
// the collage shows on every side of it at card size, and running off the
// bottom edge. Wireframes are drawn on the full 960x540 grid (CLAUDE.md,
// "Wireframe Overlay System"); they are scaled into the window here, about
// a centre a little below the canvas's own, which balances the panel's
// open top edge against the crop at the bottom.
// Strokes carry vector-effect="non-scaling-stroke", so line weights survive.
const WIN = { x: 176, y: 88, w: 608, h: 480 };
const WF_SCALE = 0.78;
const WF_CY = 300;

// Base hue (degrees) per tag. Same families as the old per-article registry,
// so articles in one category still read as related.
const FAMILY = {
	'expense-tracking': 212, // blue
	'couples-budgeting': 330, // magenta / pink
	'debt-payoff': 350, // rose / wine
	'savings-goals': 148, // green
	'irregular-income': 34, // amber
	'net-worth': 176, // teal
	'budgeting-styles': 256, // violet
};
const FALLBACK_HUE = 220;

function hash(str) {
	let h = 2166136261;
	for (const ch of str) {
		h ^= ch.codePointAt(0);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

// Deterministic 0..1 values drawn from one hash, one per call.
function rng(seed) {
	let s = seed || 1;
	return () => {
		s ^= s << 13;
		s ^= s >>> 17;
		s ^= s << 5;
		return ((s >>> 0) % 10000) / 10000;
	};
}

function hsl(h, s, l) {
	h = ((h % 360) + 360) % 360;
	s /= 100;
	l /= 100;
	const k = (n) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	const hex = (x) => Math.round(x * 255).toString(16).padStart(2, '0').toUpperCase();
	return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`;
}

const r1 = (n) => Math.round(n * 10) / 10;

function frontmatter(src) {
	const m = src.match(/^---\n([\s\S]*?)\n---/);
	return m ? parseYaml(m[1]) : {};
}

function wireframeBody(svg) {
	return svg
		.replace(/^[\s\S]*?<svg[^>]*>/, '')
		.replace(/<\/svg>\s*$/, '')
		.replace(/<!--[\s\S]*?Draw in currentColor only[\s\S]*?-->\s*/, '')
		.trim();
}

function buildCard(name, tag, wireframe) {
	const rand = rng(hash(name));
	const base = FAMILY[tag] ?? FALLBACK_HUE;
	const hue = base + (rand() - 0.5) * 20; // ±10° within the family

	// Two blocks: a saturated tint and a paler neighbour 25° round the wheel,
	// and a deep shade of the first for its halftone dots.
	const blockA = hsl(hue, 72, 80);
	const blockB = hsl(hue + 25, 52, 87);
	const dots = hsl(hue, 55, 38);

	// Three collage layouts, like the closing card's columns. Sizes jitter
	// within each so no two cards in a layout share an edge.
	const j = (lo, hi) => Math.round(lo + rand() * (hi - lo));
	const layout = Math.floor(rand() * 3);
	let a, b;
	if (layout === 0) {
		// Side columns.
		const wa = j(170, 260);
		const wb = j(150, 240);
		a = [0, 0, wa, 540];
		b = [960 - wb, 0, wb, 540];
	} else if (layout === 1) {
		// Offset corners: a large block top left, a smaller one bottom right.
		const wa = j(420, 560);
		const ha = j(260, 340);
		a = [0, 0, wa, ha];
		b = [j(560, 680), ha, 960, 540 - ha];
	} else {
		// A top band over a side column.
		const ha = j(150, 210);
		const wb = j(170, 240);
		a = [0, 0, 960, ha];
		b = [rand() < 0.5 ? 0 : 960 - wb, ha, wb, 540 - ha];
	}
	// Which side of a mirrored layout the blocks sit on.
	if (layout !== 2 && rand() < 0.5) {
		a = [960 - a[0] - a[2], a[1], a[2], a[3]];
		b = [960 - b[0] - b[2], b[1], b[2], b[3]];
	}
	const rect = ([x, y, w, h], fill, extra = '') =>
		`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;

	// The halftone fades across block A along a random diagonal.
	const fadeFrom = rand() < 0.5 ? ['0', '0', '1', '1'] : ['1', '0', '0', '1'];

	return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
  <!-- Generated by scripts/generate-article-cards.mjs from
       scripts/article-cards/wireframes/${name}.svg (tag: ${tag ?? 'none'}). Edit those, not this. -->
  <defs>
    <pattern id="halftone" width="9" height="9" patternUnits="userSpaceOnUse">
      <circle cx="4.5" cy="4.5" r="1.8" fill="${dots}"/>
    </pattern>
    <pattern id="fineDots" width="7" height="7" patternUnits="userSpaceOnUse">
      <circle cx="3.5" cy="3.5" r="0.9" fill="${INK}" fill-opacity="0.16"/>
    </pattern>
    <linearGradient id="halftoneFade" x1="${fadeFrom[0]}" y1="${fadeFrom[1]}" x2="${fadeFrom[2]}" y2="${fadeFrom[3]}">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.05"/>
    </linearGradient>
    <mask id="halftoneMask">
      ${rect(a, 'url(#halftoneFade)')}
    </mask>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${hash(name) % 997}" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.16  0 0 0 0 0.16  0 0 0 0.32 0"/>
    </filter>
    <clipPath id="window">
      <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="20"/>
    </clipPath>
    <linearGradient id="areaFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${INK}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="960" height="540" fill="${PAPER}"/>
  ${rect(a, blockA)}
  ${rect(b, blockB)}
  <rect width="960" height="540" fill="url(#halftone)" mask="url(#halftoneMask)" opacity="0.7"/>
  <rect width="960" height="540" fill="url(#fineDots)"/>
  <rect width="960" height="540" filter="url(#grain)"/>

  <rect x="${WIN.x}" y="${WIN.y + 8}" width="${WIN.w}" height="${WIN.h}" rx="20" fill="${INK}" opacity="0.14"/>
  <rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" rx="20" fill="${WINDOW}"/>

  <g color="${INK}" clip-path="url(#window)">
    <g transform="translate(480 ${WF_CY}) scale(${WF_SCALE}) translate(-480 -270)">
${wireframe
	.split('\n')
	.map((line) => '    ' + line.replace(/^\s{0,2}/, ''))
	.join('\n')}
    </g>
  </g>
</svg>
`;
}

const files = (await readdir(articlesDir)).filter((f) => /\.mdx?$/.test(f));
let count = 0;
for (const file of files) {
	const data = frontmatter(await readFile(path.join(articlesDir, file), 'utf8'));
	const image = data.cardImage ?? data.image;
	const m = typeof image === 'string' && image.match(/\/card-v4-(.+)\.svg$/);
	if (!m) {
		console.warn(`skip ${file}: cardImage is not a card-v4 image (${image})`);
		continue;
	}
	const name = m[1];
	let wireframe;
	try {
		wireframe = wireframeBody(await readFile(path.join(wireframesDir, `${name}.svg`), 'utf8'));
	} catch {
		throw new Error(`${file}: missing wireframe scripts/article-cards/wireframes/${name}.svg`);
	}
	const tag = Array.isArray(data.tags) ? data.tags[0] : undefined;
	await writeFile(path.join(imagesDir, `card-v4-${name}.svg`), buildCard(name, tag, wireframe));
	count++;
}
console.log(`Generated ${count} article card(s)`);
