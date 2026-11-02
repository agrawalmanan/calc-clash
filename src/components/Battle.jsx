import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import Timer from './Timer';
import { LeaderboardCard } from './LeaderboardCard';
import { playSound } from '../utils/sounds';

export default function Battle() {
  const { roomState, playerState, submitAnswer } = useGame();
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [numInput, setNumInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [myAnswerLog, setMyAnswerLog] = useState({}); // Track local answers for post-game review

  // Immediate check if time expired upon mount
  useEffect(() => {
    if (roomState?.endTime && Date.now() >= roomState.endTime) {
      setIsTimeUp(true);
    }
  }, [roomState?.endTime]);

  const handleTimeUp = () => {
    if (!isTimeUp) {
      setIsTimeUp(true);
      playSound('wrong'); // Buzzer for hardstop
    }
  };

  const handleAnswerSubmit = async (answer) => {
    if (feedback || isTimeUp) return; // Prevent double submit or answering after time
    setSelectedOption(answer);

    const qIndex = roomState.currentQuestionIndex;
    const currentQ = roomState.questions[qIndex];
    
    let isCorrect = false;
    if (currentQ.Type === 'NUM') {
      const numAns = parseFloat(answer);
      const correctNum = parseFloat(currentQ['Correct Answer']);
      isCorrect = Math.abs(numAns - correctNum) <= 0.01;
    } else {
      isCorrect = answer.toString() === currentQ['Correct Answer'].toString();
    }

    // Base 100 points. Streak >= 3 gives 1.5x (150 points).
    const streak = playerState?.streak || 0;
    const points = isCorrect ? (streak >= 2 ? 150 : 100) : 0;

    playSound(isCorrect ? 'correct' : 'wrong');
    setFeedback(isCorrect ? 'correct' : 'wrong');

    // Save to local log for the review screen
    setMyAnswerLog(prev => ({ ...prev, [qIndex]: { answer, isCorrect } }));

    // Send to server
    await submitAnswer(qIndex, answer, isCorrect, points);

    // 1.4s visual delay before moving to next question
    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      setNumInput('');
    }, 1400);
  };

  if (!roomState) return null;

  // LEADERBOARD & REVIEW PHASE
  if (roomState.phase === 'leaderboard') {
    return (
      <div className="max-w-4xl mx-auto w-full pb-12">
        <h2 className="text-4xl font-black text-indigo-950 text-center mb-8 drop-shadow-sm">Battle Results</h2>
        
        <LeaderboardCard 
          players={Object.values(roomState.players).sort((a, b) => b.score - a.score)} 
        />

        {/* Post-Game Answer Review */}
        <div className="mt-12 bg-white rounded-3xl p-8 border-4 border-slate-100 shadow-xl">
          <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span>📝</span> Your Battle Review
          </h3>
          <div className="space-y-6">
            {roomState.questions.map((q, idx) => {
              const myLog = myAnswerLog[idx];
              const isRight = myLog?.isCorrect;
              
              return (
                <div key={idx} className={`p-6 rounded-2xl border-4 ${isRight ? 'border-emerald-100 bg-emerald-50/50' : 'border-rose-100 bg-rose-50/50'}`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <p className="font-bold text-slate-700 text-lg">
                      <span className="text-slate-400 mr-2">{idx + 1}.</span> 
                      {q.Question}
                    </p>
                    <div className="shrink-0 text-2xl">{isRight ? '✅' : '❌'}</div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-xl border-2 border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Your Answer</span>
                      <span className={`font-black ${isRight ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {myLog ? myLog.answer : 'No Answer'}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border-2 border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Correct Answer</span>
                      <span className="font-black text-emerald-600">
                        {q.Type === 'NUM' ? q['Correct Answer'] : q[`Opt ${q['Correct Answer']}`]}
                      </span>
                    </div>
                  </div>

                  {q.Explanation && (
                    <div className="bg-white/80 p-4 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200">
                      <span className="text-indigo-600 font-bold mr-2">Explanation:</span>
                      {q.Explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // PLAYING PHASE
  const currentQ = roomState.questions[roomState.currentQuestionIndex];
  
  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-white px-4 py-2 border-4 border-slate-100 rounded-2xl shadow-sm flex items-center">
          <span className="text-slate-500 font-bold mr-2">Q</span>
          <span className="font-black text-xl text-indigo-900">{roomState.currentQuestionIndex + 1}</span>
          <span className="text-slate-400 font-bold mx-1">/</span>
          <span className="font-bold text-slate-600">{roomState.questions.length}</span>
        </div>
        
        {/* Streak Indicator */}
        {playerState?.streak >= 3 && (
          <div className="bg-amber-100 border-4 border-amber-300 text-amber-700 px-4 py-2 rounded-2xl font-black shadow-sm animate-bounce flex items-center gap-2">
            🔥 {playerState.streak} Streak! (1.5x)
          </div>
        )}
        
        <Timer endTime={roomState.endTime} onTimeUp={handleTimeUp} />
      </div>

      {/* Main Question Card - Relative for Absolute Overlay */}
      <div className="relative bg-white border-4 border-slate-100 rounded-3xl p-6 sm:p-10 shadow-xl">
        
        {/* TIME UP HARDSTOP OVERLAY */}
        {isTimeUp && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl border-4 border-rose-500 m-[-4px]">
            <h2 className="text-6xl font-black text-rose-600 tracking-tight animate-bounce mb-3 drop-shadow-sm">TIME UP!</h2>
            <div className="bg-rose-100 text-rose-800 px-6 py-2 rounded-full font-bold shadow-sm">
              Waiting for host to reveal results...
            </div>
          </div>
        )}

        <div className="mb-8">
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg mb-4">
            {currentQ.Topic || 'Calculus'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-snug">
            {currentQ.Question}
          </h2>
          {currentQ['Image URL'] && currentQ['Image URL'].trim() !== '' && (
            <img 
              src={currentQ['Image URL']} 
              alt="Question visualization" 
              className="mt-6 rounded-2xl border-4 border-slate-100 max-h-64 object-contain mx-auto"
            />
          )}
        </div>

        {/* Input Handling */}
        <div className="space-y-4">
          {currentQ.Type === 'NUM' ? (
            <div className="flex gap-4">
              <input 
                type="number"
                step="any"
                value={numInput}
                onChange={(e) => setNumInput(e.target.value)}
                placeholder="Enter exact number..."
                disabled={feedback !== null || isTimeUp}
                className="flex-1 bg-white border-4 border-slate-100 px-6 py-4 rounded-2xl font-black text-xl text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleAnswerSubmit(numInput)}
                disabled={!numInput || feedback !== null || isTimeUp}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black px-8 py-4 rounded-2xl shadow-[0_4px_0_rgb(67,56,202)] active:shadow-[0_0px_0_rgb(67,56,202)] active:translate-y-1 transition-all disabled:shadow-none disabled:translate-y-1 text-lg"
              >
                Submit
              </button>
            </div>
          ) : (
            // MCQ and TF
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(optNum => {
                const optText = currentQ[`Opt ${optNum}`];
                if (!optText) return null;

                const isSelected = selectedOption === optNum.toString();
                
                let btnStyle = "bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 shadow-[0_4px_0_rgb(226,232,240)]";
                
                if (feedback) {
                  if (isSelected) {
                    btnStyle = feedback === 'correct' 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_4px_0_rgb(5,150,105)] translate-y-1 shadow-none"
                      : "bg-rose-500 border-rose-500 text-white shadow-[0_4px_0_rgb(225,29,72)] translate-y-1 shadow-none";
                  } else if (optNum.toString() === currentQ['Correct Answer'].toString()) {
                    // Reveal correct answer if they got it wrong
                    btnStyle = "bg-emerald-500 border-emerald-500 text-white shadow-[0_4px_0_rgb(5,150,105)]";
                  } else {
                    btnStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-50 shadow-none translate-y-1";
                  }
                }

                return (
                  <button
                    key={optNum}
                    onClick={() => handleAnswerSubmit(optNum.toString())}
                    disabled={feedback !== null || isTimeUp}
                    className={`w-full text-left p-5 rounded-2xl border-4 font-bold text-lg transition-all active:translate-y-1 active:shadow-none ${btnStyle}`}
                  >
                    <span className="inline-block bg-slate-100/50 px-2 py-1 rounded text-sm mr-3 font-black opacity-70">
                      {String.fromCharCode(64 + optNum)}
                    </span>
                    {optText}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}