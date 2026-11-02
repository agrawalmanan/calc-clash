import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function Home() {
  const { createRoom, joinRoom, loading } = useGame();
  
  // Host state
  const [hostName, setHostName] = useState('');
  const [timeLimit, setTimeLimit] = useState(7); // Default 7 minutes
  
  // Player state
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (hostName.trim()) {
      createRoom(hostName, timeLimit);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      joinRoom(playerName, roomCode.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-6xl md:text-8xl font-black text-indigo-950 mb-4 tracking-tighter drop-shadow-sm">
          Calc<span className="text-indigo-600">Clash</span>
        </h1>
        <p className="text-xl text-slate-600 font-semibold max-w-2xl mx-auto">
          The ultimate real-time calculus battle arena.
        </p>
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Host Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-slate-100 flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">👑</span>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Host a Battle</h2>
            <p className="text-slate-500 font-medium mb-8">Create an arena for your students to compete in real-time.</p>
            
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">Host Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Prof. Smith"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white font-semibold outline-none transition-all"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                />
              </div>

              <div className="text-left mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Total Time Limit</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white font-semibold text-slate-700 outline-none transition-all cursor-pointer"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                >
                  <option value={3}>3 Minutes</option>
                  <option value={5}>5 Minutes</option>
                  <option value={7}>7 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={0}>No Time Limit (∞)</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-xl shadow-[0_4px_0_rgb(67,56,202)] active:shadow-[0_0px_0_rgb(67,56,202)] active:translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Arena...' : 'Create Arena'}
              </button>
            </form>
          </div>
        </div>

        {/* Player Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-slate-100 flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">⚔️</span>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Join a Battle</h2>
            <p className="text-slate-500 font-medium mb-8">Enter your teacher's room code to enter the arena.</p>
            
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="text-left">
                <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Alex"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 bg-white font-semibold outline-none transition-all"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>
              <div className="text-left mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Room Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. A1B2"
                  maxLength={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 bg-white font-black text-lg uppercase tracking-widest outline-none transition-all placeholder:font-semibold placeholder:tracking-normal"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg py-4 rounded-xl shadow-[0_4px_0_rgb(5,150,105)] active:shadow-[0_0px_0_rgb(5,150,105)] active:translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-auto"
              >
                {loading ? 'Joining...' : 'Enter Arena'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}