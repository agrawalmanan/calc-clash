import React from 'react';

function getAvatar(name, customAvatar) {
  if (customAvatar) return customAvatar;
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`;
}

function formatVal(val) {
  if (typeof val !== 'number') return '0';
  if (val >= 100000) return (val / 1000).toFixed(1) + 'k';
  if (val >= 10000) return (val / 1000).toFixed(1) + 'k';
  return val.toLocaleString();
}

export function LeaderboardCard({
  title = "Weekly Leaderboard",
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
    <div className="w-full bg-[#121214] text-zinc-100 rounded-3xl border border-zinc-800/80 p-6 shadow-2xl font-sans text-left">
      
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        {(fromDate || toDate) && (
          <p className="text-xs text-zinc-400 font-medium mt-1">
            {fromDate && <span>{fromDate}</span>} {fromDate && toDate && '—'} {toDate && <span>{toDate}</span>}
          </p>
        )}
      </div>

      {/* 🏆 PODIUM SECTION (Exact Trophy Dark Style) */}
      {podiumRankings.length > 0 && (
        <div className="flex items-end justify-center gap-3 md:gap-6 mb-8 px-2 pb-4 border-b border-zinc-800/60">
          
          {/* 2nd Place (Silver) */}
          {second ? (
            <div className="flex flex-col items-center w-24 sm:w-28 animate-fadeIn">
              <div className="relative mb-2 flex flex-col items-center">
                <div className="relative">
                  <img
                    src={getAvatar(second.userName, second.avatarUrl)}
                    alt={second.userName}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-zinc-400 bg-zinc-800 object-cover shadow-md"
                  />
                  <span className="absolute -top-1 -right-1 text-xs">👑</span>
                </div>
                <p className="font-semibold text-xs text-zinc-200 truncate w-full text-center mt-2 max-w-[90px]">
                  {second.userName}
                </p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {formatVal(second.value)}
                </p>
              </div>
              {/* Pillar 2 */}
              <div className="w-full h-20 bg-[#2d3139] border border-zinc-700/50 rounded-t-xl flex items-center justify-center font-bold text-zinc-300 text-lg shadow-inner">
                2
              </div>
            </div>
          ) : <div className="w-24 sm:w-28" />}

          {/* 1st Place (Gold - Tallest) */}
          {first ? (
            <div className="flex flex-col items-center w-28 sm:w-32 z-10 animate-fadeIn">
              <div className="relative mb-2 flex flex-col items-center">
                <div className="relative">
                  <img
                    src={getAvatar(first.userName, first.avatarUrl)}
                    alt={first.userName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400 bg-zinc-800 object-cover shadow-xl"
                  />
                  <span className="absolute -top-2 -right-1 text-base animate-bounce">👑</span>
                </div>
                <p className="font-bold text-xs text-white truncate w-full text-center mt-2 max-w-[100px]">
                  {first.userName}
                </p>
                <p className="text-xs text-amber-400 font-mono font-semibold mt-0.5">
                  {formatVal(first.value)}
                </p>
              </div>
              {/* Pillar 1 */}
              <div className="w-full h-32 bg-[#b38827] border border-amber-500/50 rounded-t-xl flex items-center justify-center font-black text-amber-100 text-2xl shadow-lg">
                1
              </div>
            </div>
          ) : <div className="w-28 sm:w-32" />}

          {/* 3rd Place (Bronze) */}
          {third ? (
            <div className="flex flex-col items-center w-24 sm:w-28 animate-fadeIn">
              <div className="relative mb-2 flex flex-col items-center">
                <div className="relative">
                  <img
                    src={getAvatar(third.userName, third.avatarUrl)}
                    alt={third.userName}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-amber-700 bg-zinc-800 object-cover shadow-md"
                  />
                  <span className="absolute -top-1 -right-1 text-xs">👑</span>
                </div>
                <p className="font-semibold text-xs text-zinc-200 truncate w-full text-center mt-2 max-w-[90px]">
                  {third.userName}
                </p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {formatVal(third.value)}
                </p>
              </div>
              {/* Pillar 3 */}
              <div className="w-full h-16 bg-[#633b1e] border border-amber-800/50 rounded-t-xl flex items-center justify-center font-bold text-amber-200 text-lg shadow-inner">
                3
              </div>
            </div>
          ) : <div className="w-24 sm:w-28" />}

        </div>
      )}

      {/* 📋 RANKINGS LIST */}
      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
        {rankings.length === 0 ? (
          <p className="text-center text-zinc-500 font-medium py-8 text-sm">
            Waiting for battle results...
          </p>
        ) : (
          rankings.map((item) => {
            const isCurrentUser = item.userId === currentUserId || item.userName === currentUserId;

            return (
              <div
                key={item.userId || item.rank}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all ${
                  isCurrentUser
                    ? 'bg-zinc-800/90 border-2 border-white text-white shadow-md'
                    : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {/* Rank # */}
                <div className="w-6 text-center font-semibold text-sm text-zinc-400 flex items-center justify-center flex-shrink-0">
                  {item.rank <= 3 ? (
                    <span className="text-amber-400 text-sm">👑</span>
                  ) : (
                    <span>{item.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <img
                  src={getAvatar(item.userName, item.avatarUrl)}
                  alt={item.userName}
                  className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 object-cover flex-shrink-0"
                />

                {/* Name & Byline */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-white">
                    {item.userName}
                  </p>
                  {item.byline && (
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {item.byline}
                    </p>
                  )}
                </div>

                {/* Value / Points */}
                <div className="font-bold text-sm text-white font-mono flex-shrink-0">
                  {formatVal(item.value)}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}