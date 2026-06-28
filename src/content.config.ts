import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
	loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		image: z.string().optional(),
		cardImage: z.string().optional(),
		featuredImage: z.string().optional(),
		tags: z.array(z.string()).default([]),
		faq: z.array(z.object({
			question: z.string(),
			answer: z.string(),
		})).optional(),
		relatedProduct: z.object({
			name: z.string(),
			url: z.string().url(),
		}).optional(),
	}),
});

const templates = defineCollection({
	loader: glob({ base: './src/content/templates', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		badge: z.string().optional(),
		sku: z.string(),
		platforms: z.array(z.string()).default(['google-sheets', 'excel']),
		darkListing: z.string().url(),
		lightListing: z.string().url(),
		heroImage: z.string(),
		lightImage: z.string().optional(),
		features: z.array(z.string()).default([]),
		relatedArticles: z.array(z.string()).default([]),
		tags: z.array(z.string()).default([]),
		order: z.number().default(99),
		bundles: z.array(z.object({
			name: z.string(),
			darkUrl: z.string().url(),
			lightUrl: z.string().url(),
		})).optional(),
		faq: z.array(z.object({
			question: z.string(),
			answer: z.string(),
		})).optional(),
		reviews: z.array(z.object({
			name: z.string(),
			text: z.string(),
		})).optional(),
	}),
});

export const collections = { articles, templates };
