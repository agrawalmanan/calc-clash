import redis from './lib/redis';
import { fetchQuestions } from './lib/questions';

// Default CSV URL fallback if process.env.GOOGLE_SHEET_URL is not provided
const DEFAULT_SHEET_URL = process.env.GOOGLE_SHEET_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT534148vnBFD7iXB-7fBebu3hvCV-QGbU63AGkc7qibsJgfMI1ZqcyxksTlQNq9ioFHsgs3RpCBzdt/pub?output=csv';

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
    const { hostName, sheetUrl, timeLimit = 7 } = req.body || {};

    if (!hostName || !hostName.trim()) {
      return res.status(400).json({ error: 'Host name is required.' });
    }

    const targetUrl = (sheetUrl && sheetUrl.trim()) ? sheetUrl.trim() : DEFAULT_SHEET_URL;

    if (!targetUrl) {
      return res.status(400).json({ error: 'No Google Sheet CSV URL provided or configured in environment.' });
    }

    // Fetch questions from published Google Sheet
    const questions = await fetchQuestions(targetUrl);

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
      sheetUrl: targetUrl,
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
    return res.status(500).json({ error: error.message || 'Failed to create room' });
  }
}