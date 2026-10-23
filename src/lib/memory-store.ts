import { applyArcadeScore, type ArcadeId } from "@/lib/arcade";
import { CHOG_UNIT } from "@/lib/format";
import {
  creditMemory,
  type MemoryBook,
  type PetMemory,
} from "@/lib/memory";

const MEMORY_KEY = "chog-pocket-memory-v1";

export function inheritedExample(): PetMemory {
  const key = "token:123";
  return {
    key,
    tokenId: 123,
    name: "Chog #123",
    streak: 14,
    bestStreak: 14,
    jarTotal: (2_000n * CHOG_UNIT).toString(),
    moodHistory: [
      { mood: "legendary", title: "Beloved", day: 20_748, at: 1_792_630_800 },
      { mood: "glowing", title: "Beaming", day: 20_741, at: 1_792_026_000 },
      { mood: "cozy", title: "Cozy", day: 20_736, at: 1_791_594_000 },
    ],
  };
}

export function seedBook(): MemoryBook {
  return { "token:123": inheritedExample() };
}

const SERVER_BOOK: MemoryBook = seedBook();
let book: MemoryBook = SERVER_BOOK;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(MEMORY_KEY);
    if (!raw) {
      book = seedBook();
      return;
    }
    const parsed = JSON.parse(raw) as MemoryBook;
    book = { ...seedBook(), ...parsed };
    if (!book["token:123"]) book["token:123"] = inheritedExample();
  } catch {
    book = seedBook();
  }
}

function emit(next: MemoryBook) {
  book = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MEMORY_KEY, JSON.stringify(next));
  }
  for (const listener of listeners) listener();
}

export function subscribeMemory(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMemoryServer(): MemoryBook {
  return SERVER_BOOK;
}

export function getMemoryClient(): MemoryBook {
  hydrate();
  return book;
}

export function rememberPet(
  memory: PetMemory,
  input: {
    streak: number;
    added: bigint;
    mood: string;
    title: string;
    day: number;
    at: number;
  },
) {
  hydrate();
  const current = book[memory.key] ?? memory;
  emit({ ...book, [memory.key]: creditMemory(current, input) });
}

export function recordArcadeScore(
  memory: PetMemory,
  input: { gameId: ArcadeId; raw: number; boost: boolean; day: number; at: number; shown?: number },
): PetMemory {
  hydrate();
  const current = book[memory.key] ?? memory;
  const next = applyArcadeScore(current, input);
  emit({ ...book, [memory.key]: next });
  return next;
}

export function resetSampleMemory() {
  hydrated = true;
  const next = seedBook();
  for (const [key, memory] of Object.entries(book)) {
    if (key.startsWith("token:") && key !== "token:123") next[key] = memory;
  }
  emit(next);
}
