import { useGame } from '../context/GameContext';
import AvatarGroup from './AvatarGroup';

export default function Lobby() {
  const { room, isHost, startGame } = useGame();

  if (!room) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 animate-fadeIn">
        {/* Room Code Display */}
        <div className="card-chunky p-8 text-center relative overflow-hidden bg-white">
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-purple"></div>
          <p className="font-bold text-slate-400 mb-2 text-xs tracking-wider uppercase">ROOM CODE</p>
          <div className="text-5xl font-black text-slate-800 tracking-widest bg-slate-50 py-4 rounded-2xl border-2 border-dashed border-slate-200">
            {room.code}
          </div>
        </div>

        {/* Players Section */}
        <div className="card-chunky p-6 bg-white">
          <h3 className="font-black text-center text-slate-700 text-lg mb-4">
            {room.players?.length || 0} Players Ready
          </h3>
          
          <AvatarGroup players={room.players || []} max={6} />
        </div>

        {isHost ? (
          <button onClick={startGame} className="btn-chunky btn-primary w-full py-5 text-2xl font-black rounded-2xl animate-pulse shadow-lg shadow-brand-purple/30">
            START BATTLE! 🚀
          </button>
        ) : (
          <div className="card-chunky p-5 text-center font-bold text-slate-500 bg-white">
            Waiting for host to start the game... ⏳
          </div>
        )}
      </div>
    </div>
  );
}