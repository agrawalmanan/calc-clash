import { useGame } from '../context/GameContext';
import AvatarGroup from './AvatarGroup';
import { CalcWizardMascot } from './Mascots';

export default function Lobby() {
  const { room, isHost, startGame } = useGame();

  if (!room) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5 animate-fadeIn">
        
        {/* Room Ticket */}
        <div className="card-chunky p-6 text-center relative overflow-hidden bg-white">
          <div className="absolute top-0 left-0 w-full h-2.5 bg-brand-purple"></div>
          <p className="font-extrabold text-xs text-slate-400 tracking-wider mb-2 uppercase">ROOM CODE</p>
          <div className="text-5xl font-black text-slate-800 tracking-[0.2em] bg-slate-50 py-3 rounded-2xl border-2 border-dashed border-slate-200">
            {room.code}
          </div>
        </div>

        {/* Players Area */}
        <div className="card-chunky p-6 text-center bg-white">
          <CalcWizardMascot className="w-24 h-24 mx-auto mb-2 animate-bounce" />
          
          <h3 className="font-black text-slate-800 text-lg mb-2">
            {room.players?.length || 0} Player{(room.players?.length || 0) !== 1 ? 's' : ''} Connected
          </h3>
          
          <AvatarGroup players={room.players || []} max={6} />
        </div>

        {isHost ? (
          <button onClick={startGame} className="btn-chunky btn-primary w-full py-4 text-2xl font-black rounded-2xl animate-pulse shadow-lg shadow-purple-500/30">
            START BATTLE! 🚀
          </button>
        ) : (
          <div className="card-chunky p-4 text-center font-bold text-slate-500 bg-white">
            Waiting for host to launch battle... ⏳
          </div>
        )}
      </div>
    </div>
  );
}