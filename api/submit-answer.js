import redis from './lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { roomCode, playerName, questionIndex, answerIndex } = req.body;
    const code = roomCode?.toUpperCase();

    const data = await redis.get(`room:${code}`);
    if (!data) return res.status(404).json({ error: 'Room not found' });

    const room = typeof data === 'string' ? JSON.parse(data) : data;
    const player = room.players.find(p => p.name === playerName);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const question = room.questions[questionIndex];
    if (!question) return res.status(400).json({ error: 'Invalid question' });

    if (player.answers[questionIndex] !== undefined && player.answers[questionIndex] !== null) {
      return res.status(400).json({ error: 'Already answered' });
    }

    // 🔥 NEW: Check answer type (Numeric vs MCQ)
    let isCorrect = false;
    if (question.type === 'NUM') {
      // For numeric, answerIndex is the string the user typed
      const studentVal = parseFloat(answerIndex);
      // Allow 0.01 margin of error for decimals
      isCorrect = Math.abs(studentVal - question.correct) < 0.01;
    } else {
      // For MCQ / TF
      isCorrect = parseInt(answerIndex) === question.correct;
    }

    // 🔥 STREAK CALCULATION
    let currentStreak = 0;
    for (let i = questionIndex - 1; i >= 0; i--) {
      if (player.answers[i]?.correct) currentStreak++;
      else break;
    }
    if (isCorrect) currentStreak++; // Add current answer

    // 🔥 1.5x Multiplier for 3+ streak!
    const isMultiplierActive = currentStreak >= 3;
    const pointsEarned = isCorrect ? (isMultiplierActive ? 150 : 100) : 0;

    player.answers[questionIndex] = {
      selected: answerIndex,
      correct: isCorrect,
      points: pointsEarned,
      streak: currentStreak
    };
    
    player.score += pointsEarned;
    player.currentQuestion = questionIndex + 1;

    if (player.currentQuestion >= room.questions.length) {
      player.finishedAt = Date.now();
    }

    // Filter out the host when checking if "all players" are finished
    const students = room.players.filter(p => p.name !== room.host);
    const allFinished = students.length > 0 && students.every(p => p.finishedAt !== null);
    
    if (allFinished) room.status = 'finished';

    await redis.set(`room:${code}`, room, { ex: 14400 });

    return res.status(200).json({
      success: true,
      isCorrect,
      pointsEarned,
      correctAnswer: question.correct,
      explanation: question.explanation,
      playerScore: player.score,
      currentStreak,
      allFinished
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit' });
  }
}