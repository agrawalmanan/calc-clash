import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CalcWizardMascot, LimmyMascot, DerivyMascot, IntegraloMascot } from './Mascots';

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
    createRoom(name.trim(), topic, 10, customSheetUrl.trim() || undefined);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      
      {/* 🎨 Grainy Mascot Characters Background Floaties */}
      <div className="absolute top-12 left-4 md:left-20 opacity-90 animate-float pointer-events-none">
        <LimmyMascot className="w-24 h-28 md:w-32 md:h-32" />
      </div>
      <div className="absolute bottom-12 right-4 md:right-20 opacity-90 animate-float-delayed pointer-events-none">
        <DerivyMascot className="w-24 h-28 md:w-32 md:h-32" />
      </div>
      <div className="absolute top-1/3 right-6 opacity-30 animate-float hidden lg:block pointer-events-none">
        <IntegraloMascot className="w-28 h-28" />
      </div>

      {/* Hero Title */}
      <div className="text-center mb-6 z-10 flex flex-col items-center animate-fadeIn">
        <CalcWizardMascot className="w-32 h-32 md:w-40 md:h-40 mb-2 hover:scale-105 transition-transform" />

        <div className="inline-block bg-white px-5 py-1.5 rounded-full shadow-sm text-xs font-black text-brand-purple mb-3 border border-purple-100">
          🎓 BTech First Year Engineering Calculus
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-800">
          Calc<span className="text-brand-purple">Clash</span> ⚔️
        </h1>
        <p className="text-slate-500 font-bold text-base md:text-lg mt-1">
          Real-Time Calculus Battle Arena
        </p>
      </div>

      <div className="w-full max-w-sm z-10">
        {!mode && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <button
              onClick={() => setMode('join')}
              className="btn-chunky btn-primary py-4 text-xl font-black rounded-2xl w-full flex items-center justify-center gap-3 shadow-indigo-500/30 shadow-lg"
            >
              <span>🎮</span> Join Battle
            </button>
            <button
              onClick={() => setMode('create')}
              className="btn-chunky btn-secondary py-3.5 text-lg font-black rounded-2xl w-full flex items-center justify-center gap-3"
            >
              <span>👨‍🏫</span> Host Game
            </button>
          </div>
        )}

        {mode === 'join' && (
          <form onSubmit={(e) => { e.preventDefault(); joinRoom(roomCode, name); }} className="card-chunky p-6 space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-black text-center text-slate-800">🎮 Join Battle</h2>
            <div>
              <label className="text-xs font-black text-slate-400 block mb-1">NICKNAME</label>
              <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-brand-purple outline-none" required />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 block mb-1">ROOM CODE</label>
              <input type="text" placeholder="XYZ123" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} maxLength={6} className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-black text-center text-2xl tracking-[0.3em] focus:border-brand-purple outline-none uppercase" required />
            </div>
            <button type="submit" disabled={loading} className="btn-chunky btn-primary w-full py-4 text-xl rounded-xl font-black mt-2">
              {loading ? 'Joining...' : "Let's Go! 🚀"}
            </button>
            <button type="button" onClick={() => setMode(null)} className="w-full font-bold text-slate-400 mt-2 hover:text-slate-600 text-sm">← Back</button>
          </form>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="card-chunky p-6 space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-black text-center text-slate-800">👨‍🏫 Host Game</h2>
            <div>
              <label className="text-xs font-black text-slate-400 block mb-1">HOST NAME</label>
              <input type="text" placeholder="e.g. Prof. Alex" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-brand-purple outline-none" required />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 block mb-1">TOPIC</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-brand-purple outline-none">
                <option value="mixed">🎲 Mixed Topics</option>
                <option value="Limits">Limits</option>
                <option value="Derivatives">Derivatives</option>
                <option value="Integrals">Integrals</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 block mb-1">GOOGLE SHEETS CSV LINK (OPTIONAL)</label>
              <input type="url" placeholder="https://docs.google.com/.../pub?output=csv" value={customSheetUrl} onChange={(e) => setCustomSheetUrl(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono focus:border-brand-purple outline-none" />
              <p className="text-[10px] font-semibold text-slate-400 mt-1">Leave blank to use default configured sheet.</p>
            </div>
            <button type="submit" disabled={loading} className="btn-chunky btn-primary w-full py-3.5 text-xl rounded-xl font-black mt-2">
              {loading ? 'Creating...' : "Create Room 🏟️"}
            </button>
            <button type="button" onClick={() => setMode(null)} className="w-full font-bold text-slate-400 mt-2 hover:text-slate-600 text-sm">← Back</button>
          </form>
        )}
      </div>
    </div>
  );
}