import { defineConfig } from 'tinacms';

// Reads Tina Cloud credentials from env vars so nothing sensitive is
// committed. Set TINA_CLIENT_ID and TINA_TOKEN wherever this is deployed
// (falls back to local-only mode if they're unset).
export default defineConfig({
	branch: 'claude/tina-io-integration-test-rl17tr',
	clientId: process.env.TINA_CLIENT_ID ?? null,
	token: process.env.TINA_TOKEN ?? null,
	search: process.env.TINA_SEARCH_TOKEN
		? {
				tina: {
					indexerToken: process.env.TINA_SEARCH_TOKEN,
					stopwordLanguages: ['eng'],
				},
				indexBatchSize: 100,
				maxSearchIndexFieldLength: 100,
			}
		: undefined,
	build: {
		outputFolder: 'admin',
		publicFolder: 'public',
	},
	media: {
		tina: {
			mediaRoot: 'images',
			publicFolder: 'public',
		},
	},
	schema: {
		collections: [
			{
				name: 'article',
				label: 'Articles',
				path: 'src/content/articles',
				format: 'mdx',
				fields: [
					{
						type: 'string',
						name: 'title',
						label: 'Title',
						isTitle: true,
						required: true,
					},
					{
						type: 'string',
						name: 'description',
						label: 'Description',
						required: true,
						ui: { component: 'textarea' },
					},
					{
						type: 'datetime',
						name: 'pubDate',
						label: 'Publish Date',
						required: true,
					},
					{
						type: 'datetime',
						name: 'updatedDate',
						label: 'Updated Date',
					},
					{
						type: 'string',
						name: 'image',
						label: 'Card/Hero Image (SVG path)',
					},
					{
						type: 'string',
						name: 'cardImage',
						label: 'Card Image (SVG path)',
					},
					{
						type: 'string',
						name: 'tags',
						label: 'Tags',
						list: true,
						options: [
							'expense-tracking',
							'couples-budgeting',
							'debt-payoff',
							'savings-goals',
							'irregular-income',
							'net-worth',
							'budgeting-styles',
						],
					},
					{
						type: 'string',
						name: 'featuredImage',
						label: 'Featured Image (legacy)',
					},
					{
						type: 'object',
						name: 'faq',
						label: 'FAQ',
						list: true,
						fields: [
							{ type: 'string', name: 'question', label: 'Question', required: true },
							{ type: 'string', name: 'answer', label: 'Answer', required: true, ui: { component: 'textarea' } },
						],
					},
					{
						type: 'object',
						name: 'relatedProduct',
						label: 'Related Product (unused)',
						fields: [
							{ type: 'string', name: 'name', label: 'Name' },
							{ type: 'string', name: 'url', label: 'URL' },
						],
					},
					{
						type: 'rich-text',
						name: 'body',
						label: 'Body',
						isBody: true,
					},
				],
			},
		],
	},
});
