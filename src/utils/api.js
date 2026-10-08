const BASE_URL = '/api';

export const api = {
  async createRoom(data) {
    const res = await fetch(`${BASE_URL}/create-room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async joinRoom(roomCode, playerName) {
    const res = await fetch(`${BASE_URL}/join-room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, playerName })
    });
    return res.json();
  },

  async startGame(roomCode, hostName) {
    const res = await fetch(`${BASE_URL}/start-game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, hostName })
    });
    return res.json();
  },

  async submitAnswer(data) {
    const res = await fetch(`${BASE_URL}/submit-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getRoomStatus(code) {
    const res = await fetch(`${BASE_URL}/room-status?code=${code}`);
    return res.json();
  },

  async getLeaderboard(code) {
    const res = await fetch(`${BASE_URL}/leaderboard?code=${code}`);
    return res.json();
  }
};