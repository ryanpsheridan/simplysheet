import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const KEY = '1002b62317924749a4897d03a0764af9';
const HOST = 'www.simplysheetdesign.com';
const SITEMAP_PATH = fileURLToPath(new URL('../dist/sitemap-0.xml', import.meta.url));

if (process.env.VERCEL_ENV !== 'production') {
	console.log('[indexnow] Skipping — not a production deploy.');
	process.exit(0);
}

let xml;
try {
	xml = readFileSync(SITEMAP_PATH, 'utf-8');
} catch {
	console.log(`[indexnow] Skipping — sitemap not found at ${SITEMAP_PATH}.`);
	process.exit(0);
}

const urlList = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

if (urlList.length === 0) {
	console.log('[indexnow] Skipping — no URLs found in sitemap.');
	process.exit(0);
}

try {
	const response = await fetch('https://api.indexnow.org/indexnow', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
		body: JSON.stringify({
			host: HOST,
			key: KEY,
			keyLocation: `https://${HOST}/${KEY}.txt`,
			urlList,
		}),
	});
	console.log(`[indexnow] Submitted ${urlList.length} URLs — status ${response.status}`);
} catch (err) {
	console.log(`[indexnow] Skipping — request failed: ${err.message}`);
}
