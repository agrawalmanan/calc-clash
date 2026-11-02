export const api = {
  createRoom: async (hostName, timeLimit) => {
    const res = await fetch('/api/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName, timeLimit })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  joinRoom: async (playerName, roomCode) => {
    const res = await fetch('/api/join-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, roomCode })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  startGame: async (roomCode) => {
    const res = await fetch('/api/start-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  submitAnswer: async (roomCode, playerId, questionIndex, answer, isCorrect, points) => {
    const res = await fetch('/api/submit-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, playerId, questionIndex, answer, isCorrect, points })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  getRoomStatus: async (roomCode) => {
    const res = await fetch(`/api/room-status?code=${roomCode}`);
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  getLeaderboard: async (roomCode) => {
    const res = await fetch(`/api/leaderboard?code=${roomCode}`);
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  }
};