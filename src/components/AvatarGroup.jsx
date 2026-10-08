export default function AvatarGroup({ players = [], max = 5 }) {
  const visible = players.slice(0, max);
  const overflow = players.length - max;

  return (
    <div className="flex items-center justify-center py-2">
      {visible.map((player, idx) => (
        <div 
          key={idx} 
          className="relative group -ml-3 first:ml-0 transition-transform hover:scale-110 hover:z-10"
        >
          {/* We use Bottts (cute robots) from DiceBear API */}
          <img 
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.name}&backgroundColor=c0aede,ffdfbf,b6e3f4`}
            alt={player.name}
            className="w-12 h-12 rounded-full border-4 border-white bg-white shadow-sm"
          />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {player.name}
          </span>
        </div>
      ))}
      
      {overflow > 0 && (
        <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm -ml-3 z-0 shadow-sm">
          +{overflow}
        </div>
      )}
    </div>
  );
}