import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function Home() {
  const { createRoom, joinRoom, loading } = useGame();
  const [mode, setMode] = useState(null);
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [topic, setTopic] = useState('mixed');
  const [customSheetUrl, setCustomSheetUrl] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    // Pass customSheetUrl if provided
    createRoom(name.trim(), topic, 10, customSheetUrl.trim() || undefined);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Decorative Math Symbols */}
      <div className="absolute top-20 left-10 text-5xl opacity-20 animate-float text-brand-purple font-black">∫</div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-20 animate-float-delayed text-brand-pink font-black">∑</div>
      <div className="absolute top-40 right-20 text-4xl opacity-20 animate-float text-brand-blue font-black">dx</div>

      <div className="text-center mb-8 z-10">
        <div className="inline-block bg-white px-6 py-2 rounded-full shadow-sm text-sm font-bold text-slate-500 mb-4 border border-slate-100">
          🎓 BTech Engineering Calculus
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-2 tracking-tight text-slate-800">
          Calc<span className="text-brand-purple">Clash</span>
        </h1>
      </div>

      <div className="w-full max-w-sm z-10">
        {!mode && (
          <div className="flex flex-col gap-4">
            <button onClick={() => setMode('join')} className="btn-chunky btn-primary py-5 text-xl font-black rounded-2xl w-full">
              🎮 Join Battle
            </button>
            <button onClick={() => setMode('create')} className="btn-chunky btn-secondary py-4 text-lg font-bold rounded-2xl w-full">
              👨‍🏫 Host Game
            </button>
          </div>
        )}

        {mode === 'join' && (
          <form onSubmit={(e) => { e.preventDefault(); joinRoom(roomCode, name); }} className="card-chunky p-6 space-y-4">
            <h2 className="text-2xl font-black text-center text-slate-700">Join Room</h2>
            <input type="text" placeholder="Your Nickname" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-brand-purple outline-none" required />
            <input type="text" placeholder="ROOM CODE" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} maxLength={6} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-black text-center text-2xl tracking-[0.3em] focus:border-brand-purple outline-none uppercase" required />
            <button type="submit" disabled={loading} className="btn-chunky btn-primary w-full py-4 text-xl rounded-xl font-black mt-2">
              {loading ? 'Joining...' : "Let's Go! 🚀"}
            </button>
            <button type="button" onClick={() => setMode(null)} className="w-full font-bold text-slate-400 mt-2 hover:text-slate-600">Back</button>
          </form>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="card-chunky p-6 space-y-4">
            <h2 className="text-2xl font-black text-center text-slate-700">Host Room</h2>
            
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">HOST NAME</label>
              <input type="text" placeholder="e.g. Prof. Alex" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-brand-purple outline-none" required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">TOPIC</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-brand-purple outline-none">
                <option value="mixed">🎲 Mixed Topics</option>
                <option value="Limits">Limits</option>
                <option value="Derivatives">Derivatives</option>
                <option value="Integrals">Integrals</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">GOOGLE SHEETS CSV LINK (OPTIONAL)</label>
              <input type="url" placeholder="https://docs.google.com/.../pub?output=csv" value={customSheetUrl} onChange={(e) => setCustomSheetUrl(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono focus:border-brand-purple outline-none" />
              <p className="text-[10px] text-slate-400 mt-1">Leave empty to use default sheet.</p>
            </div>

            <button type="submit" disabled={loading} className="btn-chunky btn-primary w-full py-4 text-xl rounded-xl font-black mt-2">
              {loading ? 'Fetching Questions...' : "Create Room 🏟️"}
            </button>

            <button type="button" onClick={() => setMode(null)} className="w-full font-bold text-slate-400 mt-2 hover:text-slate-600">Back</button>
          </form>
        )}
      </div>
    </div>
  );
}