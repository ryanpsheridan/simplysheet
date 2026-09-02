import { defineConfig } from 'tinacms';

// Local-only test setup: no clientId/token, so this runs entirely against
// the local filesystem/git (no Tina Cloud account needed). See
// https://tina.io/docs/self-hosted/overview for what going further requires.
export default defineConfig({
	branch: 'claude/tina-io-integration-test-rl17tr',
	clientId: null,
	token: null,
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
