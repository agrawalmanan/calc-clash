import { useState, useEffect } from 'react';

export default function Timer({ duration, onTimeUp, isActive, questionIndex }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;
    
    setTimeLeft(duration);
    const endTime = Date.now() + duration * 1000;

    const interval = setInterval(() => {
      const remaining = Math.round((endTime - Date.now()) / 1000);
      
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        onTimeUp?.();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000); // 1-second interval ensures no bouncing

    return () => clearInterval(interval);
  }, [duration, isActive, questionIndex, onTimeUp]); // questionIndex prevents polling re-renders

  const percentage = (timeLeft / duration) * 100;
  const isDanger = timeLeft <= 5;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-sm font-bold mb-2">
        <span className="text-slate-500">⏱️ Time Left</span>
        <span className={isDanger ? 'text-red-500 animate-pulse text-lg' : 'text-slate-700 text-lg'}>
          {timeLeft}s
        </span>
      </div>
      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isDanger ? 'bg-red-500' : 'bg-brand-blue'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}