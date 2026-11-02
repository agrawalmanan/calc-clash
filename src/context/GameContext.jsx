import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Derived phase: 'home' | 'lobby' | 'playing' | 'leaderboard'
  const gamePhase = roomState ? roomState.phase : (roomCode ? 'lobby' : 'home');

  // Poll room status every 1.5 seconds when connected to a room
  useEffect(() => {
    if (!roomCode) return;

    let isMounted = true;

    const pollStatus = async () => {
      try {
        const data = await api.getRoomStatus(roomCode);
        if (isMounted && data.room) {
          setRoomState(data.room);
          if (playerId && data.room.players && data.room.players[playerId]) {
            setPlayerState(data.room.players[playerId]);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomCode, playerId]);

  const createRoom = async (hostName, sheetUrl, timeLimit) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.createRoom(hostName, sheetUrl, timeLimit);
      setRoomCode(data.roomCode);
      setIsHost(true);
      setRoomState(data.room);
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (playerName, code) => {
    try {
      setLoading(true);
      setError(null);
      const formattedCode = code.toUpperCase();
      const data = await api.joinRoom(playerName, formattedCode);
      setRoomCode(formattedCode);
      setPlayerId(data.playerId);
      setIsHost(false);
      setRoomState(data.room);
      setPlayerState(data.player);
    } catch (err) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!roomCode) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.startGame(roomCode);
      setRoomState(data.room);
    } catch (err) {
      setError(err.message || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionIndex, answer, isCorrect, points) => {
    if (!roomCode || !playerId) return;
    try {
      const data = await api.submitAnswer(roomCode, playerId, questionIndex, answer, isCorrect, points);
      setRoomState(data.room);
      if (data.room.players && data.room.players[playerId]) {
        setPlayerState(data.room.players[playerId]);
      }
    } catch (err) {
      console.error('Submit answer error:', err);
    }
  };

  const endGame = async () => {
    if (!roomCode) return;
    try {
      setLoading(true);
      const data = await api.getLeaderboard(roomCode);
      setRoomState(data.room);
    } catch (err) {
      setError(err.message || 'Failed to end game');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const resetGame = () => {
    setRoomCode(null);
    setPlayerId(null);
    setIsHost(false);
    setRoomState(null);
    setPlayerState(null);
    setError(null);
  };

  return (
    <GameContext.Provider value={{
      roomCode,
      playerId,
      isHost,
      roomState,
      playerState,
      gamePhase,
      error,
      loading,
      createRoom,
      joinRoom,
      startGame,
      submitAnswer,
      endGame,
      clearError,
      resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}