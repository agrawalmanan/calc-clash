import { useState, useEffect, useRef } from 'react';
import { playSound } from '../utils/sounds';

export default function OverallTimer({ totalTimeLimit = 300, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(totalTimeLimit);
  const endTimeRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep latest onTimeUp ref without triggering re-subscriptions
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // 🔒 Lock end time ONCE on mount (e.g. Current Time + 300s)
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + totalTimeLimit * 1000;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Play tick sound when 10 seconds or less
      if (remaining > 0 && remaining <= 10) {
        playSound('tick');
      }

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUpRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // 👈 EMPTY ARRAY = NEVER RESTART ON RE-RENDERS / POLLING!

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pct = (timeLeft / totalTimeLimit) * 100;
  const isDanger = timeLeft <= 10;

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-bold text-slate-500">⏱️ Time Left</span>
        <span className={`font-black text-lg tabular-nums ${isDanger ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isDanger ? 'bg-red-500' : 'bg-brand-blue'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}