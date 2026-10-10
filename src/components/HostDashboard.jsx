import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { api } from '../utils/api';
import OverallTimer from './Timer';

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

  // Podium = top 3
  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-800">👨‍🏫 Teacher Dashboard</h1>
            <p className="text-brand-purple font-bold mt-1">
              Room Code:{' '}
              <span className="text-2xl tracking-[0.3em] font-black">{roomCode}</span>
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
              📊 Live Class Progress
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            </h2>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {students.length === 0 ? (
                <p className="text-slate-400 font-bold text-center py-16">
                  Waiting for students...
                </p>
              ) : (
                students.map((student, idx) => {
                  const progressPct = Math.min(
                    100,
                    (student.currentQuestion / totalQuestions) * 100
                  );
                  const isFinished = student.finishedAt !== null;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-4"
                    >
                      <img
                        src={getAvatar(student.name)}
                        alt={student.name}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-slate-800 truncate">
                            {student.name}
                          </span>
                          <span className="text-xs font-black text-brand-purple">
                            {student.score} pts
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isFinished ? 'bg-green-500' : 'bg-brand-blue'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1">
                          {isFinished
                            ? '✅ Finished'
                            : `Q${student.currentQuestion} / ${totalQuestions}`}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Trophy-style Live Leaderboard */}
          <div className="xl:col-span-3 card-chunky p-6 bg-white overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">🏆 Live Leaderboard</h2>
                <p className="text-xs text-slate-400 font-bold">
                  Updates every 2 seconds · Equal weight 100 pts / Q
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                LIVE
              </span>
            </div>

            {/* PODIUM */}
            {podium.length > 0 && (
              <div className="flex items-end justify-center gap-3 mb-8 px-2">
                {/* 2nd */}
                {podium[1] && (
                  <div className="flex flex-col items-center w-28">
                    <img
                      src={getAvatar(podium[1].name)}
                      className="w-14 h-14 rounded-full border-4 border-slate-300 bg-white shadow-md mb-2"
                      alt=""
                    />
                    <div className="text-2xl mb-1">🥈</div>
                    <div className="bg-slate-100 rounded-t-2xl w-full pt-3 pb-4 px-2 text-center border border-slate-200">
                      <p className="font-black text-sm text-slate-800 truncate">
                        {podium[1].name}
                      </p>
                      <p className="font-black text-brand-purple text-lg">
                        {podium[1].score}
                      </p>
                    </div>
                  </div>
                )}

                {/* 1st */}
                {podium[0] && (
                  <div className="flex flex-col items-center w-32 -mt-4">
                    <div className="relative">
                      <img
                        src={getAvatar(podium[0].name)}
                        className="w-20 h-20 rounded-full border-4 border-yellow-400 bg-white shadow-lg mb-2"
                        alt=""
                      />
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
                        👑
                      </span>
                    </div>
                    <div className="text-3xl mb-1">🥇</div>
                    <div className="bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-t-2xl w-full pt-4 pb-5 px-2 text-center border-2 border-yellow-300 shadow-md">
                      <p className="font-black text-sm text-slate-900 truncate">
                        {podium[0].name}
                      </p>
                      <p className="font-black text-yellow-600 text-xl">
                        {podium[0].score}
                      </p>
                    </div>
                  </div>
                )}

                {/* 3rd */}
                {podium[2] && (
                  <div className="flex flex-col items-center w-28">
                    <img
                      src={getAvatar(podium[2].name)}
                      className="w-14 h-14 rounded-full border-4 border-orange-300 bg-white shadow-md mb-2"
                      alt=""
                    />
                    <div className="text-2xl mb-1">🥉</div>
                    <div className="bg-orange-50 rounded-t-2xl w-full pt-3 pb-4 px-2 text-center border border-orange-200">
                      <p className="font-black text-sm text-slate-800 truncate">
                        {podium[2].name}
                      </p>
                      <p className="font-black text-orange-600 text-lg">
                        {podium[2].score}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FULL RANKINGS LIST */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {leaderboard.length === 0 && (
                <p className="text-center text-slate-400 font-bold py-10">
                  Scores will appear as students answer...
                </p>
              )}

              {leaderboard.map((p, idx) => (
                <div
                  key={p.name + idx}
                  className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                    idx < 3
                      ? 'bg-indigo-50/80 border-indigo-100'
                      : 'bg-slate-50 border-slate-100 hover:bg-white'
                  }`}
                >
                  <span className="w-8 text-center font-black text-slate-400 text-sm">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>

                  <img
                    src={getAvatar(p.name)}
                    alt=""
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-white"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {p.correctCount ?? '—'}/{p.totalQuestions ?? totalQuestions} correct
                    </p>
                  </div>

                  <div className="font-black text-lg text-brand-purple tabular-nums">
                    {p.score}
                    <span className="text-xs text-slate-400 font-bold ml-0.5">pts</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={resetGame}
              className="btn-chunky btn-secondary w-full py-3 text-sm font-black rounded-xl mt-6"
            >
              End Session & Exit 🏠
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}