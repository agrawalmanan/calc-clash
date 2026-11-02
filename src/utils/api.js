// Helper to safely parse server responses and prevent JSON parse crashes on HTML errors
async function handleResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    // If response is not JSON (e.g. Vercel 500 HTML error page)
    const cleanMessage = text.replace(/<[^>]*>?/gm, '').trim();
    throw new Error(cleanMessage || `Server returned status ${res.status}`);
  }

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  createRoom: async (hostName, timeLimit, sheetUrl = '') => {
    const res = await fetch('/api/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName, timeLimit, sheetUrl })
    });
    return handleResponse(res);
  },

  joinRoom: async (playerName, roomCode) => {
    const res = await fetch('/api/join-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, roomCode })
    });
    return handleResponse(res);
  },

  startGame: async (roomCode) => {
    const res = await fetch('/api/start-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode })
    });
    return handleResponse(res);
  },

  submitAnswer: async (roomCode, playerId, questionIndex, answer, isCorrect, points) => {
    const res = await fetch('/api/submit-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, playerId, questionIndex, answer, isCorrect, points })
    });
    return handleResponse(res);
  },

  getRoomStatus: async (roomCode) => {
    const res = await fetch(`/api/room-status?code=${roomCode}`);
    return handleResponse(res);
  },

  getLeaderboard: async (roomCode) => {
    const res = await fetch(`/api/leaderboard?code=${roomCode}`);
    return handleResponse(res);
  }
};