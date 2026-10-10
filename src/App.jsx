import { GameProvider, useGame } from './context/GameContext';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Battle from './components/Battle';
import HostDashboard from './components/HostDashboard';

function MainRouter() {
  const { gamePhase, error, clearError, isHost } = useGame();

  return (
    <div className="min-h-screen">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-2.5 rounded-lg shadow-xl text-sm flex items-center gap-3 animate-fadeIn">
          <span>⚠️ {error}</span>
          <button onClick={clearError} className="font-bold text-lg leading-none">&times;</button>
        </div>
      )}

      {gamePhase === 'home' && <Home />}
      {gamePhase === 'lobby' && <Lobby />}
      {gamePhase === 'playing' && (isHost ? <HostDashboard /> : <Battle />)}
      {gamePhase === 'leaderboard' && (isHost ? <HostDashboard /> : <Battle />)}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainRouter />
    </GameProvider>
  );
}