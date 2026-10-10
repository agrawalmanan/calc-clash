import React from 'react';

function getAvatar(name, customAvatar) {
  if (customAvatar) return customAvatar;
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}&backgroundColor=c0aede,ffdfbf,b6e3f4,d1d4f9`;
}

export function LeaderboardCard({
  title = "Live Leaderboard",
  fromDate,
  toDate,
  currentUserId,
  podiumRankings = [],
  rankings = []
}) {
  const sortedPodium = [...podiumRankings].sort((a, b) => a.rank - b.rank);
  const first = sortedPodium.find(p => p.rank === 1);
  const second = sortedPodium.find(p => p.rank === 2);
  const third = sortedPodium.find(p => p.rank === 3);

  return (
    <div className="card-chunky p-6 bg-white border-2 border-slate-200 shadow-lg rounded-3xl overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
          {(fromDate || toDate) && (
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              {fromDate && <span>{fromDate}</span>} {fromDate && toDate && '—'} {toDate && <span>{toDate}</span>}
            </p>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          LIVE
        </span>
      </div>

      {/* 🏆 PODIUM SECTION */}
      {podiumRankings.length > 0 && (
        <div className="flex items-end justify-center gap-2 sm:gap-4 mb-8 pt-4 pb-2 border-b border-slate-100">
          {/* 2nd Place */}
          {second ? (
            <div className="flex flex-col items-center w-24 sm:w-28 animate-fadeIn">
              <div className="relative mb-2">
                <img
                  src={getAvatar(second.userName, second.avatarUrl)}
                  alt={second.userName}
                  className="w-14 h-14 rounded-full border-4 border-slate-300 bg-slate-50 shadow-md object-cover"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow">
                  2
                </span>
              </div>
              <div className="bg-slate-100/80 rounded-t-2xl w-full pt-3 pb-4 px-2 text-center border border-slate-200">
                <p className="font-black text-xs text-slate-800 truncate">{second.userName}</p>
                <p className="font-black text-brand-purple text-base mt-0.5">
                  {second.value.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">pts</span>
                </p>
              </div>
            </div>
          ) : <div className="w-24 sm:w-28" />}

          {/* 1st Place */}
          {first ? (
            <div className="flex flex-col items-center w-28 sm:w-32 -mt-4 z-10 animate-fadeIn">
              <div className="relative mb-2">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</span>
                <img
                  src={getAvatar(first.userName, first.avatarUrl)}
                  alt={first.userName}
                  className="w-20 h-20 rounded-full border-4 border-amber-400 bg-amber-50 shadow-xl object-cover"
                />
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow">
                  1
                </span>
              </div>
              <div className="bg-gradient-to-b from-amber-50 to-amber-100/80 rounded-t-2xl w-full pt-4 pb-5 px-2 text-center border-2 border-amber-300 shadow-md">
                <p className="font-black text-sm text-slate-900 truncate">{first.userName}</p>
                <p className="font-black text-amber-600 text-lg mt-0.5">
                  {first.value.toLocaleString()} <span className="text-[10px] font-bold text-amber-600/70">pts</span>
                </p>
              </div>
            </div>
          ) : <div className="w-28 sm:w-32" />}

          {/* 3rd Place */}
          {third ? (
            <div className="flex flex-col items-center w-24 sm:w-28 animate-fadeIn">
              <div className="relative mb-2">
                <img
                  src={getAvatar(third.userName, third.avatarUrl)}
                  alt={third.userName}
                  className="w-14 h-14 rounded-full border-4 border-amber-700/40 bg-orange-50 shadow-md object-cover"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow">
                  3
                </span>
              </div>
              <div className="bg-orange-50/80 rounded-t-2xl w-full pt-3 pb-4 px-2 text-center border border-orange-200">
                <p className="font-black text-xs text-slate-800 truncate">{third.userName}</p>
                <p className="font-black text-amber-700 text-base mt-0.5">
                  {third.value.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">pts</span>
                </p>
              </div>
            </div>
          ) : <div className="w-24 sm:w-28" />}
        </div>
      )}

      {/* 📋 RANKINGS LIST */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {rankings.length === 0 ? (
          <p className="text-center text-slate-400 font-bold py-8 text-sm">
            Waiting for players to score points...
          </p>
        ) : (
          rankings.map((item) => {
            const isCurrentUser = item.userId === currentUserId || item.userName === currentUserId;
            
            return (
              <div
                key={item.userId || item.rank}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
                  isCurrentUser
                    ? 'bg-brand-purple/10 border-brand-purple shadow-sm ring-2 ring-brand-purple/20'
                    : item.rank <= 3
                    ? 'bg-slate-50/90 border-slate-200/80'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="w-7 text-center font-black text-sm text-slate-400 flex-shrink-0">
                  {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                </div>

                <img
                  src={getAvatar(item.userName, item.avatarUrl)}
                  alt={item.userName}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-white object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 text-sm truncate">{item.userName}</p>
                    {isCurrentUser && (
                      <span className="text-[10px] font-black bg-brand-purple text-white px-2 py-0.5 rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                  {item.byline && (
                    <p className="text-[11px] font-bold text-slate-400 truncate mt-0.5">
                      {item.byline}
                    </p>
                  )}
                </div>

                <div className="font-black text-slate-900 text-base tabular-nums flex-shrink-0">
                  {item.value.toLocaleString()}
                  <span className="text-[10px] font-bold text-slate-400 ml-1">pts</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}