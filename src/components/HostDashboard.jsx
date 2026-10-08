import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { api } from '../utils/api';
import OverallTimer from './Timer';

export default function HostDashboard() {
  const { room, dispatch, roomCode } = useGame();
  const [liveData, setLiveData] = useState(room);

  // Poll for live class progress
  useEffect(() => {
    const fetchStatus = async () => {
      const data = await api.getRoomStatus(roomCode);
      if (data.success) setLiveData(data.room);
    };
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [roomCode]);

  // Filter out the host from the students list
  const students = (liveData?.players || []).filter(p => p.name !== liveData?.host);
  const totalQuestions = liveData?.questions?.length || 10;

  return (
    <div className="min-h-screen bg-indigo-50 p-6 pt-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800">👨‍🏫 Teacher Dashboard</h1>
            <p className="text-brand-purple font-bold mt-1">Room Code: <span className="text-2xl tracking-widest">{roomCode}</span></p>
          </div>
          <div className="w-64">
            <OverallTimer 
              startedAt={liveData?.startedAt} 
              totalTimeLimit={liveData?.totalTimeLimit} 
              onTimeUp={() => dispatch({ type: 'GAME_FINISHED' })} 
            />
          </div>
        </div>

        {/* Live Grid */}
        <div className="card-chunky p-8 bg-white">
          <h2 className="text-xl font-black text-slate-700 mb-6 flex items-center gap-2">
            📊 Live Class Progress <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </h2>
          
          <div className="space-y-4">
            {students.length === 0 ? (
              <p className="text-slate-400 font-bold text-center py-10">No students joined yet...</p>
            ) : students.map((student, idx) => {
              const progressPct = (student.currentQuestion / totalQuestions) * 100;
              const isFinished = student.finishedAt !== null;

              return (
                <div key={idx} className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-6">
                  <div className="w-1/4">
                    <span className="font-bold text-lg text-slate-800">{student.name}</span>
                    <span className="block text-xs font-black text-brand-purple">{student.score} pts</span>
                  </div>
                  
                  <div className="flex-1 relative">
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isFinished ? 'bg-green-500' : 'bg-brand-blue'}`} 
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="w-24 text-right font-black text-slate-400">
                    {isFinished ? '✅ FINISHED' : `Q${student.currentQuestion} / ${totalQuestions}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}