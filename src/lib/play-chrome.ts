type PlayChrome = { playing: boolean; title: string; score: number };

const IDLE: PlayChrome = { playing: false, title: "", score: 0 };

let chrome: PlayChrome = IDLE;
const listeners = new Set<() => void>();

export function getPlayChrome() {
  return chrome;
}

export function getPlayChromeServer() {
  return IDLE;
}

export function subscribePlayChrome(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setPlayChrome(next: PlayChrome) {
  if (chrome.playing === next.playing && chrome.title === next.title && chrome.score === next.score) return;
  chrome = next;
  listeners.forEach((listener) => listener());
}
