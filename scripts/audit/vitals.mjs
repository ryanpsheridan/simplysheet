// Measures Core Web Vitals for a built site under simulated mobile conditions.
//
//     node scripts/audit/vitals.mjs <distDir> [<distDir2>]
//
// With two directories it prints a before/after comparison.
//
// Conditions: 390x844 at 2x DPR, 4x CPU throttling, and Slow 4G (1.6 Mbps down,
// 150 ms RTT) applied through CDP — roughly a mid-range Android on mobile data,
// which is where this site's search visibility actually sits.
//
// Methodology, because it decides what these numbers can and cannot show:
//
// ALL web font requests are blocked, in every run. This sandbox cannot reach
// fonts.googleapis.com, and every way of working around that distorts the
// comparison in one direction or the other — mirroring them through Playwright's
// route.fulfill() delivers them instantly, because fulfilled responses bypass
// CDP network throttling, which hands the "before" build free fonts while the
// "after" build pays for real throttled requests. Blocking fonts on both sides
// removes that asymmetry: both render in fallback faces, and what is left is a
// clean measurement of the HTML and image delivery path.
//
// So these numbers capture the image and payload work. They deliberately say
// NOTHING about self-hosting the fonts — that change removes a render-blocking
// cross-origin request, and its benefit is invisible here by construction.
// Judge it on the request waterfall, not on this.
//
// Each page is measured RUNS times and the median reported, since single
// samples of LCP are noisy.
import { chromium } from 'playwright-core';
import path from 'node:path';
import { startServer } from './serve.mjs';

const PAGES = [
	['homepage', '/'],
	['article', '/articles/50-30-20-budget-rule/'],
	['product page', '/spreadsheets/budget-spreadsheet/'],
	['bill-split tool', '/tools/bill-split-calculator/'],
	['spreadsheets hub', '/spreadsheets/'],
];
const RUNS = 5;
const CHROME = process.env.AUDIT_CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const median = (xs) => {
	const s = [...xs].sort((a, b) => a - b);
	return s[Math.floor(s.length / 2)];
};

async function measureDist(dist) {
	const { server, port } = await startServer(dist);
	const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
	const results = {};

	for (const [name, route] of PAGES) {
		const lcps = [];
		const clss = [];
		const bytes = [];
		for (let run = 0; run < RUNS; run++) {
			const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
			// Block every web font, on both sides — see the methodology note above.
			await ctx.route('**/*', (route) => {
				const u = route.request().url();
				const isFont = route.request().resourceType() === 'font'
					|| /fonts\.(googleapis|gstatic)\.com|\.woff2?($|\?)/.test(u);
				return isFont ? route.abort() : route.continue();
			});
			const page = await ctx.newPage();

			let transferred = 0;
			page.on('response', async (r) => {
				try { transferred += (await r.body()).length; } catch { /* aborted */ }
			});

			const cdp = await ctx.newCDPSession(page);
			await cdp.send('Network.enable');
			await cdp.send('Network.emulateNetworkConditions', {
				offline: false,
				downloadThroughput: (1.6 * 1024 * 1024) / 8,
				uploadThroughput: (750 * 1024) / 8,
				latency: 150,
			});
			await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

			await page.addInitScript(() => {
				window.__lcp = 0;
				window.__cls = 0;
				new PerformanceObserver((l) => {
					for (const e of l.getEntries()) window.__lcp = e.startTime;
				}).observe({ type: 'largest-contentful-paint', buffered: true });
				new PerformanceObserver((l) => {
					for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
				}).observe({ type: 'layout-shift', buffered: true });
			});

			await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'load', timeout: 120000 });
			await page.waitForTimeout(2500);
			const v = await page.evaluate(() => ({ lcp: window.__lcp, cls: window.__cls }));
			lcps.push(v.lcp);
			clss.push(v.cls);
			bytes.push(transferred);
			await ctx.close();
		}
		results[name] = { lcp: median(lcps), cls: median(clss), bytes: median(bytes) };
	}

	await browser.close();
	server.close();
	return results;
}

const dirs = process.argv.slice(2);
if (!dirs.length) {
	console.error('usage: node scripts/audit/vitals.mjs <distDir> [<distDir2>]');
	process.exit(2);
}

const [a, b] = await Promise.all(dirs.map(measureDist)).then((r) => r);

const ms = (n) => `${Math.round(n)} ms`;
if (!b) {
	console.log('\npage'.padEnd(19), 'LCP'.padStart(10), 'CLS'.padStart(8), 'transfer'.padStart(11));
	for (const [name] of PAGES) {
		const r = a[name];
		console.log(name.padEnd(18), ms(r.lcp).padStart(10), r.cls.toFixed(3).padStart(8), `${(r.bytes / 1024).toFixed(0)} KB`.padStart(11));
	}
} else {
	console.log('\nMedian of 5 runs — 390x844 @2x, 4x CPU throttle, Slow 4G\n');
	console.log('page'.padEnd(19), 'LCP before'.padStart(11), 'LCP after'.padStart(11), 'change'.padStart(9), '   CLS before  CLS after');
	for (const [name] of PAGES) {
		const x = a[name];
		const y = b[name];
		const delta = `${(100 * (1 - y.lcp / x.lcp)).toFixed(0)}%`;
		console.log(
			name.padEnd(18), ms(x.lcp).padStart(11), ms(y.lcp).padStart(11), delta.padStart(9),
			`   ${x.cls.toFixed(3).padStart(9)}  ${y.cls.toFixed(3).padStart(9)}`,
		);
	}
}
