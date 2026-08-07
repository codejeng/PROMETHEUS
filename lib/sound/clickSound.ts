let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!ctx) ctx = new AudioContextCtor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Short synthesized tick — a quick sine blip with a fast exponential decay, no audio asset needed. */
export function playClickSound(): void {
  const audioCtx = getContext();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(1400, now);
  oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.05);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.07);
}
