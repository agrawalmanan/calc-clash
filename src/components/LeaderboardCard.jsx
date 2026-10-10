import React from 'react';

function getAvatar(name, customAvatar) {
  if (customAvatar) return customAvatar;
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
    name || 'player'
  )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`;
}

function formatVal(val) {
  if (typeof val !== 'number') return '0';
  if (val >= 100000) return (val / 1000).toFixed(1) + 'k';
  if (val >= 10000) return (val / 1000).toFixed(1) + 'k';
  return val.toLocaleString();
}

export function LeaderboardCard({
  title = 'Live Leaderboard',
  fromDate,
  toDate,
  currentUserId,
  podiumRankings = [],
  rankings = [],
}) {
  const sorted = [...podiumRankings].sort((a, b) => a.rank - b.rank);
  const first = sorted.find((p) => p.rank === 1);
  const second = sorted.find((p) => p.rank === 2);
  const third = sorted.find((p) => p.rank === 3);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        {(fromDate || toDate) && (
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">
            {fromDate}
            {fromDate && toDate ? ' – ' : ''}
            {toDate}
          </p>
        )}
      </div>

      {/* ===================== PODIUM ===================== */}
      {(first || second || third) && (
        <div className="px-4 pb-6 flex items-end justify-center gap-3 sm:gap-5">
          {/* 2nd Place */}
          <div className="flex flex-col items-center w-[88px] sm:w-[100px]">
            {second ? (
              <>
                <div className="relative mb-2 flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={getAvatar(second.userName, second.avatarUrl)}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 bg-slate-100 shadow-sm"
                    />
                    <span className="absolute -top-1.5 -right-1.5 text-[11px] bg-white rounded-full w-5 h-5 flex items-center justify-center shadow border border-slate-200">
                      👑
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 mt-1.5 truncate max-w-[80px] text-center leading-tight">
                    {second.userName}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                    {formatVal(second.value)}
                  </p>
                </div>
                {/* Silver pillar */}
                <div className="w-full h-[72px] bg-slate-300 rounded-t-xl flex items-center justify-center shadow-inner">
                  <span className="text-white font-black text-xl drop-shadow-sm">2</span>
                </div>
              </>
            ) : (
              <div className="w-full h-[72px]" />
            )}
          </div>

          {/* 1st Place (taller) */}
          <div className="flex flex-col items-center w-[100px] sm:w-[112px] -mt-3 z-10">
            {first ? (
              <>
                <div className="relative mb-2 flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={getAvatar(first.userName, first.avatarUrl)}
                      alt=""
                      className="w-[60px] h-[60px] rounded-full object-cover border-[3px] border-amber-400 bg-amber-50 shadow-md"
                    />
                    <span className="absolute -top-2 -right-1.5 text-sm bg-white rounded-full w-6 h-6 flex items-center justify-center shadow border border-amber-200">
                      👑
                    </span>
                  </div>
                  <p className="text-[12px] font-bold text-slate-800 mt-1.5 truncate max-w-[90px] text-center leading-tight">
                    {first.userName}
                  </p>
                  <p className="text-[12px] font-black text-amber-600 mt-0.5">
                    {formatVal(first.value)}
                  </p>
                </div>
                {/* Gold pillar */}
                <div className="w-full h-[110px] bg-amber-400 rounded-t-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-3xl drop-shadow">1</span>
                </div>
              </>
            ) : (
              <div className="w-full h-[110px]" />
            )}
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center w-[88px] sm:w-[100px]">
            {third ? (
              <>
                <div className="relative mb-2 flex flex-col items-center">
                  <div className="relative">
                    <img
                      src={getAvatar(third.userName, third.avatarUrl)}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-300 bg-orange-50 shadow-sm"
                    />
                    <span className="absolute -top-1.5 -right-1.5 text-[11px] bg-white rounded-full w-5 h-5 flex items-center justify-center shadow border border-orange-200">
                      👑
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 mt-1.5 truncate max-w-[80px] text-center leading-tight">
                    {third.userName}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                    {formatVal(third.value)}
                  </p>
                </div>
                {/* Bronze pillar */}
                <div className="w-full h-[56px] bg-orange-400 rounded-t-xl flex items-center justify-center shadow-inner">
                  <span className="text-white font-black text-xl drop-shadow-sm">3</span>
                </div>
              </>
            ) : (
              <div className="w-full h-[56px]" />
            )}
          </div>
        </div>
      )}

      {/* ===================== LIST ===================== */}
      <div className="px-3 pb-4 space-y-1 max-h-[340px] overflow-y-auto">
        {rankings.length === 0 && (
          <p className="text-center text-slate-400 text-sm font-medium py-10">
            Waiting for scores...
          </p>
        )}

        {rankings.map((item, idx) => {
          const isCurrent =
            item.userId === currentUserId || item.userName === currentUserId;
          const isTop3 = item.rank <= 3;

          // Show ellipsis when there is a jump in ranks (like the original)
          const prevRank = idx > 0 ? rankings[idx - 1].rank : 0;
          const showEllipsis = idx > 0 && item.rank - prevRank > 1;

          return (
            <React.Fragment key={item.userId || item.rank}>
              {showEllipsis && (
                <div className="flex justify-center py-1">
                  <span className="text-slate-300 text-lg tracking-widest">···</span>
                </div>
              )}

              <div
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/10'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Rank + crown */}
                <div className="w-7 flex items-center justify-center gap-0.5 flex-shrink-0">
                  {isTop3 ? (
                    <span className="text-[13px]">👑</span>
                  ) : null}
                  <span
                    className={`text-[13px] font-bold ${
                      isCurrent ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {item.rank}
                  </span>
                </div>

                {/* Avatar */}
                <img
                  src={getAvatar(item.userName, item.avatarUrl)}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100 flex-shrink-0"
                />

                {/* Name + byline */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-semibold truncate leading-tight ${
                      isCurrent ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {item.userName}
                  </p>
                  {item.byline && (
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isCurrent ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {item.byline}
                    </p>
                  )}
                </div>

                {/* Score */}
                <div
                  className={`text-[13px] font-bold tabular-nums flex-shrink-0 ${
                    isCurrent ? 'text-white' : 'text-slate-700'
                  }`}
                >
                  {formatVal(item.value)}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}