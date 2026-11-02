import redis from './lib/redis';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const { playerName, roomCode } = body;

    if (!playerName || !roomCode) {
      return res.status(400).json({ error: 'Player name and room code are required.' });
    }

    const formattedCode = roomCode.toUpperCase().trim();
    const room = await redis.get(`room:${formattedCode}`);

    if (!room) {
      return res.status(404).json({ error: 'Room not found. Please check the 4-letter code.' });
    }

    const playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(playerName.trim())}`;

    const playerObj = {
      id: playerId,
      name: playerName.trim(),
      avatar,
      score: 0,
      streak: 0,
      answers: {}
    };

    room.players = room.players || {};
    room.players[playerId] = playerObj;

    await redis.set(`room:${formattedCode}`, room);

    return res.status(200).json({
      success: true,
      playerId,
      player: playerObj,
      room
    });
  } catch (error) {
    console.error('Join room error:', error);
    return res.status(500).json({ error: error.message || 'Failed to join room' });
  }
}