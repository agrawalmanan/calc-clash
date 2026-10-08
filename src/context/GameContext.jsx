import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { api } from '../utils/api';

const GameContext = createContext();

const initialState = {
  playerName: '',
  roomCode: '',
  room: null,
  isHost: false,
  currentQuestion: 0,
  score: 0,
  answers: [],
  gamePhase: 'home', // 'home' | 'lobby' | 'playing' | 'leaderboard'
  error: null,
  loading: false,
  lastResult: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER':
      return { ...state, playerName: action.payload };
    case 'SET_ROOM':
      return { ...state, room: action.payload, roomCode: action.payload.code };
    case 'SET_HOST':
      return { ...state, isHost: true };
    case 'SET_PHASE':
      return { ...state, gamePhase: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'ANSWER_SUBMITTED':
      return {
        ...state,
        lastResult: action.payload,
        score: action.payload.playerScore,
        currentQuestion: state.currentQuestion + 1,
        answers: [...state.answers, action.payload]
      };
    case 'UPDATE_ROOM':
      return { ...state, room: { ...state.room, ...action.payload } };
    case 'GAME_STARTED':
      return { ...state, gamePhase: 'playing', currentQuestion: 0 };
    case 'GAME_FINISHED':
      return { ...state, gamePhase: 'leaderboard' };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const pollingRef = useRef(null);
  
  // Ref to always track latest phase without stale closures in setInterval
  const phaseRef = useRef(state.gamePhase);
  useEffect(() => {
    phaseRef.current = state.gamePhase;
  }, [state.gamePhase]);

  const startPolling = useCallback((roomCode) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const data = await api.getRoomStatus(roomCode);
        if (data.success) {
          dispatch({ type: 'UPDATE_ROOM', payload: data.room });

          // Auto-transition when host starts
          if (data.room.status === 'playing' && phaseRef.current === 'lobby') {
            dispatch({ type: 'GAME_STARTED' });
          }
          
          // Auto-transition when all players finish
          if (data.room.status === 'finished') {
            dispatch({ type: 'GAME_FINISHED' });
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1500); // Check every 1.5 seconds for snappy updates
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const createRoom = useCallback(async (hostName, topic, questionCount) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const data = await api.createRoom({ hostName, topic, questionCount });
      if (data.success) {
        dispatch({ type: 'SET_PLAYER', payload: hostName });
        dispatch({ type: 'SET_ROOM', payload: data.room });
        dispatch({ type: 'SET_HOST' });
        dispatch({ type: 'SET_PHASE', payload: 'lobby' });
        startPolling(data.roomCode);
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create room' });
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [startPolling]);

  const joinRoom = useCallback(async (roomCode, playerName) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const data = await api.joinRoom(roomCode, playerName);
      if (data.success) {
        dispatch({ type: 'SET_PLAYER', payload: playerName });
        dispatch({ type: 'SET_ROOM', payload: data.room });
        dispatch({ type: 'SET_PHASE', payload: 'lobby' });
        startPolling(roomCode);
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to join room' });
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [startPolling]);

  const startGame = useCallback(async () => {
    try {
      const data = await api.startGame(state.roomCode, state.playerName);
      if (data.success) {
        dispatch({ type: 'GAME_STARTED' });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start game' });
    }
  }, [state.roomCode, state.playerName]);

  const submitAnswer = useCallback(async (questionIndex, answerIndex, timeTaken) => {
    try {
      const data = await api.submitAnswer({
        roomCode: state.roomCode,
        playerName: state.playerName,
        questionIndex,
        answerIndex,
        timeTaken
      });
      if (data.success) {
        dispatch({ type: 'ANSWER_SUBMITTED', payload: data });
        if (data.allFinished) {
          dispatch({ type: 'GAME_FINISHED' });
        }
      }
      return data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to submit answer' });
      return null;
    }
  }, [state.roomCode, state.playerName]);

  const resetGame = useCallback(() => {
    stopPolling();
    dispatch({ type: 'RESET' });
  }, [stopPolling]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  return (
    <GameContext.Provider value={{
      ...state,
      createRoom,
      joinRoom,
      startGame,
      submitAnswer,
      resetGame,
      clearError,
      dispatch
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);