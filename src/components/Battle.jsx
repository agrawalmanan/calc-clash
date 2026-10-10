import { useState, useCallback, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { api } from '../utils/api';
import { playSound } from '../utils/sounds';
import OverallTimer from './Timer';
import { LeaderboardCard } from './ui/LeaderboardCard';

export default function Battle() {
  const {
    room,
    currentQuestion,
    submitAnswer,
    nextQuestion,
    score,
    myAnswerLog,
    playerName,
    resetGame,
    dispatch
  } = useGame();

  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [numInput, setNumInput] = useState('');

  const questions = room?.questions || [];
  const isFinished = currentQuestion >= questions.length && questions.length > 0;

  // Live leaderboard when finished
  useEffect(() => {
    if (!isFinished || !room?.code) return;

    const fetchLb = async () => {
      try {
        const data = await api.getLeaderboard(room.code);
        if (data.success) setLeaderboard(data.leaderboard || []);
      } catch {}
    };

    fetchLb();
    const t = setInterval(fetchLb, 2500);
    return () => clearInterval(t);
  }, [isFinished, room?.code]);

  // Play victory fanfare once when results open
  useEffect(() => {
    if (isFinished) playSound('victory');
  }, [isFinished]);

  const handleSelect = useCallback(
    async (idx) => {
      if (result || isSubmitting) return;
      setIsSubmitting(true);
      setSelected(idx);

      const qIndex = currentQuestion;
      const res = await submitAnswer(qIndex, idx);

      if (res?.success) {
        setResult(res);
        if (res.isCorrect) playSound('correct');
        else playSound('wrong');

        setTimeout(() => {
          setResult(null);
          setSelected(null);
          setNumInput('');
          setIsSubmitting(false);
          nextQuestion();
        }, 1400);
      } else {
        setIsSubmitting(false);
        setSelected(null);
      }
    },
    [result, isSubmitting, currentQuestion, submitAnswer, nextQuestion]
  );

  const handleTimeUp = useCallback(() => {
    dispatch({ type: 'GAME_FINISHED' });
  }, [dispatch]);

  // ===================== REVIEW + LEADERBOARD =====================
  if (isFinished) {
    const podiumRankings = leaderboard.slice(0, 3).map((p, idx) => ({
      userId: p.name,
      userName: p.name,
      rank: idx + 1,
      value: p.score
    }));

    const rankings = leaderboard.map((p, idx) => {
      let byline = '1st Year BTech';
      if (p.score >= 500) byline = '🔥 Calculus Master';
      else if (p.score >= 300) byline = '⚡ Limit Slayer';
      else if (p.score >= 100) byline = '📐 Derivative Novice';

      return {
        userId: p.name,
        userName: p.name,
        rank: idx + 1,
        byline,
        value: p.score,
        displayed: true
      };
    });

    return (
      <div className="min-h-screen p-4 max-w-7xl mx-auto pt-8 pb-10">
        <div className="text-center mb-10 animate-fadeIn">
          <div className="text-6xl mb-3">🏆</div>
          <h2 className="text-4xl font-black text-slate-800">Battle Complete!</h2>
          <div className="inline-block bg-brand-purple text-white px-8 py-2.5 rounded-full font-black text-2xl mt-4 shadow-lg border-4 border-white">
            {score} pts
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Answer Review */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-black text-slate-600 text-xl mb-2">📋 Your Answer Review</h3>

            {questions.map((q, idx) => {
              const ans = myAnswerLog.find((a) => a.questionIndex === idx);
              const isRight = ans?.correct;
              const selectedVal = ans?.selected;
              const isNum = q.type === 'NUM';

              return (
                <div
                  key={idx}
                  className={`card-chunky p-5 border-l-[6px] ${
                    !ans
                      ? 'border-l-slate-300'
                      : isRight
                      ? 'border-l-green-500'
                      : 'border-l-red-400'
                  }`}
                >
                  <p className="font-bold text-slate-800 mb-3 text-[15px] leading-snug">
                    <span className="text-slate-400 mr-1">Q{idx + 1}.</span> {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div
                      className={`p-3 rounded-xl border ${
                        !ans
                          ? 'bg-slate-50 border-slate-200'
                          : isRight
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wide opacity-60 block mb-1">
                        Your Answer
                      </span>
                      <span
                        className={`font-bold ${
                          !ans
                            ? 'text-slate-400'
                            : isRight
                            ? 'text-green-700'
                            : 'text-red-600'
                        }`}
                      >
                        {!ans
                          ? '⏱ Skipped'
                          : isNum
                          ? selectedVal
                          : q.options?.[selectedVal]}
                        {ans && (isRight ? ' ✓' : ' ✗')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border bg-green-50 border-green-200">
                      <span className="text-[10px] font-black uppercase tracking-wide text-green-600/70 block mb-1">
                        Correct Answer
                      </span>
                      <span className="font-bold text-green-700">
                        {isNum ? q.correct : q.options?.[q.correct] ?? '—'}
                      </span>
                    </div>
                  </div>

                  {ans && !isRight && (ans.explanation || q.explanation) && (
                    <p className="mt-3 text-xs text-slate-600 bg-blue-50 border border-blue-100 p-3 rounded-xl">
                      💡 {ans.explanation || q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: Trophy LeaderboardCard */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <LeaderboardCard
                title="Live Leaderboard"
                currentUserId={playerName}
                podiumRankings={podiumRankings}
                rankings={rankings}
              />

              <button
                onClick={resetGame}
                className="btn-chunky btn-secondary w-full py-3 text-sm font-black rounded-xl"
              >
                Exit to Menu 🏠
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== ACTIVE QUESTION =====================
  const question = questions[currentQuestion];

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 font-bold animate-pulse">Loading question...</p>
      </div>
    );
  }

  const streakOnFire = (result?.currentStreak || 0) >= 3;

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-xl mx-auto pt-6">
      {/* Top bar */}
      <div