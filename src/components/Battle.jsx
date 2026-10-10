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

          {/* RIGHT: LeaderboardCard */}
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
        className={`flex justify-between items-center mb-4 px-5 py-3 rounded-2xl shadow-sm border ${
          streakOnFire
            ? 'bg-orange-50 border-orange-400 animate-fireGlow'
            : 'bg-white border-slate-100'
        }`}
      >
        <span className="font-black text-slate-400 text-sm">
          Q{currentQuestion + 1} <span className="text-slate-300">/ {questions.length}</span>
        </span>
        <div className="flex items-center gap-3">
          {streakOnFire && (
            <span className="font-black text-orange-600 animate-bounce text-sm">
              🔥 STREAK x1.5!
            </span>
          )}
          <span className="font-black text-brand-purple bg-purple-50 px-4 py-1 rounded-full text-sm">
            ⭐ {score}
          </span>
        </div>
      </div>

      <OverallTimer
        totalTimeLimit={room?.totalTimeLimit || questions.length * 45}
        onTimeUp={handleTimeUp}
      />

      {/* Optional Image */}
      {question.imageUrl && (
        <div className="mb-4 rounded-2xl overflow-hidden border-4 border-slate-200 shadow-sm bg-white">
          <img
            src={question.imageUrl}
            alt="Math Diagram"
            className="w-full h-auto object-contain max-h-64 mx-auto"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
      )}

      {/* Question Text */}
      <div className="card-chunky p-6 mb-5 animate-fadeIn">
        <div className="text-xs font-black text-brand-purple uppercase tracking-wider mb-2 text-center">
          {question.topic || 'Calculus'} ·{' '}
          {question.type === 'NUM' ? 'Type the Number' : 'Select Option'}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug text-center">
          {question.question}
        </h2>
      </div>

      {/* Options / Numeric Input */}
      {question.type === 'NUM' ? (
        <div className="flex flex-col gap-3 animate-fadeIn">
          <input
            type="number"
            step="any"
            value={numInput}
            onChange={(e) => setNumInput(e.target.value)}
            disabled={!!result || isSubmitting}
            placeholder="Type your answer here..."
            className="w-full p-5 rounded-2xl border-4 border-slate-100 bg-white text-slate-900 text-2xl font-black text-center placeholder:text-slate-300 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/20 outline-none transition-all disabled:opacity-50 shadow-inner"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && numInput.trim() !== '') handleSelect(numInput);
            }}
          />
          <button
            onClick={() => handleSelect(numInput)}
            disabled={!!result || isSubmitting || numInput.trim() === ''}
            className="btn-chunky btn-primary w-full py-4 text-xl font-black rounded-2xl"
          >
            Submit Answer
          </button>

          {result && (
            <div
              className={`p-4 rounded-xl text-center font-black mt-2 ${
                result.isCorrect
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700 animate-shake'
              }`}
            >
              {result.isCorrect
                ? '✓ CORRECT!'
                : `✗ WRONG! (Answer was ${result.correctAnswer})`}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`grid gap-3 ${
            question.options?.filter((o) => o).length > 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {(question.options || [])
            .filter((opt) => opt && opt.trim() !== '')
            .map((opt, idx) => {
              let extra = 'btn-secondary';
              let badge = ['A', 'B', 'C', 'D'][idx];

              if (result) {
                if (idx === result.correctAnswer) {
                  extra =
                    '!bg-green-500 !text-white !border-green-600 !shadow-[0_6px_0_0_#16a34a]';
                  badge = '✓';
                } else if (idx === selected) {
                  extra =
                    '!bg-red-500 !text-white !border-red-600 !shadow-[0_6px_0_0_#dc2626] animate-shake';
                  badge = '✗';
                } else {
                  extra = 'opacity-40';
                }
              }

              return (
                <button
                  key={`${currentQuestion}-${idx}`}
                  onClick={() => handleSelect(idx)}
                  disabled={!!result || isSubmitting}
                  className={`btn-chunky w-full p-4 sm:p-5 rounded-2xl font-bold text-left flex items-center gap-4 ${extra}`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      result && (idx === result.correctAnswer || idx === selected)
                        ? 'bg-white/20'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {badge}
                  </span>
                  <span className="text-base sm:text-lg">{opt}</span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}