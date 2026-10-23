export type Sfx = "flap" | "jump" | "drop" | "perfect" | "score" | "hit" | "over" | "shot";

const listeners = new Set<() => void>();
let muted = false;
let ctx: AudioContext | null = null;

export function getMuted() {
  return muted;
}

export function subscribeMuted(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function setMuted(next: boolean) {
  muted = next;
  try {
    window.localStorage.setItem("chog-arcade-mute", next ? "1" : "0");
  } catch {
    /* the toggle still works for this visit */
  }
  emit();
}

export function unlockAudio() {
  try {
    muted = window.localStorage.getItem("chog-arcade-mute") === "1";
  } catch {
    muted = false;
  }
  emit();
  const audio = context();
  if (audio && audio.state === "suspended") void audio.resume();
}

function context() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function playSfx(kind: Sfx) {
  if (muted) return;
  const audio = context();
  if (!audio || audio.state !== "running") return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.connect(gain);
  gain.connect(audio.destination);
  const now = audio.currentTime;
  const tone: Record<Sfx, [number, number, OscillatorType]> = {
    flap: [540, 0.07, "square"],
    jump: [420, 0.09, "square"],
    drop: [170, 0.12, "triangle"],
    perfect: [760, 0.18, "square"],
    score: [640, 0.1, "square"],
    hit: [120, 0.14, "sawtooth"],
    over: [98, 0.32, "triangle"],
    shot: [260, 0.05, "square"],
  };
  const [freq, dur, type] = tone[kind];
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (kind === "perfect" || kind === "score") osc.frequency.exponentialRampToValueAtTime(freq * 1.7, now + dur);
  if (kind === "over") osc.frequency.exponentialRampToValueAtTime(55, now + dur);
  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}
