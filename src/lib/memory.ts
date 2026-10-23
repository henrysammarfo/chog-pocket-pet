export type MoodMark = {
  mood: string;
  title: string;
  day: number;
  at: number;
};

export type PetMemory = {
  key: string;
  tokenId: number | null;
  name: string;
  streak: number;
  bestStreak: number;
  jarTotal: string;
  moodHistory: MoodMark[];
  playStreak?: number;
  arcadeBest?: Record<string, number>;
  arcadeDay?: number;
  arcadeTotal?: number;
};

export type MemoryBook = Record<string, PetMemory>;

export function memoryKey(id: string, tokenId: number | null): string {
  return tokenId != null ? `token:${tokenId}` : `sample:${id}`;
}

export function blankMemory(key: string, name: string, tokenId: number | null): PetMemory {
  return {
    key,
    tokenId,
    name,
    streak: 0,
    bestStreak: 0,
    jarTotal: "0",
    moodHistory: [],
  };
}

export function creditMemory(
  memory: PetMemory,
  input: {
    streak: number;
    added: bigint;
    mood: string;
    title: string;
    day: number;
    at: number;
  },
): PetMemory {
  const jar = BigInt(memory.jarTotal) + (input.added > 0n ? input.added : 0n);
  const mark: MoodMark = {
    mood: input.mood,
    title: input.title,
    day: input.day,
    at: input.at,
  };
  return {
    ...memory,
    name: memory.name,
    streak: Math.max(input.streak, memory.playStreak ?? 0),
    bestStreak: Math.max(memory.bestStreak, input.streak),
    jarTotal: jar.toString(),
    moodHistory: [mark, ...memory.moodHistory].slice(0, 12),
  };
}
