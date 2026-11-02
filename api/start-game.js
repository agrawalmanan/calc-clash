import redis from './lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { roomCode } = req.body;
    const room = await redis.get(`room:${roomCode}`);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Determine the end time
    const limit = room.timeLimit !== undefined ? room.timeLimit : 7;
    const endTime = limit > 0 ? Date.now() + (limit * 60 * 1000) : null;

    room.phase = 'playing';
    room.currentQuestionIndex = 0;
    room.endTime = endTime; // Save absolute timestamp in milliseconds

    // Reset player scores for the new game
    Object.keys(room.players).forEach(id => {
      room.players[id].score = 0;
      room.players[id].streak = 0;
      room.players[id].answers = {};
    });

    await redis.set(`room:${roomCode}`, room);
    res.status(200).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start game' });
  }
}