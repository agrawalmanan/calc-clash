import redis from './lib/redis.js';
import { fetchAllQuestions } from '../src/data/questions.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { hostName, topic = 'mixed', questionCount = 10 } = req.body;
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const allQuestions = await fetchAllQuestions();
    let selectedQuestions = [];

    if (topic === 'mixed') {
      selectedQuestions = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, questionCount);
    } else {
      const filtered = allQuestions.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
      const pool = filtered.length > 0 ? filtered : allQuestions;
      selectedQuestions = [...pool].sort(() => Math.random() - 0.5).slice(0, questionCount);
    }

    const room = {
      code: roomCode,
      host: hostName,
      topic,
      status: 'waiting', // waiting | playing | finished
      players: [{
        name: hostName,
        score: 0,
        currentQuestion: 0,
        answers: [],
        finishedAt: null
      }],
      questions: selectedQuestions,
      createdAt: Date.now()
    };

    // Store in Upstash Redis with 4-hour expiry
    await redis.set(`room:${roomCode}`, JSON.stringify(room), { ex: 14400 });

    // Hide correct answers from response sent to client
    const safeRoom = {
      ...room,
      questions: room.questions.map(({ correct, explanation, ...q }) => q)
    };

    return res.status(200).json({ success: true, room: safeRoom, roomCode });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create room' });
  }
}