import { useState, useEffect } from 'react';
import { playSound } from '../utils/sounds';

export default function OverallTimer({ startedAt, totalTimeLimit, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(totalTimeLimit || 300);

  useEffect(() => {
    if (!startedAt) return;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, (totalTimeLimit || 300) - elapsed);
      
      setTimeLeft(remaining);
      
      // Play tick sound when 10 seconds or less
      if (remaining > 0 && remaining <= 10) playSound('tick');
      if (remaining <= 0) onTimeUp?.();
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, totalTimeLimit, onTimeUp]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pct = (timeLeft / (totalTimeLimit || 300)) * 100;
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
        <div className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'bg-red-500' : 'bg-brand-blue'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}