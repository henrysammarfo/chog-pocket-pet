import type { ChogPet } from "@/lib/pets";

const KEY = "chog-pocket-held-v1";

let pet: ChogPet | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    pet = raw ? (JSON.parse(raw) as ChogPet) : null;
  } catch {
    pet = null;
  }
}

function emit(next: ChogPet | null) {
  pet = next;
  if (typeof window !== "undefined") {
    if (next) window.sessionStorage.setItem(KEY, JSON.stringify(next));
    else window.sessionStorage.removeItem(KEY);
  }
  for (const listener of listeners) listener();
}

export function subscribeHeld(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getHeldServer(): ChogPet | null {
  return null;
}

export function getHeldClient(): ChogPet | null {
  hydrate();
  return pet;
}

export function setHeldPet(next: ChogPet | null) {
  hydrated = true;
  emit(next);
}
