import redis from './lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Code required' });

    const data = await redis.get(`room:${code.toUpperCase()}`);
    if (!data) return res.status(404).json({ error: 'Room not found' });

    const room = typeof data === 'string' ? JSON.parse(data) : data;

    const safeRoom = {
      code: room.code,
      host: room.host,
      topic: room.topic,
      status: room.status,
      questionCount: room.questions.length,
      players: room.players.map(p => ({
        name: p.name,
        score: p.score,
        currentQuestion: p.currentQuestion,
        finishedAt: p.finishedAt
      })),
      questions: room.status === 'finished'
        ? room.questions
        : room.questions.map(({ correct, explanation, ...q }) => q)
    };

    return res.status(200).json({ success: true, room: safeRoom });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
}