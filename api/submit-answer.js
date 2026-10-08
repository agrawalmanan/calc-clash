import redis from './lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { roomCode, playerName, questionIndex, answerIndex, timeTaken } = req.body;
    const code = roomCode?.toUpperCase();

    const data = await redis.get(`room:${code}`);
    if (!data) return res.status(404).json({ error: 'Room not found' });

    const room = typeof data === 'string' ? JSON.parse(data) : data;
    const player = room.players.find(p => p.name === playerName);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const question = room.questions[questionIndex];
    if (!question) return res.status(400).json({ error: 'Invalid question' });

    const isCorrect = answerIndex === question.correct;
    
    // Calculate speed bonus
    let pointsEarned = 0;
    if (isCorrect) {
      const basePoints = question.points || 100;
      const speedBonus = Math.max(0, Math.floor(((question.timeLimit || 30) - timeTaken) * 2));
      pointsEarned = basePoints + speedBonus;
    }

    player.answers[questionIndex] = {
      selected: answerIndex,
      correct: isCorrect,
      points: pointsEarned,
      timeTaken
    };

    player.score += pointsEarned;
    player.currentQuestion = questionIndex + 1;

    // Check if player completed all questions
    if (player.currentQuestion >= room.questions.length) {
      player.finishedAt = Date.now();
    }

    // Check if ALL players are done
    const allFinished = room.players.every(p => p.finishedAt !== null);
    if (allFinished) {
      room.status = 'finished';
    }

    await redis.set(`room:${code}`, JSON.stringify(room), { ex: 14400 });

    return res.status(200).json({
      success: true,
      isCorrect,
      pointsEarned,
      correctAnswer: question.correct,
      explanation: question.explanation,
      playerScore: player.score,
      allFinished
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to submit answer' });
  }
}