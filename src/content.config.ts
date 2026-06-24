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

export const collections = { articles };
