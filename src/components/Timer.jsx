import { useState, useEffect, useRef } from 'react';

export default function Timer({ duration, onTimeUp, isActive }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setTimeLeft(duration);
    startTimeRef.current = Date.now();

    if (!isActive) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [duration, isActive, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="text-slate-400">⏱️ Time Remaining</span>
        <span className={`font-mono font-bold text-sm ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-200'}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-indigo-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}