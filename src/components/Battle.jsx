import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import Timer from './Timer';

export default function Battle() {
  const { room, currentQuestion, submitAnswer, score } = useGame();
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  const questions = room?.questions || [];
  const question = questions[currentQuestion];

  useEffect(() => {
    setSelected(null);
    setResult(null);
    setStartTime(Date.now());
  }, [currentQuestion]);

  const handleSelect = useCallback(async (idx) => {
    if (result) return; // Prevent double submits
    setSelected(idx);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const res = await submitAnswer(currentQuestion, idx, timeTaken);
    if (res) {
      setResult(res);
    }
  }, [result, startTime, submitAnswer, currentQuestion]);

  if (!question) return null;

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-xl mx-auto justify-center">
      {/* Top Info Bar */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700">
          Q{currentQuestion + 1} of {questions.length} • {question.topic}
        </span>
        <span className="text-sm font-bold text-indigo-400">Score: {score}</span>
      </div>

      {/* Timer */}
      <div className="mb-6">
        <Timer duration={question.timeLimit || 30} onTimeUp={() => handleSelect(-1)} isActive={!result} key={currentQuestion} />
      </div>

      {/* Question Card */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-4 animate-fadeIn">
        <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-slate-100">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {question.options?.map((opt, idx) => {
          let style = "bg-slate-800 border-slate-700 hover:border-indigo-500";
          if (result) {
            if (idx === result.correctAnswer) style = "bg-emerald-900/40 border-emerald-500 text-emerald-200";
            else if (idx === selected) style = "bg-rose-900/40 border-rose-500 text-rose-200 animate-shake";
            else style = "bg-slate-900/40 border-slate-800 opacity-50";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={!!result}
              className={`w-full p-4 text-left rounded-xl border font-medium transition-all flex items-center justify-between ${style}`}
            >
              <span>{opt}</span>
              <span className="text-xs opacity-50 font-mono">[{['A','B','C','D'][idx]}]</span>
            </button>
          );
        })}
      </div>

      {/* Answer Explanation Banner */}
      {result && (
        <div className={`p-4 rounded-xl text-sm animate-fadeIn ${result.isCorrect ? 'bg-emerald-950/60 border border-emerald-600 text-emerald-200' : 'bg-rose-950/60 border border-rose-600 text-rose-200'}`}>
          <div className="font-bold mb-1">
            {result.isCorrect ? `🎯 Correct! +${result.pointsEarned} pts` : '❌ Incorrect!'}
          </div>
          <p className="text-xs opacity-90">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}