import { useState, useEffect, useRef } from 'react';
import { playSound } from '../utils/sounds';

export default function OverallTimer({ totalTimeLimit = 300, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(totalTimeLimit);
  const endTimeRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

  useEffect(() => {
    if (!endTimeRef.current) endTimeRef.current = Date.now() + totalTimeLimit * 1000;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining > 0 && remaining <= 10) playSound('tick');
      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUpRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isDanger = timeLeft <= 10;

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-bold text-slate-500">⏱️ Battle Time</span>
        
        {/* 🔥 DAISY UI ROLLING COUNTDOWN 🔥 */}
        <span className={`countdown font-mono text-2xl font-black ${isDanger ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
          <span style={{ "--value": mins }}></span>:
          <span style={{ "--value": secs }}></span>
        </span>
      </div>
      
      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${isDanger ? 'bg-red-500' : 'bg-brand-blue'}`} style={{ width: `${(timeLeft / totalTimeLimit) * 100}%` }} />
      </div>
    </div>
  );
}