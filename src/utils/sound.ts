// Web Audio API sound effects

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if audio isn't available
  }
}

export function playCorrectSound() {
  // Pleasant ascending tone
  playTone(523, 0.1, 'sine', 0.2);  // C5
  setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 100);  // E5
  setTimeout(() => playTone(784, 0.2, 'sine', 0.2), 200);  // G5
}

export function playWrongSound() {
  // Low buzz
  playTone(200, 0.3, 'sawtooth', 0.1);
}

export function playPerfectSound() {
  // Fanfare
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.2), i * 150);
  });
}

export function playLevelUpSound() {
  // Rising celebration
  const notes = [392, 440, 494, 523, 587, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'sine', 0.15), i * 100);
  });
}

export function playClickSound() {
  playTone(800, 0.05, 'sine', 0.1);
}

export function playCoinSound() {
  playTone(1200, 0.1, 'sine', 0.15);
  setTimeout(() => playTone(1500, 0.1, 'sine', 0.15), 80);
}

export function playAchievementSound() {
  const notes = [523, 659, 784, 1047, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'triangle', 0.2), i * 120);
  });
}
