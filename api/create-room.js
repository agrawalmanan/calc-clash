import redis from './lib/redis';
import { fetchQuestions, DEFAULT_SHEET_URL } from './lib/questions';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

    const hostName = body.hostName;
    const timeLimit = body.timeLimit !== undefined ? body.timeLimit : 7;

    if (!hostName || !hostName.trim()) {
      return res.status(400).json({ error: 'Host name is required.' });
    }

    // Fetch questions using the user's sheet URL
    let questions;
    try {
      questions = await fetchQuestions(DEFAULT_SHEET_URL);
    } catch (sheetErr) {
      return res.status(400).json({ error: sheetErr.message });
    }

    let roomCode = generateRoomCode();
    let existing = await redis.get(`room:${roomCode}`);
    let attempts = 0;

    while (existing && attempts < 10) {
      roomCode = generateRoomCode();
      existing = await redis.get(`room:${roomCode}`);
      attempts++;
    }

    const roomData = {
      code: roomCode,
      hostName: hostName.trim(),
      sheetUrl: DEFAULT_SHEET_URL,
      timeLimit: Number(timeLimit),
      phase: 'lobby',
      players: {},
      questions,
      createdAt: Date.now()
    };

    await redis.set(`room:${roomCode}`, roomData);

    return res.status(200).json({ success: true, roomCode, room: roomData });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(400).json({ error: error.message || 'Failed to create room.' });
  }
}