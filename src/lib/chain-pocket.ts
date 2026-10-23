export type ChainPocket = {
  saved: bigint;
  lastFeedDay: number;
  streak: number;
  withdrewOnDay: number;
};

export function asChainPocket(data: unknown): ChainPocket | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    if (typeof data[0] !== "bigint") return null;
    return {
      saved: data[0],
      lastFeedDay: Number(data[1]),
      streak: Number(data[2]),
      withdrewOnDay: Number(data[3]),
    };
  }
  if (typeof data !== "object") return null;
  const row = data as {
    saved?: unknown;
    lastFeedDay?: unknown;
    streak?: unknown;
    withdrewOnDay?: unknown;
  };
  if (typeof row.saved !== "bigint") return null;
  return {
    saved: row.saved,
    lastFeedDay: Number(row.lastFeedDay),
    streak: Number(row.streak),
    withdrewOnDay: Number(row.withdrewOnDay),
  };
}
