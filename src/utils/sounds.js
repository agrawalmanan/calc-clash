export const playSound = (type) => {
  const sounds = {
    correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Ding!
    wrong: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',   // Buzzer
    tick: 'https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3'     // Clock Tick
  };
  
  if (sounds[type]) {
    const audio = new Audio(sounds[type]);
    audio.volume = type === 'tick' ? 0.3 : 0.6; // Keep tick quiet
    audio.play().catch(() => {}); // Catch browser auto-play blocks silently
  }
};