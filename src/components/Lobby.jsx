import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function Lobby() {
  const { room, isHost, playerName, startGame, resetGame } = useGame();
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 animate-fadeIn">
        {/* Room Header */}
        <div className="bg-slate-800 p-6 rounded-2xl text-center border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">ROOM CODE</p>
          <div 
            onClick={copyCode}
            className="text-5xl font-mono font-black text-indigo-400 tracking-wider cursor-pointer hover:scale-105 transition-transform"
          >
            {room.code}
          </div>
          <button onClick={copyCode} className="text-xs text-slate-400 mt-2 hover:text-cyan-400">
            {copied ? '✅ Copied to clipboard!' : '📋 Click code to copy'}
          </button>
        </div>

        {/* Player List */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">👥 Joined Players</h3>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-bold">
              {room.players?.length || 0} Ready
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {room.players?.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-900/60 px-3 py-2 rounded-lg text-sm">
                <span className="font-medium">
                  {p.name} {p.name === playerName && <span className="text-xs text-indigo-400">(You)</span>}
                </span>
                {idx === 0 && <span className="text-xs text-amber-400 font-bold">👑 Host</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isHost ? (
            <button
              onClick={startGame}
              className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20"
            >
              🚀 START BATTLE!
            </button>
          ) : (
            <div className="flex-1 py-4 bg-slate-800 text-slate-400 text-center rounded-xl font-medium border border-slate-700">
              ⏳ Waiting for host to start...
            </div>
          )}

          <button
            onClick={resetGame}
            className="px-4 bg-slate-800 hover:bg-rose-900/30 text-rose-400 rounded-xl border border-slate-700 text-lg"
          >
            🚪
          </button>
        </div>
      </div>
    </div>
  );
}