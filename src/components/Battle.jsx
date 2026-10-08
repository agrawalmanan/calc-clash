import { useState, useCallback, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { api } from '../utils/api';
import OverallTimer from './Timer';
import { playSound } from '../utils/sounds';

export default function Battle() {
  const { room, currentQuestion, submitAnswer, score, dispatch, playerName, resetGame } = useGame();
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Leaderboard state for the finish screen
  const [leaderboard, setLeaderboard] = useState([]);

  const questions = room?.questions || [];
  const isFinished = currentQuestion >= questions.length && questions.length > 0;

  // Poll leaderboard when finished
  useEffect(() => {
    if (!isFinished) return;
    
    const fetchLb = async () => {
      const data = await api.getLeaderboard(room.code);
      if (data.success) setLeaderboard(data.leaderboard);
    };

    fetchLb();
    const interval = setInterval(fetchLb, 3000);
    return () => clearInterval(interval);
  }, [isFinished, room?.code]);

  const handleSelect = useCallback(async (idx) => {
    if (result || isSubmitting) return;
    setIsSubmitting(true);
    setSelected(idx);

    const res = await submitAnswer(currentQuestion, idx, 0);
    if (res) {
      setResult(res);
      
      // 🎵 PLAY SOUND BASED ON RESULT
      if (res.isCorrect) playSound('correct');
      else playSound('wrong');

      setTimeout(() => {
        setResult(null);
        setSelected(null);
        setIsSubmitting(false);
      }, 1400);
    } else {
      setIsSubmitting(false);
    }
  }, [result, isSubmitting, submitAnswer, currentQuestion]);

  const handleTimeUp = useCallback(() => {
    // Force finish if timer runs out
    dispatch({ type: 'GAME_FINISHED' });
  }, [dispatch]);

  // ========== FINISHED / REVIEW SCREEN ==========
  if (isFinished) {
    const me = room?.players?.find(p => p.name === playerName);
    const myAnswers = me?.answers || [];

    return (
      <div className="min-h-screen p-4 max-w-7xl mx-auto pt-8 pb-10">
        
        {/* Header */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="text-6xl mb-3">🏆</div>
          <h2 className="text-4xl font-black text-slate-800">Battle Complete!</h2>
          <div className="inline-block bg-brand-purple text-white px-8 py-2.5 rounded-full font-black text-2xl mt-4 shadow-lg border-4 border-white">
            {score} pts
          </div>
        </div>

        {/* Two Column Layout (Stacks on Mobile, Side-by-Side on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Answer Review (Takes up 2/3 space on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-black text-slate-600 text-xl mb-2">📋 Your Answer Review</h3>
            
            {questions.map((q, idx) => {
              const ans = myAnswers[idx];
              const isRight = ans?.correct;
              const selectedIdx = ans?.selected;

              return (
                <div key={idx} className={`card-chunky p-5 border-l-[6px] ${isRight ? 'border-l-green-500' : 'border-l-red-400'}`}>
                  <p className="font-bold text-slate-800 mb-3 text-[15px] leading-snug">
                    <span className="text-slate-400 mr-1">Q{idx + 1}.</span> {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className={`p-3 rounded-xl border ${isRight ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <span className="text-[10px] font-black uppercase tracking-wide opacity-60 block mb-1">Your Answer</span>
                      <span className={`font-bold ${isRight ? 'text-green-700' : 'text-red-600'}`}>
                        {selectedIdx >= 0 ? q.options?.[selectedIdx] : '⏱ Skipped'}
                        {isRight ? ' ✓' : ' ✗'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl border bg-green-50 border-green-200">
                      <span className="text-[10px] font-black uppercase tracking-wide text-green-600/70 block mb-1">Correct Answer</span>
                      <span className="font-bold text-green-700">{q.options?.[q.correct]}</span>
                    </div>
                  </div>

                  {!isRight && q.explanation && (
                    <p className="mt-3 text-xs text-slate-600 bg-blue-50 border border-blue-100 p-3 rounded-xl">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: Live Leaderboard (Takes up 1/3 space on desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <h3 className="font-black text-slate-600 text-xl mb-2 flex items-center gap-2">
                🌍 Live Leaderboard
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </h3>
              
              <div className="card-chunky p-4 bg-white/80 backdrop-blur-sm">
                <div className="space-y-2">
                  {leaderboard.map((p, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${p.name === playerName ? 'bg-brand-purple/10 border-brand-purple' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold w-6 text-center">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </span>
                        <div className="font-bold text-sm text-slate-700">
                          {p.name} {p.name === playerName && <span className="text-xs text-brand-purple">(You)</span>}
                        </div>
                      </div>
                      <div className="font-black text-brand-purple">
                        {p.score}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={resetGame}
                  className="btn-chunky btn-secondary w-full py-3 text-sm font-black rounded-xl mt-6"
                >
                  Exit to Menu 🏠
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ========== ACTIVE QUESTION ==========
  const question = questions[currentQuestion];

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 font-bold animate-pulse">Loading question...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-xl mx-auto pt-6">
      {/* Top bar */}
      <div className={`flex justify-between items-center mb-4 px-5 py-3 rounded-2xl shadow-sm border ${
        result?.currentStreak >= 3 ? 'bg-orange-50 border-orange-400 animate-fireGlow' : 'bg-white border-slate-100'
      }`}>
        <span className="font-black text-slate-400 text-sm">
          Q{currentQuestion + 1} <span className="text-slate-300">/ {questions.length}</span>
        </span>
        <div className="flex items-center gap-3">
          {result?.currentStreak >= 3 && (
            <span className="font-black text-orange-600 animate-bounce">🔥 STREAK x1.5!</span>
          )}
          <span className="font-black text-brand-purple bg-purple-50 px-4 py-1 rounded-full text-sm">
            ⭐ {score}
          </span>
        </div>
      </div>

      <OverallTimer
        startedAt={room?.startedAt}
        totalTimeLimit={room?.totalTimeLimit || questions.length * 45}
        onTimeUp={handleTimeUp}
      />

      {/* Question card */}
      <div className="card-chunky p-6 mb-5 animate-fadeIn">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug text-center">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {(question.options || []).map((opt, idx) => {
          let extra = 'btn-secondary';
          let badge = ['A', 'B', 'C', 'D'][idx];

          if (result) {
            if (idx === result.correctAnswer) {
              extra = '!bg-green-500 !text-white !border-green-600 !shadow-[0_6px_0_0_#16a34a]';
              badge = '✓';
            } else if (idx === selected) {
              extra = '!bg-red-500 !text-white !border-red-600 !shadow-[0_6px_0_0_#dc2626] animate-shake';
              badge = '✗';
            } else {
              extra = 'opacity-40';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={!!result || isSubmitting}
              className={`btn-chunky w-full p-4 sm:p-5 rounded-2xl font-bold text-left flex items-center gap-4 ${extra}`}
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                result && idx === result.correctAnswer ? 'bg-white/20' : result && idx === selected ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
              }`}>
                {badge}
              </span>
              <span className="text-base sm:text-lg">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}