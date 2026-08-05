// Adds intrinsic width/height and lazy-loading hints to images written in
// article markdown.
//
// Markdown gives no way to express dimensions, so `![alt](/images/x.jpg)`
// renders as a bare <img>. The browser then cannot reserve space for it until
// the bytes arrive, which shifts everything below it — a Cumulative Layout
// Shift that only affects article bodies, the site's most-read content.
//
// `.prose img` is already `max-width: 100%; height: auto`, so the attributes
// establish an aspect ratio without changing the rendered size at any
// breakpoint. Article body images always sit well below the fold, under the
// hero and opening paragraphs, so lazy-loading them never touches LCP.
import { intrinsicSize } from './image-size.mjs';

function collectImages(node, out = []) {
	if (node.type === 'element' && node.tagName === 'img') out.push(node);
	for (const child of node.children ?? []) collectImages(child, out);
	return out;
}

export default function rehypeImageAttrs() {
	return async (tree) => {
		await Promise.all(
			collectImages(tree).map(async (node) => {
				// Never overwrite dimensions an author set deliberately.
				if (node.properties?.width || node.properties?.height) return;

				const size = await intrinsicSize(node.properties?.src);
				if (!size) return;

				node.properties.width = size.width;
				node.properties.height = size.height;
				node.properties.loading ??= 'lazy';
				node.properties.decoding ??= 'async';
			}),
		);
	};
}
