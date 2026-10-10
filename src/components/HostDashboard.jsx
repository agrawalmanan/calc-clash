import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { api } from '../utils/api';
import OverallTimer from './Timer';
import { LeaderboardCard } from './ui/LeaderboardCard';

function getAvatar(name) {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}&backgroundColor=c0aede,ffdfbf,b6e3f4,d1d4f9`;
}

export default function HostDashboard() {
  const { room, dispatch, roomCode, resetGame } = useGame();
  const [liveData, setLiveData] = useState(room);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statusRes, lbRes] = await Promise.all([
          api.getRoomStatus(roomCode),
          api.getLeaderboard(roomCode)
        ]);
        if (statusRes.success) setLiveData(statusRes.room);
        if (lbRes.success) setLeaderboard(lbRes.leaderboard || []);
      } catch (e) {
        console.error(e);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 2000);
    return () => clearInterval(interval);
  }, [roomCode]);

  const students = (liveData?.players || []).filter((p) => p.name !== liveData?.host);
  const totalQuestions = liveData?.questions?.length || 10;

  const podiumRankings = leaderboard.slice(0, 3).map((p, idx) => ({
    userId: p.name,
    userName: p.name,
    rank: idx + 1,
    value: p.score,
    avatarUrl: getAvatar(p.name)
  }));

  const rankings = leaderboard.map((p, idx) => {
    let byline = "1st Year BTech";
    if (p.score >= 500) byline = "🔥 Calculus Master";
    else if (p.score >= 300) byline = "⚡ Limit Slayer";
    else if (p.score >= 100) byline = "📐 Derivative Novice";

    return {
      userId: p.name,
      rank: idx + 1,
      userName: p.name,
      byline: byline,
      value: p.score,
      displayed: true
    };
  });

  const currentDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-800">👨‍🏫 Teacher Dashboard</h1>
            <p className="text-brand-purple font-bold mt-1">
              Room Code: <span className="text-2xl tracking-[0.3em] font-black">{roomCode}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {students.length} student{students.length !== 1 ? 's' : ''} connected
            </p>
          </div>
          <div className="w-full md:w-72">
            <OverallTimer
              totalTimeLimit={liveData?.totalTimeLimit || totalQuestions * 45}
              onTimeUp={() => dispatch({ type: 'GAME_FINISHED' })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* LEFT: Live Progress */}
          <div className="xl:col-span-2 card-chunky p-6 bg-white">
            <h2 className="text-lg font-black text-slate-700 mb-5 flex items-center gap-2">
              📊 Live Student Progress
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            </h2>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {students.length === 0 ? (
                <p className="text-slate-400 font-bold text-center py-16">
                  Waiting for students to join...
                </p>
              ) : (
                students.map((student, idx) => {
                  const progressPct = Math.min(100, (student.currentQuestion / totalQuestions) * 100);
                  const isFinished = student.finishedAt !== null;

                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                      <img
                        src={getAvatar(student.name)}
                        alt={student.name}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-slate-800 truncate">{student.name}</span>
                          <span className="text-xs font-black text-brand-purple">{student.score} pts</span>
                        </div>
                        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isFinished ? 'bg-emerald-500' : 'bg-brand-blue'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1">
                          {isFinished ? '✅ Finished' : `Q${student.currentQuestion} / ${totalQuestions}`}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={resetGame}
              className="btn-chunky btn-secondary w-full py-3 text-sm font-black rounded-xl mt-6"
            >
              End Session & Exit 🏠
            </button>
          </div>

          {/* RIGHT: LeaderboardCard */}
          <div className="xl:col-span-3">
            <LeaderboardCard
              title="Live Battle Leaderboard"
              fromDate={currentDateStr}
              podiumRankings={podiumRankings}
              rankings={rankings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}