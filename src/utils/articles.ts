import { getCollection, type CollectionEntry } from 'astro:content';
import { readTime } from '../consts';

// The one shape every article card is built from, on every page. Pages used
// to compute read time and pick `cardImage ?? image` themselves, each slightly
// differently; now they call toArticleCard and hand the result to ArticleCard.
export interface ArticleCardData {
	id: string;
	title: string;
	desc: string;
	tags: string[];
	image?: string;
	readTime: number;
	date: number;
}

export function toArticleCard(article: CollectionEntry<'articles'>): ArticleCardData {
	return {
		id: article.id,
		title: article.data.title,
		desc: article.data.description,
		tags: article.data.tags ?? [],
		image: article.data.cardImage ?? article.data.image,
		readTime: readTime(article.body),
		date: article.data.pubDate.valueOf(),
	};
}

/** Every article, newest first. */
export async function getSortedArticles(): Promise<CollectionEntry<'articles'>[]> {
	return (await getCollection('articles')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
}

/**
 * Up to `limit` other articles, those sharing a tag with `tags` first, then
 * the rest, each group newest first. Shared by the article and calculator
 * layouts' "Related articles" blocks.
 */
export async function getRelatedArticles(
	tags: string[],
	excludeId?: string,
	limit = 4,
): Promise<CollectionEntry<'articles'>[]> {
	const others = (await getSortedArticles()).filter((a) => a.id !== excludeId);
	const matched = others.filter((a) => a.data.tags?.some((t) => tags.includes(t)));
	const rest = others.filter((a) => !matched.includes(a));
	return [...matched, ...rest].slice(0, limit);
}
