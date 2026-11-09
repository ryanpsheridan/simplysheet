import { existsSync } from 'node:fs';
import path from 'node:path';
import queue from '../../scripts/pins/queue.json';

// The "Save to Pinterest" button prefills Pinterest's save page with an image.
// A page's own pin (tall, made for Pinterest) beats its 16:9 photo, so look up
// the newest pin whose queue `source` is this page's id (an article id or a
// tool's URL slug). Video pins have a PNG still with the same name.
interface QueuedPin {
	slug: string;
	source: string;
	type: string;
}

const pins = (queue as { pins: QueuedPin[] }).pins;

export function pinImageFor(sourceId: string): string | undefined {
	for (let i = pins.length - 1; i >= 0; i--) {
		const pin = pins[i];
		if (pin.source !== sourceId || pin.type === 'product') continue;
		const file = `${pin.slug.replace(/\.mp4$/, '')}.png`;
		if (existsSync(path.resolve('public/images/pins', file))) return `/images/pins/${file}`;
	}
	return undefined;
}

/** Pinterest's save page, prefilled. A plain link: no Pinterest script, no
    cookies, nothing to add to the CSP or the privacy policy. */
export function pinterestSaveUrl(pageUrl: string, imagePath: string, description: string, site: URL | undefined): string {
	const media = new URL(imagePath, site).toString();
	const params = new URLSearchParams({ url: pageUrl, media, description: description.slice(0, 480) });
	return `https://www.pinterest.com/pin/create/button/?${params.toString()}`;
}
