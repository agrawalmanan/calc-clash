import redis from './lib/redis';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Room code required.' });
    }

    const formattedCode = code.toUpperCase().trim();
    const room = await redis.get(`room:${formattedCode}`);

    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    return res.status(200).json({ success: true, room });
  } catch (error) {
    console.error('Room status error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch room status' });
  }
}