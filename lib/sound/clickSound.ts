let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!ctx) ctx = new AudioContextCtor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function playTone(freqFrom: number, freqTo: number, gainPeak: number, duration: number): void {
  const audioCtx = getContext();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(freqFrom, now);
  oscillator.frequency.exponentialRampToValueAtTime(freqTo, now + duration);

  gain.gain.setValueAtTime(gainPeak, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.01);
}

/** Short synthesized tick — a quick sine blip with a fast exponential decay, no audio asset needed. */
export function playClickSound(): void {
  playTone(1400, 900, 0.08, 0.06);
}

/** Quieter, higher, shorter blip than the click sound — a subtle cue for hovering an interactive element. */
export function playHoverSound(): void {
  playTone(2200, 1900, 0.03, 0.03);
}
