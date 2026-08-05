// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import rehypeImageAttrs from './scripts/rehype-image-attrs.mjs';

export default defineConfig({
	site: 'https://www.simplysheetdesign.com',
	build: {
		// Inline all page CSS directly into the HTML instead of splitting it
		// into a separate hashed file. On a slow connection, an external
		// stylesheet request can lose the race with first paint, showing a
		// flash of unstyled (browser-default) content before it loads.
		inlineStylesheets: 'always',
	},
	markdown: {
		// `unified()` is the current API; top-level markdown.rehypePlugins is
		// deprecated. mdx() extends this config by default, so .md and .mdx
		// both get it.
		//
		// Caveat found while adding this: supplying a custom processor at all —
		// even with an empty plugin list and smartypants: true — stops
		// smartypants being applied to *image alt text*. Body copy is
		// unaffected; a full-site diff turned up exactly one changed alt
		// string. Rather than depend on that implicit substitution, the one
		// affected alt now uses a typographic apostrophe in the source, so its
		// output is identical either way. smartypants stays on for body copy.
		processor: unified({
			rehypePlugins: [rehypeImageAttrs],
			smartypants: true,
		}),
	},
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !page.includes('/style-guide') && !page.endsWith('/rss.xml'),
		}),
	],
	redirects: {
		'/articles/debt-payoff': '/articles/how-to-pay-off-debt/',
		'/tools/debt-snowball-avalanche-calculator': '/tools/debt-snowball-vs-avalanche-calculator/',
		'/calculators/50-30-20-budget-calculator': '/tools/50-30-20-budget-calculator/',
	},
});
