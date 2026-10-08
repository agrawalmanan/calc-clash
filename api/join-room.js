import redis from './lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { roomCode, playerName } = req.body;
    const code = roomCode?.toUpperCase();

    const data = await redis.get(`room:${code}`);
    if (!data) {
      return res.status(404).json({ error: 'Room not found! Check code.' });
    }

    const room = typeof data === 'string' ? JSON.parse(data) : data;

    if (room.status === 'playing') {
      return res.status(400).json({ error: 'Battle already started!' });
    }
    if (room.status === 'finished') {
      return res.status(400).json({ error: 'This battle has ended.' });
    }

    const existingPlayer = room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (existingPlayer) {
      return res.status(400).json({ error: 'Name already taken in this room!' });
    }

    room.players.push({
      name: playerName,
      score: 0,
      currentQuestion: 0,
      answers: [],
      finishedAt: null
    });

    await redis.set(`room:${code}`, JSON.stringify(room), { ex: 14400 });

    const safeRoom = {
      ...room,
      questions: room.questions.map(({ correct, explanation, ...q }) => q)
    };

    return res.status(200).json({ success: true, room: safeRoom });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to join room' });
  }
}