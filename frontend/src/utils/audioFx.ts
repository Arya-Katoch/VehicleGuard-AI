/**
 * Web Audio API synthesizer for futuristic sci-fi telemetry UI feedback.
 * Zero external audio files, ultra lightweight, operates only when sound is enabled.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playFuturisticTone(freq = 880, duration = 0.08, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio errors gracefully
  }
}

export function playModeSwitchTone() {
  playFuturisticTone(520, 0.12, 'sine');
  setTimeout(() => playFuturisticTone(780, 0.12, 'triangle'), 60);
}

export function playSampleClickTone() {
  playFuturisticTone(660, 0.09, 'sine');
  setTimeout(() => playFuturisticTone(1100, 0.15, 'sine'), 50);
}

export function playProcessingChime() {
  const notes = [440, 554, 659, 880];
  notes.forEach((freq, i) => {
    setTimeout(() => playFuturisticTone(freq, 0.15, 'triangle'), i * 70);
  });
}
