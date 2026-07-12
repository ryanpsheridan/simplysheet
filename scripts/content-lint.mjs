#!/usr/bin/env node
// content-lint.mjs — guards the site invariants documented in CLAUDE.md.
//
// Checks the things that have shipped as regressions before: dead internal
// links, missing article images / OG PNGs, wrong Etsy domain, invalid tags,
// duplicate title/description, a manual "Related:" wrap-up block, em-dash
// pileups, bold in body text, and the flush-right product-image CSS rule.
//
// Usage: node scripts/content-lint.mjs
// Exit code 1 if any ERROR is found (WARN never fails the run).

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_DIR = join(ROOT, 'src/content/articles');
const TEMPLATES_DIR = join(ROOT, 'src/content/templates');
const IMAGES_DIR = join(ROOT, 'public/images');

const errors = [];
const warnings = [];
const err = (file, msg) => errors.push({ file, msg });
const warn = (file, msg) => warnings.push({ file, msg });

// --- Source-of-truth lists -------------------------------------------------

function validTags() {
	const src = readFileSync(join(ROOT, 'src/consts.ts'), 'utf8');
	const block = src.slice(src.indexOf('ALL_TAGS'), src.indexOf('];', src.indexOf('ALL_TAGS')));
	return new Set([...block.matchAll(/slug:\s*'([a-z-]+)'/g)].map((m) => m[1]));
}

const stripExt = (f) => basename(f, extname(f));
const listSlugs = (dir) =>
	new Set(readdirSync(dir).filter((f) => /\.(md|mdx)$/.test(f)).map(stripExt));

const TAGS = validTags();
const ARTICLE_SLUGS = listSlugs(ARTICLES_DIR);
const TEMPLATE_SLUGS = listSlugs(TEMPLATES_DIR);

// --- Frontmatter parsing (lightweight; no yaml dep) ------------------------

function splitFrontmatter(raw) {
	if (!raw.startsWith('---')) return { fm: '', body: raw };
	const end = raw.indexOf('\n---', 3);
	if (end === -1) return { fm: '', body: raw };
	return { fm: raw.slice(3, end), body: raw.slice(end + 4) };
}

