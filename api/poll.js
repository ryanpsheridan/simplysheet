import { Redis } from '@upstash/redis';

// Server-side allowlist of every poll on the site, keyed by pollId. Keeps
// Redis keys and hash fields bounded to known values instead of trusting
// whatever a client sends.
const POLLS = {
	'budgeting-style': ['planner', 'saver', 'spender', 'avoider'],
	'debt-payoff-method': ['snowball', 'avalanche', 'not-started'],
};

const VOTER_TTL_SECONDS = 60 * 60 * 24 * 365;

function getRedis() {
	const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
	if (!url || !token) return null;
	return new Redis({ url, token });
}

function normalizeCounts(pollId, raw) {
	const counts = {};
	for (const key of POLLS[pollId]) {
		counts[key] = Number(raw?.[key]) || 0;
	}
	return counts;
}

export default async function handler(req, res) {
	const redis = getRedis();
	if (!redis) {
		res.status(503).json({ error: 'Poll storage is not configured.' });
		return;
	}

	if (req.method === 'GET') {
		const pollId = req.query.pollId;
		if (typeof pollId !== 'string' || !POLLS[pollId]) {
			res.status(400).json({ error: 'Unknown poll.' });
			return;
		}
		const raw = await redis.hgetall(`poll:${pollId}:counts`);
		res.status(200).json({ counts: normalizeCounts(pollId, raw) });
		return;
	}

	if (req.method === 'POST') {
		const { pollId, option, voterId } = req.body || {};

		if (typeof pollId !== 'string' || !POLLS[pollId]) {
			res.status(400).json({ error: 'Unknown poll.' });
			return;
		}
		if (typeof option !== 'string' || !POLLS[pollId].includes(option)) {
			res.status(400).json({ error: 'Unknown option.' });
			return;
		}
		if (typeof voterId !== 'string' || voterId.length < 8 || voterId.length > 64) {
			res.status(400).json({ error: 'Invalid voter id.' });
			return;
		}

		const voterKey = `poll:${pollId}:voters:${voterId}`;
		const isNewVote = await redis.set(voterKey, option, { nx: true, ex: VOTER_TTL_SECONDS });
		if (isNewVote) {
			await redis.hincrby(`poll:${pollId}:counts`, option, 1);
		}

		const raw = await redis.hgetall(`poll:${pollId}:counts`);
		res.status(200).json({ counts: normalizeCounts(pollId, raw) });
		return;
	}

	res.status(405).json({ error: 'Method not allowed.' });
}
