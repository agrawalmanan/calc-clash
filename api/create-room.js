import redis from './lib/redis';
import { fetchQuestions, DEFAULT_SHEET_URL } from './lib/questions';

export default async function handler(req, res) {
  // 1. Basic Setup
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    // 2. Body Handling (Vercel parses req.body automatically)
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { hostName, timeLimit = 7 } = data;

    if (!hostName) {
      return res.status(400).json({ error: 'Host name is required' });
    }

    // 3. Fetch Questions (Using your provided URL)
    const questions = await fetchQuestions(DEFAULT_SHEET_URL);
    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: 'No questions found in sheet' });
    }

    // 4. Generate Room Code
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    // 5. Save to Redis
    const roomData = {
      code: roomCode,
      hostName,
      timeLimit: Number(timeLimit),
      phase: 'lobby',
      players: {},
      questions,
      createdAt: Date.now()
    };

    await redis.set(`room:${roomCode}`, roomData);

    // 6. Success Response
    return res.status(200).json({ success: true, roomCode, room: roomData });

  } catch (error) {
    console.error("Fatal API Error:", error);
    return res.status(500).json({ 
      error: "Server Error: " + error.message,
      details: error.stack 
    });
  }
}