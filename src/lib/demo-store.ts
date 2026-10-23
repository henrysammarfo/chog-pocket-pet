import type { DemoSpeed } from "@/lib/demo-clock";
import { holderTier } from "@/lib/tiers";
import { demoChog } from "@/lib/pets";
import {
  freshPocket,
  type PocketState,
} from "@/lib/savings";

export const DEMO_STORAGE_KEY = "chog-pocket-demo-v1";

export type DemoSave = {
  petId: string;
  wallet: string;
  saved: string;
  lastFeedDay: number;
  streak: number;
  goal: string;
  withdrewOnDay: number;
  clock: number | null;
  bestStreak?: number;
  speed?: DemoSpeed;
  freezeLeft?: number;
};

function countOf(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

export function stateToSave(
  petId: string,
  state: PocketState,
  clock: number | null,
  bestStreak = 0,
  extras?: { speed?: DemoSpeed; freezeLeft?: number },
): DemoSave {
  return {
    petId,
    wallet: state.wallet.toString(),
    saved: state.saved.toString(),
    lastFeedDay: state.lastFeedDay,
    streak: state.streak,
    goal: state.goal.toString(),
    withdrewOnDay: state.withdrewOnDay,
    clock,
    bestStreak,
    speed: extras?.speed === "minute" ? "minute" : "day",
    freezeLeft: extras?.freezeLeft ?? 0,
  };
}

export function saveToState(save: DemoSave): {
  petId: string;
  state: PocketState;
  clock: number | null;
} | null {
  try {
    const wallet = BigInt(save.wallet);
    const saved = BigInt(save.saved);
    const goal = BigInt(save.goal);
    if (wallet < 0n || saved < 0n || goal <= 0n) return null;
    if (!Number.isInteger(save.lastFeedDay) || !Number.isInteger(save.streak)) {
      return null;
    }
    return {
      petId: demoChog(save.petId).id,
      clock: typeof save.clock === "number" ? save.clock : null,
      state: {
        wallet,
        saved,
        goal,
        lastFeedDay: save.lastFeedDay,
        streak: save.streak,
        withdrewOnDay: Number.isInteger(save.withdrewOnDay) ? save.withdrewOnDay : 0,
      },
    };
  } catch {
    return null;
  }
}

export function loadDemoSave(): DemoSave | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoSave;
  } catch {
    return null;
  }
}

export function writeDemoSave(save: DemoSave): void {
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(save));
}

export function clearDemoSave(): void {
  window.localStorage.removeItem(DEMO_STORAGE_KEY);
}

export function freshDemo(): { petId: string; state: PocketState; clock: number | null } {
  return { petId: "bubblegum", state: freshPocket(), clock: null };
}

export type LiveDemo = {
  ready: boolean;
  petId: string;
  state: PocketState;
  nowSec: number;
  clock: number | null;
  bestStreak: number;
  speed: DemoSpeed;
  freezeLeft: number;
};

const serverDemo: LiveDemo = {
  ready: true,
  petId: "bubblegum",
  state: freshPocket(),
  nowSec: 0,
  clock: null,
  bestStreak: 0,
  speed: "day",
  freezeLeft: 1,
};

let clientDemo: LiveDemo | null = null;
const listeners = new Set<() => void>();

export function subscribeDemo(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDemoServer(): LiveDemo {
  return serverDemo;
}

export function getDemoClient(): LiveDemo {
  if (!clientDemo) clientDemo = readDemo();
  return clientDemo;
}

function readDemo(): LiveDemo {
  const saved = loadDemoSave();
  const parsed = saved ? saveToState(saved) : null;
  const nowSec = Math.floor(Date.now() / 1000);
  if (!parsed) {
    const fresh = freshDemo();
    return {
      ready: true,
      petId: fresh.petId,
      state: fresh.state,
      nowSec,
      clock: null,
      bestStreak: 0,
      speed: "day",
      freezeLeft: holderTier(fresh.state.wallet).freeze ? 1 : 0,
    };
  }
  const recorded = saved?.bestStreak;
  const savedBest = typeof recorded === "number" && Number.isInteger(recorded) ? recorded : 0;
  const freezeLeft =
    saved?.freezeLeft === undefined
      ? holderTier(parsed.state.wallet).freeze
        ? 1
        : 0
      : countOf(saved.freezeLeft);
  return {
    ready: true,
    petId: parsed.petId,
    state: parsed.state,
    nowSec: parsed.clock ?? nowSec,
    clock: parsed.clock,
    bestStreak: Math.max(savedBest, parsed.state.streak),
    speed: saved?.speed === "minute" ? "minute" : "day",
    freezeLeft,
  };
}

function publish(next: LiveDemo): void {
  clientDemo = next;
  writeDemoSave(
    stateToSave(next.petId, next.state, next.clock, next.bestStreak, {
      speed: next.speed,
      freezeLeft: next.freezeLeft,
    }),
  );
  for (const listener of listeners) listener();
}

export function updateDemo(
  recipe: (current: LiveDemo) => LiveDemo,
): void {
  publish(recipe(getDemoClient()));
}

export function resetDemo(): void {
  const fresh = freshDemo();
  clearDemoSave();
  clientDemo = {
    ready: true,
    petId: fresh.petId,
    state: fresh.state,
    nowSec: Math.floor(Date.now() / 1000),
    clock: null,
    bestStreak: 0,
    speed: "day",
    freezeLeft: holderTier(fresh.state.wallet).freeze ? 1 : 0,
  };
  for (const listener of listeners) listener();
}
