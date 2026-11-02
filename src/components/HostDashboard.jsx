import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import Timer from './Timer';
import { LeaderboardCard } from './LeaderboardCard';
import { playSound } from '../utils/sounds';

export default function HostDashboard() {
  const { roomState, startGame, endGame } = useGame();
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Monitor timer for hardstop
  useEffect(() => {
    if (roomState?.endTime && Date.now() >= roomState.endTime) {
      setIsTimeUp(true);
    }
  }, [roomState?.endTime]);

  const handleTimeUp = () => {
    if (!isTimeUp) {
      setIsTimeUp(true);
      playSound('wrong'); 
    }
  };

  if (!roomState) return null;

  const playersList = Object.values(roomState.players || {});

  // LOBBY PHASE
  if (roomState.phase === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto w-full text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl border-4 border-slate-100 mb-8">
          <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">Join at CalcClash.com with code</h2>
          <div className="text-7xl sm:text-9xl font-black text-indigo-950 tracking-widest mb-8 drop-shadow-sm">
            {roomState.code}
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="bg-indigo-50 text-indigo-800 px-6 py-3 rounded-2xl font-black text-xl border-2 border-indigo-100">
              👥 {playersList.length} Players Joined
            </div>
          </div>

          <button 
            onClick={startGame}
            disabled={playersList.length === 0}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-black text-2xl px-12 py-5 rounded-2xl shadow-[0_6px_0_rgb(5,150,105)] active:shadow-[0_0px_0_rgb(5,150,105)] active:translate-y-1 transition-all"
          >
            Start Battle Now
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {playersList.map(p => (
            <div key={p.id} className="bg-white px-5 py-3 rounded-2xl font-bold text-slate-700 shadow-sm border-2 border-slate-100 flex items-center gap-3 animate-fadeIn">
              <img src={p.avatar} alt="avatar" className="w-8 h-8 rounded-full bg-slate-100" />
              {p.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // LEADERBOARD PHASE
  if (roomState.phase === 'leaderboard') {
    return (
      <div className="max-w-4xl mx-auto w-full pb-12">
        <h2 className="text-5xl font-black text-indigo-950 text-center mb-8 tracking-tight drop-shadow-sm">Final Rankings</h2>
        <LeaderboardCard players={playersList.sort((a, b) => b.score - a.score)} />
      </div>
    );
  }

  // PLAYING PHASE (GOD MODE)
  const totalQuestions = roomState.questions.length;

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-6 border-4 border-slate-100 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Live Arena</h2>
          <div className="text-4xl font-black text-indigo-900 tracking-widest">{roomState.code}</div>
        </div>
        
        <div className="flex gap-4 items-center">
          <Timer endTime={roomState.endTime} onTimeUp={handleTimeUp} />
          <button 
            onClick={endGame}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-xl shadow-[0_4px_0_rgb(159,18,57)] active:shadow-[0_0px_0_rgb(159,18,57)] active:translate-y-1 transition-all"
          >
            End Game Early
          </button>
        </div>
      </div>

      {/* HOST TIME UP BANNER */}
      {isTimeUp && (
        <div className="mb-8 bg-rose-50 border-4 border-rose-500 text-rose-800 px-6 py-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <span className="text-4xl">⏰</span>
            <div>
              <h3 className="font-black text-2xl tracking-tight">TIME IS UP!</h3>
              <p className="font-semibold text-rose-600/80">Students can no longer submit answers.</p>
            </div>
          </div>
          <button 
            onClick={endGame}
            className="bg-rose-600 text-white font-black px-8 py-4 rounded-xl shadow-[0_4px_0_rgb(159,18,57)] active:shadow-[0_0px_0_rgb(159,18,57)] active:translate-y-1 transition-all text-lg"
          >
            Show Leaderboard Now
          </button>
        </div>
      )}

      {/* Live Student Progress */}
      <div className="bg-white rounded-3xl p-8 border-4 border-slate-100 shadow-xl">
        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <span>📡</span> Live Student Progress
        </h3>
        
        <div className="space-y-6">
          {playersList.map(player => {
            const answeredCount = Object.keys(player.answers || {}).length;
            const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
            const isDone = answeredCount === totalQuestions;
            
            return (
              <div key={player.id} className="relative">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-3">
                    <img src={player.avatar} alt="avatar" className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200" />
                    <div>
                      <span className="font-black text-slate-800 block leading-none">{player.name}</span>
                      <span className="text-xs font-bold text-slate-400">Score: {player.score}</span>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-slate-500">
                    {isDone ? '✅ Finished' : `${answeredCount} / ${totalQuestions} Qs`}
                  </div>
                </div>
                
                {/* Chunky Progress Bar */}
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${isDone ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}

          {playersList.length === 0 && (
            <div className="text-center py-8 text-slate-400 font-bold">
              No players found in this arena.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}