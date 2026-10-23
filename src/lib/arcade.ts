import { creditMemory, type PetMemory } from "@/lib/memory";

export type ArcadeId = "stack" | "tower" | "dash" | "floppy" | "coin2048" | "snack";

export type ArcadeGame = {
  id: ArcadeId;
  name: string;
  kicker: string;
  blurb: string;
  licence: string;
  source: string;
  credit: string;
  figure: string;
};

export const ARCADE_GAMES: ArcadeGame[] = [
  {
    id: "stack",
    name: "Chog Stack",
    kicker: "drop the block",
    blurb: "Slide a block and drop it on the tower. A clean land keeps the width.",
    licence: "MIT",
    source: "iamkun/tower_game",
    credit: "BMQB, Inc. Gameplay from tower_game. Art is the Chog and original blocks.",
    figure: "/figures/bubblegum.png",
  },
  {
    id: "tower",
    name: "Chog Tower 3D",
    kicker: "stack in space",
    blurb: "The same drop, turned in three.js. Miss the edge and the tower stops.",
    licence: "MIT",
    source: "KonradLinkowski/Stack",
    credit: "Konrad Linkowski. Gameplay from Stack. Blocks are Orbis colours.",
    figure: "/figures/crown.png",
  },
  {
    id: "dash",
    name: "Chog Dash",
    kicker: "jump the gap",
    blurb: "Run, jump, and duck. Space or a tap jumps. Down ducks.",
    licence: "BSD-3-Clause",
    source: "wayou/t-rex-runner",
    credit: "wayou. Gameplay from t-rex-runner. The runner is a Chog, not a dinosaur.",
    figure: "/figures/laser.png",
  },
  {
    id: "floppy",
    name: "Floppy Chog",
    kicker: "through the gap",
    blurb: "Tap or press space to flap through the neon gaps.",
    licence: "Apache-2.0",
    source: "nebez/floppybird",
    credit: "Nebez. Gameplay from floppybird. All original art is replaced.",
    figure: "/figures/quiet.png",
  },
  {
    id: "coin2048",
    name: "Chog 2048",
    kicker: "merge the coins",
    blurb: "Slide coins until they stack into a golden Chog.",
    licence: "MIT",
    source: "gabrielecirulli/2048",
    credit: "Gabriele Cirulli. Gameplay from 2048. Tiles are coins, then a golden Chog.",
    figure: "/figures/crown.png",
  },
  {
    id: "snack",
    name: "Chog Snack Hunt",
    kicker: "tap the snack",
    blurb: "Snacks pop up. Tap them, or aim with the arrows and press enter.",
    licence: "MIT",
    source: "MattSurabian/DuckHunt-JS",
    credit: "Matt Surabian. Gameplay from DuckHunt-JS. Nintendo art is rebuilt as snacks.",
    figure: "/figures/bubblegum.png",
  },
];

export function arcadeGame(id: string): ArcadeGame | null {
  return ARCADE_GAMES.find((game) => game.id === id) ?? null;
}

/** A Chog on stage can play. A real Chog Genesis in the wallet doubles the score. */
export function arcadeAccess(hasPet: boolean, holdsGenesis: boolean): { play: boolean; boost: boolean } {
  return { play: hasPet, boost: hasPet && holdsGenesis };
}

export function scoredPoints(raw: number, boost: boolean): number {
  const safe = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  return boost ? safe * 2 : safe;
}

export function moodFromArcade(score: number): { mood: string; title: string } {
  if (score >= 40) return { mood: "legendary", title: "Arcade legend" };
  if (score >= 16) return { mood: "glowing", title: "Arcade glow" };
  if (score >= 6) return { mood: "buzzing", title: "Arcade buzz" };
  if (score >= 1) return { mood: "cozy", title: "Arcade cozy" };
  return { mood: "waiting", title: "Arcade quiet" };
}

export function applyArcadeScore(
  memory: PetMemory,
  input: { gameId: ArcadeId; raw: number; boost: boolean; day: number; at: number; shown?: number },
): PetMemory {
  const earned = scoredPoints(input.raw, input.boost);
  const shown = scoredPoints(input.shown ?? input.raw, input.boost);
  if (earned <= 0) return memory;
  const playedNewDay = memory.arcadeDay !== input.day;
  const playStreak = (memory.playStreak ?? 0) + (playedNewDay ? 1 : 0);
  const mood = moodFromArcade(shown);
  const next = creditMemory(
    { ...memory, playStreak },
    { streak: memory.streak, added: 0n, mood: mood.mood, title: mood.title, day: input.day, at: input.at },
  );
  const arcadeBest = { ...(memory.arcadeBest ?? {}) };
  arcadeBest[input.gameId] = Math.max(arcadeBest[input.gameId] ?? 0, shown);
  return {
    ...next,
    playStreak,
    bestStreak: Math.max(next.bestStreak, playStreak),
    arcadeBest,
    arcadeDay: input.day,
    arcadeTotal: (memory.arcadeTotal ?? 0) + earned,
  };
}
