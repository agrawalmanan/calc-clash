import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function Home() {
  const { createRoom, joinRoom, loading } = useGame();
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [topic, setTopic] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(10);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createRoom(name.trim(), topic, questionCount);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !roomCode.trim()) return;
    joinRoom(roomCode.trim(), name.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Title */}
      <div className="text-center mb-10 animate-fadeIn">
        <h1 className="text-6xl md:text-7xl font-black mb-3 tracking-tight">
          <span className="text-indigo-500">Calc</span>
          <span className="text-cyan-400">Clash</span>
          <span className="ml-3 text-5xl">⚔️</span>
        </h1>
        <p className="text-slate-400 text-lg">Real-Time Calculus Arena</p>
        <p className="text-xs text-slate-500 mt-1">First Year BTech Engineering Mathematics</p>
      </div>

      {!mode && (
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm animate-fadeIn">
          <button
            onClick={() => setMode('create')}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/25"
          >
            🏟️ Create Room
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-lg transition-all"
          >
            🎮 Join Room
          </button>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleCreate} className="w-full max-w-md bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4 animate-fadeIn">
          <h2 className="text-xl font-bold text-center">🏟️ Host Battle</h2>
          
          <div>
            <label className="text-xs text-slate-400 block mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Alex"
              className="w-full px-4 py-3 bg-slate-900 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="mixed">🎲 Mixed Topics</option>
              <option value="Limits">Limits</option>
              <option value="Derivatives">Derivatives</option>
              <option value="Integrals">Integrals</option>
              <option value="Applications">Applications</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Questions: {questionCount}</label>
            <input
              type="range"
              min="5"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : '🚀 Create Room'}
          </button>

          <button
            type="button"
            onClick={() => setMode(null)}
            className="w-full py-2 text-slate-400 hover:text-white text-sm"
          >
            ← Back
          </button>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={handleJoin} className="w-full max-w-md bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4 animate-fadeIn">
          <h2 className="text-xl font-bold text-center">🎮 Join Battle</h2>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your student name..."
              className="w-full px-4 py-3 bg-slate-900 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. X8A921"
              maxLength={6}
              className="w-full px-4 py-3 bg-slate-900 rounded-lg border border-slate-700 text-center font-mono text-2xl tracking-widest uppercase focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Joining...' : '⚡ Join Battle'}
          </button>

          <button
            type="button"
            onClick={() => setMode(null)}
            className="w-full py-2 text-slate-400 hover:text-white text-sm"
          >
            ← Back
          </button>
        </form>
      )}
    </div>
  );
}