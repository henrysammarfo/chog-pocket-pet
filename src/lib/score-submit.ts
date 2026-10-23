"use client";

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function guestId() {
  let id = localStorage.getItem("cpp-guest-id");
  if (!id) {
    id = `guest-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("cpp-guest-id", id);
  }
  return id;
}

export function submitScore(game: string, score: number, address?: string, petName?: string) {
  if (typeof window === "undefined" || score <= 0) return;
  const player = address ? address.toLowerCase() : guestId();
  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : player.replace("guest-", "Guest ");
  const label = petName ? `${petName} · ${short}` : short;
  const key = `${player}:${game}`;
  clearTimeout(timers.get(key));
  timers.set(
    key,
    setTimeout(() => {
      fetch("/api/scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ player, label, game, score }),
        keepalive: true,
      }).catch(() => {});
    }, 1500),
  );
}
