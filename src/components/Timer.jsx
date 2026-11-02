import React, { useState, useEffect } from 'react';

export default function Timer({ endTime, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!endTime) return null;
    return Math.max(0, endTime - Date.now());
  });

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now()); // Hardstop negative looping
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        if (onTimeUp) onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  // Handle "No Time Limit" UI
  if (!endTime) {
    return (
      <div className="flex items-center gap-2 bg-white px-4 py-2 border-4 border-slate-100 rounded-2xl shadow-sm text-slate-400 font-bold">
        <span className="text-xl leading-none">∞</span>
        <span className="text-sm tracking-wide">NO LIMIT</span>
      </div>
    );
  }

  const totalSeconds = Math.floor(timeLeft / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  const isUrgent = totalSeconds > 0 && totalSeconds <= 10;
  const isFinished = totalSeconds === 0;

  return (
    <div className={`flex items-center gap-2 bg-white px-4 py-2 border-4 ${
      isUrgent ? 'border-rose-500 text-rose-600 animate-pulse' : 
      isFinished ? 'border-slate-800 text-slate-800' : 
      'border-slate-100 text-slate-800'
    } rounded-2xl shadow-sm font-mono font-bold text-xl transition-colors`}>
      <span className="countdown">
        <span style={{ "--value": minutes }}></span>
      </span>
      :
      <span className="countdown">
        <span style={{ "--value": seconds }}></span>
      </span>
    </div>
  );
}