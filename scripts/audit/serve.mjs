// Minimal static server for the built `dist/` directory, used only by the
// audit harness. Mirrors the path resolution the harness needs: `/foo/` and
// `/foo` both resolve to `dist/foo/index.html`, so a route can be captured
// the same way regardless of how the harness spells it.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.xml': 'application/xml; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.mp3': 'audio/mpeg',
	'.woff2': 'font/woff2',
	'.ico': 'image/x-icon',
	'.txt': 'text/plain; charset=utf-8',
	'.otf': 'font/otf',
};

function resolveFile(root, urlPath) {
	const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
	const candidates = [
		path.join(root, decoded),
		path.join(root, decoded, 'index.html'),
		path.join(root, `${decoded}.html`),
	];
	for (const c of candidates) {
		if (!c.startsWith(root)) continue;
		if (existsSync(c) && statSync(c).isFile()) return c;
	}
	return null;
}

export function startServer(root) {
	const server = createServer((req, res) => {
		const file = resolveFile(root, req.url);
		if (!file) {
			const notFound = path.join(root, '404.html');
			res.writeHead(404, { 'content-type': MIME['.html'] });
			if (existsSync(notFound)) return createReadStream(notFound).pipe(res);
			return res.end('Not found');
		}
		res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
		createReadStream(file).pipe(res);
	});
	return new Promise((resolve) => {
		server.listen(0, '127.0.0.1', () => {
			resolve({ server, port: server.address().port });
		});
	});
}
