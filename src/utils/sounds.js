// Keep track of background music so we can stop it
let bgMusic = null;

export const playSound = (type) => {
  const sounds = {
    correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    wrong: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
    tick: 'https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3',
    startSting: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // 3-2-1 Go!
    victory: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',   // Leaderboard Fanfare
  };
  
  if (sounds[type]) {
    const audio = new Audio(sounds[type]);
    audio.volume = type === 'tick' ? 0.3 : 0.6;
    audio.play().catch(() => {});
  }
};

export const playMusic = (type) => {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  if (type === 'lobby') {
    // Upbeat waiting room music (Kahoot style vibes)
    bgMusic = new Audio('https://assets.mixkit.co/active_storage/sfx/135/135-preview.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.2;
    bgMusic.play().catch(() => {});
  } else if (type === 'stop') {
    bgMusic = null;
  }
};