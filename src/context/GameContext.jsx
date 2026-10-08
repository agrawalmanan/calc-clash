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
  // Local log of every answer this player made (for reliable review)
  myAnswerLog: [],
  gamePhase: 'home',
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
    case 'UPDATE_ROOM':
      return { ...state, room: { ...state.room, ...action.payload } };

    // ✅ Only update score + lastResult. DO NOT advance question here.
    case 'ANSWER_RESULT':
      return {
        ...state,
        lastResult: action.payload,
        score: action.payload.playerScore,
        myAnswerLog: [
          ...state.myAnswerLog,
          {
            questionIndex: action.payload.questionIndex,
            selected: action.payload.selected,
            correct: action.payload.isCorrect,
            points: action.payload.pointsEarned,
            correctAnswer: action.payload.correctAnswer,
            explanation: action.payload.explanation,
            streak: action.payload.currentStreak || 0
          }
        ]
      };

    // ✅ Advance ONLY when Battle says feedback is done
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: state.currentQuestion + 1,
        lastResult: null
      };

    case 'GAME_STARTED':
      return {
        ...state,
        gamePhase: 'playing',
        currentQuestion: 0,
        score: 0,
        myAnswerLog: [],
        lastResult: null
      };

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
  const phaseRef = useRef(state.gamePhase);

  useEffect(() => {
    phaseRef.current = state.gamePhase;
  }, [state.gamePhase]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback((roomCode) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const data = await api.getRoomStatus(roomCode);
        if (data.success) {
          dispatch({ type: 'UPDATE_ROOM', payload: data.room });

          if (data.room.status === 'playing' && phaseRef.current === 'lobby') {
            dispatch({ type: 'GAME_STARTED' });
          }
          if (data.room.status === 'finished' && phaseRef.current !== 'leaderboard') {
            dispatch({ type: 'GAME_FINISHED' });
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1500);
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const createRoom = useCallback(async (hostName, topic, questionCount, customSheetUrl) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const data = await api.createRoom({ hostName, topic, questionCount, customSheetUrl });
      if (data.success) {
        dispatch({ type: 'SET_PLAYER', payload: hostName });
        dispatch({ type: 'SET_ROOM', payload: data.room });
        dispatch({ type: 'SET_HOST' });
        dispatch({ type: 'SET_PHASE', payload: 'lobby' });
        startPolling(data.roomCode);
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error });
      }
    } catch {
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
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to join room' });
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [startPolling]);

  const startGame = useCallback(async () => {
    try {
      const data = await api.startGame(state.roomCode, state.playerName);
      if (data.success) dispatch({ type: 'GAME_STARTED' });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start game' });
    }
  }, [state.roomCode, state.playerName]);

  // Returns the server result so Battle can show feedback
  const submitAnswer = useCallback(async (questionIndex, answerIndex) => {
    try {
      const data = await api.submitAnswer({
        roomCode: state.roomCode,
        playerName: state.playerName,
        questionIndex,
        answerIndex
      });

      if (data.success) {
        dispatch({
          type: 'ANSWER_RESULT',
          payload: {
            ...data,
            questionIndex,
            selected: answerIndex
          }
        });

        if (data.allFinished) {
          // slight delay so last feedback can show
          setTimeout(() => dispatch({ type: 'GAME_FINISHED' }), 1500);
        }
      }
      return data;
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to submit answer' });
      return null;
    }
  }, [state.roomCode, state.playerName]);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

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
      nextQuestion,
      resetGame,
      clearError,
      dispatch
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);