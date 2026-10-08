import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import { api } from '../utils/api';

export default function Leaderboard() {
  const { roomCode, playerName, resetGame } = useGame();
  const [board, setBoard] = useState([]);

  useEffect(() => {
    // Fire confetti when reaching podium
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    const fetchLeaderboard = async () => {
      const data = await api.getLeaderboard(roomCode);
      if (data.success) setBoard(data.leaderboard);
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(interval);
  }, [roomCode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-6 rounded-2xl border border-slate-700 animate-fadeIn space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-1">🏆 Leaderboard</h1>
          <p className="text-xs text-slate-400">Battle Room: <span className="font-mono text-indigo-400">{roomCode}</span></p>
        </div>

        {/* Player Rankings List */}
        <div className="space-y-2">
          {board.map((p, idx) => (
            <div
              key={idx}
              className={`flex justify-between items-center p-3 rounded-xl ${
                p.name === playerName ? 'bg-indigo-900/40 border border-indigo-500' : 'bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold w-6 text-center">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </span>
                <div>
                  <div className="font-bold text-sm">
                    {p.name} {p.name === playerName && <span className="text-xs text-indigo-400">(You)</span>}
                  </div>
                  <div className="text-xs text-slate-400">{p.correctCount}/{p.totalQuestions} Correct</div>
                </div>
              </div>

              <div className="font-mono font-black text-indigo-400 text-lg">
                {p.score} pts
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={resetGame}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all"
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}