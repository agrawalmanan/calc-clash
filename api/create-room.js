import redis from './lib/redis.js';
import { fetchQuestionsFromSheet } from './lib/questions.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { hostName, topic = 'mixed', questionCount = 10, customSheetUrl } = req.body;
    if (!hostName) return res.status(400).json({ error: 'Host name required' });

    // 🔥 FETCH LIVE QUESTIONS FROM GOOGLE SHEETS!
    const allQuestions = await fetchQuestionsFromSheet(customSheetUrl);

    if (!allQuestions || allQuestions.length === 0) {
      return res.status(400).json({ 
        error: 'Could not load questions from Google Sheets! Check your CSV link and column headers.' 
      });
    }

    // Filter by topic if needed
    let pool = [...allQuestions];
    if (topic && topic !== 'mixed') {
      const filtered = allQuestions.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
      if (filtered.length > 0) pool = filtered;
    }

    // Shuffle and pick requested number
    const selected = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(questionCount, pool.length));
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const totalTimeLimit = selected.length * 45; // 45s per question

    const room = {
      code: roomCode,
      host: hostName,
      topic,
      status: 'waiting',
      players: [{
        name: hostName,
        score: 0,
        currentQuestion: 0,
        answers: [],
        finishedAt: null
      }],
      questions: selected,
      totalTimeLimit,
      startedAt: null,
      createdAt: Date.now()
    };

    await redis.set(`room:${roomCode}`, room, { ex: 14400 });

    // Safe room copy (don't leak correct answers yet)
    const safeRoom = {
      ...room,
      questions: room.questions.map(q => ({
        id: q.id,
        topic: q.topic,
        question: q.question,
        options: q.options,
        points: q.points
      }))
    };

    return res.status(200).json({ success: true, room: safeRoom, roomCode });
  } catch (err) {
    console.error('Create room error:', err);
    return res.status(500).json({ error: 'Failed to create room' });
  }
}