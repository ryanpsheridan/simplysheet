// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://www.simplysheetdesign.com',
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
