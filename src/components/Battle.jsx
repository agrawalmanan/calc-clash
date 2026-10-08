import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import Timer from './Timer';

export default function Battle() {
  const { room, currentQuestion, submitAnswer, score, dispatch, playerName } = useGame();
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const questions = room?.questions || [];
  const isFinished = currentQuestion >= questions.length && questions.length > 0;

  useEffect(() => {
    setSelected(null);
    setResult(null);
  }, [currentQuestion]);

  const handleSelect = useCallback(async (idx) => {
    if (result) return;
    setSelected(idx);
    const res = await submitAnswer(currentQuestion, idx, 10); // Standardized time for simplicity
    if (res) setResult(res);
  }, [result, submitAnswer, currentQuestion]);

  // 🎉 DETAILED RESULTS SCREEN
  if (isFinished) {
    const me = room?.players?.find(p => p.name === playerName);
    const myAnswers = me?.answers || [];

    return (
      <div className="min-h-screen p-4 max-w-2xl mx-auto pt-10 pb-24">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-black text-slate-800">Battle Complete!</h2>
          <div className="inline-block bg-brand-purple text-white px-6 py-2 rounded-full font-black text-xl mt-3 shadow-md">
            Score: {score} pts
          </div>
        </div>

        <h3 className="font-black text-slate-700 text-xl mb-4">Your Results:</h3>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ans = myAnswers[idx];
            const isRight = ans?.correct;
            
            return (
              <div key={idx} className={`card-chunky p-5 border-l-8 ${isRight ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <p className="font-bold text-slate-800 mb-2">Q{idx + 1}: {q.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-xs font-bold mb-1">YOUR ANSWER</span>
                    <span className={`font-bold ${isRight ? 'text-green-600' : 'text-red-600'}`}>
                      {ans?.selected >= 0 ? q.options[ans.selected] : 'Skipped / Timeout'}
                    </span>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <span className="text-green-600/70 block text-xs font-bold mb-1">CORRECT ANSWER</span>
                    <span className="font-bold text-green-700">{q.options[q.correct]}</span>
                  </div>
                </div>
                {!isRight && q.explanation && (
                  <div className="mt-3 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => dispatch({ type: 'GAME_FINISHED' })}
          className="btn-chunky btn-primary w-full py-4 text-xl font-black rounded-2xl mt-8 fixed bottom-4 max-w-2xl"
        >
          View Global Leaderboard 🌍
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-xl mx-auto pt-10">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <span className="font-black text-slate-400">
          Q{currentQuestion + 1} <span className="text-slate-300">/ {questions.length}</span>
        </span>
        <span className="font-black text-brand-purple bg-brand-purple/10 px-4 py-1 rounded-full">
          ⭐ {score}
        </span>
      </div>

      <Timer 
        duration={question.timeLimit || 30} 
        onTimeUp={() => handleSelect(-1)} 
        isActive={!result} 
        questionIndex={currentQuestion} 
      />

      <div className="card-chunky p-8 my-6 bg-white">
        <h2 className="text-2xl font-bold text-slate-800 leading-snug text-center">
          {question.question}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {question.options?.map((opt, idx) => {
          let stateClass = "btn-secondary";
          let icon = "";

          if (result) {
            if (idx === result.correctAnswer) {
              stateClass = "!bg-green-500 !text-white !border-green-600 !shadow-[0_6px_0_0_#16a34a]";
              icon = "✓";
            } else if (idx === selected) {
              stateClass = "!bg-red-500 !text-white !border-red-600 !shadow-[0_6px_0_0_#dc2626] animate-shake";
              icon = "✗";
            } else {
              stateClass = "opacity-40";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={!!result}
              className={`btn-chunky w-full p-5 rounded-2xl font-bold text-lg text-left flex justify-between items-center ${stateClass}`}
            >
              <span>{opt}</span>
              {icon && <span className="font-black">{icon}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}