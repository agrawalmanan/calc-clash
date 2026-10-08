import redis from './lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { code } = req.query;
    const data = await redis.get(`room:${code?.toUpperCase()}`);
    if (!data) return res.status(404).json({ error: 'Room not found' });

    const room = typeof data === 'string' ? JSON.parse(data) : data;

    const leaderboard = room.players
      .map(p => ({
        name: p.name,
        score: p.score,
        correctCount: p.answers.filter(a => a && a.correct).length,
        totalQuestions: room.questions.length,
        finishedAt: p.finishedAt
      }))
      .sort((a, b) => b.score - a.score);

    return res.status(200).json({ success: true, leaderboard });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}