// Generates a narration MP3 for one article via Google Cloud Text-to-Speech
// (Studio voice) and saves it to public/audio/{slug}.mp3. Run manually per
// article, not part of the build. Studio voices aren't in Google's always-free
// tier (unlike Neural2/WaveNet), but the per-article cost is a few cents and
// each article only needs to be generated once.
//
// Usage: GOOGLE_TTS_API_KEY=... node scripts/generate-audio-narration.mjs <slug> [--force]
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';

const articlesDir = path.resolve(import.meta.dirname, '../src/content/articles');
const audioDir = path.resolve(import.meta.dirname, '../public/audio');

const VOICE = { languageCode: 'en-US', name: 'en-US-Studio-O' };
const SPEAKING_RATE = 1.12;
const MAX_CHUNK_CHARS = 4500; // Google's per-request input limit is 5000 bytes.

function stripFrontmatter(raw) {
	return raw.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function stripJsx(body) {
	return body
		.replace(/^import .*$/gm, '')
		.replace(/<[A-Z][A-Za-z0-9]*(\s[^>]*)?\/>/g, '')
		.replace(/<[A-Z][A-Za-z0-9]*(\s[^>]*)?>[\s\S]*?<\/[A-Z][A-Za-z0-9]*>/g, '');
}

function markdownToPlainText(body) {
	return body
		.replace(/```[\s\S]*?```/g, '') // code blocks
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> link text
		.replace(/^#{1,6}\s+/gm, '') // heading markers
		.replace(/\*\*([^*]+)\*\*/g, '$1') // bold
		.replace(/\*([^*]+)\*/g, '$1') // italic
		.replace(/^>\s?/gm, '') // blockquote markers
		.replace(/^[-*+]\s+/gm, '') // unordered list markers
		.replace(/^\d+\.\s+/gm, '') // ordered list markers
		.replace(/^---$/gm, '') // horizontal rules
		.trim();
}

function splitIntoChunks(text, maxChars) {
	const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
	const chunks = [];
	let current = '';

	for (const para of paragraphs) {
		const candidate = current ? `${current}\n\n${para}` : para;
		if (candidate.length > maxChars && current) {
			chunks.push(current);
			current = para;
		} else {
			current = candidate;
		}
	}
	if (current) chunks.push(current);
	return chunks;
}

async function synthesizeChunk(apiKey, text) {
	const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			input: { text },
			voice: VOICE,
			audioConfig: { audioEncoding: 'MP3', speakingRate: SPEAKING_RATE },
		}),
	});

	if (!res.ok) {
		const errBody = await res.text();
		throw new Error(`Google TTS request failed (${res.status}): ${errBody}`);
	}

	const { audioContent } = await res.json();
	return Buffer.from(audioContent, 'base64');
}

async function main() {
	const args = process.argv.slice(2);
	const force = args.includes('--force');
	const slug = args.find((a) => !a.startsWith('--'));

	if (!slug) {
		console.error('Usage: node scripts/generate-audio-narration.mjs <slug> [--force]');
		process.exit(1);
	}

	const apiKey = process.env.GOOGLE_TTS_API_KEY;
	if (!apiKey) {
		console.error('Missing GOOGLE_TTS_API_KEY environment variable.');
		process.exit(1);
	}

	const outPath = path.join(audioDir, `${slug}.mp3`);
	if (!force) {
		try {
			await access(outPath);
			console.log(`${slug}.mp3 already exists, skipping (use --force to regenerate).`);
			return;
		} catch {
			// doesn't exist yet, continue
		}
	}

	let raw;
	let sourcePath;
	for (const ext of ['.mdx', '.md']) {
		try {
			sourcePath = path.join(articlesDir, `${slug}${ext}`);
			raw = await readFile(sourcePath, 'utf-8');
			break;
		} catch {
			raw = undefined;
		}
	}
	if (!raw) {
		console.error(`No article found for slug "${slug}" in ${articlesDir}`);
		process.exit(1);
	}

	const body = stripJsx(stripFrontmatter(raw));
	const text = markdownToPlainText(body);
	const chunks = splitIntoChunks(text, MAX_CHUNK_CHARS);

	console.log(`Synthesizing ${slug} in ${chunks.length} chunk(s)...`);

	const buffers = [];
	for (let i = 0; i < chunks.length; i++) {
		console.log(`  chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
		buffers.push(await synthesizeChunk(apiKey, chunks[i]));
	}

	await mkdir(audioDir, { recursive: true });
	await writeFile(outPath, Buffer.concat(buffers));
	console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
}

main();