function fmScalar(fm, key) {
	const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
	if (!m) return null;
	return m[1].trim().replace(/^['"]|['"]$/g, '');
}

function fmTags(fm) {
	const inline = fm.match(/^tags:\s*\[(.*?)\]/m);
	if (inline) return [...inline[1].matchAll(/'([a-z-]+)'|"([a-z-]+)"/g)].map((m) => m[1] || m[2]);
	// block style
	const block = fm.match(/^tags:\s*\n((?:\s*-\s*.+\n?)+)/m);
	if (block) return [...block[1].matchAll(/-\s*'?"?([a-z-]+)'?"?/g)].map((m) => m[1]);
	return [];
}

// --- Body helpers ----------------------------------------------------------

// Return body lines with fenced code blocks removed, so style checks don't
// fire on code samples.
function bodyLinesNoCode(body) {
	const out = [];
	let inFence = false;
	for (const line of body.split('\n')) {
		if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
		if (!inFence) out.push(line);
	}
	return out;
}

// --- Per-article checks ----------------------------------------------------

const titles = new Map();
const descriptions = new Map();

function checkArticle(file) {
	const path = join(ARTICLES_DIR, file);
	const raw = readFileSync(path, 'utf8');
	const { fm, body } = splitFrontmatter(raw);

	// Frontmatter completeness
	const title = fmScalar(fm, 'title');
	const description = fmScalar(fm, 'description');
	const image = fmScalar(fm, 'image');
	const cardImage = fmScalar(fm, 'cardImage');
	const tags = fmTags(fm);

	if (!title) err(file, 'missing frontmatter: title');
	if (!description) err(file, 'missing frontmatter: description');
	if (!image) err(file, 'missing frontmatter: image');
	if (!cardImage) err(file, 'missing frontmatter: cardImage');
	if (!tags.length) err(file, 'missing frontmatter: tags');

	// image === cardImage, and both files (svg + png counterpart) exist
	if (image && cardImage && image !== cardImage)
		warn(file, `image (${image}) and cardImage (${cardImage}) differ — CLAUDE.md expects the same file`);
	for (const [field, val] of [['image', image], ['cardImage', cardImage]]) {
		if (!val) continue;
		const abs = join(ROOT, 'public', val.replace(/^\//, ''));
		if (!existsSync(abs)) { err(file, `${field} file not found: ${val}`); continue; }
		if (val.endsWith('.svg')) {
			const png = abs.replace(/\.svg$/, '.png');
			if (!existsSync(png))
				err(file, `${field} SVG has no OG PNG counterpart (run scripts/generate-og-images.mjs): ${basename(png)}`);
		}
	}

	// Tags valid
	for (const t of tags) if (!TAGS.has(t)) err(file, `unknown tag '${t}' (not in ALL_TAGS)`);

	// Uniqueness
	if (title) {
		if (titles.has(title)) err(file, `duplicate title, also in ${titles.get(title)}`);
		else titles.set(title, file);
	}
	if (description) {
		if (descriptions.has(description)) err(file, `duplicate description, also in ${descriptions.get(description)}`);
		else descriptions.set(description, file);
	}

	// Internal links resolve (body only)
	for (const m of body.matchAll(/\]\(\/articles\/([a-z0-9-]+)\/?\)/g))
		if (!ARTICLE_SLUGS.has(m[1])) err(file, `dead internal link: /articles/${m[1]}/ (no such article)`);
	for (const m of body.matchAll(/\]\(\/spreadsheets\/([a-z0-9-]+)\/?\)/g))
		if (!TEMPLATE_SLUGS.has(m[1])) err(file, `dead internal link: /spreadsheets/${m[1]}/ (no such template)`);

	// No direct Etsy links in body prose (articles funnel through /spreadsheets/)
	for (const m of body.matchAll(/\]\((https?:\/\/[^)]*etsy\.com[^)]*)\)/g))
		err(file, `article body links directly to Etsy (${m[1]}) — link to a /spreadsheets/ page instead`);
	// Wrong Etsy domain anywhere in the file (incl. relatedProduct frontmatter)
	for (const m of raw.matchAll(/https?:\/\/(www\.etsy\.com|etsy\.com)\/[^\s'")]+/g))
		err(file, `wrong Etsy domain (${m[1]}) — must be simplysheetdesign.etsy.com`);

	// Style + structure checks on prose (code stripped)
	const lines = bodyLinesNoCode(body);
	const nonEmpty = lines.map((l) => l.trim()).filter(Boolean);

	// Trailing manual "Related:" / sign-off block
	const tail = nonEmpty.slice(-6).join('\n');
	if (/^(#{0,3}\s*)?(\*{0,2})(related|see also|further reading|you might also like)\b/im.test(tail))
		err(file, 'body ends with a manual "Related/See also" block — ArticleLayout renders this automatically; remove it');
	if (nonEmpty.length && /^-{3,}$/.test(nonEmpty[nonEmpty.length - 1]))
		err(file, 'body ends with a trailing "---" divider — remove it');

	// Em-dash usage (a stray one or two is fine; flag pileups)
	const emCount = (body.match(/—/g) || []).length;
	if (emCount > 2) warn(file, `${emCount} em-dashes in body (style: prefer periods/commas/colons)`);
	for (const line of lines)
		if ((line.match(/—/g) || []).length > 1) { warn(file, 'a single paragraph/line has multiple em-dashes'); break; }

	// Bold in body prose (headings use ##, not **)
	for (const line of lines) {
		if (/^\s*(import|export)\b/.test(line)) continue; // mdx import lines
		if (/(^|[^*])\*\*[^*\n]+\*\*/.test(line)) { warn(file, 'bold (**text**) used in body prose (style: avoid bold for emphasis)'); break; }
	}
}

// --- Site-wide checks ------------------------------------------------------

function checkOgPngParity() {
	for (const f of readdirSync(IMAGES_DIR)) {
		if (!/^card-v2-.*\.svg$/.test(f)) continue;
		const png = join(IMAGES_DIR, f.replace(/\.svg$/, '.png'));
		if (!existsSync(png))
			err(`public/images/${f}`, `card SVG has no OG PNG counterpart (run scripts/generate-og-images.mjs)`);
	}
}

function checkEtsyDomainInSource() {
	const files = [];
	const walk = (dir) => {
		for (const e of readdirSync(dir, { withFileTypes: true })) {
			const p = join(dir, e.name);
			if (e.isDirectory()) walk(p);
			else if (/\.(astro|ts|js|mjs|md|mdx)$/.test(e.name)) files.push(p);
		}
	};
	walk(join(ROOT, 'src'));
	for (const p of files) {
		const raw = readFileSync(p, 'utf8');
		const rel = p.slice(ROOT.length + 1);
		for (const m of raw.matchAll(/https?:\/\/www\.etsy\.com\/[^\s'")]+/g))
			err(rel, `hardcoded www.etsy.com URL (${m[0].slice(0, 60)}…) — use simplysheetdesign.etsy.com`);
	}
}

// Flush-right product-image rule: the named selectors must keep
// `object-position: right center`. Coarse but catches a full flip to center.
function checkProductImageInvariant() {
	const targets = {
		'src/layouts/TemplateLayout.astro': ['.product-image', '.template-thumb'],
		'src/pages/spreadsheets/index.astro': ['.template-thumb'],
		'src/pages/index.astro': ['.template-thumb'],
		'src/pages/articles/[...page].astro': ['.resource-thumb'],
		'src/styles/global.css': ['.article-promo-thumb', '.product-thumb'],
	};
	for (const [rel, selectors] of Object.entries(targets)) {
		const abs = join(ROOT, rel);
		if (!existsSync(abs)) { warn(rel, 'expected file for product-image invariant not found'); continue; }
		const css = readFileSync(abs, 'utf8');
		for (const sel of selectors) {
			// find each rule block whose selector head contains this class
			const re = new RegExp(`([^{}]*\\${sel}[^{}]*)\\{([^}]*)\\}`, 'g');
			let found = false;
			for (const m of css.matchAll(re)) {
				const block = m[2];
				if (!/object-fit|object-position/.test(block)) continue;
				found = true;
				if (!/object-position:\s*right\s+center/.test(block))
					err(rel, `${sel} block sets object-fit/position but not "object-position: right center" — flush-right crop will break`);
			}
			if (!found) warn(rel, `${sel} not found with an object-position rule (selector renamed?) — verify flush-right crop`);
		}
	}
}

// --- Run -------------------------------------------------------------------

for (const f of readdirSync(ARTICLES_DIR)) if (/\.(md|mdx)$/.test(f)) checkArticle(f);
checkOgPngParity();
checkEtsyDomainInSource();
checkProductImageInvariant();

// --- Report ----------------------------------------------------------------

const group = (items) => {
	const by = new Map();
	for (const { file, msg } of items) (by.get(file) || by.set(file, []).get(file)).push(msg);
	return by;
};

function print(label, items) {
	if (!items.length) return;
	console.log(`\n${label} (${items.length})`);
	for (const [file, msgs] of group(items)) {
		console.log(`  ${file}`);
		for (const m of msgs) console.log(`    - ${m}`);
	}
}

console.log(`content-lint: ${ARTICLE_SLUGS.size} articles, ${TEMPLATE_SLUGS.size} templates, ${TAGS.size} tags`);
print('ERRORS', errors);
print('WARNINGS', warnings);

if (!errors.length && !warnings.length) console.log('\nAll checks passed.');
else console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);

process.exit(errors.length ? 1 : 0);
