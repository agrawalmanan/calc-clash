import redis from './lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { roomCode, hostName } = req.body;
    const code = roomCode?.toUpperCase();

    const data = await redis.get(`room:${code}`);
    if (!data) return res.status(404).json({ error: 'Room not found' });

    const room = typeof data === 'string' ? JSON.parse(data) : data;

    if (room.host !== hostName) {
      return res.status(403).json({ error: 'Only host can start the game!' });
    }

    room.status = 'playing';
    room.startedAt = Date.now();

    await redis.set(`room:${code}`, JSON.stringify(room), { ex: 14400 });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to start game' });
  }
}