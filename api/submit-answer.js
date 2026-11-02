import redis from './lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { roomCode, playerId, questionIndex, answer, isCorrect, points } = body;

    const code = roomCode?.toUpperCase();
    if (!code || !playerId || questionIndex === undefined) {
      return res.status(400).json({ error: 'Missing roomCode, playerId or questionIndex' });
    }

    const room = await redis.get(`room:${code}`);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    room.players = room.players || {};
    const player = room.players[playerId];
    if (!player) return res.status(404).json({ error: 'Player not found' });

    player.answers = player.answers || {};
    if (player.answers[questionIndex] !== undefined) {
      return res.status(400).json({ error: 'Already answered' });
    }

    const correct = !!isCorrect;
    const pointsEarned = correct ? (Number(points) || 0) : 0;
    const newStreak = correct ? (player.streak || 0) + 1 : 0;

    player.answers[questionIndex] = { answer, correct, points: pointsEarned };
    player.score = (player.score || 0) + pointsEarned;
    player.streak = newStreak;

    room.players[playerId] = player;
    await redis.set(`room:${code}`, room);

    return res.status(200).json({ success: true, room, player });
  } catch (err) {
    console.error('Submit answer error:', err);
    return res.status(500).json({ error: err.message || 'Failed to submit' });
  }
}