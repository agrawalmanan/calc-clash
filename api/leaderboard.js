import redis from './lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { code } = req.query;
    const formattedCode = code?.toUpperCase();
    if (!formattedCode) return res.status(400).json({ error: 'Room code required' });

    const room = await redis.get(`room:${formattedCode}`);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Mark the room as finished so clients polling room-status see the phase change too
    room.phase = 'leaderboard';
    await redis.set(`room:${formattedCode}`, room);

    const players = Object.values(room.players || {});
    const leaderboard = players
      .map(p => ({
        name: p.name,
        score: p.score || 0,
        correctCount: Object.values(p.answers || {}).filter(a => a && a.correct).length,
        totalQuestions: (room.questions || []).length
      }))
      .sort((a, b) => b.score - a.score);

    return res.status(200).json({ success: true, room, leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch leaderboard' });
  }
}